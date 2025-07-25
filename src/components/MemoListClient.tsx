'use client';

import { useState, useEffect } from 'react';
import { MemoListResponse, SearchParams } from '@/lib/schemas';
import { memoApi } from '@/lib/api';
import MemoList from '@/components/MemoList';
import SearchFilters from '@/components/SearchFilters';

interface MemoListClientProps {
  initialMemos: MemoListResponse | null;
  initialError: string | null;
}

export default function MemoListClient({
  initialMemos,
  initialError,
}: MemoListClientProps) {
  const [memos, setMemos] = useState<MemoListResponse | null>(initialMemos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [searchParams, setSearchParams] = useState<Partial<SearchParams>>({});

  // メモ一覧を取得
  const fetchMemos = async (params: Partial<SearchParams> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await memoApi.getMemos(params);
      setMemos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み時にメモを取得
  useEffect(() => {
    fetchMemos();
  }, []);

  // 検索パラメータが変更されたときに再取得
  const handleSearchChange = (params: Partial<SearchParams>) => {
    setSearchParams(params);
    fetchMemos(params);
  };

  // メモが作成・更新・削除されたときの処理
  const handleMemoChange = () => {
    fetchMemos(searchParams);
  };

  // タグ検索処理
  const handleTagSearch = (tag: string) => {
    const newParams = { tags: tag };
    setSearchParams(newParams);
    fetchMemos(newParams);
  };

  // 優先度検索処理
  const handlePrioritySearch = (priority: string) => {
    const newParams = { priority: priority as 'low' | 'medium' | 'high' };
    setSearchParams(newParams);
    fetchMemos(newParams);
  };

  // カテゴリ検索処理
  const handleCategorySearch = (category: string) => {
    const newParams = { category: category };
    setSearchParams(newParams);
    fetchMemos(newParams);
  };

  return (
    <>
      {/* 検索・フィルター */}
      <div className="mb-6">
        <SearchFilters
          params={searchParams}
          onChange={handleSearchChange}
          loading={loading}
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* メモ一覧 */}
      <MemoList
        memos={memos}
        loading={loading}
        onMemoChange={handleMemoChange}
        onTagSearch={handleTagSearch}
        onPrioritySearch={handlePrioritySearch}
        onCategorySearch={handleCategorySearch}
      />
    </>
  );
}
