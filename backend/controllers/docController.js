const axios = require("axios");
const pdf = require("pdf-parse");
const { Groq } = require("groq-sdk");
const Invoice = require("../models/Invoice");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function processInvoice(pdfUrl, userId, emailRecordId) {
  try {
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBuffer = Buffer.from(response.data, "binary");
    const data = await pdf(pdfBuffer);
    const invoiceText = data.text;

    let invoiceData;
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Analyze this invoice text and extract the following information in JSON format:
        - invoice_number: Invoice number (e.g., INV-2023-XXX)
        - date: Invoice date (YYYY-MM-DD)
        - customer_details:
          - name: Customer's name
          - email: Customer's email
          - phone: Customer's phone number
          - shipping_address: Shipping address
        - amount: Subtotal before tax
        - tax: Tax amount
        - total: Total amount including tax
        - number_of_units: Total number of items in invoice
        - confidence: Extraction confidence (high/medium/low)
        - confidence_score: Score 0-100
        - line_items: Array of items with:
          - sku: Product SKU
          - name: Item name
          - quantity: Number of units
          - unit_price: Price per unit
          - total: Total for this item
        - notes: Any important notes

        Text: ${invoiceText}`,
          },
        ],
        model: "mixtral-8x7b-32768",
        response_format: { type: "json_object" },
      });
      invoiceData = JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
      console.error("Error extracting invoice data from AI:", error);
      throw new Error("Failed to extract invoice data. Please try again.");
    }

    if (!Array.isArray(invoiceData.line_items)) {
      invoiceData.line_items = [];
    }

    const isFulfillable = await checkInventoryForInvoice(
      invoiceData.line_items
    );

    let invoiceStatus;
    if (invoiceData.confidence_score < 50) {
      invoiceStatus = "Pending"; // Low confidence requires manual review
      //send email to user to check pending emails
    } else if (isFulfillable) {
      invoiceStatus = "Approved";
      //send email to customer that delivery will be processed soon
    } else {
      invoiceStatus = "Flagged";
      //send email to user to check flagged emails
      //send email to customer that stock is low and delivery is delayed
    }


    const invoice = new Invoice({
      invoice_number: invoiceData.invoice_number,
      date: new Date(invoiceData.date),
      customer_details: invoiceData.customer_details,
      amount: invoiceData.amount,
      tax: invoiceData.tax,
      total: invoiceData.total,
      payment_method: "Bank Transfer",
      payment_status: "Pending",
      number_of_units: invoiceData.number_of_units,
      confidence: invoiceData.confidence,
      confidence_score: invoiceData.confidence_score,
      invoice_status: invoiceStatus,
      line_items: invoiceData.line_items.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
      notes: invoiceData.notes || "",
      created_at: new Date(),
      userId,
      emailRecordId,
    });

    const savedInvoice = await invoice.save();

    if (invoiceData.confidence_score >= 50 && isFulfillable) {
      for (const item of invoiceData.line_items) {
        await Inventory.updateOne(
          { sku: item.sku },
          { $inc: { quantity: -item.quantity } }
        );
      }
    }

    return savedInvoice;
  } catch (error) {
    console.error("Error processing invoice:", error);
    throw error;
  }
}

async function checkInventoryForInvoice(lineItems) {
  let isFulfillable = true;

  for (const item of lineItems) {
    const inventoryItem = await Inventory.findOne({ sku: item.sku });

    const actualStock = inventoryItem ? inventoryItem.quantity : 0;
    const gap = item.quantity - actualStock;

    if (gap > 0) {
      isFulfillable = false;

      // Determine impact based on gap size
      let impact = "Low";
      if (gap > 5) impact = "Medium";
      if (gap > 10) impact = "High";

      // Update shortage details in Inventory
      await Inventory.updateOne(
        { sku: item.sku },
        {
          shortages: {
            expected: item.quantity,
            actual: actualStock,
            gap,
            impact,
          },
        }
      );
    }
  }

  return isFulfillable;
}

//manual approval/reject function

//invoice by id

//get all invoices list with filters(processed, pending, flagged)

//total invoices, pending invoices, approved invoices, flagged invoices in past month

module.exports = {
  processInvoice,
  checkInventoryForInvoice,
};
