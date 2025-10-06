import { IAMClient } from '../IAMClient';

describe('IAMClient', () => {
  let client: IAMClient;

  beforeEach(() => {
    client = new IAMClient({
      baseUrl: 'http://localhost:8000/api/v1',
      timeout: 5000,
      verifySSL: false,
    });
  });

  describe('constructor', () => {
    it('should create an instance with default config', () => {
      expect(client).toBeInstanceOf(IAMClient);
    });

    it('should initialize with provided config', () => {
      const customClient = new IAMClient({
        baseUrl: 'http://example.com/api',
        timeout: 15000,
      });
      expect(customClient).toBeInstanceOf(IAMClient);
    });
  });

  describe('token management', () => {
    it('should set and get token', () => {
      const token = 'test-token-123';
      client.setToken(token);
      expect(client.getToken()).toBe(token);
    });

    it('should clear token', () => {
      client.setToken('test-token');
      client.clearToken();
      expect(client.getToken()).toBeNull();
    });

    it('should return null for token initially', () => {
      expect(client.getToken()).toBeNull();
    });
  });

  // Note: Add more tests with mocked axios for actual API calls
  // This is a basic test structure
});
