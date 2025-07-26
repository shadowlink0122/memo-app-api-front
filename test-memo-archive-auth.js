#!/usr/bin/env node

/**
 * 認証付きメモアーカイブ機能のテストスクリプト
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('認証付きメモアーカイブ機能テスト');
console.log('================================');
console.log(`API URL: ${API_URL}`);
console.log('');

let authToken = null;

// HTTPリクエストのヘルパー関数
async function makeRequest(method, path, data = null, headers = {}) {
  const parsedUrl = new URL(API_URL + path);
  const client = parsedUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // 認証トークンがある場合は追加
    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      timeout: 10000,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    };

    const req = client.request(options, res => {
      let responseData = '';
      res.on('data', chunk => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: parsed,
            raw: responseData,
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            data: null,
            raw: responseData,
          });
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// ユーザー登録
async function testRegister() {
  console.log('\n👤 ユーザー登録テスト');

  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123',
  };

  console.log(`   登録データ:`, userData);

  try {
    const result = await makeRequest('POST', '/api/auth/register', userData);
    console.log(`   ステータス: ${result.status}`);
    console.log(`   レスポンス:`, result.raw);

    if (result.status === 201 && result.data && result.data.access_token) {
      authToken = result.data.access_token;
      console.log(`   ✅ 登録成功、トークン取得済み`);
      return true;
    } else if (
      result.status === 200 &&
      result.data &&
      result.data.access_token
    ) {
      authToken = result.data.access_token;
      console.log(`   ✅ 登録成功、トークン取得済み`);
      return true;
    } else {
      console.log(`   ❌ 登録失敗: ${result.raw}`);

      // 登録に失敗した場合、ログインを試してみる
      console.log(`   🔄 ログインを試行します...`);
      return await testLogin();
    }
  } catch (error) {
    console.log(`   ❌ 登録失敗: ${error.message}`);
    return false;
  }
}

// ユーザーログイン
async function testLogin() {
  console.log('\n🔑 ユーザーログインテスト');

  const loginData = {
    email: 'test@example.com',
    password: 'password',
  };

  console.log(`   ログインデータ:`, loginData);

  try {
    const result = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`   ステータス: ${result.status}`);
    console.log(`   レスポンス:`, result.raw);

    if (
      (result.status === 200 || result.status === 201) &&
      result.data &&
      result.data.access_token
    ) {
      authToken = result.data.access_token;
      console.log(`   ✅ ログイン成功、トークン取得済み`);
      return true;
    } else {
      console.log(`   ❌ ログイン失敗: ${result.raw}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ログイン失敗: ${error.message}`);
    return false;
  }
}

// テスト用メモを作成
async function createTestMemo() {
  console.log('\n📝 テスト用メモ作成');

  const memoData = {
    title: `テストメモ ${new Date().toISOString()}`,
    content: 'このメモはアーカイブテスト用です',
    category: 'テスト',
    tags: ['test', 'archive'],
    priority: 'medium',
  };

  console.log(`   メモタイトル: "${memoData.title}"`);

  try {
    const result = await makeRequest('POST', '/api/memos', memoData);
    console.log(`   ステータス: ${result.status}`);

    if (result.status === 201 && result.data) {
      console.log(`   ✅ メモ作成成功 ID: ${result.data.id}`);
      return result.data;
    } else {
      console.log(`   ❌ メモ作成失敗: ${result.raw}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ メモ作成失敗: ${error.message}`);
    return null;
  }
}

// メモ一覧を取得
async function testGetMemos(status = null) {
  const path = status ? `/api/memos?status=${status}` : '/api/memos';
  console.log(`\n📋 メモ一覧取得テスト: ${path}`);

  try {
    const result = await makeRequest('GET', path);
    console.log(`   ステータス: ${result.status}`);

    if (result.status === 200 && result.data && result.data.memos) {
      console.log(`   メモ数: ${result.data.memos.length}`);

      // statusごとの集計
      const statusCount = result.data.memos.reduce((acc, memo) => {
        acc[memo.status] = (acc[memo.status] || 0) + 1;
        return acc;
      }, {});

      console.log(`   ステータス分布:`, statusCount);

      return result.data.memos;
    } else {
      console.log(`   エラー: ${result.raw}`);
      return [];
    }
  } catch (error) {
    console.log(`   ❌ 取得失敗: ${error.message}`);
    return [];
  }
}

// メモをアーカイブ（PUT方式）
async function testArchiveMemo(id, memoData) {
  console.log(`\n🗃️  メモアーカイブテスト: ID ${id}`);

  const updateData = {
    title: memoData.title,
    content: memoData.content,
    category: memoData.category,
    tags: memoData.tags,
    priority: memoData.priority,
    status: 'archived',
  };

  console.log(`   送信データ:`, { ...updateData, status: updateData.status });

  try {
    const result = await makeRequest('PUT', `/api/memos/${id}`, updateData);
    console.log(`   ステータス: ${result.status}`);
    console.log(`   レスポンス:`, result.data);

    if (result.status === 200 && result.data) {
      console.log(`   更新後ステータス: ${result.data.status}`);
      console.log(
        `   ✅ ${result.data.status === 'archived' ? 'アーカイブ成功' : '⚠️ ステータス更新が反映されていません'}`
      );
      return result.data;
    } else {
      console.log(`   ❌ アーカイブ失敗: ${result.raw}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ アーカイブ失敗: ${error.message}`);
    return null;
  }
}

// メイン実行関数
async function runArchiveTest() {
  console.log('🔍 認証付きアーカイブ機能の詳細テストを開始します...\n');

  // 1. ユーザー登録またはログインして認証トークンを取得
  const authSuccess = await testRegister();
  if (!authSuccess) {
    console.log('\n❌ 認証に失敗しました。テストを終了します。');
    return;
  }

  // 2. テスト用メモを作成
  const testMemo = await createTestMemo();
  if (!testMemo) {
    console.log('\n❌ テスト用メモの作成に失敗しました。');
    return;
  }

  console.log(`\n🎯 テスト対象メモ: ID ${testMemo.id} - "${testMemo.title}"`);
  console.log(`   作成時ステータス: ${testMemo.status}`);

  // 3. アクティブメモ一覧での確認（アーカイブ前）
  const activeMemosBeforeList = await testGetMemos('active');
  const activeMemoBefore = activeMemosBeforeList.find(
    memo => memo.id === testMemo.id
  );
  console.log(`\n📊 アーカイブ前の確認:`);
  console.log(
    `   アクティブ一覧に存在: ${activeMemoBefore ? 'はい' : 'いいえ'}`
  );

  // 4. メモをアーカイブ
  const archivedMemo = await testArchiveMemo(testMemo.id, testMemo);
  if (!archivedMemo) {
    console.log('\n❌ メモのアーカイブに失敗しました。');
    return;
  }

  // 5. 少し待ってからリスト確認
  console.log('\n⏳ 少し待ってからアーカイブ後の状態を確認...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 6. アクティブメモ一覧で該当メモが除外されているか確認
  console.log('\n🔍 アーカイブ後のアクティブメモ一覧確認...');
  const activeMemosAfter = await testGetMemos('active');
  const stillActive = activeMemosAfter.find(memo => memo.id === testMemo.id);

  console.log(`📊 アーカイブ後の結果:`);
  console.log(`   API応答ステータス: ${archivedMemo.status}`);
  console.log(
    `   アクティブ一覧に存在: ${stillActive ? 'はい (問題!)' : 'いいえ (正常)'}`
  );

  if (stillActive) {
    console.log(
      `   ❌ 問題: メモID ${testMemo.id} がまだアクティブメモ一覧に表示されています`
    );
    console.log(
      `   ❌ この問題により、フロントエンドでアーカイブが正しく動作していません`
    );
  } else {
    console.log(
      `   ✅ メモID ${testMemo.id} はアクティブメモ一覧から正しく除外されました`
    );
  }

  // 7. アーカイブメモ一覧で該当メモが表示されているか確認
  console.log('\n🔍 アーカイブメモ一覧での確認...');
  const archivedMemos = await testGetMemos('archived');
  const inArchive = archivedMemos.find(memo => memo.id === testMemo.id);

  if (inArchive) {
    console.log(
      `   ✅ メモID ${testMemo.id} がアーカイブメモ一覧に表示されています`
    );
    console.log(`   アーカイブ一覧でのステータス: ${inArchive.status}`);
  } else {
    console.log(
      `   ❌ メモID ${testMemo.id} がアーカイブメモ一覧に表示されていません`
    );
  }

  console.log('\n🏁 結論:');
  if (stillActive) {
    console.log(
      '   🚨 アーカイブ機能に問題があります - APIサーバー側でstatus更新が正しく処理されていません'
    );
  } else {
    console.log('   ✅ アーカイブ機能は正常に動作しています');
  }

  console.log('\n🏁 認証付きアーカイブ機能テスト完了');
}

// スクリプト実行
if (require.main === module) {
  runArchiveTest().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  testRegister,
  testLogin,
  createTestMemo,
  testGetMemos,
  testArchiveMemo,
  runArchiveTest,
};
