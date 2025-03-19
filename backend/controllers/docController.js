const axios = require("axios");
const pdf = require("pdf-parse");
const { Groq } = require("groq-sdk");
const Invoice = require("../models/Invoice");
const Inventory = require("../models/Inventory");
const { EmailLog } = require("../models/EmailLog");

require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Process Invoice
const processInvoice = async (pdfUrl, userId, emailRecordId) => {
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
      invoiceData.line_items,
      userId
    );

    let invoiceStatus;
    if (invoiceData.confidence_score < 50) {
      invoiceStatus = "Pending"; // Low confidence requires manual review
    } else if (isFulfillable) {
      invoiceStatus = "Approved";
    } else {
      invoiceStatus = "Flagged";
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
        const inventoryItem = await Inventory.findOne({
          sku: item.sku,
          userId,
        });
        if (!inventoryItem) {
          throw new Error(
            `Inventory item with SKU ${item.sku} does not belong to this user.`
          );
        }
        await Inventory.updateOne(
          { sku: item.sku, userId },
          { $inc: { quantity: -item.quantity } }
        );
      }
    }

    return savedInvoice;
  } catch (error) {
    console.error("Error processing invoice:", error);
    throw error;
  }
};

// Check Inventory for Invoice
const checkInventoryForInvoice = async (lineItems, userId) => {
    for (const item of lineItems) {
      const inventoryItem = await Inventory.findOne({ sku: item.sku, userId });
      if (!inventoryItem) {
        throw new Error(`Inventory item with SKU ${item.sku} is missing. Process halted.`);
      }
      const actualStock = inventoryItem.quantity;
      const gap = item.quantity - actualStock;
      if (gap > 0) {
        let impact = "Low";
        if (gap > 5) impact = "Medium";
        if (gap > 10) impact = "High";
        // Update shortage details (if desired) before returning false
        await Inventory.updateOne(
          { sku: item.sku, userId },
          {
            shortages: {
              expected: item.quantity,
              actual: actualStock,
              gap,
              impact,
            },
          }
        );
        return false; // Not enough inventory for this item
      }
    }
    return true;
  };  

// Analyze Email for Invoice
const analyzeEmailForInvoice = async (subject, headers, emailBody) => {
  try {
    const lowerSubject = subject.toLowerCase();
    const lowerBody = emailBody.toLowerCase();

    const quickChecks = {
      hasInvoiceKeyword:
        lowerSubject.includes("invoice") || lowerBody.includes("invoice"),
      hasAmount: /\$\d+/.test(emailBody),
      hasInvoiceNumber: /invoice\s*#?\s*\d+/i.test(emailBody),
      hasDueDate: /due\s*date/i.test(emailBody),
    };

    if (Object.values(quickChecks).filter(Boolean).length >= 2) {
      return {
        is_invoice: true,
        reason: "Multiple invoice indicators found in email content",
      };
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze this email to determine if it contains an invoice. Respond in JSON format with:
                - "is_invoice": true or false
                - "reason": Explanation
                - "confidence_score": 0-100
                
                **Email Data:**
                - Subject: "${subject}"
                - Headers: ${JSON.stringify(headers)}
                - Body: "${emailBody}"`,
        },
      ],
      model: "mixtral-8x7b-32768",
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content);

    await EmailLog.create({
      emailSubject: subject,
      analysisResult: result,
      timestamp: new Date(),
    });

    return result;
  } catch (error) {
    console.error("Error analyzing email for invoice:", error);
    await EmailLog.create({
      emailSubject: subject,
      analysisResult: { is_invoice: false, reason: "API Error" },
      timestamp: new Date(),
      error: error.message,
    });
    return {
      is_invoice: false,
      reason: "Error in processing AI response.",
      confidence_score: 0,
    };
  }
};

// Manually Update Invoice Status
const manuallyUpdateInvoiceStatus = async (invoiceId, action) => {
    try {
      if (!["Approved", "Rejected"].includes(action)) {
        throw new Error("Invalid action. Use 'Approved' or 'Rejected'.");
      }
  
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found.");
      }
  
      // If the user is trying to approve the invoice, first check if inventory is sufficient
      if (action === "Approved") {
        const isSufficient = await checkInventoryForInvoice(invoice.line_items, invoice.userId);
        if (!isSufficient) {
          throw new Error("Inventory is not enough to fulfill the order.");
        }
        // If inventory is sufficient, update the inventory for each line item
        for (const item of invoice.line_items) {
          await Inventory.updateOne(
            { sku: item.sku, userId: invoice.userId },
            { $inc: { quantity: -item.quantity } }
          );
        }
      }
  
      // Update the invoice status to the requested action
      invoice.invoice_status = action;
      await invoice.save();
  
      return {
        success: true,
        message: `Invoice ${action} successfully.`,
        invoice,
      };
    } catch (error) {
      console.error("Error updating invoice status:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  };  

//invoice by id
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Extract user ID from authenticated request

    const invoice = await Invoice.findOne({ _id: id, userId });

    if (!invoice) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Invoice not found or access denied.",
        });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

//get all invoices list with filters(processed, pending, flagged)
const getAllInvoices = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from authenticated request
    const { status } = req.query; // Get status filter from query params

    const validStatuses = ["Approved", "Pending", "Flagged", "Rejected"];
    let filter = { userId };

    if (status && validStatuses.includes(status)) {
      filter.invoice_status = status;
    }

    const invoices = await Invoice.find(filter).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * Returns invoice stats for the past month:
 * - totalInvoices
 * - pending
 * - approved
 * - flagged
 * - rejected
 * Also computes percentages for each status (relative to total).
 */
const getMonthlyInvoiceStats = async (req, res) => {
    try {
      const userId = req.user._id; // Authenticated user
      // Calculate date 1 month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
      // Count total invoices for the past month
      const totalCount = await Invoice.countDocuments({
        userId,
        created_at: { $gte: oneMonthAgo },
      });
  
      // Count each status
      const pendingCount = await Invoice.countDocuments({
        userId,
        invoice_status: "Pending",
        created_at: { $gte: oneMonthAgo },
      });
  
      const approvedCount = await Invoice.countDocuments({
        userId,
        invoice_status: "Approved",
        created_at: { $gte: oneMonthAgo },
      });
  
      const flaggedCount = await Invoice.countDocuments({
        userId,
        invoice_status: "Flagged",
        created_at: { $gte: oneMonthAgo },
      });
  
      const rejectedCount = await Invoice.countDocuments({
        userId,
        invoice_status: "Rejected",
        created_at: { $gte: oneMonthAgo },
      });
  
      // Compute percentages
      const toPercent = (count) =>
        totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) : 0;
  
      res.status(200).json({
        success: true,
        stats: {
          totalInvoices: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          flagged: flaggedCount,
          rejected: rejectedCount,
          pendingPercentage: toPercent(pendingCount),
          approvedPercentage: toPercent(approvedCount),
          flaggedPercentage: toPercent(flaggedCount),
          rejectedPercentage: toPercent(rejectedCount),
        },
      });
    } catch (error) {
      console.error("Error fetching monthly invoice stats:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  

module.exports = {
  processInvoice,
  checkInventoryForInvoice,
  analyzeEmailForInvoice,
  manuallyUpdateInvoiceStatus,
  getInvoiceById,
  getAllInvoices,
  getMonthlyInvoiceStats
};
