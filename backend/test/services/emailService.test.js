const { expect } = require('chai');
const sinon = require('sinon');
const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const emailService = require('../../services/emailService');

describe('Email Service Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    process.env.EMAIL_FROM = 'test@example.com';
    process.env.AWS_BUCKET_NAME = 'test-bucket';
  });

  afterEach(() => {
    sandbox.restore();
    delete process.env.EMAIL_FROM;
    delete process.env.AWS_BUCKET_NAME;
  });

  describe('sendInvoiceStatusEmail', () => {
    const mockInvoice = {
      invoiceNumber: 'INV-2023-001',
      amount: 1000,
      items: [
        { sku: 'SKU001', quantity: 5, name: 'Test Item' }
      ],
      status: 'approved'
    };
    const mockCustomerEmail = 'customer@example.com';

    it('should send approved invoice email successfully', async () => {
      const mockTransporter = {
        sendMail: sinon.stub().resolves({ messageId: 'test-message-id' })
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      await emailService.sendInvoiceStatusEmail(mockInvoice, mockCustomerEmail);
      
      expect(mockTransporter.sendMail.called).to.be.true;
      const emailOptions = mockTransporter.sendMail.firstCall.args[0];
      expect(emailOptions.to).to.equal(mockCustomerEmail);
      expect(emailOptions.subject).to.include('Invoice Approved');
      expect(emailOptions.html).to.include(mockInvoice.invoiceNumber);
    });

    it('should send rejected invoice email successfully', async () => {
      const mockInvoiceRejected = {
        ...mockInvoice,
        status: 'rejected'
      };

      const mockTransporter = {
        sendMail: sinon.stub().resolves({ messageId: 'test-message-id' })
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      await emailService.sendInvoiceStatusEmail(mockInvoiceRejected, mockCustomerEmail);
      
      expect(mockTransporter.sendMail.called).to.be.true;
      const emailOptions = mockTransporter.sendMail.firstCall.args[0];
      expect(emailOptions.to).to.equal(mockCustomerEmail);
      expect(emailOptions.subject).to.include('Invoice Rejected');
      expect(emailOptions.html).to.include(mockInvoice.invoiceNumber);
    });

    it('should handle missing invoice', async () => {
      try {
        await emailService.sendInvoiceStatusEmail(null, mockCustomerEmail);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invoice is required');
      }
    });

    it('should handle missing customer email', async () => {
      try {
        await emailService.sendInvoiceStatusEmail(mockInvoice);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Customer email is required');
      }
    });

    it('should handle email sending errors', async () => {
      const mockTransporter = {
        sendMail: sinon.stub().rejects(new Error('Failed to send email'))
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      try {
        await emailService.sendInvoiceStatusEmail(mockInvoice, mockCustomerEmail);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to send invoice status email');
      }
    });
  });

  describe('sendSupplierOrderEmail', () => {
    const mockOrder = {
      orderNumber: 'PO-2023-001',
      items: [
        { sku: 'SKU001', quantity: 5, name: 'Test Item', specifications: 'Test Specs' }
      ],
      notes: 'Test order notes'
    };
    const mockSupplierEmail = 'supplier@example.com';
    const mockSenderInfo = {
      name: 'Test Sender',
      email: 'sender@example.com'
    };

    it('should send supplier order email successfully', async () => {
      const mockTransporter = {
        sendMail: sinon.stub().resolves({ messageId: 'test-message-id' })
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      await emailService.sendSupplierOrderEmail(mockOrder, mockSupplierEmail, mockSenderInfo);
      
      expect(mockTransporter.sendMail.called).to.be.true;
      const emailOptions = mockTransporter.sendMail.firstCall.args[0];
      expect(emailOptions.to).to.equal(mockSupplierEmail);
      expect(emailOptions.subject).to.include('Purchase Order');
      expect(emailOptions.html).to.include(mockOrder.orderNumber);
      expect(emailOptions.html).to.include(mockSenderInfo.name);
    });

    it('should handle missing order', async () => {
      try {
        await emailService.sendSupplierOrderEmail(null, mockSupplierEmail, mockSenderInfo);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Order is required');
      }
    });

    it('should handle missing supplier email', async () => {
      try {
        await emailService.sendSupplierOrderEmail(mockOrder, null, mockSenderInfo);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Supplier email is required');
      }
    });

    it('should handle missing sender info', async () => {
      try {
        await emailService.sendSupplierOrderEmail(mockOrder, mockSupplierEmail);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Sender info is required');
      }
    });

    it('should handle email sending errors', async () => {
      const mockTransporter = {
        sendMail: sinon.stub().rejects(new Error('Failed to send email'))
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      try {
        await emailService.sendSupplierOrderEmail(mockOrder, mockSupplierEmail, mockSenderInfo);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to send supplier order email');
      }
    });
  });

  describe('sendLowInventoryAlert', () => {
    const mockItems = [
      { sku: 'SKU001', name: 'Test Item 1', quantity: 2, minQuantity: 5 },
      { sku: 'SKU002', name: 'Test Item 2', quantity: 1, minQuantity: 10 }
    ];
    const mockUserEmail = 'user@example.com';

    it('should send low inventory alert successfully', async () => {
      const mockTransporter = {
        sendMail: sinon.stub().resolves({ messageId: 'test-message-id' })
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      await emailService.sendLowInventoryAlert(mockItems, mockUserEmail);
      
      expect(mockTransporter.sendMail.called).to.be.true;
      const emailOptions = mockTransporter.sendMail.firstCall.args[0];
      expect(emailOptions.to).to.equal(mockUserEmail);
      expect(emailOptions.subject).to.include('Low Inventory Alert');
      expect(emailOptions.html).to.include('SKU001');
      expect(emailOptions.html).to.include('SKU002');
    });

    it('should handle missing items', async () => {
      try {
        await emailService.sendLowInventoryAlert(null, mockUserEmail);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Items array is required');
      }
    });

    it('should handle empty items array', async () => {
      try {
        await emailService.sendLowInventoryAlert([], mockUserEmail);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Items array cannot be empty');
      }
    });

    it('should handle missing user email', async () => {
      try {
        await emailService.sendLowInventoryAlert(mockItems);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('User email is required');
      }
    });

    it('should handle email sending errors', async () => {
      const mockTransporter = {
        sendMail: sinon.stub().rejects(new Error('Failed to send email'))
      };

      sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);

      try {
        await emailService.sendLowInventoryAlert(mockItems, mockUserEmail);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to send low inventory alert');
      }
    });
  });
});
