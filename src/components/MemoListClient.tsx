'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const urlSearchParams = useSearchParams();

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
    // URLパラメータから検索条件を取得
    const initialParams: Partial<SearchParams> = {};

    const status = urlSearchParams.get('status');
    if (status) {
      initialParams.status = status as 'active' | 'archived';
    }

    const tags = urlSearchParams.get('tags');
    if (tags) {
      initialParams.tags = tags;
    }

    const priority = urlSearchParams.get('priority');
    if (priority) {
      initialParams.priority = priority as 'low' | 'medium' | 'high';
    }

    const category = urlSearchParams.get('category');
    if (category) {
      initialParams.category = category;
    }

    // 検索パラメータを設定
    setSearchParams(initialParams);

    // 検索条件がある場合はその条件で、ない場合は通常の取得
    fetchMemos(initialParams);
  }, [urlSearchParams]);

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

  // ステータス検索処理
  const handleStatusSearch = (status: string) => {
    const newParams = { status: status as 'active' | 'archived' };
    setSearchParams(newParams);
    fetchMemos(newParams);
  };

  // 締切色フィルタ検索処理
  const handleDeadlineColorSearch = (color: string) => {
    // 色名から日数範囲を決定
    let deadlineFrom: string | undefined;
    let deadlineTo: string | undefined;
    const now = new Date();
    if (color === 'red') {
      // 締切過ぎ: deadline < now
      deadlineTo = now.toISOString();
    } else if (color === 'orange') {
      // 1日以内: now <= deadline < now+1日
      deadlineFrom = now.toISOString();
      deadlineTo = new Date(
        now.getTime() + 1 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else if (color === 'yellow') {
      // 2日以内: now+1日 <= deadline < now+2日
      deadlineFrom = new Date(
        now.getTime() + 1 * 24 * 60 * 60 * 1000
      ).toISOString();
      deadlineTo = new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else if (color === 'green') {
      // 3日以内: now+2日 <= deadline < now+3日
      deadlineFrom = new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      deadlineTo = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    const newParams: Partial<SearchParams> = {};
    if (deadlineFrom) newParams.deadlineFrom = deadlineFrom;
    if (deadlineTo) newParams.deadlineTo = deadlineTo;
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
        onStatusSearch={handleStatusSearch}
        onDeadlineColorClick={handleDeadlineColorSearch}
      />
    </>
  );
}
