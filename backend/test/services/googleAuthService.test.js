const { expect } = require('chai');
const sinon = require('sinon');
const { google } = require('googleapis');
const googleAuthService = require('../../services/googleAuthService');

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
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REDIRECT_URI;
  });

  describe('getGoogleAuthURL', () => {
    it('should return Google auth URL', () => {
      const mockOAuth2Client = {
        generateAuthUrl: sinon.stub().returns('https://accounts.google.com/o/oauth2/v2/auth')
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      const url = googleAuthService.getGoogleAuthURL();
      
      expect(url).to.equal('https://accounts.google.com/o/oauth2/v2/auth');
      expect(mockOAuth2Client.generateAuthUrl.called).to.be.true;
    });

    it('should handle errors', () => {
      const mockOAuth2Client = {
        generateAuthUrl: sinon.stub().throws(new Error('OAuth error'))
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      expect(() => googleAuthService.getGoogleAuthURL()).to.throw('Failed to generate auth URL');
    });
  });

  describe('processGoogleCallback', () => {
    const mockCode = 'test-auth-code';
    const mockTokens = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token'
    };
    const mockUserProfile = {
      data: {
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg'
      }
    };

    it('should process Google callback successfully', async () => {
      const mockOAuth2Client = {
        getToken: sinon.stub().resolves({ tokens: mockTokens }),
        setCredentials: sinon.stub()
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);
      sandbox.stub(google.oauth2('v2').userinfo, 'get').resolves(mockUserProfile);

      const result = await googleAuthService.processGoogleCallback(mockCode);
      
      expect(result).to.have.property('email', 'test@example.com');
      expect(result).to.have.property('name', 'Test User');
      expect(result).to.have.property('picture', 'https://example.com/photo.jpg');
      expect(result).to.have.property('accessToken', mockTokens.access_token);
      expect(result).to.have.property('refreshToken', mockTokens.refresh_token);
    });

    it('should handle missing code', async () => {
      try {
        await googleAuthService.processGoogleCallback();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Authorization code is required');
      }
    });

    it('should handle token exchange errors', async () => {
      const mockOAuth2Client = {
        getToken: sinon.stub().rejects(new Error('Token exchange failed'))
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      try {
        await googleAuthService.processGoogleCallback(mockCode);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to exchange authorization code');
      }
    });

    it('should handle user info errors', async () => {
      const mockOAuth2Client = {
        getToken: sinon.stub().resolves({ tokens: mockTokens }),
        setCredentials: sinon.stub()
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);
      sandbox.stub(google.oauth2('v2').userinfo, 'get').rejects(new Error('Failed to get user info'));

      try {
        await googleAuthService.processGoogleCallback(mockCode);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to get user info');
      }
    });
  });

  describe('getGmailService', () => {
    const mockAccessToken = 'test-access-token';

    it('should return Gmail service instance', () => {
      const mockOAuth2Client = {
        setCredentials: sinon.stub()
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);
      const gmailStub = sandbox.stub(google, 'gmail');

      const gmail = googleAuthService.getGmailService(mockAccessToken);
      
      expect(mockOAuth2Client.setCredentials.calledWith({ access_token: mockAccessToken })).to.be.true;
      expect(gmailStub.called).to.be.true;
    });

    it('should handle missing access token', () => {
      expect(() => googleAuthService.getGmailService()).to.throw('Access token is required');
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshToken = 'test-refresh-token';
    const mockNewTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token'
    };

    it('should refresh access token successfully', async () => {
      const mockOAuth2Client = {
        refreshToken: sinon.stub().resolves({ tokens: mockNewTokens })
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      const result = await googleAuthService.refreshAccessToken(mockRefreshToken);
      
      expect(result).to.deep.equal(mockNewTokens);
      expect(mockOAuth2Client.refreshToken.calledWith(mockRefreshToken)).to.be.true;
    });

    it('should handle missing refresh token', async () => {
      try {
        await googleAuthService.refreshAccessToken();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Refresh token is required');
      }
    });

    it('should handle refresh token errors', async () => {
      const mockOAuth2Client = {
        refreshToken: sinon.stub().rejects(new Error('Token refresh failed'))
      };

      sandbox.stub(google.auth, 'OAuth2').returns(mockOAuth2Client);

      try {
        await googleAuthService.refreshAccessToken(mockRefreshToken);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to refresh access token');
      }
    });
  });
});
