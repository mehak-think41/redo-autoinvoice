const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  supplierEmail: { 
    type: String, 
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  LastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);