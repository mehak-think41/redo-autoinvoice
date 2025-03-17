const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    description: String,
    quantity: Number,
    unit_price: Number,
    total: Number
});

const invoiceSchema = new mongoose.Schema({
    invoice_number: { type: String, unique: true },
    date: Date,
    due_date: Date,
    supplier: String,
    amount: Number,
    tax: Number,
    total: Number,
    supplier_address: String,
    supplier_email: String,
    supplier_phone: String,
    number_of_units: Number,
    confidence: String,
    confidence_score: Number,
    line_items: [lineItemSchema],
    notes: String,
    userId: String,
    emailRecordId: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);