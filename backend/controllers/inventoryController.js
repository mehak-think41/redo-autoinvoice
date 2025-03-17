const Inventory = require('../models/Inventory');

// Create
const createInventory = async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      LastUpdated: Date.now()
    };
    const inventory = await Inventory.create(inventoryData);
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read All
const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read One
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
const updateInventory = async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        LastUpdated: Date.now()
      };
      const inventory = await Inventory.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Delete
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventory,
  updateInventory,
  deleteInventory
};