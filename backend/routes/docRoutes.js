const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const { auth } = require('../middleware/auth');

// Protect all routes in this router
router.use(auth);

// CRUD routes
router.post('/', docController.processInvoice);
// router.get('/', docController.getAllInvoices);
router.get('/:id', docController.getInvoiceById);
router.post('/update-status', docController.manuallyUpdateInvoiceStatus);