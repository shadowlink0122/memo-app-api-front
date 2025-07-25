'use client';

import { useState } from 'react';
import { MemoListResponse, Memo } from '@/lib/schemas';
import { memoApi } from '@/lib/api';
import MemoCard from './MemoCard';
import MemoForm from './MemoForm';
import Pagination from './Pagination';

interface MemoListProps {
  memos: MemoListResponse | null;
  loading: boolean;
  onMemoChange: () => void;
  onTagSearch?: (tag: string) => void;
  onPrioritySearch?: (priority: string) => void;
  onCategorySearch?: (category: string) => void;
  onStatusSearch?: (status: string) => void;
}

export default function MemoList({
  memos,
  loading,
  onMemoChange,
  onTagSearch,
  onPrioritySearch,
  onCategorySearch,
  onStatusSearch,
}: MemoListProps) {
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  const handleEdit = (memo: Memo) => {
    setEditingMemo(memo);
  };

  const handleDelete = async (id: number, isArchived: boolean = false) => {
    if (isArchived) {
      // アーカイブからの削除は完全削除 - 確認ダイアログを表示
      if (!confirm('このメモを完全に削除しますか？この操作は取り消せません。'))
        return;

      try {
        await memoApi.permanentlyDeleteMemo(id);
        onMemoChange();
      } catch (err) {
        console.error('メモの完全削除に失敗:', err);
        alert('メモの完全削除に失敗しました');
      }
    } else {
      // 通常の削除はアーカイブ - 確認ダイアログなし
      try {
        await memoApi.deleteMemo(id);
        onMemoChange();
      } catch (err) {
        console.error('メモの削除に失敗:', err);
        alert('メモの削除に失敗しました');
      }
    }
  };

  const handleRestore = async (id: number) => {
    // 復元処理 - 確認ダイアログなし
    try {
      await memoApi.restoreMemo(id);
      onMemoChange();
    } catch (err) {
      console.error('メモの復元に失敗:', err);
      alert('メモの復元に失敗しました');
    }
  };

  const handleSave = () => {
    setEditingMemo(null);
    onMemoChange();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!memos || memos.memos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">メモが見つかりませんでした</div>
        <div className="text-gray-400 text-sm mt-2">
          新しいメモを作成してみましょう
        </div>
      </div>
    );
  }

  return (
    <div data-testid="memo-list">
      {/* メモカードのグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {memos.memos.map(memo => (
          <MemoCard
            key={memo.id}
            memo={memo}
            onEdit={handleEdit}
            onDelete={id => handleDelete(id, memo.status === 'archived')}
            onRestore={memo.status === 'archived' ? handleRestore : undefined}
            onTagClick={onTagSearch}
            onPriorityClick={onPrioritySearch}
            onCategoryClick={onCategorySearch}
            onStatusClick={onStatusSearch}
          />
        ))}
      </div>

      {/* ページネーション */}
      {memos.total_pages > 1 && (
        <Pagination
          currentPage={memos.page}
          totalPages={memos.total_pages}
          totalItems={memos.total}
          itemsPerPage={memos.limit}
        />
      )}

      {/* 編集フォーム */}
      {editingMemo && (
        <MemoForm
          memo={editingMemo}
          onClose={() => setEditingMemo(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
