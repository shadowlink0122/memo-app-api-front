'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { memoApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Memo } from '@/lib/schemas';

interface MemoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MemoDetailPage({ params }: MemoDetailPageProps) {
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMemo = async () => {
      try {
        const { id } = await params;
        const memoId = parseInt(id);

        if (isNaN(memoId)) {
          notFound();
          return;
        }

        const memoData = await memoApi.getMemo(memoId);
        setMemo(memoData);
      } catch (err) {
        console.error('メモの取得に失敗:', err);
        setError('メモの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadMemo();
  }, [params]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error || !memo) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div className="space-y-6 bg-white min-h-full">
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">メモ詳細</h1>
        <p className="text-gray-600">メモの詳細情報を確認できます</p>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/memos">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>メモ一覧に戻る</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/memos/${memo.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>編集</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>削除</span>
          </Button>
        </div>
      </div>

      {/* メモ詳細 */}
      <div
        className={`rounded-lg shadow-sm border p-6 ${
          memo.status === 'archived' ? 'bg-gray-200 opacity-85' : 'bg-white'
        }`}
      >
        <div className="space-y-4">
          {/* タイトル */}
          <div>
            <h1
              className="text-3xl font-bold text-gray-900 break-words"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {memo.title}
            </h1>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="font-medium">カテゴリ:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {memo.category}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">優先度:</span>
              <span
                className={`px-2 py-1 rounded ${
                  memo.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : memo.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {memo.priority === 'high'
                  ? '高'
                  : memo.priority === 'medium'
                    ? '中'
                    : '低'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">ステータス:</span>
              <span
                className={`px-2 py-1 rounded ${
                  memo.status === 'archived'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {memo.status === 'archived' ? 'アーカイブ' : 'アクティブ'}
              </span>
            </div>
          </div>

          {/* タグ */}
          {memo.tags && memo.tags.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">タグ:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {memo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* コンテンツ */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">内容</h3>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-900 leading-relaxed">
                {memo.content.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className="mb-2">
                    {line
                      .split(/(\bhttps?:\/\/[^\s]+)/g)
                      .map((part, partIndex) => {
                        // URLパターンにマッチする場合
                        if (/^https?:\/\//.test(part)) {
                          return (
                            <a
                              key={partIndex}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {part}
                            </a>
                          );
                        }
                        return part;
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* メタデータ */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 space-y-1">
              <div>
                作成日時: {new Date(memo.created_at).toLocaleString('ja-JP')}
              </div>
              <div>
                更新日時: {new Date(memo.updated_at).toLocaleString('ja-JP')}
              </div>
              {memo.completed_at && (
                <div>
                  完了日時:{' '}
                  {new Date(memo.completed_at).toLocaleString('ja-JP')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
