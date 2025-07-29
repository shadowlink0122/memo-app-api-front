// アーカイブされたメモの完全削除テスト

import { memoApi } from './src/lib/api.ts';

async function testPermanentDelete() {
  try {
    console.log('=== アーカイブメモの完全削除テスト ===');

    // 1. まずテスト用メモを作成
    console.log('1. テスト用メモを作成...');
    const newMemo = await memoApi.createMemo({
      title: 'テスト用メモ（削除予定）',
      content: 'このメモは削除テスト用です',
      category: 'テスト',
      tags: ['削除テスト'],
      priority: 'low',
    });
    console.log('作成されたメモ:', newMemo);

    // 2. メモをアーカイブ
    console.log('2. メモをアーカイブ...');
    const archivedMemo = await memoApi.archiveMemo(newMemo.id);
    console.log('アーカイブされたメモ:', archivedMemo);

    // 3. アーカイブされたメモを完全削除
    console.log('3. アーカイブされたメモを完全削除...');
    await memoApi.permanentlyDeleteMemo(newMemo.id);
    console.log('完全削除完了');

    // 4. 削除されたことを確認
    console.log('4. 削除確認...');
    try {
      const deletedMemo = await memoApi.getMemo(newMemo.id);
      console.error('❌ エラー: メモがまだ存在しています:', deletedMemo);
    } catch (error) {
      if (
        error.message.includes('404') ||
        error.message.includes('見つかりません')
      ) {
        console.log('✅ 成功: メモが正常に削除されました');
      } else {
        console.error('❌ 予期しないエラー:', error.message);
      }
    }
  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
  }
}

// テスト実行
testPermanentDelete();
