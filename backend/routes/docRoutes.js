const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const Inventory = require('../models/Inventory');
const Invoice = require('../models/Invoice');

// router.get('/process-invoice', async (req, res) => {
//     try {
//         // pdfUrl = 
//         const result = await processInvoice(pdfUrl);
//         res.json(result);
//     } catch (error) {
//         res.status(500).json({ error: 'Invoice processing failed' });
//     }
// });


// module.exports = router;

router.post('/process', async (req, res) => {
    try {
        const { pdfUrl, userId, emailRecordId } = req.body;
        const invoice = await docController.processInvoice(pdfUrl, userId, emailRecordId);

        // Fetch shortages from Inventory
        const shortages = await Inventory.find(
            { "shortages.gap": { $gt: 0 } },
            { sku: 1, name: 1, shortages: 1 }
        );

        res.status(200).json({
            invoice,
            shortages: shortages || [] // Always include shortages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get shortages for flagged invoices
router.get('/gap-analysis/:invoiceId', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId);
        if (!invoice || invoice.invoice_status !== "Flagged") {
            return res.status(404).json({ message: "Invoice not found or not flagged." });
        }

        // Find all inventory items with shortages
        const shortages = await Inventory.find(
            { "shortages.gap": { $gt: 0 } },
            { sku: 1, name: 1, shortages: 1 }
        );

        res.json({ shortages });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});