import { NextRequest, NextResponse } from 'next/server';
import { memoApi } from '@/lib/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/memos/[id] - メモ詳細取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const memoId = parseInt(id);

    if (isNaN(memoId)) {
      return NextResponse.json({ error: '無効なメモIDです' }, { status: 400 });
    }

    const memo = await memoApi.getMemo(memoId);
    return NextResponse.json(memo);
  } catch (error) {
    console.error('メモ取得エラー:', error);
    return NextResponse.json(
      { error: 'メモの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT /api/memos/[id] - メモ更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const memoId = parseInt(id);

    if (isNaN(memoId)) {
      return NextResponse.json({ error: '無効なメモIDです' }, { status: 400 });
    }

    const body = await request.json();
    const memo = await memoApi.updateMemo(memoId, body);
    return NextResponse.json(memo);
  } catch (error) {
    console.error('メモ更新エラー:', error);
    return NextResponse.json(
      { error: 'メモの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE /api/memos/[id] - メモ完全削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const memoId = parseInt(id);

    if (isNaN(memoId)) {
      return NextResponse.json({ error: '無効なメモIDです' }, { status: 400 });
    }

    // バックエンドAPIサーバーに直接DELETE要求を送信
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${API_BASE_URL}/api/memos/${memoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_TOKEN || 'test-token'}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('バックエンドAPI削除エラー:', response.status, errorData);
      throw new Error(`バックエンドAPI削除に失敗: ${response.status}`);
    }

    console.log(`メモ ${memoId} の完全削除が完了しました`);
    return NextResponse.json({ message: 'メモが完全削除されました' });
  } catch (error) {
    console.error('メモ完全削除エラー:', error);
    return NextResponse.json(
      { error: 'メモの完全削除に失敗しました' },
      { status: 500 }
    );
  }
}
