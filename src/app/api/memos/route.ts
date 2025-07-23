import { NextRequest, NextResponse } from 'next/server';
import { memoApi } from '@/lib/api';
import { Priority, Status } from '@/lib/schemas';

// GET /api/memos - メモ一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const memos = await memoApi.getMemos({
      page,
      limit,
      category,
      priority: priority as Priority | undefined,
      status: status as Status | undefined,
      search,
    });

    return NextResponse.json(memos);
  } catch (error) {
    console.error('メモ一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'メモの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST /api/memos - メモ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const memo = await memoApi.createMemo(body);
    return NextResponse.json(memo, { status: 201 });
  } catch (error) {
    console.error('メモ作成エラー:', error);
    return NextResponse.json(
      { error: 'メモの作成に失敗しました' },
      { status: 500 }
    );
  }
}
