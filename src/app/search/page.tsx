'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import MemoList from '@/components/MemoList';
import SearchFilters from '@/components/SearchFilters';
import { memoApi } from '@/lib/api';
import { MemoListResponse, SearchParams } from '@/lib/schemas';

export default function SearchPage() {
  const [memos, setMemos] = useState<MemoListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<Partial<SearchParams>>({});

  // メモを検索
  const searchMemos = async (params: Partial<SearchParams>) => {
    if (
      !params.search &&
      !params.tags &&
      !params.category &&
      !params.status &&
      !params.priority
    ) {
      setMemos(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await memoApi.getMemos(params);
      setMemos(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '検索中にエラーが発生しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // 検索パラメータが変更されたときに検索を実行
  useEffect(() => {
    searchMemos(searchParams);
  }, [searchParams]);

  const handleSearch = (params: Partial<SearchParams>) => {
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    searchParams.search ||
    searchParams.tags ||
    searchParams.category ||
    searchParams.status ||
    searchParams.priority;

  return (
    <div className="space-y-6 bg-white min-h-full">
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">メモを検索</h1>
        <p className="text-gray-600">
          タイトル、内容、タグでメモを検索できます
        </p>
      </div>

      {/* 検索フィルター */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            検索・フィルター
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              クリア
            </button>
          )}
        </div>

        <SearchFilters
          params={searchParams}
          onChange={handleSearch}
          loading={loading}
        />
      </div>

      {/* 検索結果 */}
      <div>
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">検索中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => searchMemos(searchParams)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        )}

        {!loading && !error && !memos && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              検索キーワードを入力してください
            </h3>
            <p className="text-gray-600">
              メモのタイトル、内容、タグから検索できます
            </p>
          </div>
        )}

        {!loading && !error && memos && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {memos.total}件のメモが見つかりました
                {searchParams.search && ` - 「${searchParams.search}」`}
                {searchParams.tags && ` - タグ: ${searchParams.tags}`}
              </p>
            </div>
            <MemoList
              memos={memos}
              loading={loading}
              onMemoChange={() => searchMemos(searchParams)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
