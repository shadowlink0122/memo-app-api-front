'use client';

import { useState, useEffect } from 'react';
import { Archive, Inbox } from 'lucide-react';
import MemoList from '@/components/MemoList';
import { memoApi } from '@/lib/api';
import { MemoListResponse } from '@/lib/schemas';

export default function ArchivePage() {
  const [memos, setMemos] = useState<MemoListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // アーカイブされたメモを取得
  const fetchArchivedMemos = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await memoApi.getMemos({ status: 'archived' });
      setMemos(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'メモの取得中にエラーが発生しました'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedMemos();
  }, []);

  return (
    <div className="space-y-6 bg-white min-h-full">
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Archive className="h-8 w-8 text-gray-600" />
          <h1 role="heading" className="text-3xl font-bold text-gray-900">
            アーカイブ
          </h1>
        </div>
        <p className="text-gray-600">アーカイブされたメモを管理できます</p>
      </div>

      {/* メモ一覧 */}
      <div>
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchArchivedMemos}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        )}

        {!loading && !error && memos && memos.memos.length === 0 && (
          <div className="text-center py-12">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              アーカイブされたメモはありません
            </h3>
            <p className="text-gray-600">
              メモをアーカイブすると、ここに表示されます
            </p>
          </div>
        )}

        {!loading && !error && memos && memos.memos.length > 0 && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {memos.total}件のアーカイブされたメモ
              </p>
            </div>
            <MemoList
              memos={memos}
              loading={loading}
              onMemoChange={fetchArchivedMemos}
            />
          </div>
        )}
      </div>
    </div>
  );
}
