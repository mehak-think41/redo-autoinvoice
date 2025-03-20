const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const axios = require('axios');
const pdf = require('pdf-parse');
const { Groq } = require('groq-sdk');
const docController = require('../controllers/docController');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const emailService = require('../services/emailService');

describe('Doc Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processInvoice', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockEmailRecordId = new mongoose.Types.ObjectId();
    const mockPdfUrl = 'https://example.com/invoice.pdf';

    it('should process invoice successfully with high confidence and sufficient inventory', async () => {
      const mockPdfData = {
        text: 'Sample invoice text'
      };

      const mockInvoiceData = {
        invoice_number: 'INV-2023-001',
        date: '2023-01-01',
        customer_details: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          shipping_address: '123 Main St'
        },
        amount: 100,
        tax: 10,
        total: 110,
        number_of_units: 2,
        confidence: 'high',
        confidence_score: 90,
        line_items: [
          {
            sku: 'SKU001',
            name: 'Product 1',
            quantity: 2,
            unit_price: 50,
            total: 100
          }
        ]
      };

      const mockInventoryItem = {
        sku: 'SKU001',
        quantity: 10,
        userId: mockUserId
      };

      sandbox.stub(axios, 'get').resolves({ data: Buffer.from('fake pdf') });
      sandbox.stub(pdf, 'default').resolves(mockPdfData);
      sandbox.stub(Groq.prototype.chat.completions, 'create').resolves({
        choices: [{ message: { content: JSON.stringify(mockInvoiceData) } }]
      });
      sandbox.stub(Inventory, 'findOne').resolves(mockInventoryItem);
      sandbox.stub(Inventory, 'updateOne').resolves();
      sandbox.stub(Invoice.prototype, 'save').resolves({
        ...mockInvoiceData,
        _id: new mongoose.Types.ObjectId()
      });
      sandbox.stub(User, 'findById').resolves({
        email: 'user@example.com'
      });
      sandbox.stub(emailService, 'sendApprovedInvoiceCustomerEmail').resolves();

      const result = await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);

      expect(result).to.have.property('invoice_number', mockInvoiceData.invoice_number);
      expect(result.invoice_status).to.equal('Approved');
      expect(Inventory.updateOne.calledOnce).to.be.true;
    });

    it('should handle low confidence invoice and set status to Pending', async () => {
      const mockPdfData = {
        text: 'Sample invoice text'
      };

      const mockInvoiceData = {
        invoice_number: 'INV-2023-002',
        confidence_score: 40,
        line_items: [],
        customer_details: {
          email: 'customer@example.com'
        }
      };

      sandbox.stub(axios, 'get').resolves({ data: Buffer.from('fake pdf') });
      sandbox.stub(pdf, 'default').resolves(mockPdfData);
      sandbox.stub(Groq.prototype.chat.completions, 'create').resolves({
        choices: [{ message: { content: JSON.stringify(mockInvoiceData) } }]
      });
      sandbox.stub(Invoice.prototype, 'save').resolves({
        ...mockInvoiceData,
        _id: new mongoose.Types.ObjectId()
      });
      sandbox.stub(User, 'findById').resolves({
        email: 'user@example.com'
      });
      sandbox.stub(emailService, 'sendPendingInvoiceEmail').resolves();

      const result = await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);

      expect(result.invoice_status).to.equal('Pending');
      expect(emailService.sendPendingInvoiceEmail.calledOnce).to.be.true;
    });

    it('should handle insufficient inventory and set status to Flagged', async () => {
      const mockPdfData = {
        text: 'Sample invoice text'
      };

      const mockInvoiceData = {
        invoice_number: 'INV-2023-003',
        confidence_score: 90,
        line_items: [
          {
            sku: 'SKU001',
            quantity: 20,
            unit_price: 50,
            total: 1000
          }
        ],
        customer_details: {
          email: 'customer@example.com'
        }
      };

      const mockInventoryItem = {
        sku: 'SKU001',
        quantity: 5,
        userId: mockUserId
      };

      sandbox.stub(axios, 'get').resolves({ data: Buffer.from('fake pdf') });
      sandbox.stub(pdf, 'default').resolves(mockPdfData);
      sandbox.stub(Groq.prototype.chat.completions, 'create').resolves({
        choices: [{ message: { content: JSON.stringify(mockInvoiceData) } }]
      });
      sandbox.stub(Inventory, 'findOne').resolves(mockInventoryItem);
      sandbox.stub(Invoice.prototype, 'save').resolves({
        ...mockInvoiceData,
        _id: new mongoose.Types.ObjectId()
      });
      sandbox.stub(User, 'findById').resolves({
        email: 'user@example.com'
      });
      sandbox.stub(emailService, 'sendFlaggedInvoiceEmail').resolves();
      sandbox.stub(emailService, 'sendDelayedDeliveryCustomerEmail').resolves();

      const result = await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);

      expect(result.invoice_status).to.equal('Flagged');
      expect(emailService.sendFlaggedInvoiceEmail.calledOnce).to.be.true;
      expect(emailService.sendDelayedDeliveryCustomerEmail.calledOnce).to.be.true;
    });

    it('should handle AI extraction errors', async () => {
      sandbox.stub(axios, 'get').resolves({ data: Buffer.from('fake pdf') });
      sandbox.stub(pdf, 'default').resolves({ text: 'Sample invoice text' });
      sandbox.stub(Groq.prototype.chat.completions, 'create').rejects(new Error('AI Error'));

      try {
        await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to extract invoice data');
      }
    });
  });

  describe('manuallyUpdateInvoiceStatus', () => {
    const mockInvoiceId = new mongoose.Types.ObjectId();
    const mockUserId = new mongoose.Types.ObjectId();

    it('should update invoice status to Approved and update inventory', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_status: 'Pending',
        line_items: [
          {
            sku: 'SKU001',
            quantity: 2
          }
        ],
        customer_details: {
          email: 'customer@example.com'
        },
        save: sinon.stub().resolves()
      };

      const mockInventoryItem = {
        sku: 'SKU001',
        quantity: 10,
        userId: mockUserId
      };

      sandbox.stub(Invoice, 'findById').resolves(mockInvoice);
      sandbox.stub(Inventory, 'findOne').resolves(mockInventoryItem);
      sandbox.stub(Inventory, 'updateOne').resolves();
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Approved' },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(Inventory.updateOne.calledOnce).to.be.true;
      expect(emailService.sendInvoiceStatusEmail.calledOnce).to.be.true;
    });

    it('should handle insufficient inventory when approving', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_status: 'Pending',
        line_items: [
          {
            sku: 'SKU001',
            quantity: 20
          }
        ]
      };

      const mockInventoryItem = {
        sku: 'SKU001',
        quantity: 5,
        userId: mockUserId
      };

      sandbox.stub(Invoice, 'findById').resolves(mockInvoice);
      sandbox.stub(Inventory, 'findOne').resolves(mockInventoryItem);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Approved' },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Insufficient inventory');
    });
  });

  describe('getMonthlyInvoiceStats', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should return monthly invoice statistics', async () => {
      const mockStats = [
        { _id: 'Approved', count: 5 },
        { _id: 'Pending', count: 3 },
        { _id: 'Flagged', count: 2 },
        { _id: 'Rejected', count: 1 }
      ];

      sandbox.stub(Invoice, 'aggregate').resolves(mockStats);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);

      const response = mockRes.json.firstCall.args[0];
      expect(response.totalInvoices).to.equal(11);
      expect(response.approved).to.equal(5);
      expect(response.approvedPercentage).to.equal(45.45);
    });

    it('should handle empty stats', async () => {
      sandbox.stub(Invoice, 'aggregate').resolves([]);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);

      const response = mockRes.json.firstCall.args[0];
      expect(response.totalInvoices).to.equal(0);
      expect(response.approved).to.equal(0);
      expect(response.approvedPercentage).to.equal(0);
    });
  });
});

