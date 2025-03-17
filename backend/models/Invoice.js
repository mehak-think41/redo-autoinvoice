const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
    invoice_number: { type: String, unique: true, required: true },
    date: { type: Date, required: true },
    customer_details: { 
        name: String, 
        email: String, 
        phone: String,
        shipping_address: String
    },
    
    amount: { type: Number, required: true }, // Subtotal
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }, // Total after tax

    payment_method: { type: String, enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'], default: 'Bank Transfer' },
    payment_status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    // shipping_status: { type: String, enum: ['Not Shipped', 'Shipped', 'Delivered', 'Returned'], default: 'Not Shipped' },
    
    number_of_units: { type: Number, required: true },
    
    confidence: String, // AI confidence level
    confidence_score: { type: Number, default: 0 },
    
    invoice_status: { type: String, enum: ['Pending', 'Approved', 'Flagged', 'Rejected'], default: 'Pending' },

    line_items: [lineItemSchema], // List of products

    notes: String,
    
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
