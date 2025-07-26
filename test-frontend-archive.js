#!/usr/bin/env node

/**
 * フロントエンド経由でのメモアーカイブテスト
 */

const http = require('http');
const { URL } = require('url');

const FRONTEND_URL = 'http://localhost:3000';

console.log('フロントエンド経由メモアーカイブテスト');
console.log('====================================');
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log('');

// HTTPリクエストのヘルパー関数
async function makeRequest(method, path, data = null, headers = {}) {
  const parsedUrl = new URL(FRONTEND_URL + path);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, res => {
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

// フロントエンドのAPIルート経由でメモ一覧を取得
async function testFrontendGetMemos(status = null) {
  const path = status ? `/api/memos?status=${status}` : '/api/memos';
  console.log(`\n📋 フロントエンドAPI経由メモ一覧取得: ${path}`);

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

// フロントエンドのAPIルート経由でメモを作成
async function testFrontendCreateMemo() {
  console.log('\n📝 フロントエンドAPI経由メモ作成');

  const memoData = {
    title: `フロントエンドテストメモ ${new Date().toISOString()}`,
    content: 'このメモはフロントエンド経由のアーカイブテスト用です',
    category: 'テスト',
    tags: ['frontend-test', 'archive'],
    priority: 'medium',
  };

  console.log(`   メモタイトル: "${memoData.title}"`);

  try {
    const result = await makeRequest('POST', '/api/memos', memoData);
    console.log(`   ステータス: ${result.status}`);

    if (result.status === 201 && result.data) {
      console.log(`   ✅ メモ作成成功 ID: ${result.data.id}`);
      console.log(`   作成されたメモのステータス: ${result.data.status}`);
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

// フロントエンドのAPIルート経由でメモをアーカイブ
async function testFrontendArchiveMemo(id) {
  console.log(`\n🗃️  フロントエンドAPI経由メモアーカイブ: ID ${id}`);

  try {
    const result = await makeRequest('PATCH', `/api/memos/${id}/archive`);
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
async function runFrontendArchiveTest() {
  console.log('🔍 フロントエンド経由アーカイブ機能テストを開始します...\n');

  // 1. テスト用メモを作成
  const testMemo = await testFrontendCreateMemo();
  if (!testMemo) {
    console.log('\n❌ テスト用メモの作成に失敗しました。');
    return;
  }

  console.log(`\n🎯 テスト対象メモ: ID ${testMemo.id} - "${testMemo.title}"`);
  console.log(`   作成時ステータス: ${testMemo.status}`);

  // 2. アクティブメモ一覧での確認（アーカイブ前）
  const activeMemosBeforeList = await testFrontendGetMemos('active');
  const activeMemoBefore = activeMemosBeforeList.find(
    memo => memo.id === testMemo.id
  );
  console.log(`\n📊 アーカイブ前の確認:`);
  console.log(
    `   アクティブ一覧に存在: ${activeMemoBefore ? 'はい' : 'いいえ'}`
  );

  // 3. メモをアーカイブ
  const archivedMemo = await testFrontendArchiveMemo(testMemo.id);
  if (!archivedMemo) {
    console.log('\n❌ メモのアーカイブに失敗しました。');
    return;
  }

  // 4. 少し待ってからリスト確認
  console.log('\n⏳ 少し待ってからアーカイブ後の状態を確認...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 5. アクティブメモ一覧で該当メモが除外されているか確認
  console.log('\n🔍 アーカイブ後のアクティブメモ一覧確認...');
  const activeMemosAfter = await testFrontendGetMemos('active');
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

  // 6. アーカイブメモ一覧で該当メモが表示されているか確認
  console.log('\n🔍 アーカイブメモ一覧での確認...');
  const archivedMemos = await testFrontendGetMemos('archived');
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
    console.log('   🚨 アーカイブ機能に問題があります');
    console.log('   💡 考えられる原因:');
    console.log('      - APIサーバー側でstatus更新が正しく処理されていない');
    console.log('      - データベースの同期問題');
    console.log('      - フロントエンドのキャッシュ問題');
  } else {
    console.log('   ✅ アーカイブ機能は正常に動作しています');
  }

  console.log('\n🏁 フロントエンド経由アーカイブ機能テスト完了');
}

// スクリプト実行
if (require.main === module) {
  runFrontendArchiveTest().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  testFrontendGetMemos,
  testFrontendCreateMemo,
  testFrontendArchiveMemo,
  runFrontendArchiveTest,
};
