const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
});

// カスタムJest設定
const customJestConfig = {
  // テスト環境の設定
  testEnvironment: 'jest-environment-jsdom',

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 環境変数セットアップ
  setupFiles: ['<rootDir>/jest.env.js'],

  // テストファイルのパターン
  testMatch: ['<rootDir>/src/__tests__/**/*.{js,jsx,ts,tsx}'],

  // モジュール名マッピング
  moduleNameMapper: {
    // CSS Modulesとassets
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i':
      '<rootDir>/__mocks__/fileMock.js',

    // パスエイリアス（@/は最後に配置）
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // テスト対象外のディレクトリ
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/playwright-tests/',
    '<rootDir>/playwright/',
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],

  // ファイル変換の設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          'next/babel',
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },

  // モジュール変換の除外
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// Next.js設定とマージしてエクスポート
module.exports = createJestConfig(customJestConfig);
