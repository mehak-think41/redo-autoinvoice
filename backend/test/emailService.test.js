const { expect } = require('chai');
const sinon = require('sinon');
const nodemailer = require('nodemailer');
const emailService = require('../services/emailService');

describe('Email Service Tests', () => {
  let sandbox;
  let mockTransporter;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockTransporter = {
      sendMail: sandbox.stub().resolves({ messageId: 'test-id' })
    };
    sandbox.stub(nodemailer, 'createTransport').returns(mockTransporter);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendPendingInvoiceEmail', () => {
    it('should send pending invoice notification successfully', async () => {
      const email = 'user@example.com';
      const data = {
        invoice_number: 'INV-2023-001',
        amount: 100,
        confidence_score: 45,
        items: [
          { sku: 'SKU001', quantity: 2, unit_price: 50 }
        ]
      };

      await emailService.sendPendingInvoiceEmail(email, data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(email);
      expect(emailArgs.subject).to.include('Pending Invoice Review');
      expect(emailArgs.html).to.include(data.invoice_number);
      expect(emailArgs.html).to.include(data.amount.toString());
    });

    it('should handle missing data fields', async () => {
      const email = 'user@example.com';
      const data = {
        invoice_number: 'INV-2023-001'
      };

      await emailService.sendPendingInvoiceEmail(email, data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.html).to.include('N/A');
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail.rejects(new Error('SMTP error'));

      try {
        await emailService.sendPendingInvoiceEmail('user@example.com', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('SMTP error');
      }
    });
  });

  describe('sendApprovedInvoiceCustomerEmail', () => {
    it('should send order confirmation successfully', async () => {
      const email = 'customer@example.com';
      const data = {
        invoice_number: 'INV-2023-002',
        amount: 200,
        customerName: 'John Doe',
        shippingAddress: '123 Main St',
        items: [
          { sku: 'SKU001', name: 'Product 1', quantity: 2, unit_price: 100 }
        ]
      };

      await emailService.sendApprovedInvoiceCustomerEmail(email, data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(email);
      expect(emailArgs.subject).to.include('Order Confirmation');
      expect(emailArgs.html).to.include(data.customerName);
      expect(emailArgs.html).to.include(data.shippingAddress);
      expect(emailArgs.html).to.include(data.items[0].name);
    });

    it('should handle missing shipping details', async () => {
      const email = 'customer@example.com';
      const data = {
        invoice_number: 'INV-2023-002',
        amount: 200
      };

      await emailService.sendApprovedInvoiceCustomerEmail(email, data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.html).to.include('Valued Customer');
    });
  });

  describe('sendDelayedDeliveryCustomerEmail', () => {
    it('should send delayed delivery notification successfully', async () => {
      const email = 'customer@example.com';
      const data = {
        invoice_number: 'INV-2023-003',
        customerName: 'Jane Doe',
        items: [
          { sku: 'SKU001', name: 'Product 1', quantity: 5 }
        ]
      };

      await emailService.sendDelayedDeliveryCustomerEmail(email, data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(email);
      expect(emailArgs.subject).to.include('Order Update');
      expect(emailArgs.html).to.include(data.customerName);
      expect(emailArgs.html).to.include(data.items[0].name);
    });
  });

  describe('sendMissingSkuCustomerEmail', () => {
    it('should send missing SKU notification successfully', async () => {
      const email = 'customer@example.com';
      const data = {
        invoice_number: 'INV-2023-004',
        sku: 'SKU001',
        customerName: 'Alice Smith'
      };

      await emailService.sendMissingSkuCustomerEmail(email, data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(email);
      expect(emailArgs.subject).to.include('Product Availability');
      expect(emailArgs.html).to.include(data.sku);
    });
  });

  describe('sendInvoiceStatusEmail', () => {
    it('should send approved status email successfully', async () => {
      const data = {
        email: 'customer@example.com',
        status: 'Approved',
        invoice_number: 'INV-2023-005',
        amount: 500,
        customerName: 'Bob Johnson',
        items: [
          { sku: 'SKU001', name: 'Product 1', quantity: 1, unit_price: 500 }
        ]
      };

      await emailService.sendInvoiceStatusEmail(data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(data.email);
      expect(emailArgs.subject).to.include('Approved');
      expect(emailArgs.html).to.include(data.customerName);
      expect(emailArgs.html).to.include(data.amount.toString());
    });

    it('should send rejected status email successfully', async () => {
      const data = {
        email: 'customer@example.com',
        status: 'Rejected',
        invoice_number: 'INV-2023-006',
        reason: 'Invalid items'
      };

      await emailService.sendInvoiceStatusEmail(data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(data.email);
      expect(emailArgs.subject).to.include('Rejected');
      expect(emailArgs.html).to.include(data.reason);
    });

    it('should handle invalid status', async () => {
      const data = {
        email: 'customer@example.com',
        status: 'Invalid',
        invoice_number: 'INV-2023-007'
      };

      try {
        await emailService.sendInvoiceStatusEmail(data);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Invalid status');
      }
    });
  });

  describe('sendSupplierOrderEmail', () => {
    it('should send supplier order email successfully', async () => {
      const data = {
        supplierEmail: 'supplier@example.com',
        senderName: 'John Buyer',
        senderEmail: 'buyer@example.com',
        items: [
          {
            sku: 'SKU001',
            name: 'Product 1',
            quantity: 10,
            specifications: 'Color: Red, Size: Large'
          },
          {
            sku: 'SKU002',
            name: 'Product 2',
            quantity: 5,
            specifications: 'Material: Steel'
          }
        ],
        notes: 'Urgent order, please expedite'
      };

      await emailService.sendSupplierOrderEmail(data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(data.supplierEmail);
      expect(emailArgs.subject).to.include('Purchase Order');
      expect(emailArgs.html).to.include(data.senderName);
      expect(emailArgs.html).to.include(data.items[0].sku);
      expect(emailArgs.html).to.include(data.items[1].specifications);
      expect(emailArgs.html).to.include(data.notes);
    });

    it('should handle missing optional fields', async () => {
      const data = {
        supplierEmail: 'supplier@example.com',
        senderName: 'John Buyer',
        senderEmail: 'buyer@example.com',
        items: [
          {
            sku: 'SKU001',
            name: 'Product 1',
            quantity: 10
          }
        ]
      };

      await emailService.sendSupplierOrderEmail(data);

      expect(mockTransporter.sendMail.calledOnce).to.be.true;
      const emailArgs = mockTransporter.sendMail.firstCall.args[0];
      expect(emailArgs.to).to.equal(data.supplierEmail);
      expect(emailArgs.html).to.not.include('Notes');
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail.rejects(new Error('SMTP error'));

      const data = {
        supplierEmail: 'supplier@example.com',
        senderName: 'John Buyer',
        senderEmail: 'buyer@example.com',
        items: [
          {
            sku: 'SKU001',
            name: 'Product 1',
            quantity: 10
          }
        ]
      };

      try {
        await emailService.sendSupplierOrderEmail(data);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('SMTP error');
      }
    });
  });
});
