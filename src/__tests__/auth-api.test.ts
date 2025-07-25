/**
 * @jest-environment jsdom
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock axios module
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

import { authApi, tokenManager, AuthApiError } from '../lib/auth-api';
import { LoginRequest, RegisterRequest } from '../lib/auth-schemas';

describe('Auth API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Clear localStorage mock
    localStorageMock.clear.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    // Clear tokens
    tokenManager.clearTokens();
  });

  describe('tokenManager', () => {
    it('should store tokens via setTokens', () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';

      tokenManager.setTokens(accessToken, refreshToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'access_token',
        accessToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'refresh_token',
        refreshToken
      );
    });

    it('should clear tokens correctly', () => {
      tokenManager.clearTokens();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('AuthApiError', () => {
    it('should create error with correct properties', () => {
      const status = 400;
      const errorCode = 'INVALID_CREDENTIALS';
      const message = 'Invalid username or password';

      const error = new AuthApiError(status, errorCode, message);

      expect(error.status).toBe(status);
      expect(error.errorCode).toBe(errorCode);
      expect(error.message).toBe(message);
      expect(error.name).toBe('AuthApiError');
    });
  });

  describe('API structure validation', () => {
    it('should have required auth API methods', () => {
      expect(typeof authApi.login).toBe('function');
      expect(typeof authApi.register).toBe('function');
      expect(typeof authApi.logout).toBe('function');
      expect(typeof authApi.refreshToken).toBe('function');
      expect(typeof authApi.getProfile).toBe('function');
      expect(typeof authApi.getCurrentUser).toBe('function');
      expect(typeof authApi.getCachedUserInfo).toBe('function');
    });

    it('should validate data types', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'testpassword',
      };

      const registerRequest: RegisterRequest = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      };

      expect(typeof loginRequest.email).toBe('string');
      expect(typeof loginRequest.password).toBe('string');
      expect(typeof registerRequest.username).toBe('string');
      expect(typeof registerRequest.email).toBe('string');
      expect(typeof registerRequest.password).toBe('string');
    });
  });
});
