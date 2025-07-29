#!/usr/bin/env node

/**
 * 修正されたアーカイブ機能の簡単なテスト
 */

const http = require('http');
const { URL } = require('url');

const FRONTEND_URL = 'http://localhost:3000';

console.log('修正されたアーカイブ機能テスト');
console.log('==============================');
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

// メモ一覧を取得してアクティブなメモを探す
async function findActiveMemo() {
  console.log('\n📋 アクティブなメモを検索中...');

  try {
    const result = await makeRequest('GET', '/api/memos?status=active');

    if (result.status === 200 && result.data && result.data.memos) {
      const activeMemos = result.data.memos;
      console.log(`   見つかったアクティブメモ数: ${activeMemos.length}`);

      if (activeMemos.length > 0) {
        const memo = activeMemos[0];
        console.log(`   テスト対象メモ: ID ${memo.id} - "${memo.title}"`);
        return memo;
      } else {
        console.log('   ❌ アクティブなメモが見つかりません');
        return null;
      }
    } else {
      console.log(`   ❌ メモ一覧取得失敗: ${result.raw}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`);
    return null;
  }
}

// メモをアーカイブ
async function archiveMemo(id) {
  console.log(`\n🗃️  メモ${id}をアーカイブ中...`);

  try {
    const result = await makeRequest('PATCH', `/api/memos/${id}/archive`);
    console.log(`   ステータス: ${result.status}`);
    console.log(`   レスポンス:`, result.data);

    if (result.status === 200 && result.data) {
      console.log(`   更新後ステータス: ${result.data.status}`);
      if (result.data.status === 'archived') {
        console.log(`   ✅ アーカイブ成功！`);
        return true;
      } else {
        console.log(
          `   ⚠️  ステータスが期待値と異なります: ${result.data.status}`
        );
        return false;
      }
    } else {
      console.log(`   ❌ アーカイブ失敗: ${result.raw}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`);
    return false;
  }
}

// アーカイブ後の確認
async function verifyArchive(memoId) {
  console.log(`\n🔍 アーカイブ後の確認...`);

  // アクティブメモ一覧でメモが除外されているかチェック
  try {
    const activeResult = await makeRequest('GET', '/api/memos?status=active');
    if (
      activeResult.status === 200 &&
      activeResult.data &&
      activeResult.data.memos
    ) {
      const stillActive = activeResult.data.memos.find(
        memo => memo.id === memoId
      );
      console.log(
        `   アクティブ一覧に存在: ${stillActive ? 'はい (問題!)' : 'いいえ (正常)'}`
      );

      if (stillActive) {
        console.log(
          `   ❌ 問題: メモID ${memoId} がまだアクティブ一覧にあります`
        );
        return false;
      }
    }
  } catch (error) {
    console.log(`   ⚠️  アクティブメモ確認エラー: ${error.message}`);
  }

  // アーカイブメモ一覧でメモが表示されているかチェック
  try {
    const archivedResult = await makeRequest(
      'GET',
      '/api/memos?status=archived'
    );
    if (
      archivedResult.status === 200 &&
      archivedResult.data &&
      archivedResult.data.memos
    ) {
      const inArchive = archivedResult.data.memos.find(
        memo => memo.id === memoId
      );
      console.log(
        `   アーカイブ一覧に存在: ${inArchive ? 'はい (正常)' : 'いいえ (問題!)'}`
      );

      if (inArchive) {
        console.log(
          `   ✅ メモID ${memoId} がアーカイブ一覧に正しく表示されています`
        );
        return true;
      } else {
        console.log(
          `   ❌ 問題: メモID ${memoId} がアーカイブ一覧に表示されていません`
        );
        return false;
      }
    }
  } catch (error) {
    console.log(`   ⚠️  アーカイブメモ確認エラー: ${error.message}`);
  }

  return false;
}

// メイン実行関数
async function runQuickTest() {
  console.log('🚀 修正されたアーカイブ機能の簡単テストを開始...\n');

  // 1. アクティブなメモを探す
  const targetMemo = await findActiveMemo();
  if (!targetMemo) {
    console.log('\n❌ テスト対象のメモが見つかりませんでした');
    return;
  }

  // 2. メモをアーカイブ
  const archiveSuccess = await archiveMemo(targetMemo.id);
  if (!archiveSuccess) {
    console.log('\n❌ アーカイブ処理が失敗しました');
    return;
  }

  // 3. 少し待つ
  console.log('\n⏳ 2秒待機中...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. 結果確認
  const verifySuccess = await verifyArchive(targetMemo.id);

  console.log('\n🏁 テスト結果:');
  if (verifySuccess) {
    console.log('   ✅ アーカイブ機能は正常に動作しています！');
    console.log('   ✅ ブラウザでも同様に動作するはずです');
  } else {
    console.log('   ❌ アーカイブ機能にまだ問題があります');
    console.log('   🔧 さらなる調査と修正が必要です');
  }

  console.log('\n📋 推奨アクション:');
  console.log('   1. ブラウザで http://localhost:3000/memos にアクセス');
  console.log('   2. メモの削除ボタン（ゴミ箱）をクリック');
  console.log('   3. 開発者ツールのコンソールでログを確認');
  console.log(
    '   4. http://localhost:3000/archive でアーカイブされたメモを確認'
  );
}

// スクリプト実行
if (require.main === module) {
  runQuickTest().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  findActiveMemo,
  archiveMemo,
  verifyArchive,
  runQuickTest,
};
