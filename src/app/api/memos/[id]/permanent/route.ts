import { NextResponse } from 'next/server';

// DELETE /api/memos/[id]/permanent - アーカイブされたメモの完全削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const memoId = parseInt(params.id);
    if (isNaN(memoId)) {
      return NextResponse.json({ error: 'Invalid memo ID' }, { status: 400 });
    }
    console.log(`DELETE /api/memos/${memoId}/permanent - 完全削除開始`);
    // Swagger仕様に従い、APIサーバーのpermanentエンドポイントを使用
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const deleteUrl = `${apiUrl}/api/memos/${memoId}/permanent`;
    console.log(`APIサーバーへDELETEリクエスト送信: ${deleteUrl}`);
    // 認証ヘッダーを取得
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    // APIサーバーにDELETEリクエスト
    const response = await fetch(deleteUrl, { method: 'DELETE', headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`APIサーバーエラー: ${response.status}`, errorData);
      return NextResponse.json(
        { error: errorData.message || 'APIサーバーエラー' },
        { status: response.status }
      );
    }
    const responseData = await response.json().catch(() => ({}));
    console.log(`✅ メモ${memoId}の完全削除が完了しました`, responseData);
    return NextResponse.json(
      { message: 'メモが完全に削除されました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('完全削除エラー:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '完全削除に失敗しました',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function POST() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
