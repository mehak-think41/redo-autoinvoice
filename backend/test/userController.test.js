const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const userController = require('../controllers/userController');
const User = require('../models/User');
const GoogleToken = require('../models/GoogleToken');
const { google } = require('googleapis');

describe('User Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getGmailInboxLive', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should fetch Gmail inbox successfully', async () => {
      // Mock user and token
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com'
      };
      const mockToken = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiryDate: new Date(Date.now() + 3600000)
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);

      // Mock Gmail API
      const mockGmail = {
        users: {
          messages: {
            list: sandbox.stub().resolves({
              data: {
                messages: [
                  { id: 'msg1', threadId: 'thread1' },
                  { id: 'msg2', threadId: 'thread2' }
                ]
              }
            }),
            get: sandbox.stub().resolves({
              data: {
                id: 'msg1',
                payload: {
                  headers: [
                    { name: 'Subject', value: 'Test Email' },
                    { name: 'From', value: 'sender@example.com' }
                  ]
                }
              }
            })
          }
        }
      };
      sandbox.stub(google, 'gmail').returns(mockGmail);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.getGmailInboxLive(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      const response = mockRes.json.firstCall.args[0];
      expect(response).to.have.property('messages');
      expect(response.messages).to.be.an('array');
    });

    it('should handle missing user', async () => {
      sandbox.stub(User, 'findById').resolves(null);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.getGmailInboxLive(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('User not found');
    });

    it('should handle missing Google token', async () => {
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com'
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(GoogleToken, 'findOne').resolves(null);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.getGmailInboxLive(mockReq, mockRes);

      expect(mockRes.status.calledWith(401)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Google token');
    });

    it('should handle Gmail API errors', async () => {
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com'
      };
      const mockToken = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiryDate: new Date(Date.now() + 3600000)
      };

      sandbox.stub(User, 'findById').resolves(mockUser);
      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      
      // Mock Gmail API error
      const mockGmail = {
        users: {
          messages: {
            list: sandbox.stub().rejects(new Error('Gmail API error'))
          }
        }
      };
      sandbox.stub(google, 'gmail').returns(mockGmail);

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.getGmailInboxLive(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Error fetching');
    });
  });

  describe('updateProfile', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'New Name',
        companyName: 'New Company',
        phone: '1234567890'
      };

      const updatedUser = {
        _id: mockUserId,
        ...updateData
      };

      sandbox.stub(User, 'findByIdAndUpdate').resolves(updatedUser);

      const mockReq = {
        user: { _id: mockUserId },
        body: updateData
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.updateProfile(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      const response = mockRes.json.firstCall.args[0];
      expect(response.name).to.equal(updateData.name);
      expect(response.companyName).to.equal(updateData.companyName);
    });

    it('should handle user not found', async () => {
      sandbox.stub(User, 'findByIdAndUpdate').resolves(null);

      const mockReq = {
        user: { _id: mockUserId },
        body: { name: 'New Name' }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.updateProfile(mockReq, mockRes);

      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('not found');
    });

    it('should handle validation errors', async () => {
      sandbox.stub(User, 'findByIdAndUpdate').rejects(new Error('Validation failed'));

      const mockReq = {
        user: { _id: mockUserId },
        body: { email: 'invalid-email' }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await userController.updateProfile(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('validation');
    });
  });
});