describe('Doc Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Mock the generateUniqueInvoiceNumber function
    sandbox.stub(require('../utils/invoiceUtils'), 'generateUniqueInvoiceNumber')
      .callsFake(async (baseNumber) => `${baseNumber}-UNIQUE`);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processInvoice', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockEmailRecordId = new mongoose.Types.ObjectId();
    const mockPdfUrl = 'https://example.com/invoice.pdf';

    it('should process invoice successfully with high confidence', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      const mockPdfText = 'Invoice #INV-2023-001\nCustomer: John Doe\nAmount: $100';
      const mockInvoiceData = {
        invoice_number: 'INV-2023-001',
        date: '2023-12-01',
        customer_details: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          shipping_address: '123 Main St'
        },
        amount: 100,
        tax: 10,
        total: 110,
        number_of_units: 2,
        confidence: 'high',
        confidence_score: 95,
        line_items: [
          { sku: 'SKU001', name: 'Item 1', quantity: 1 },
          { sku: 'SKU002', name: 'Item 2', quantity: 1 }
        ]
      };

      // Mock external dependencies
      sandbox.stub(axios, 'get').resolves({ data: mockPdfBuffer });
      sandbox.stub(require('pdf-parse')).resolves({ text: mockPdfText });
      sandbox.stub(Groq.prototype.chat.completions, 'create').resolves({
        choices: [{ message: { content: JSON.stringify(mockInvoiceData) } }]
      });

      // Mock database operations
      sandbox.stub(Invoice.prototype, 'save').resolves({
        _id: new mongoose.Types.ObjectId(),
        ...mockInvoiceData
      });
      sandbox.stub(EmailLog, 'findByIdAndUpdate').resolves();
      sandbox.stub(Inventory, 'find').resolves([
        { sku: 'SKU001', quantity: 5 },
        { sku: 'SKU002', quantity: 5 }
      ]);
      sandbox.stub(emailService, 'sendPendingInvoiceEmail').resolves();

      const result = await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);
      
      expect(result).to.have.property('status', 'processed');
      expect(result.invoice).to.have.property('invoice_number', mockInvoiceData.invoice_number);
      expect(result.invoice.customer_details).to.deep.equal(mockInvoiceData.customer_details);
    });

    it('should handle low confidence invoice with flagged status', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      const mockPdfText = 'Unclear invoice content';
      const mockInvoiceData = {
        invoice_number: 'INV-2023-002',
        confidence: 'low',
        confidence_score: 45,
        line_items: []
      };

      sandbox.stub(axios, 'get').resolves({ data: mockPdfBuffer });
      sandbox.stub(require('pdf-parse')).resolves({ text: mockPdfText });
      sandbox.stub(Groq.prototype.chat.completions, 'create').resolves({
        choices: [{ message: { content: JSON.stringify(mockInvoiceData) } }]
      });

      sandbox.stub(Invoice.prototype, 'save').resolves({
        _id: new mongoose.Types.ObjectId(),
        ...mockInvoiceData
      });
      sandbox.stub(EmailLog, 'findByIdAndUpdate').resolves();
      sandbox.stub(emailService, 'sendFlaggedInvoiceEmail').resolves();

      const result = await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);
      
      expect(result).to.have.property('status', 'flagged');
      expect(result.invoice).to.have.property('confidence_score', 45);
    });

    it('should handle PDF fetch errors', async () => {
      sandbox.stub(axios, 'get').rejects(new Error('Failed to fetch PDF'));

      try {
        await docController.processInvoice(mockPdfUrl, mockUserId, mockEmailRecordId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to fetch PDF');
      }
    });
  });

  describe('manuallyUpdateInvoiceStatus', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockInvoiceId = new mongoose.Types.ObjectId();

    it('should approve invoice and update inventory', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        userId: mockUserId,
        status: 'pending',
        line_items: [
          { sku: 'SKU001', quantity: 2 },
          { sku: 'SKU002', quantity: 3 }
        ],
        save: sinon.stub().resolves()
      };

      const mockInventoryItems = [
        { sku: 'SKU001', quantity: 10, save: sinon.stub().resolves() },
        { sku: 'SKU002', quantity: 15, save: sinon.stub().resolves() }
      ];

      sandbox.stub(Invoice, 'findById').resolves(mockInvoice);
      sandbox.stub(Inventory, 'find').resolves(mockInventoryItems);
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockInvoice.status).to.equal('approved');
      expect(mockInventoryItems[0].quantity).to.equal(8); // 10 - 2
      expect(mockInventoryItems[1].quantity).to.equal(12); // 15 - 3
    });

    it('should reject invoice without updating inventory', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        userId: mockUserId,
        status: 'pending',
        line_items: [
          { sku: 'SKU001', quantity: 2 }
        ],
        save: sinon.stub().resolves()
      };

      sandbox.stub(Invoice, 'findById').resolves(mockInvoice);
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'rejected' },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockInvoice.status).to.equal('rejected');
    });

    it('should handle insufficient inventory', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        userId: mockUserId,
        status: 'pending',
        line_items: [
          { sku: 'SKU001', quantity: 20 } // More than available
        ],
        save: sinon.stub().resolves()
      };

      const mockInventoryItems = [
        { sku: 'SKU001', quantity: 10 }
      ];

      sandbox.stub(Invoice, 'findById').resolves(mockInvoice);
      sandbox.stub(Inventory, 'find').resolves(mockInventoryItems);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Insufficient inventory');
    });
  });

  describe('getMonthlyInvoiceStats', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should return correct monthly stats', async () => {
      const mockStats = {
        total: 100,
        pending: 30,
        approved: 40,
        flagged: 20,
        rejected: 10
      };

      sandbox.stub(Invoice, 'countDocuments')
        .onFirstCall().resolves(mockStats.total)
        .onSecondCall().resolves(mockStats.pending)
        .onThirdCall().resolves(mockStats.approved)
        .onCall(3).resolves(mockStats.flagged)
        .onCall(4).resolves(mockStats.rejected);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(200)).to.be.true;
      const response = mockRes.json.firstCall.args[0];
      expect(response.stats).to.deep.equal({
        totalInvoices: mockStats.total,
        pending: mockStats.pending,
        approved: mockStats.approved,
        flagged: mockStats.flagged,
        rejected: mockStats.rejected,
        pendingPercentage: 30,
        approvedPercentage: 40,
        flaggedPercentage: 20,
        rejectedPercentage: 10
      });
    });

    it('should handle zero invoices case', async () => {
      sandbox.stub(Invoice, 'countDocuments').resolves(0);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);
      
      expect(mockRes.json.calledWith({
        stats: {
          totalInvoices: 0,
          pending: 0,
          approved: 0,
          flagged: 0,
          rejected: 0,
          pendingPercentage: 0,
          approvedPercentage: 0,
          flaggedPercentage: 0,
          rejectedPercentage: 0
        }
      })).to.be.true;
    });
  });

  describe('processInvoice', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockInvoiceId = new mongoose.Types.ObjectId();
    const mockPdfBuffer = Buffer.from('fake pdf content');
    const mockEmailId = 'test-email-id';

    it('should process invoice successfully with complete data', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-1001',
        date: '2025-03-20',
        total_amount: 1000.50,
        supplier_name: 'Test Supplier',
        supplier_email: 'supplier@test.com',
        items: [
          { description: 'Item 1', quantity: 2, price: 500.25 }
        ]
      };

      const mockUser = {
        _id: mockUserId,
        email: 'user@test.com',
        name: 'Test User'
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(Invoice.prototype, 'save').resolves({
        _id: mockInvoiceId,
        ...mockExtractedData,
        userId: mockUserId,
        status: 'pending',
        emailId: mockEmailId
      });

      const mockReq = {
        file: {
          buffer: mockPdfBuffer,
          originalname: 'test-invoice.pdf'
        },
        body: {
          emailId: mockEmailId
        },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(docController, 'extractInvoiceData').resolves(mockExtractedData);
      sandbox.stub(require('../utils/invoiceUtils'), 'generateUniqueInvoiceNumber').resolves('INV-1001');
      sandbox.stub(emailService, 'sendInvoiceProcessedEmail').resolves();

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].status).to.equal('success');
      expect(mockRes.json.firstCall.args[0].invoice.invoice_number).to.equal('INV-1001');
    });

    it('should handle missing PDF file', async () => {
      const mockReq = {
        body: { emailId: mockEmailId },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('No PDF file');
    });

    it('should handle invalid PDF content', async () => {
      const mockReq = {
        file: {
          buffer: Buffer.from('invalid pdf'),
          originalname: 'test.pdf'
        },
        body: { emailId: mockEmailId },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(docController, 'extractInvoiceData').rejects(new Error('Invalid PDF'));

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to process PDF');
    });

    it('should handle missing required invoice data', async () => {
      const mockExtractedData = {
        // Missing invoice_number and other required fields
        date: '2025-03-20'
      };

      const mockReq = {
        file: {
          buffer: mockPdfBuffer,
          originalname: 'test.pdf'
        },
        body: { emailId: mockEmailId },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(docController, 'extractInvoiceData').resolves(mockExtractedData);

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid invoice data');
    });

    it('should handle database errors', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-1001',
        date: '2025-03-20',
        total_amount: 1000.50,
        supplier_name: 'Test Supplier',
        supplier_email: 'supplier@test.com'
      };

      sandbox.stub(User, 'findById').rejects(new Error('Database error'));
      sandbox.stub(docController, 'extractInvoiceData').resolves(mockExtractedData);

      const mockReq = {
        file: {
          buffer: mockPdfBuffer,
          originalname: 'test.pdf'
        },
        body: { emailId: mockEmailId },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to save invoice');
    });
  });

  describe('getInvoices', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should return all invoices for user', async () => {
      const mockInvoices = [
        {
          _id: new mongoose.Types.ObjectId(),
          invoice_number: 'INV-1001',
          date: '2025-03-20',
          total_amount: 1000.50,
          status: 'pending'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          invoice_number: 'INV-1002',
          date: '2025-03-20',
          total_amount: 2000.75,
          status: 'approved'
        }
      ];

      sandbox.stub(Invoice, 'find').resolves(mockInvoices);

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await docController.getInvoices(mockReq, mockRes);

      expect(mockRes.json.calledWith(mockInvoices)).to.be.true;
    });

    it('should handle database errors when fetching invoices', async () => {
      sandbox.stub(Invoice, 'find').rejects(new Error('Database error'));

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.getInvoices(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to fetch invoices');
    });
  });

  describe('updateInvoiceStatus', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockInvoiceId = new mongoose.Types.ObjectId();

    it('should update invoice status successfully', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_number: 'INV-1001',
        status: 'pending',
        save: sinon.stub().resolves({
          _id: mockInvoiceId,
          invoice_number: 'INV-1001',
          status: 'approved'
        })
      };

      sandbox.stub(Invoice, 'findOne').resolves(mockInvoice);
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' },
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0].status).to.equal('approved');
      expect(emailService.sendInvoiceStatusEmail.calledOnce).to.be.true;
    });

    it('should handle invalid invoice ID', async () => {
      sandbox.stub(Invoice, 'findOne').resolves(null);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Invoice not found');
    });

    it('should handle invalid status', async () => {
      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'invalid-status' },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid status');
    });

    it('should handle database errors', async () => {
      sandbox.stub(Invoice, 'findOne').rejects(new Error('Database error'));

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to update invoice');
    });
  });

  describe('deleteInvoice', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockInvoiceId = new mongoose.Types.ObjectId();

    it('should delete invoice successfully', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        userId: mockUserId,
        remove: sinon.stub().resolves()
      };

      sandbox.stub(Invoice, 'findOne').resolves(mockInvoice);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await docController.deleteInvoice(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0].message).to.equal('Invoice deleted successfully');
    });

    it('should handle invoice not found', async () => {
      sandbox.stub(Invoice, 'findOne').resolves(null);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.deleteInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Invoice not found');
    });

    it('should handle unauthorized deletion', async () => {
      const differentUserId = new mongoose.Types.ObjectId();
      const mockInvoice = {
        _id: mockInvoiceId,
        userId: differentUserId
      };

      sandbox.stub(Invoice, 'findOne').resolves(mockInvoice);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.deleteInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(403)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Unauthorized to delete this invoice');
    });

    it('should handle database errors', async () => {
      sandbox.stub(Invoice, 'findOne').rejects(new Error('Database error'));

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.deleteInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to delete invoice');
    });
  });
});

