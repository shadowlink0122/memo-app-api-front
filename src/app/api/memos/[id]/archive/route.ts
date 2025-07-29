import { NextRequest, NextResponse } from 'next/server';
import { memoApi } from '@/lib/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/memos/[id]/archive - メモアーカイブ（段階的削除）
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const memoId = parseInt(id);

    if (isNaN(memoId)) {
      return NextResponse.json({ error: '無効なメモIDです' }, { status: 400 });
    }

    console.log(`フロントエンドAPIルート: メモ${memoId}のアーカイブ開始`);

    // deleteMemo関数を使用（内部でAPIサーバーとの通信とバグ対策を処理）
    const archivedMemo = await memoApi.deleteMemo(memoId);

    console.log(
      `フロントエンドAPIルート: メモ${memoId}のアーカイブ完了`,
      archivedMemo
    );
    return NextResponse.json(archivedMemo);
  } catch (error) {
    console.error('フロントエンドAPIルート: メモアーカイブエラー:', error);
    return NextResponse.json(
      { error: 'メモのアーカイブに失敗しました' },
      { status: 500 }
    );
  }
}
