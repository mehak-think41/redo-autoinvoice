const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const tokenUtils = require('../utils/tokenUtils');

describe('Token Utils Tests', () => {
  const mockPayload = {
    userId: '123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = tokenUtils.generateToken(mockPayload);
      expect(token).to.be.a('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).to.equal(mockPayload.userId);
      expect(decoded.email).to.equal(mockPayload.email);
      expect(decoded.exp).to.be.a('number');
    });

    it('should handle missing JWT secret', () => {
      delete process.env.JWT_SECRET;
      expect(() => tokenUtils.generateToken(mockPayload)).to.throw('JWT_SECRET');
    });

    it('should handle invalid payload', () => {
      expect(() => tokenUtils.generateToken(null)).to.throw();
      expect(() => tokenUtils.generateToken(undefined)).to.throw();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = tokenUtils.generateToken(mockPayload);
      const decoded = tokenUtils.verifyToken(token);
      expect(decoded.userId).to.equal(mockPayload.userId);
      expect(decoded.email).to.equal(mockPayload.email);
    });

    it('should handle invalid token', () => {
      expect(() => tokenUtils.verifyToken('invalid-token')).to.throw(jwt.JsonWebTokenError);
    });

    it('should handle expired token', () => {
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_SECRET, { expiresIn: '0s' });
      expect(() => tokenUtils.verifyToken(expiredToken)).to.throw(jwt.TokenExpiredError);
    });

    it('should handle missing token', () => {
      expect(() => tokenUtils.verifyToken()).to.throw();
      expect(() => tokenUtils.verifyToken(null)).to.throw();
      expect(() => tokenUtils.verifyToken('')).to.throw();
    });

    it('should handle missing JWT secret', () => {
      const token = tokenUtils.generateToken(mockPayload);
      delete process.env.JWT_SECRET;
      expect(() => tokenUtils.verifyToken(token)).to.throw('JWT_SECRET');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'valid-token';
      const authHeader = `Bearer ${token}`;
      const extractedToken = tokenUtils.extractTokenFromHeader(authHeader);
      expect(extractedToken).to.equal(token);
    });

    it('should handle missing Authorization header', () => {
      expect(() => tokenUtils.extractTokenFromHeader()).to.throw('No token provided');
      expect(() => tokenUtils.extractTokenFromHeader('')).to.throw('No token provided');
    });

    it('should handle invalid Authorization header format', () => {
      expect(() => tokenUtils.extractTokenFromHeader('invalid')).to.throw('Invalid token format');
      expect(() => tokenUtils.extractTokenFromHeader('Basic token')).to.throw('Invalid token format');
      expect(() => tokenUtils.extractTokenFromHeader('Bearer')).to.throw('Invalid token format');
    });
  });

  describe('authenticateToken middleware', () => {
    it('should authenticate valid token', () => {
      const token = tokenUtils.generateToken(mockPayload);
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = () => {};

      tokenUtils.authenticateToken(req, res, next);
      expect(req.user).to.deep.equal(mockPayload);
    });

    it('should handle missing Authorization header', () => {
      const req = { headers: {} };
      const res = {
        status: (code) => ({
          json: (data) => {
            expect(code).to.equal(401);
            expect(data.error).to.include('No token provided');
          }
        })
      };
      const next = () => {};

      tokenUtils.authenticateToken(req, res, next);
    });

    it('should handle invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = {
        status: (code) => ({
          json: (data) => {
            expect(code).to.equal(403);
            expect(data.error).to.include('Invalid token');
          }
        })
      };
      const next = () => {};

      tokenUtils.authenticateToken(req, res, next);
    });

    it('should handle expired token', () => {
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_SECRET, { expiresIn: '0s' });
      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`
        }
      };
      const res = {
        status: (code) => ({
          json: (data) => {
            expect(code).to.equal(403);
            expect(data.error).to.include('Token expired');
          }
        })
      };
      const next = () => {};

      tokenUtils.authenticateToken(req, res, next);
    });
  });
});
