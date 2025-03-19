const mongoose = require('mongoose');
 
 const shortageSchema = new mongoose.Schema({
     expected: { type: Number, required: true },
     actual: { type: Number, required: true },
     gap: { type: Number, required: true },  // Expected - Actual
     impact: { type: String, enum: ['Low', 'Medium', 'High'], required: true }
 });
 
 const inventorySchema = new mongoose.Schema({
     userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true
     },
     sku: { type: String, required: true, unique: true },
     name: { type: String, required: true },
     quantity: { type: Number, required: true, min: 0 },
     unitPrice: { type: Number, required: true, min: 0 },
     supplierEmail: { 
         type: String, 
         required: true,
         match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
     },
     shortages: shortageSchema,  // New field to store shortage data
     lastUpdated: { type: Date, default: Date.now }
 });
 
 module.exports = mongoose.model('Inventory', inventorySchema);