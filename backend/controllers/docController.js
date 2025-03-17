const axios = require('axios');
const pdf = require('pdf-parse');
const { Groq } = require("groq-sdk");
const Invoice = require("../models/Invoice");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function processInvoice(pdfUrl, userId, emailRecordId) {
    try {
        // Fetch and convert PDF to text
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(response.data, 'binary');
        const data = await pdf(pdfBuffer);
        const invoiceText = data.text;

        // AI Extraction Prompt
        const chatCompletion = await groq.chat.completions.create({
            messages: [{
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

        Text: ${invoiceText}`
            }],
            model: "mixtral-8x7b-32768",
            response_format: { type: "json_object" }
        });

        // Parse AI Response
        const invoiceData = JSON.parse(chatCompletion.choices[0].message.content);

        // Ensure line items match schema
        if (!Array.isArray(invoiceData.line_items)) {
            invoiceData.line_items = [];
        }

        // Create and save invoice
        const invoice = new Invoice({
            invoice_number: invoiceData.invoice_number,
            date: new Date(invoiceData.date),
            customer_details: invoiceData.customer_details,
            amount: invoiceData.amount,
            tax: invoiceData.tax,
            total: invoiceData.total,
            payment_method: "Bank Transfer", // Default as per schema
            payment_status: "Pending", // Default as per schema
            number_of_units: invoiceData.number_of_units,
            confidence: invoiceData.confidence,
            confidence_score: invoiceData.confidence_score,
            invoice_status: "Pending", // Default as per schema
            line_items: invoiceData.line_items.map(item => ({
                sku: item.sku,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total
            })),
            notes: invoiceData.notes || "",
            created_at: new Date(),
            userId,
            emailRecordId
        });

        const savedInvoice = await invoice.save();
        return savedInvoice;

    } catch (error) {
        console.error('Error processing invoice:', error);
        throw error;
    }
}

module.exports = {
    processInvoice
};
