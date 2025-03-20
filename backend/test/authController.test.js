const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const authController = require('../controllers/authController');
const googleAuthService = require('../services/googleAuthService');
const User = require('../models/User');
const GoogleToken = require('../models/GoogleToken');

describe('Auth Controller Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback';
  });

  afterEach(() => {
    sandbox.restore();
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REDIRECT_URI;
  });

  describe('getGoogleAuthURL', () => {
    it('should return Google auth URL', () => {
      const mockReq = {};
      const mockRes = {
        json: sinon.stub()
      };

      authController.getGoogleAuthURL(mockReq, mockRes);

      expect(mockRes.json.calledOnce).to.be.true;
      const url = mockRes.json.firstCall.args[0].url;
      expect(url).to.include('accounts.google.com');
      expect(url).to.include('client_id=test-client-id');
      expect(url).to.include('redirect_uri=http://localhost:3000/auth/google/callback');
    });

    it('should handle errors', () => {
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;

      const mockReq = {};
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      authController.getGoogleAuthURL(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('configuration');

      process.env.GOOGLE_CLIENT_ID = originalClientId;
    });
  });

  describe('googleCallback', () => {
    const mockCode = 'test-auth-code';
    const mockUserId = new mongoose.Types.ObjectId();
    const mockEmail = 'test@example.com';

    it('should handle successful first-time Google login', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expiry_date: Date.now() + 3600000
      };

      const mockUserInfo = {
        email: mockEmail,
        name: 'Test User'
      };

      sandbox.stub(googleAuthService, 'processGoogleCallback').resolves({
        tokens: mockTokens,
        userInfo: mockUserInfo
      });

      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(User.prototype, 'save').resolves({
        _id: mockUserId,
        email: mockEmail,
        name: 'Test User'
      });

      sandbox.stub(GoogleToken.prototype, 'save').resolves({
        userId: mockUserId,
        ...mockTokens
      });

      const mockReq = {
        query: { code: mockCode }
      };
      const mockRes = {
        cookie: sinon.stub(),
        redirect: sinon.stub()
      };

      await authController.googleCallback(mockReq, mockRes);

      expect(googleAuthService.processGoogleCallback.calledWith(mockCode)).to.be.true;
      expect(mockRes.cookie.calledWith('auth_token')).to.be.true;
      expect(mockRes.redirect.calledWith('/dashboard')).to.be.true;
    });

    it('should handle returning Google user', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expiry_date: Date.now() + 3600000
      };

      const mockUserInfo = {
        email: mockEmail,
        name: 'Test User'
      };

      const existingUser = {
        _id: mockUserId,
        email: mockEmail,
        name: 'Test User'
      };

      sandbox.stub(googleAuthService, 'processGoogleCallback').resolves({
        tokens: mockTokens,
        userInfo: mockUserInfo
      });

      sandbox.stub(User, 'findOne').resolves(existingUser);
      sandbox.stub(GoogleToken.prototype, 'save').resolves({
        userId: mockUserId,
        ...mockTokens
      });

      const mockReq = {
        query: { code: mockCode }
      };
      const mockRes = {
        cookie: sinon.stub(),
        redirect: sinon.stub()
      };

      await authController.googleCallback(mockReq, mockRes);

      expect(googleAuthService.processGoogleCallback.calledWith(mockCode)).to.be.true;
      expect(mockRes.cookie.calledWith('auth_token')).to.be.true;
      expect(mockRes.redirect.calledWith('/dashboard')).to.be.true;
    });

    it('should handle missing auth code', async () => {
      const mockReq = {
        query: {}
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await authController.googleCallback(mockReq, mockRes);

      expect(mockRes.status.calledWith(400)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Missing authorization code');
    });

    it('should handle OAuth errors', async () => {
      sandbox.stub(googleAuthService, 'processGoogleCallback').rejects(new Error('OAuth Error'));

      const mockReq = {
        query: { code: mockCode }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await authController.googleCallback(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('OAuth Error');
    });

    it('should handle database errors', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expiry_date: Date.now() + 3600000
      };

      const mockUserInfo = {
        email: mockEmail,
        name: 'Test User'
      };

      sandbox.stub(googleAuthService, 'processGoogleCallback').resolves({
        tokens: mockTokens,
        userInfo: mockUserInfo
      });

      sandbox.stub(User, 'findOne').rejects(new Error('Database error'));

      const mockReq = {
        query: { code: mockCode }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await authController.googleCallback(mockReq, mockRes);

      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.firstCall.args[0].error).to.include('Database error');
    });
  });

  describe('getCurrentUser', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should return current user data', async () => {
      const mockUser = {
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/picture.jpg'
      };

      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(User, 'findById').resolves(mockUser);

      await authController.getCurrentUser(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.calledWith({ user: mockUser })).to.be.true;
    });

    it('should handle non-existent user', async () => {
      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(User, 'findById').resolves(null);

      await authController.getCurrentUser(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(404)).to.be.true;
      expect(mockRes.json.calledWith({ error: 'User not found' })).to.be.true;
    });

    it('should handle database errors', async () => {
      const mockReq = {
        user: { _id: mockUserId }
      };
      const mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(User, 'findById').rejects(new Error('Database error'));

      await authController.getCurrentUser(mockReq, mockRes);
      
      expect(mockRes.status.calledWith(500)).to.be.true;
      expect(mockRes.json.calledWith({ error: 'Failed to get user data' })).to.be.true;
    });
  });

  describe('logout', () => {
    it('should clear auth cookie and return success message', () => {
      const mockReq = {};
      const mockRes = {
        clearCookie: sinon.stub(),
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      authController.logout(mockReq, mockRes);
      
      expect(mockRes.clearCookie.calledWith('auth_token')).to.be.true;
      expect(mockRes.status.calledWith(200)).to.be.true;
      expect(mockRes.json.calledWith({ message: 'Logged out successfully' })).to.be.true;
    });

    it('should use correct cookie options in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockReq = {};
      const mockRes = {
        clearCookie: sinon.stub(),
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      authController.logout(mockReq, mockRes);
      
      expect(mockRes.clearCookie.firstCall.args[1]).to.deep.include({
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