describe('Doc Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processInvoice', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockPdfPath = 'test.pdf';
    const mockPdfContent = Buffer.from('fake pdf content');

    beforeEach(() => {
      // Create a temporary PDF file for testing
      const fs = require('fs');
      fs.writeFileSync(mockPdfPath, mockPdfContent);
    });

    afterEach(() => {
      // Clean up the temporary file
      const fs = require('fs');
      if (fs.existsSync(mockPdfPath)) {
        fs.unlinkSync(mockPdfPath);
      }
    });

    it('should process invoice successfully', async () => {
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com'
      };

      const mockInvoiceData = {
        invoice_number: 'INV-123',
        amount: 1000,
        date: '2025-03-20',
        supplier: 'Test Supplier'
      };

      const mockInvoice = {
        _id: new mongoose.Types.ObjectId(),
        ...mockInvoiceData,
        status: 'pending',
        user: mockUserId
      };

      sandbox.stub(require('../models/User'), 'findById').resolves(mockUser);
      sandbox.stub(require('../models/Invoice').prototype, 'save').resolves(mockInvoice);
      sandbox.stub(require('../utils/tokenUtils'), 'generateUniqueInvoiceNumber').resolves('INV-123');
      sandbox.stub(emailService, 'sendInvoiceProcessedEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          path: mockPdfPath
        },
        body: mockInvoiceData
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].invoice).to.deep.include(mockInvoiceData);
      expect(emailService.sendInvoiceProcessedEmail.calledOnce).to.be.true;
    });

    it('should handle missing PDF file', async () => {
      const mockReq = {
        user: { _id: mockUserId },
        body: {
          invoice_number: 'INV-123'
        }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('No PDF file uploaded');
    });

    it('should handle invalid invoice data', async () => {
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com'
      };

      sandbox.stub(require('../models/User'), 'findById').resolves(mockUser);
      sandbox.stub(require('../models/Invoice').prototype, 'save').rejects(new Error('Validation error'));

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          path: mockPdfPath
        },
        body: {
          invoice_number: 'INV-123',
          amount: 'invalid' // Invalid amount
        }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to process invoice');
    });

    it('should handle database errors', async () => {
      sandbox.stub(require('../models/User'), 'findById').rejects(new Error('Database error'));

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          path: mockPdfPath
        },
        body: {
          invoice_number: 'INV-123',
          amount: 1000
        }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to process invoice');
    });
  });

  describe('getInvoices', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should get all invoices for user', async () => {
      const mockInvoices = [
        {
          _id: new mongoose.Types.ObjectId(),
          invoice_number: 'INV-123',
          amount: 1000,
          status: 'pending'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          invoice_number: 'INV-124',
          amount: 2000,
          status: 'approved'
        }
      ];

      sandbox.stub(Invoice, 'find').returns({
        populate: sinon.stub().resolves(mockInvoices)
      });

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await docController.getInvoices(mockReq, mockRes);

      expect(mockRes.json.calledWith(mockInvoices)).to.be.true;
    });

    it('should handle database errors when fetching invoices', async () => {
      sandbox.stub(Invoice, 'find').returns({
        populate: sinon.stub().rejects(new Error('Database error'))
      });

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.getInvoices(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to fetch invoices');
    });
  });

  describe('updateInvoiceStatus', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockInvoiceId = new mongoose.Types.ObjectId();

    it('should update invoice status successfully', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_number: 'INV-123',
        status: 'pending',
        save: sinon.stub().resolves({
          _id: mockInvoiceId,
          invoice_number: 'INV-123',
          status: 'approved'
        })
      };

      sandbox.stub(Invoice, 'findById').resolves(mockInvoice);
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].invoice.status).to.equal('approved');
      expect(emailService.sendInvoiceStatusEmail.calledOnce).to.be.true;
    });

    it('should handle invalid status', async () => {
      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'invalid_status' }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid status');
    });

    it('should handle missing invoice', async () => {
      sandbox.stub(Invoice, 'findById').resolves(null);

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Invoice not found');
    });

    it('should handle database errors', async () => {
      sandbox.stub(Invoice, 'findById').rejects(new Error('Database error'));

      const mockReq = {
        params: { id: mockInvoiceId.toString() },
        body: { status: 'approved' }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to update invoice status');
    });
  });
});

