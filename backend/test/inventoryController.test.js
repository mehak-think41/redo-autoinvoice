const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const inventoryController = require('../controllers/inventoryController');
const emailService = require('../services/emailService');

describe('Inventory Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should add new inventory item successfully', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Item',
        quantity: 10,
        minQuantity: 5,
        specifications: 'Test specs'
      };

      sandbox.stub(Inventory, 'findOne').resolves(null);
      sandbox.stub(Inventory.prototype, 'save').resolves({
        _id: new mongoose.Types.ObjectId(),
        ...mockItem,
        userId: mockUserId
      });

      const mockReq = {
        body: mockItem,
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(201)).to.be.true;
      expect(mockRes.json.firstCall.args[0].item).to.have.property('sku', mockItem.sku);
    });

    it('should handle duplicate SKU', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Item',
        quantity: 10,
        minQuantity: 5
      };

      sandbox.stub(Inventory, 'findOne').resolves({
        _id: new mongoose.Types.ObjectId(),
        ...mockItem
      });

      const mockReq = {
        body: mockItem,
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('SKU already exists');
    });

    it('should handle missing required fields', async () => {
      const mockReq = {
        body: {
          name: 'Test Item'
        },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('required');
    });

    it('should handle database errors', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Item',
        quantity: 10,
        minQuantity: 5
      };

      sandbox.stub(Inventory, 'findOne').rejects(new Error('Database error'));

      const mockReq = {
        body: mockItem,
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to add item');
    });
  });

  describe('updateInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockItemId = new mongoose.Types.ObjectId();

    it('should update inventory item successfully', async () => {
      const mockUpdate = {
        quantity: 15,
        minQuantity: 8
      };

      const mockItem = {
        _id: mockItemId,
        userId: mockUserId,
        sku: 'SKU001',
        name: 'Test Item',
        quantity: 10,
        minQuantity: 5,
        save: sinon.stub().resolves()
      };

      sandbox.stub(Inventory, 'findById').resolves(mockItem);

      const mockReq = {
        params: { id: mockItemId.toString() },
        body: mockUpdate,
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockItem.quantity).to.equal(mockUpdate.quantity);
      expect(mockItem.minQuantity).to.equal(mockUpdate.minQuantity);
    });

    it('should handle non-existent item', async () => {
      sandbox.stub(Inventory, 'findById').resolves(null);

      const mockReq = {
        params: { id: mockItemId.toString() },
        body: { quantity: 15 },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Item not found');
    });

    it('should handle unauthorized access', async () => {
      const mockItem = {
        _id: mockItemId,
        userId: new mongoose.Types.ObjectId(), // Different user
        sku: 'SKU001',
        quantity: 10
      };

      sandbox.stub(Inventory, 'findById').resolves(mockItem);

      const mockReq = {
        params: { id: mockItemId.toString() },
        body: { quantity: 15 },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(403)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Unauthorized');
    });

    it('should handle database errors', async () => {
      sandbox.stub(Inventory, 'findById').rejects(new Error('Database error'));

      const mockReq = {
        params: { id: mockItemId.toString() },
        body: { quantity: 15 },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to update item');
    });
  });

  describe('sendSupplierOrder', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should send supplier order successfully', async () => {
      const mockOrder = {
        items: [
          { sku: 'SKU001', quantity: 10, name: 'Test Item 1' },
          { sku: 'SKU002', quantity: 5, name: 'Test Item 2' }
        ],
        supplierEmail: 'supplier@example.com',
        notes: 'Urgent order'
      };

      const mockUser = {
        _id: mockUserId,
        name: 'Test User',
        email: 'user@example.com'
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(emailService, 'sendSupplierOrderEmail').resolves();

      const mockReq = {
        body: mockOrder,
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(emailService.sendSupplierOrderEmail.called).to.be.true;
      const emailCall = emailService.sendSupplierOrderEmail.firstCall;
      expect(emailCall.args[1]).to.equal(mockOrder.supplierEmail);
      expect(emailCall.args[2]).to.include({ name: mockUser.name });
    });

    it('should handle missing required fields', async () => {
      const mockReq = {
        body: {
          items: [{ sku: 'SKU001', quantity: 10 }]
          // Missing supplierEmail
        },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('required');
    });

    it('should handle email service errors', async () => {
      const mockOrder = {
        items: [{ sku: 'SKU001', quantity: 10, name: 'Test Item' }],
        supplierEmail: 'supplier@example.com'
      };

      const mockUser = {
        _id: mockUserId,
        name: 'Test User',
        email: 'user@example.com'
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(emailService, 'sendSupplierOrderEmail').rejects(new Error('Email error'));

      const mockReq = {
        body: mockOrder,
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to send order');
    });

    it('should handle user not found', async () => {
      sandbox.stub(User, 'findById').resolves(null);

      const mockReq = {
        body: {
          items: [{ sku: 'SKU001', quantity: 10 }],
          supplierEmail: 'supplier@example.com'
        },
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('User not found');
    });
  });

  describe('addItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should add new item successfully', async () => {
      const mockItem = {
        sku: 'SKU123',
        name: 'Test Item',
        description: 'Test Description',
        quantity: 10,
        reorderPoint: 5,
        unitPrice: 100.50,
        supplier: 'Test Supplier',
        supplierEmail: 'supplier@test.com'
      };

      sandbox.stub(Inventory.prototype, 'save').resolves({
        _id: new mongoose.Types.ObjectId(),
        userId: mockUserId,
        ...mockItem
      });

      const mockReq = {
        body: mockItem,
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(201)).to.be.true;
      expect(mockRes.json.firstCall.args[0].sku).to.equal(mockItem.sku);
    });

    it('should handle missing required fields', async () => {
      const mockReq = {
        body: {
          name: 'Test Item',
          // Missing other required fields
        },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Missing required fields');
    });

    it('should handle duplicate SKU', async () => {
      const mockItem = {
        sku: 'SKU123',
        name: 'Test Item',
        description: 'Test Description',
        quantity: 10,
        reorderPoint: 5,
        unitPrice: 100.50
      };

      sandbox.stub(Inventory.prototype, 'save').rejects(new Error('Duplicate key error'));

      const mockReq = {
        body: mockItem,
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('SKU already exists');
    });
  });

  describe('getItems', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should return all items for user', async () => {
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SKU123',
          name: 'Item 1',
          quantity: 10
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SKU124',
          name: 'Item 2',
          quantity: 20
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.getItems(mockReq, mockRes);

      expect(mockRes.json.calledWith(mockItems)).to.be.true;
    });

    it('should handle database errors', async () => {
      sandbox.stub(Inventory, 'find').rejects(new Error('Database error'));

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.getItems(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to fetch inventory items');
    });
  });

  describe('updateItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockItemId = new mongoose.Types.ObjectId();

    it('should update item successfully', async () => {
      const mockItem = {
        _id: mockItemId,
        sku: 'SKU123',
        name: 'Updated Item',
        quantity: 15,
        save: sinon.stub().resolves({
          _id: mockItemId,
          sku: 'SKU123',
          name: 'Updated Item',
          quantity: 15
        })
      };

      sandbox.stub(Inventory, 'findOne').resolves(mockItem);

      const mockReq = {
        params: { id: mockItemId.toString() },
        body: {
          name: 'Updated Item',
          quantity: 15
        },
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.updateItem(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0].name).to.equal('Updated Item');
      expect(mockRes.json.firstCall.args[0].quantity).to.equal(15);
    });

    it('should handle item not found', async () => {
      sandbox.stub(Inventory, 'findOne').resolves(null);

      const mockReq = {
        params: { id: mockItemId.toString() },
        body: { name: 'Updated Item' },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Item not found');
    });

    it('should handle invalid updates', async () => {
      const mockReq = {
        params: { id: mockItemId.toString() },
        body: { invalidField: 'value' },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('No valid updates provided');
    });
  });

  describe('deleteItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockItemId = new mongoose.Types.ObjectId();

    it('should delete item successfully', async () => {
      const mockItem = {
        _id: mockItemId,
        userId: mockUserId,
        remove: sinon.stub().resolves()
      };

      sandbox.stub(Inventory, 'findOne').resolves(mockItem);

      const mockReq = {
        params: { id: mockItemId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.deleteItem(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0].message).to.equal('Item deleted successfully');
    });

    it('should handle item not found', async () => {
      sandbox.stub(Inventory, 'findOne').resolves(null);

      const mockReq = {
        params: { id: mockItemId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.deleteItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Item not found');
    });

    it('should handle unauthorized deletion', async () => {
      const differentUserId = new mongoose.Types.ObjectId();
      const mockItem = {
        _id: mockItemId,
        userId: differentUserId
      };

      sandbox.stub(Inventory, 'findOne').resolves(mockItem);

      const mockReq = {
        params: { id: mockItemId.toString() },
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.deleteItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(403)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.equal('Unauthorized to delete this item');
    });
  });

  describe('checkLowStock', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should identify low stock items and send notifications', async () => {
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SKU123',
          name: 'Low Stock Item',
          quantity: 2,
          reorderPoint: 5,
          supplier: 'Test Supplier',
          supplierEmail: 'supplier@test.com'
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);
      sandbox.stub(emailService, 'sendLowStockAlert').resolves();

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.checkLowStock(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0].lowStockItems).to.have.lengthOf(1);
      expect(emailService.sendLowStockAlert.called).to.be.true;
    });

    it('should handle no low stock items', async () => {
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SKU123',
          name: 'Well Stocked Item',
          quantity: 10,
          reorderPoint: 5
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.checkLowStock(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0].lowStockItems).to.have.lengthOf(0);
    });

    it('should handle database errors', async () => {
      sandbox.stub(Inventory, 'find').rejects(new Error('Database error'));

      const mockReq = {
        user: { _id: mockUserId }
      };

      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.checkLowStock(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Failed to check inventory');
    });
  });

  describe('addInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should add new inventory item successfully', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Product',
        quantity: 10,
        unit_price: 100,
        reorder_point: 5,
        supplier_info: {
          name: 'Test Supplier',
          email: 'supplier@example.com'
        }
      };

      sandbox.stub(Inventory, 'findOne').resolves(null);
      sandbox.stub(Inventory.prototype, 'save').resolves({
        ...mockItem,
        _id: new mongoose.Types.ObjectId(),
        userId: mockUserId
      });

      const mockReq = {
        user: { _id: mockUserId },
        body: mockItem
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(201)).to.be.true;
      expect(mockRes.json.firstCall.args[0]).to.have.property('sku', mockItem.sku);
    });

    it('should handle duplicate SKU', async () => {
      sandbox.stub(Inventory, 'findOne').resolves({ sku: 'SKU001' });

      const mockReq = {
        user: { _id: mockUserId },
        body: { sku: 'SKU001' }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('SKU already exists');
    });
  });

  describe('updateInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockItemId = new mongoose.Types.ObjectId();

    it('should update inventory item successfully', async () => {
      const mockItem = {
        _id: mockItemId,
        sku: 'SKU001',
        name: 'Test Product',
        quantity: 10,
        userId: mockUserId,
        save: sinon.stub().resolves()
      };

      sandbox.stub(Inventory, 'findOne').resolves(mockItem);

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() },
        body: {
          quantity: 15,
          unit_price: 120
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockItem.quantity).to.equal(15);
    });

    it('should handle item not found', async () => {
      sandbox.stub(Inventory, 'findOne').resolves(null);

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() },
        body: { quantity: 15 }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('not found');
    });
  });

  describe('deleteInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockItemId = new mongoose.Types.ObjectId();

    it('should delete inventory item successfully', async () => {
      sandbox.stub(Inventory, 'findOneAndDelete').resolves({
        _id: mockItemId,
        sku: 'SKU001'
      });

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.deleteInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].message).to.include('deleted');
    });

    it('should handle item not found', async () => {
      sandbox.stub(Inventory, 'findOneAndDelete').resolves(null);

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.deleteInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
    });
  });

  describe('getInventoryItems', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should get all inventory items successfully', async () => {
      const mockItems = [
        {
          sku: 'SKU001',
          name: 'Product 1',
          quantity: 10
        },
        {
          sku: 'SKU002',
          name: 'Product 2',
          quantity: 20
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId },
        query: {}
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.getInventoryItems(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0]).to.have.lengthOf(2);
    });

    it('should filter by low stock items', async () => {
      const mockItems = [
        {
          sku: 'SKU001',
          name: 'Product 1',
          quantity: 2,
          reorder_point: 5
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId },
        query: { filter: 'low_stock' }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.getInventoryItems(mockReq, mockRes);

      expect(mockRes.json.firstCall.args[0]).to.have.lengthOf(1);
    });
  });

  describe('sendSupplierOrder', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should send supplier order successfully', async () => {
      const mockUser = {
        _id: mockUserId,
        name: 'Test User',
        email: 'user@example.com'
      };

      const mockItems = [
        {
          sku: 'SKU001',
          name: 'Product 1',
          quantity: 10,
          supplier_info: {
            email: 'supplier1@example.com'
          }
        },
        {
          sku: 'SKU002',
          name: 'Product 2',
          quantity: 20,
          supplier_info: {
            email: 'supplier2@example.com'
          }
        }
      ];

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(Inventory, 'find').resolves(mockItems);
      sandbox.stub(emailService, 'sendSupplierOrderEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        body: {
          items: [
            { sku: 'SKU001', quantity: 50 },
            { sku: 'SKU002', quantity: 30 }
          ],
          notes: 'Urgent order'
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(emailService.sendSupplierOrderEmail.calledTwice).to.be.true;
    });

    it('should handle missing items', async () => {
      const mockReq = {
        user: { _id: mockUserId },
        body: {}
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('items are required');
    });

    it('should handle invalid SKUs', async () => {
      sandbox.stub(Inventory, 'find').resolves([]);

      const mockReq = {
        user: { _id: mockUserId },
        body: {
          items: [{ sku: 'INVALID-SKU', quantity: 10 }]
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Invalid SKUs');
    });
  });
});

