#!/usr/bin/env node

/**
 * APIサーバーの接続をテストするスクリプト
 */

// Node.js標準モジュールのrequire（CommonJS形式）
const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000';

console.log('APIサーバー接続テスト');
console.log('======================');
console.log(`API URL: ${API_URL}`);
console.log('');

// 基本的な接続テスト
async function testConnection() {
  try {
    const parsedUrl = new URL(API_URL);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: '/health',
        method: 'GET',
        timeout: 5000,
      };

      const req = client.request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data,
          });
        });
      });

      req.on('error', err => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  } catch (error) {
    throw error;
  }
}

// ログアウトエンドポイントのテスト
async function testLogoutEndpoint() {
  try {
    const parsedUrl = new URL(API_URL);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: '/api/auth/logout',
        method: 'POST',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = client.request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data,
          });
        });
      });

      req.on('error', err => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  } catch (error) {
    throw error;
  }
}

// メイン実行関数
async function runTests() {
  console.log('1. 基本接続テスト (/health)');
  try {
    const result = await testConnection();
    console.log(`   ステータス: ${result.status}`);
    console.log(`   レスポンス: ${result.data}`);

    if (result.status === 200) {
      console.log('   ✅ 接続成功');
    } else {
      console.log('   ⚠️  予期しないステータス');
    }
  } catch (error) {
    console.log(`   ❌ 接続失敗: ${error.message}`);
  }

  console.log('');
  console.log('2. ログアウトエンドポイントテスト (/api/auth/logout)');
  try {
    const result = await testLogoutEndpoint();
    console.log(`   ステータス: ${result.status}`);
    console.log(`   レスポンス: ${result.data}`);

    if (result.status === 400) {
      console.log('   ✅ 認証エラー（期待される動作）');
    } else {
      console.log('   ⚠️  予期しないステータス');
    }
  } catch (error) {
    console.log(`   ❌ テスト失敗: ${error.message}`);
  }

  console.log('');
  console.log('テスト完了');
}

// スクリプト実行
if (require.main === module) {
  runTests().catch(error => {
    console.error('エラー:', error);
    process.exit(1);
  });
}

module.exports = {
  testConnection,
  testLogoutEndpoint,
  runTests,
};
