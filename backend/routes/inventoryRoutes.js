// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

// Protect all routes in this router
router.use(auth);

// Analysis routes (must come before :id routes to prevent parameter conflicts)
router.get('/gap-analysis', inventoryController.getGapAnalysis);
router.get('/shortages', inventoryController.getInventoryShortages);

// CRUD routes
router.post('/', inventoryController.createInventory);
router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventory);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;