describe('Inventory Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should add new inventory item successfully', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Product',
        quantity: 100,
        specifications: 'Test Specs',
        reorderPoint: 20
      };

      sandbox.stub(Inventory.prototype, 'save').resolves({
        _id: new mongoose.Types.ObjectId(),
        userId: mockUserId,
        ...mockItem
      });

      const mockReq = {
        user: { _id: mockUserId },
        body: mockItem
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(201)).to.be.true;
      expect(mockRes.json.firstCall.args[0].sku).to.equal(mockItem.sku);
    });

    it('should handle duplicate SKU', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Product',
        quantity: 100
      };

      sandbox.stub(Inventory.prototype, 'save').rejects({
        code: 11000,
        keyPattern: { sku: 1 }
      });

      const mockReq = {
        user: { _id: mockUserId },
        body: mockItem
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('already exists');
    });

    it('should handle validation errors', async () => {
      const mockItem = {
        sku: '',
        name: '',
        quantity: -1
      };

      const mockReq = {
        user: { _id: mockUserId },
        body: mockItem
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.addInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('validation');
    });
  });

  describe('updateInventoryItem', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockItemId = new mongoose.Types.ObjectId();

    it('should update inventory item successfully', async () => {
      const mockItem = {
        sku: 'SKU001',
        name: 'Test Product',
        quantity: 150,
        specifications: 'Updated Specs'
      };

      sandbox.stub(Inventory, 'findOneAndUpdate').resolves({
        _id: mockItemId,
        userId: mockUserId,
        ...mockItem
      });

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() },
        body: mockItem
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      expect(mockRes.json.firstCall.args[0].quantity).to.equal(mockItem.quantity);
    });

    it('should handle item not found', async () => {
      sandbox.stub(Inventory, 'findOneAndUpdate').resolves(null);

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() },
        body: { quantity: 100 }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('not found');
    });

    it('should handle validation errors', async () => {
      sandbox.stub(Inventory, 'findOneAndUpdate').rejects(new Error('Validation error'));

      const mockReq = {
        user: { _id: mockUserId },
        params: { id: mockItemId.toString() },
        body: { quantity: -1 }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.updateInventoryItem(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('validation');
    });
  });

  describe('getInventoryItems', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should get all inventory items successfully', async () => {
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SKU001',
          name: 'Product 1',
          quantity: 100
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SKU002',
          name: 'Product 2',
          quantity: 50
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.getInventoryItems(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      expect(mockRes.json.firstCall.args[0]).to.have.lengthOf(2);
    });

    it('should handle empty inventory', async () => {
      sandbox.stub(Inventory, 'find').resolves([]);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.getInventoryItems(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      expect(mockRes.json.firstCall.args[0]).to.have.lengthOf(0);
    });

    it('should handle database errors', async () => {
      sandbox.stub(Inventory, 'find').rejects(new Error('Database error'));

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.getInventoryItems(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Error fetching');
    });
  });

  describe('sendSupplierOrder', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should send supplier order successfully', async () => {
      const mockUser = {
        _id: mockUserId,
        name: 'John Buyer',
        email: 'buyer@example.com'
      };

      const mockOrderData = {
        supplierEmail: 'supplier@example.com',
        items: [
          {
            sku: 'SKU001',
            name: 'Product 1',
            quantity: 100,
            specifications: 'Color: Red'
          }
        ],
        notes: 'Urgent order'
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(emailService, 'sendSupplierOrderEmail').resolves();

      const mockReq = {
        user: { _id: mockUserId },
        body: mockOrderData
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.firstCall.args[0].message).to.include('successfully');
      expect(emailService.sendSupplierOrderEmail.calledOnce).to.be.true;
    });

    it('should handle missing supplier email', async () => {
      const mockReq = {
        user: { _id: mockUserId },
        body: {
          items: [{ sku: 'SKU001', quantity: 100 }]
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('supplier email');
    });

    it('should handle missing items', async () => {
      const mockReq = {
        user: { _id: mockUserId },
        body: {
          supplierEmail: 'supplier@example.com'
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('items');
    });

    it('should handle email service errors', async () => {
      const mockUser = {
        _id: mockUserId,
        name: 'John Buyer',
        email: 'buyer@example.com'
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(emailService, 'sendSupplierOrderEmail').rejects(new Error('Email error'));

      const mockReq = {
        user: { _id: mockUserId },
        body: {
          supplierEmail: 'supplier@example.com',
          items: [{ sku: 'SKU001', quantity: 100 }]
        }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.sendSupplierOrder(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('send order');
    });
  });

  describe('checkLowInventory', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should identify low inventory items successfully', async () => {
      const mockItems = [
        {
          sku: 'SKU001',
          name: 'Product 1',
          quantity: 10,
          reorderPoint: 20
        },
        {
          sku: 'SKU002',
          name: 'Product 2',
          quantity: 30,
          reorderPoint: 20
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.checkLowInventory(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      const lowItems = mockRes.json.firstCall.args[0];
      expect(lowItems).to.have.lengthOf(1);
      expect(lowItems[0].sku).to.equal('SKU001');
    });

    it('should handle no low inventory items', async () => {
      const mockItems = [
        {
          sku: 'SKU001',
          name: 'Product 1',
          quantity: 30,
          reorderPoint: 20
        }
      ];

      sandbox.stub(Inventory, 'find').resolves(mockItems);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        json: sinon.stub()
      };

      await inventoryController.checkLowInventory(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      expect(mockRes.json.firstCall.args[0]).to.have.lengthOf(0);
    });

    it('should handle database errors', async () => {
      sandbox.stub(Inventory, 'find').rejects(new Error('Database error'));

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await inventoryController.checkLowInventory(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Error checking');
    });
  });
});
