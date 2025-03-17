const axios = require('axios');
const pdf = require('pdf-parse');
const { Groq } = require("groq-sdk");
const Invoice = require("../models/Invoice")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function processInvoice(pdfUrl, userId, emailRecordId) {
    try {

        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(response.data, 'binary');


        const data = await pdf(pdfBuffer);
        const invoiceText = data.text;


        const chatCompletion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `Analyze this invoice text and extract the following information in JSON format:
        - invoice_number: Invoice number (e.g., INV-2023-XXX)
        - date: Invoice date (YYYY-MM-DD)
        - due_date: Due date (YYYY-MM-DD)
        - supplier: Company name
        - amount: Subtotal before tax
        - tax: Tax amount
        - total: Total amount including tax
        - supplier_address: Full address
        - supplier_email: Email if present
        - supplier_phone: Phone if present
        - number_of_units: Total number of items
        - confidence: Extraction confidence (high/medium/low)
        - confidence_score: Score 0-100
        - line_items: Array of items with:
          - description: Item description
          - quantity: Number of units
          - unit_price: Price per unit
          - total: Total for this item
        - notes: Any important notes

        Text: ${invoiceText}`
            }],
            model: "mixtral-8x7b-32768",
            response_format: { type: "json_object" }
        });

        const invoiceData = JSON.parse(chatCompletion.choices[0].message.content);

        // Create and save invoice
        const invoice = new Invoice({
            ...invoiceData,
            userId,
            emailRecordId,
            date: new Date(invoiceData.date),
            due_date: new Date(invoiceData.due_date)
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
}