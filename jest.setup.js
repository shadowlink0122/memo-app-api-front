import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
process.env.NEXT_PUBLIC_AUTH_API_URL = 'http://localhost:8000';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location with test parameter
// JSDOMの制限により、一時的にコンソールエラーが表示されますが、テストには影響しません
delete window.location;
window.location = {
  href: 'http://localhost:3000/?test=true',
  search: '?test=true',
  origin: 'http://localhost:3000',
  hostname: 'localhost',
  port: '3000',
  protocol: 'http:',
  pathname: '/',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  toString: () => 'http://localhost:3000/?test=true',
};

// モック設定
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver のモック
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// scrollTo のモック
global.scrollTo = jest.fn();

// fetch のモック（テスト用）
global.fetch = jest.fn();
