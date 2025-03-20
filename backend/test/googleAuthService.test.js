const { expect } = require('chai');
const sinon = require('sinon');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const googleAuthService = require('../services/googleAuthService');
const User = require('../models/User');
const GoogleToken = require('../models/GoogleToken');

describe('Google Auth Service Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback';
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processGoogleCallback', () => {
    const mockCode = 'test-auth-code';
    const mockRedirectUri = 'http://localhost:3000/auth/google/callback';

    it('should process first-time Google login successfully', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expiry_date: Date.now() + 3600000
      };

      const mockUserInfo = {
        data: {
          email: 'test@example.com',
          name: 'Test User',
          picture: 'profile.jpg'
        }
      };

      sandbox.stub(OAuth2Client.prototype, 'getToken').resolves({ tokens: mockTokens });
      sandbox.stub(google.oauth2('v2').userinfo, 'get').resolves(mockUserInfo);
      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(User.prototype, 'save').resolves({
        _id: 'user-id',
        email: mockUserInfo.data.email,
        name: mockUserInfo.data.name
      });
      sandbox.stub(GoogleToken.prototype, 'save').resolves();

      const result = await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);

      expect(result.isNewUser).to.be.true;
      expect(result.user.email).to.equal(mockUserInfo.data.email);
      expect(GoogleToken.prototype.save.calledOnce).to.be.true;
    });

    it('should handle returning Google user', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        expiry_date: Date.now() + 3600000
      };

      const mockUserInfo = {
        data: {
          email: 'test@example.com',
          name: 'Test User',
          picture: 'profile.jpg'
        }
      };

      const existingUser = {
        _id: 'user-id',
        email: mockUserInfo.data.email,
        name: mockUserInfo.data.name
      };

      sandbox.stub(OAuth2Client.prototype, 'getToken').resolves({ tokens: mockTokens });
      sandbox.stub(google.oauth2('v2').userinfo, 'get').resolves(mockUserInfo);
      sandbox.stub(User, 'findOne').resolves(existingUser);
      sandbox.stub(GoogleToken, 'findOneAndUpdate').resolves();

      const result = await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);

      expect(result.isNewUser).to.be.false;
      expect(result.user).to.deep.equal(existingUser);
      expect(GoogleToken.findOneAndUpdate.calledOnce).to.be.true;
    });

    it('should handle token retrieval errors', async () => {
      sandbox.stub(OAuth2Client.prototype, 'getToken').rejects(new Error('Token Error'));

      try {
        await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Token Error');
      }
    });

    it('should process Google callback successfully for new user', async () => {
      const mockUserInfo = {
        data: {
          email: 'test@example.com',
          name: 'Test User',
          picture: 'profile-pic-url'
        }
      };

      // Mock OAuth2Client
      sandbox.stub(google.oauth2('v2').userinfo, 'get').resolves(mockUserInfo);

      // Mock User.findOne to simulate new user
      sandbox.stub(User, 'findOne').resolves(null);
      
      // Mock User.create
      const mockNewUser = {
        _id: 'mock-user-id',
        email: mockUserInfo.data.email,
        name: mockUserInfo.data.name,
        profilePicture: mockUserInfo.data.picture
      };
      sandbox.stub(User.prototype, 'save').resolves(mockNewUser);

      // Mock GoogleToken.findOneAndUpdate
      sandbox.stub(GoogleToken, 'findOneAndUpdate').resolves({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      const result = await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);

      expect(result).to.have.property('user');
      expect(result.user.email).to.equal(mockUserInfo.data.email);
      expect(result).to.have.property('token');
      expect(result.isNewUser).to.be.true;
    });

    it('should process Google callback successfully for existing user', async () => {
      const mockUserInfo = {
        data: {
          email: 'test@example.com',
          name: 'Test User',
          picture: 'profile-pic-url'
        }
      };

      // Mock OAuth2Client
      sandbox.stub(google.oauth2('v2').userinfo, 'get').resolves(mockUserInfo);

      // Mock User.findOne to simulate existing user
      const mockExistingUser = {
        _id: 'mock-user-id',
        email: mockUserInfo.data.email,
        name: mockUserInfo.data.name
      };
      sandbox.stub(User, 'findOne').resolves(mockExistingUser);

      // Mock GoogleToken.findOneAndUpdate
      sandbox.stub(GoogleToken, 'findOneAndUpdate').resolves({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      const result = await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);

      expect(result).to.have.property('user');
      expect(result.user.email).to.equal(mockUserInfo.data.email);
      expect(result).to.have.property('token');
      expect(result.isNewUser).to.be.false;
    });

    it('should handle invalid auth code', async () => {
      const mockCode = 'invalid-code';

      // Mock OAuth2Client to simulate error
      sandbox.stub(google.oauth2('v2').userinfo, 'get').rejects(new Error('Invalid code'));

      try {
        await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to authenticate');
      }
    });

    it('should handle user info fetch error', async () => {
      const mockCode = 'mock-auth-code';

      // Mock OAuth2Client to simulate userinfo error
      sandbox.stub(google.oauth2('v2').userinfo, 'get').rejects(new Error('Failed to fetch user info'));

      try {
        await googleAuthService.processGoogleCallback(mockCode, mockRedirectUri);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to fetch user info');
      }
    });
  });

  describe('getLatestEmails', () => {
    const mockUserId = 'user-id';

    it('should fetch latest emails successfully', async () => {
      const mockToken = {
        access_token: 'test-access-token'
      };

      const mockMessages = {
        data: {
          messages: [
            { id: 'msg1', threadId: 'thread1' },
            { id: 'msg2', threadId: 'thread2' }
          ]
        }
      };

      const mockMessageDetails = {
        data: {
          payload: {
            headers: [
              { name: 'Subject', value: 'Test Email' },
              { name: 'From', value: 'sender@example.com' }
            ]
          }
        }
      };

      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      sandbox.stub(google.gmail('v1').users.messages, 'list').resolves(mockMessages);
      sandbox.stub(google.gmail('v1').users.messages, 'get').resolves(mockMessageDetails);

      const result = await googleAuthService.getLatestEmails(mockUserId);

      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.have.property('subject', 'Test Email');
    });

    it('should handle missing token', async () => {
      sandbox.stub(GoogleToken, 'findOne').resolves(null);

      try {
        await googleAuthService.getLatestEmails(mockUserId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Gmail token not found');
      }
    });

    it('should handle Gmail API errors', async () => {
      const mockToken = {
        access_token: 'test-access-token'
      };

      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      sandbox.stub(google.gmail('v1').users.messages, 'list').rejects(new Error('API Error'));

      try {
        await googleAuthService.getLatestEmails(mockUserId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('API Error');
      }
    });
  });

  describe('watchGmailInbox', () => {
    const mockUserId = 'user-id';

    it('should set up Gmail watch successfully', async () => {
      const mockToken = {
        access_token: 'test-access-token'
      };

      const mockWatchResponse = {
        data: {
          historyId: '12345',
          expiration: Date.now() + 604800000
        }
      };

      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      sandbox.stub(google.gmail('v1').users, 'watch').resolves(mockWatchResponse);

      const result = await googleAuthService.watchGmailInbox(mockUserId);

      expect(result).to.have.property('historyId', '12345');
      expect(result).to.have.property('expiration');
    });

    it('should handle watch setup errors', async () => {
      const mockToken = {
        access_token: 'test-access-token'
      };

      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      sandbox.stub(google.gmail('v1').users, 'watch').rejects(new Error('Watch Error'));

      try {
        await googleAuthService.watchGmailInbox(mockUserId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Watch Error');
      }
    });
  });

  describe('stopGmailWatch', () => {
    const mockUserId = 'user-id';

    it('should stop Gmail watch successfully', async () => {
      const mockToken = {
        access_token: 'test-access-token'
      };

      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      sandbox.stub(google.gmail('v1').users, 'stop').resolves();

      await googleAuthService.stopGmailWatch(mockUserId);
      expect(google.gmail('v1').users.stop.calledOnce).to.be.true;
    });

    it('should handle stop watch errors', async () => {
      const mockToken = {
        access_token: 'test-access-token'
      };

      sandbox.stub(GoogleToken, 'findOne').resolves(mockToken);
      sandbox.stub(google.gmail('v1').users, 'stop').rejects(new Error('Stop Error'));

      try {
        await googleAuthService.stopGmailWatch(mockUserId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Stop Error');
      }
    });
  });

  describe('getGmailMessages', () => {
    const mockUserId = 'mock-user-id';

    it('should fetch Gmail messages successfully', async () => {
      const mockToken = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      // Mock Gmail API responses
      sandbox.stub(google, 'gmail').returns({
        users: {
          messages: {
            list: sandbox.stub().resolves({
              data: {
                messages: [
                  { id: 'msg1', threadId: 'thread1' },
                  { id: 'msg2', threadId: 'thread2' }
                ]
              }
            })
          }
        }
      });

      const messages = await googleAuthService.getGmailMessages(mockToken);

      expect(messages).to.be.an('array');
      expect(messages[0]).to.have.property('id');
      expect(messages[0]).to.have.property('subject');
      expect(messages[0]).to.have.property('from');
    });

    it('should handle Gmail API errors', async () => {
      const mockToken = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      // Mock Gmail API to simulate error
      sandbox.stub(google, 'gmail').returns({
        users: {
          messages: {
            list: sandbox.stub().rejects(new Error('Gmail API error'))
          }
        }
      });

      try {
        await googleAuthService.getGmailMessages(mockToken);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Gmail API error');
      }
    });

    it('should handle empty message list', async () => {
      const mockToken = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      // Mock Gmail API to return empty list
      sandbox.stub(google, 'gmail').returns({
        users: {
          messages: {
            list: sandbox.stub().resolves({ data: { messages: [] } })
          }
        }
      });

      const messages = await googleAuthService.getGmailMessages(mockToken);

      expect(messages).to.be.an('array');
      expect(messages).to.have.lengthOf(0);
    });
  });

  describe('refreshGoogleToken', () => {
    it('should refresh token successfully', async () => {
      const mockOldToken = {
        refreshToken: 'mock-refresh-token'
      };

      const mockNewTokens = {
        access_token: 'new-access-token',
        expiry_date: Date.now() + 3600000
      };

      // Mock OAuth2Client
      const mockOAuth2Client = {
        setCredentials: sandbox.stub(),
        getAccessToken: sandbox.stub().resolves({
          token: mockNewTokens.access_token,
          res: { data: mockNewTokens }
        })
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      const result = await googleAuthService.refreshGoogleToken(mockOldToken);

      expect(result).to.have.property('accessToken');
      expect(result.accessToken).to.equal(mockNewTokens.access_token);
      expect(result).to.have.property('expiryDate');
    });

    it('should handle refresh token errors', async () => {
      const mockOldToken = {
        refreshToken: 'invalid-refresh-token'
      };

      // Mock OAuth2Client to simulate error
      const mockOAuth2Client = {
        setCredentials: sandbox.stub(),
        getAccessToken: sandbox.stub().rejects(new Error('Invalid refresh token'))
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      try {
        await googleAuthService.refreshGoogleToken(mockOldToken);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to refresh token');
      }
    });
  });
});
