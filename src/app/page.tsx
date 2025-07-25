'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { memoApi } from '@/lib/api';
import { MemoListResponse } from '@/lib/schemas';
import MemoList from '@/components/MemoList';
import MemoForm from '@/components/MemoForm';
import Link from 'next/link';
import { Plus, Menu } from 'lucide-react';
import { mockAuthForTests, isTestEnvironment } from '@/lib/test-utils';

export default function Home() {
  const [memos, setMemos] = useState<MemoListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  // テスト環境の初期化
  useEffect(() => {
    if (isTestEnvironment()) {
      console.log('ホーム画面: テスト環境を初期化中...');
      mockAuthForTests();
    }

    // 開発モード（?dev=true）でテスト用認証を設定
    if (
      typeof window !== 'undefined' &&
      window.location.search.includes('dev=true')
    ) {
      console.log('開発モード: テスト用認証を設定中...');
      localStorage.setItem('auth_token', 'dev-test-token-12345');
      localStorage.setItem(
        'user_info',
        JSON.stringify({
          id: 1,
          username: 'developer',
          email: 'dev@example.com',
        })
      );
    }
  }, []);

  // メモ一覧を取得（activeなメモのみ）
  const fetchMemos = async (
    params: { status?: 'active' | 'archived' } = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log('ホーム画面: メモを取得中...', params);
      console.log(
        '環境変数 NEXT_PUBLIC_DISABLE_AUTH:',
        process.env.NEXT_PUBLIC_DISABLE_AUTH
      );
      // デフォルトはactiveなメモのみを取得
      const data = await memoApi.getMemos({
        status: params.status || 'active',
      });
      console.log('ホーム画面: メモ取得成功:', data);
      setMemos(data);
    } catch (err) {
      console.error('ホーム画面: メモ取得エラー:', err);
      setError(err instanceof Error ? err.message : 'メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchMemos();
  }, []);

  // メモが作成・更新・削除されたときの処理
  const handleMemoChange = () => {
    fetchMemos();
    setShowForm(false);
  };

  // タグ検索処理
  const handleTagSearch = (tag: string) => {
    router.push(`/memos?tags=${encodeURIComponent(tag)}`);
  };

  // 優先度検索処理
  const handlePrioritySearch = (priority: string) => {
    router.push(`/memos?priority=${encodeURIComponent(priority)}`);
  };

  // カテゴリ検索処理
  const handleCategorySearch = (category: string) => {
    router.push(`/memos?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-full">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 role="heading" className="text-3xl font-bold text-gray-900">
            メモアプリ
          </h1>
          <p className="text-gray-600 mt-2">メモの管理と整理</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/memos"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>メモ管理ページ</span>
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新しいメモ</span>
          </button>
        </div>
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

      {/* メモ作成フォーム */}
      {showForm && (
        <MemoForm
          onClose={() => setShowForm(false)}
          onSave={handleMemoChange}
        />
      )}
    </div>
  );
}
