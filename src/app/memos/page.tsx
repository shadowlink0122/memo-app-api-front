import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import MemoListClient from '@/components/MemoListClient';

export default function MemosPage() {
  return (
    <div className="space-y-6 bg-white min-h-full">
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">メモ一覧</h1>
        <p className="text-gray-600">すべてのメモを管理できます</p>
      </div>

      {/* アクションバー */}
      <div className="flex justify-start items-center">
        <Link href="/memos/create">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>新しいメモ</span>
          </Button>
        </Link>
      </div>

      {/* メモリスト */}
      <MemoListClient
        initialMemos={{
          memos: [],
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0,
        }}
        initialError={null}
      />
    </div>
  );
}
