const Inventory = require('../models/Inventory');

// Create
const createInventory = async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      userId: req.user._id, // Ensure inventory is linked to the authenticated user
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
    const inventory = await Inventory.find({ userId: req.user._id });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read One
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ _id: req.params.id, userId: req.user._id });
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
        lastUpdated: Date.now()
      };
      const inventory = await Inventory.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
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
    const inventory = await Inventory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GAP Analysis
const getGapAnalysis = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find({ userId: req.user._id });
        
        const gapAnalysis = inventoryItems
            .filter(item => item.shortages)
            .map(item => ({
                category: item.name,
                expected: item.shortages.expected,
                actual: item.shortages.actual,
                gap: item.shortages.gap,
                impact: item.shortages.impact
            }))
            .sort((a, b) => {
                const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return impactOrder[b.impact] - impactOrder[a.impact];
            });

        const totalCategories = gapAnalysis.length;
        const totalGap = gapAnalysis.reduce((sum, item) => sum + item.gap, 0);
        const averageGap = totalGap / totalCategories;
        const highImpactGaps = gapAnalysis.filter(item => item.impact === 'High').length;

        res.json({
            summary: {
                totalCategories,
                highImpactGaps,
                averageGap: Math.round(averageGap),
                totalGap
            },
            categories: gapAnalysis
        });
    } catch (error) {
        console.error('Error generating GAP analysis:', error);
        res.status(500).json({ 
            message: "Error fetching GAP Analysis", 
            error: error.message 
        });
    }
};

// Inventory Shortages
const getInventoryShortages = async (req, res) => {
    try {
        const { category } = req.query;
        const query = category 
            ? { userId: req.user._id, name: category, 'shortages.gap': { $gt: 0 } } 
            : { userId: req.user._id, 'shortages.gap': { $gt: 0 } };
        const shortages = await Inventory.find(query, {
            sku: 1,
            name: 1,
            shortages: 1
        });
        res.json({ shortages });
    } catch (error) {
        console.error('Error fetching inventory shortages:', error);
        res.status(500).json({ 
            message: "Error fetching inventory shortages", 
            error: error.message 
        });
    }
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getGapAnalysis,
  getInventoryShortages
};
