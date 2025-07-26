#!/usr/bin/env node

/**
 * メモアーカイブ機能のテストスクリプト
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('メモアーカイブ機能テスト');
console.log('========================');
console.log(`API URL: ${API_URL}`);
console.log('');

// HTTPリクエストのヘルパー関数
async function makeRequest(method, path, data = null, headers = {}) {
  const parsedUrl = new URL(API_URL + path);
  const client = parsedUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
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

      // 最初の3件のメモの詳細を表示
      const first3 = result.data.memos.slice(0, 3);
      console.log(`   最初の3件:`);
      first3.forEach(memo => {
        console.log(`     ID:${memo.id} [${memo.status}] "${memo.title}"`);
      });

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

// 特定のメモを取得
async function testGetMemo(id) {
  console.log(`\n📄 メモ詳細取得テスト: ID ${id}`);

  try {
    const result = await makeRequest('GET', `/api/memos/${id}`);
    console.log(`   ステータス: ${result.status}`);

    if (result.status === 200 && result.data) {
      console.log(`   メモID: ${result.data.id}`);
      console.log(`   タイトル: "${result.data.title}"`);
      console.log(`   ステータス: ${result.data.status}`);
      console.log(`   更新日時: ${result.data.updated_at}`);
      return result.data;
    } else {
      console.log(`   エラー: ${result.raw}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ 取得失敗: ${error.message}`);
    return null;
  }
}

// メモをアーカイブ（PUT方式）
async function testArchiveMemo(id, memoData) {
  console.log(`\n🗃️  メモアーカイブテスト: ID ${id}`);

  const updateData = {
    ...memoData,
    status: 'archived',
  };

  console.log(`   送信データ:`, updateData);

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
  console.log('🔍 アーカイブ機能の詳細テストを開始します...\n');

  // 1. アクティブなメモ一覧を取得
  const activeMemos = await testGetMemos('active');

  if (activeMemos.length === 0) {
    console.log('\n⚠️  アクティブなメモが見つかりません。テストを終了します。');
    return;
  }

  // 2. 最初のアクティブメモを選択
  const targetMemo = activeMemos[0];
  console.log(
    `\n🎯 テスト対象メモ: ID ${targetMemo.id} - "${targetMemo.title}"`
  );

  // 3. メモの詳細を取得（アーカイブ前）
  const beforeMemo = await testGetMemo(targetMemo.id);
  if (!beforeMemo) {
    console.log('\n❌ メモの詳細取得に失敗しました。');
    return;
  }

  // 4. メモをアーカイブ
  const archivedMemo = await testArchiveMemo(targetMemo.id, beforeMemo);
  if (!archivedMemo) {
    console.log('\n❌ メモのアーカイブに失敗しました。');
    return;
  }

  // 5. アーカイブ後のメモ詳細を確認
  console.log('\n⏳ 少し待ってからアーカイブ後の状態を確認...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  const afterMemo = await testGetMemo(targetMemo.id);
  if (afterMemo) {
    console.log(`\n📊 アーカイブ結果の比較:`);
    console.log(`   アーカイブ前: ${beforeMemo.status}`);
    console.log(`   API応答: ${archivedMemo.status}`);
    console.log(`   アーカイブ後: ${afterMemo.status}`);

    if (afterMemo.status === 'archived') {
      console.log(`   ✅ アーカイブが正常に完了しました！`);
    } else {
      console.log(`   ⚠️  データベースでのステータス更新が反映されていません`);
    }
  }

  // 6. アクティブメモ一覧で該当メモが除外されているか確認
  console.log('\n🔍 アクティブメモ一覧での確認...');
  const activeMemosAfter = await testGetMemos('active');
  const stillActive = activeMemosAfter.find(memo => memo.id === targetMemo.id);

  if (stillActive) {
    console.log(
      `   ❌ メモID ${targetMemo.id} がまだアクティブメモ一覧に表示されています`
    );
  } else {
    console.log(
      `   ✅ メモID ${targetMemo.id} はアクティブメモ一覧から除外されました`
    );
  }

  // 7. アーカイブメモ一覧で該当メモが表示されているか確認
  console.log('\n🔍 アーカイブメモ一覧での確認...');
  const archivedMemos = await testGetMemos('archived');
  const inArchive = archivedMemos.find(memo => memo.id === targetMemo.id);

  if (inArchive) {
    console.log(
      `   ✅ メモID ${targetMemo.id} がアーカイブメモ一覧に表示されています`
    );
  } else {
    console.log(
      `   ❌ メモID ${targetMemo.id} がアーカイブメモ一覧に表示されていません`
    );
  }

  console.log('\n🏁 アーカイブ機能テスト完了');
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
  testGetMemos,
  testGetMemo,
  testArchiveMemo,
  runArchiveTest,
};
