const Inventory = require('../models/Inventory');
const User = require('../models/User');
const { sendSupplierOrderEmail } = require('../services/emailService');

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
        
        if (!inventoryItems || inventoryItems.length === 0) {
            return res.json({
                summary: {
                    totalCategories: 0,
                    highImpactGaps: 0,
                    averageGap: 0,
                    totalGap: 0
                },
                categories: []
            });
        }

        const gapAnalysis = inventoryItems
            .filter(item => item.shortages)
            .map(item => ({
                category: item.name || 'Unnamed Category',
                expected: item.shortages?.expected || 0,
                actual: item.shortages?.actual || 0,
                gap: item.shortages?.gap || 0,
                impact: (item.shortages?.impact || 'Low').toLowerCase()
            }))
            .sort((a, b) => {
                const impactOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
            });

        const totalCategories = gapAnalysis.length;
        const totalGap = gapAnalysis.reduce((sum, item) => sum + item.gap, 0);
        const averageGap = totalCategories > 0 ? totalGap / totalCategories : 0;
        const highImpactGaps = gapAnalysis.filter(item => item.impact === 'high').length;

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
            message: "Failed to fetch gap analysis. Please try again.", 
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

// Send order email to supplier
const sendSupplierOrder = async (req, res) => {
  try {
    const { supplierEmail, skus, additionalNotes } = req.body;

    if (!supplierEmail || !skus || !Array.isArray(skus) || skus.length === 0) {
      return res.status(400).json({ error: 'Invalid request data. Please provide supplierEmail and at least one SKU.' });
    }

    // Get user details from database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await sendSupplierOrderEmail(supplierEmail, skus, additionalNotes, user.name, user.email);
    res.status(200).json({ message: 'Order email sent successfully to supplier' });
  } catch (error) {
    console.error('Error sending supplier order email:', error);
    res.status(500).json({ error: 'Failed to send order email' });
  }
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getGapAnalysis,
  getInventoryShortages,
  sendSupplierOrder
};
