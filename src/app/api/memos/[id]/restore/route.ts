import { NextRequest, NextResponse } from 'next/server';
import { memoApi } from '@/lib/api';

// PATCH /api/memos/[id]/restore - メモ復元
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const memoId = parseInt(context.params.id);

    if (isNaN(memoId)) {
      return NextResponse.json({ error: '無効なメモIDです' }, { status: 400 });
    }

    const restoredMemo = await memoApi.restoreMemo(memoId);
    return NextResponse.json(restoredMemo);
  } catch (error) {
    console.error('メモ復元エラー:', error);
    return NextResponse.json(
      { error: 'メモの復元に失敗しました' },
      { status: 500 }
    );
  }
}