describe('Doc Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    process.env.GROQ_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    sandbox.restore();
    delete process.env.GROQ_API_KEY;
  });

  describe('processInvoice', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockPdfBuffer = Buffer.from('test pdf content');

    it('should process invoice with high confidence successfully', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-2023-001',
        amount: 1000,
        date: '2023-01-01',
        items: [
          { sku: 'SKU001', quantity: 5 },
          { sku: 'SKU002', quantity: 3 }
        ],
        confidence_score: 0.95
      };

      const mockInventoryItems = [
        { sku: 'SKU001', quantity: 10 },
        { sku: 'SKU002', quantity: 8 }
      ];

      sandbox.stub(GroqApi.prototype, 'chat').resolves({
        choices: [{
          message: {
            content: JSON.stringify(mockExtractedData)
          }
        }]
      });

      sandbox.stub(Invoice, 'findOne').resolves(null);
      sandbox.stub(Invoice.prototype, 'save').resolves({
        ...mockExtractedData,
        _id: new mongoose.Types.ObjectId(),
        userId: mockUserId,
        status: 'Approved'
      });

      sandbox.stub(Inventory, 'find').resolves(mockInventoryItems);
      sandbox.stub(emailService, 'sendApprovedInvoiceCustomerEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          buffer: mockPdfBuffer
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].status).to.equal('Approved');
    });

    it('should handle low confidence invoice', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-2023-002',
        amount: 500,
        confidence_score: 0.45
      };

      sandbox.stub(GroqApi.prototype, 'chat').resolves({
        choices: [{
          message: {
            content: JSON.stringify(mockExtractedData)
          }
        }]
      });

      sandbox.stub(Invoice, 'findOne').resolves(null);
      sandbox.stub(Invoice.prototype, 'save').resolves({
        ...mockExtractedData,
        _id: new mongoose.Types.ObjectId(),
        userId: mockUserId,
        status: 'Pending'
      });

      sandbox.stub(emailService, 'sendPendingInvoiceEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          buffer: mockPdfBuffer
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].status).to.equal('Pending');
    });

    it('should handle duplicate invoice number', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-2023-003',
        amount: 750,
        confidence_score: 0.85
      };

      sandbox.stub(GroqApi.prototype, 'chat').resolves({
        choices: [{
          message: {
            content: JSON.stringify(mockExtractedData)
          }
        }]
      });

      sandbox.stub(Invoice, 'findOne').resolves({
        invoice_number: 'INV-2023-003'
      });

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          buffer: mockPdfBuffer
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('already exists');
    });

    it('should handle missing inventory items', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-2023-004',
        amount: 1200,
        items: [
          { sku: 'INVALID-SKU', quantity: 2 }
        ],
        confidence_score: 0.92
      };

      sandbox.stub(GroqApi.prototype, 'chat').resolves({
        choices: [{
          message: {
            content: JSON.stringify(mockExtractedData)
          }
        }]
      });

      sandbox.stub(Invoice, 'findOne').resolves(null);
      sandbox.stub(Inventory, 'find').resolves([]);
      sandbox.stub(emailService, 'sendMissingSkuCustomerEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          buffer: mockPdfBuffer
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid SKUs');
    });

    it('should handle insufficient inventory', async () => {
      const mockExtractedData = {
        invoice_number: 'INV-2023-005',
        amount: 1500,
        items: [
          { sku: 'SKU001', quantity: 20 }
        ],
        confidence_score: 0.88
      };

      sandbox.stub(GroqApi.prototype, 'chat').resolves({
        choices: [{
          message: {
            content: JSON.stringify(mockExtractedData)
          }
        }]
      });

      sandbox.stub(Invoice, 'findOne').resolves(null);
      sandbox.stub(Inventory, 'find').resolves([
        { sku: 'SKU001', quantity: 10 }
      ]);
      sandbox.stub(emailService, 'sendDelayedDeliveryCustomerEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        file: {
          buffer: mockPdfBuffer
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.processInvoice(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Insufficient inventory');
    });
  });

  describe('getMonthlyInvoiceStats', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should get monthly stats successfully', async () => {
      const mockInvoices = [
        {
          status: 'Approved',
          amount: 1000,
          date: new Date('2023-01-15')
        },
        {
          status: 'Approved',
          amount: 1500,
          date: new Date('2023-01-20')
        },
        {
          status: 'Rejected',
          amount: 500,
          date: new Date('2023-01-25')
        }
      ];

      sandbox.stub(Invoice, 'find').resolves(mockInvoices);

      const mockReq = {
        user: { _id: mockUserId },
        query: {
          month: 1,
          year: 2023
        }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      const stats = mockRes.json.firstCall.args[0];
      expect(stats.totalAmount).to.equal(3000);
      expect(stats.approvedAmount).to.equal(2500);
      expect(stats.rejectedAmount).to.equal(500);
      expect(stats.totalCount).to.equal(3);
    });

    it('should handle invalid month/year', async () => {
      const mockReq = {
        user: { _id: mockUserId },
        query: {
          month: 13,
          year: -1
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid');
    });

    it('should handle no invoices found', async () => {
      sandbox.stub(Invoice, 'find').resolves([]);

      const mockReq = {
        user: { _id: mockUserId },
        query: {
          month: 1,
          year: 2023
        }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.getMonthlyInvoiceStats(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      const stats = mockRes.json.firstCall.args[0];
      expect(stats.totalAmount).to.equal(0);
      expect(stats.totalCount).to.equal(0);
    });
  });

  describe('manuallyUpdateInvoiceStatus', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockInvoiceId = new mongoose.Types.ObjectId();

    it('should approve invoice successfully', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_number: 'INV-2023-006',
        status: 'Pending',
        items: [
          { sku: 'SKU001', quantity: 5 }
        ],
        save: sinon.stub().resolves()
      };

      const mockInventoryItems = [
        { sku: 'SKU001', quantity: 10, save: sinon.stub().resolves() }
      ];

      sandbox.stub(Invoice, 'findOne').resolves(mockInvoice);
      sandbox.stub(Inventory, 'find').resolves(mockInventoryItems);
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Approved' }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      expect(mockInvoice.status).to.equal('Approved');
      expect(mockInventoryItems[0].quantity).to.equal(5);
    });

    it('should reject invoice successfully', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_number: 'INV-2023-007',
        status: 'Pending',
        save: sinon.stub().resolves()
      };

      sandbox.stub(Invoice, 'findOne').resolves(mockInvoice);
      sandbox.stub(emailService, 'sendInvoiceStatusEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Rejected' }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      expect(mockInvoice.status).to.equal('Rejected');
    });

    it('should handle invalid status', async () => {
      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Invalid' }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid status');
    });

    it('should handle invoice not found', async () => {
      sandbox.stub(Invoice, 'findOne').resolves(null);

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Approved' }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('not found');
    });

    it('should handle insufficient inventory for approval', async () => {
      const mockInvoice = {
        _id: mockInvoiceId,
        invoice_number: 'INV-2023-008',
        status: 'Pending',
        items: [
          { sku: 'SKU001', quantity: 15 }
        ]
      };

      const mockInventoryItems = [
        { sku: 'SKU001', quantity: 10 }
      ];

      sandbox.stub(Invoice, 'findOne').resolves(mockInvoice);
      sandbox.stub(Inventory, 'find').resolves(mockInventoryItems);

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockInvoiceId.toString() },
        body: { status: 'Approved' }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await docController.manuallyUpdateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Insufficient inventory');
    });
  });
});
