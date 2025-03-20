const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

// Load environment variables
dotenv.config();

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback';
process.env.NODE_ENV = 'test';
process.env.SERVER_URL = 'http://localhost:3000';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';

let mongoServer;

// Set up chai and sinon
chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;

// Export mocha hooks
exports.mochaHooks = {
  beforeAll: async function() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Set up Google API mocks
    setupGoogleMocks();
  },

  beforeEach: async function() {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  },

  afterAll: async function() {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (global.__googleMockSandbox) {
      global.__googleMockSandbox.restore();
    }
  }
};

function setupGoogleMocks() {
  // Create sandbox for isolated mocking
  const sandbox = sinon.createSandbox();

  // Mock OAuth2Client constructor
  class MockOAuth2Client {
    constructor() {
      this.credentials = {};
    }

    setCredentials(creds) {
      this.credentials = creds;
      return this;
    }

    async getAccessToken() {
      return {
        token: 'mock-access-token',
        res: {
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expiry_date: Date.now() + 3600000
          }
        }
      };
    }

    generateAuthUrl() {
      return 'https://mock-google-auth-url';
    }
  }

  // Mock Gmail API
  const mockGmailAPI = {
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
              ],
              parts: [
                {
                  mimeType: 'text/plain',
                  body: { data: Buffer.from('Email content').toString('base64') }
                }
              ]
            }
          }
        })
      }
    }
  };

  // Mock userinfo API
  const mockUserInfo = {
    get: sandbox.stub().resolves({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/profile.jpg'
      }
    })
  };

  // Replace original methods with mocks
  sandbox.stub(google.auth, 'OAuth2').callsFake(() => new MockOAuth2Client());
  sandbox.stub(google, 'gmail').returns(mockGmailAPI);
  
  // Create a mock oauth2 function that returns our mock userinfo
  const mockOauth2 = sandbox.stub().returns({
    userinfo: mockUserInfo
  });
  sandbox.stub(google, 'oauth2').callsFake(mockOauth2);

  // Store sandbox globally for cleanup in afterAll
  global.__googleMockSandbox = sandbox;
}

// Helper function to create mock response object
global.createMockResponse = () => {
  const json = sinon.stub();
  const status = sinon.stub().returnsThis();
  const send = sinon.stub().returnsThis();
  
  const res = {
    json,
    status,
    send
  };

  // Make the stubs available for chaining
  res.status.returns(res);
  res.json.returns(res);
  res.send.returns(res);

  return res;
};
