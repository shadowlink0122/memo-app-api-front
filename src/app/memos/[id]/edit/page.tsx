'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { memoApi } from '@/lib/api';
import MemoForm from '@/components/MemoForm';
import { useEffect, useState } from 'react';
import { Memo } from '@/lib/schemas';

interface EditMemoPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemoPage({ params }: EditMemoPageProps) {
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
    <div
      className={`space-y-6 min-h-full ${
        memo.status === 'archived' ? 'bg-gray-200' : 'bg-white'
      }`}
    >
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
          メモを編集
        </h1>
        <p className="text-gray-600">メモの内容を編集・更新できます</p>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center space-x-4">
        <Link href={`/memos/${memo.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>詳細に戻る</span>
          </Button>
        </Link>
      </div>

      {/* メモ編集フォーム */}
      <div
        className={`rounded-lg shadow-sm border p-6 ${
          memo.status === 'archived' ? 'bg-gray-100 opacity-85' : 'bg-white'
        }`}
      >
        <MemoForm
          memo={memo}
          onClose={() => {
            // メモ詳細に戻る
            window.history.back();
          }}
          onSave={() => {
            console.log('メモが更新されました');
            // メモ詳細に戻る
            window.history.back();
          }}
        />
      </div>
    </div>
  );
}
