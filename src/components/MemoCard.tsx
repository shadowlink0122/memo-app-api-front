'use client';

import React, { memo } from 'react';
import type { Memo } from '@/lib/schemas';
import {
  priorityLabels,
  statusLabels,
  priorityColors,
  statusColors,
  formatRelativeTime,
  cn,
} from '@/lib/utils';
import { Edit, Trash2, RotateCcw, Tag, Folder } from 'lucide-react';

interface MemoCardProps {
  memo: Memo;
  onEdit?: (memo: Memo) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  onTagClick?: (tag: string) => void;
  onPriorityClick?: (priority: string) => void;
  onCategoryClick?: (category: string) => void;
  onStatusClick?: (status: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  onEdit,
  onDelete,
  onRestore,
  onTagClick,
  onPriorityClick,
  onCategoryClick,
  onStatusClick,
}) => {
  // デバッグ用の情報出力
  console.log('MemoCard render:', {
    id: memo.id,
    title: memo.title,
    status: memo.status,
    hasOnRestore: !!onRestore,
    hasOnDelete: !!onDelete,
  });

  return (
    <div
      data-testid="memo-item"
      className={cn(
        'rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow',
        memo.status === 'archived'
          ? 'bg-gray-200 border-gray-400 opacity-80' // アーカイブされたメモはより濃いグレー
          : 'bg-white border-gray-200' // アクティブなメモは通常のスタイル
      )}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-4 min-w-0">
          <div className="mb-1">
            <h3
              className="text-lg font-semibold text-gray-900 line-clamp-2 break-words"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {memo.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(memo)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編集"
              aria-label="編集"
              data-testid="memo-edit-button"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {/* アーカイブ済みの場合は復元ボタンを表示 */}
          {memo.status === 'archived' && onRestore && (
            <button
              onClick={() => onRestore(memo.id)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="復元"
              aria-label="復元"
              data-testid="memo-restore-button"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {/* 削除ボタン：アーカイブ済みの場合は完全削除、そうでなければアーカイブ */}
          {onDelete && (
            <button
              onClick={() => onDelete(memo.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title={memo.status === 'archived' ? '完全削除' : 'アーカイブ'}
              aria-label={
                memo.status === 'archived' ? '完全削除' : 'アーカイブ'
              }
              data-testid="memo-delete-button"
            >
              {memo.status === 'archived' ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 内容 */}
      {memo.content && (
        <div className="text-gray-600 text-sm mb-4 line-clamp-3">
          {memo.content.split('\n').map((line, lineIndex) => (
            <div key={lineIndex}>
              {line.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, partIndex) => {
                // URLパターンにマッチする場合
                if (/^https?:\/\//.test(part)) {
                  return (
                    <a
                      key={partIndex}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                      onClick={e => e.stopPropagation()}
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
      )}

      {/* タグ */}
      {memo.tags && memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {memo.tags.map((tag, index) => (
            <button
              key={index}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
              title={`"${tag}" で検索`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* カテゴリ */}
      {memo.category && (
        <div className="mb-4">
          <button
            onClick={() => onCategoryClick?.(memo.category)}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
            title={`カテゴリ "${memo.category}" で検索`}
          >
            <Folder className="h-3 w-3 mr-1" />
            {memo.category}
          </button>
        </div>
      )}

      {/* メタ情報 */}
      <div className="flex items-center justify-start text-xs text-gray-500 space-x-4 mb-3">
        {/* 優先度 */}
        <button
          onClick={() => onPriorityClick?.(memo.priority)}
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer',
            priorityColors[memo.priority]
          )}
          title={`優先度 "${priorityLabels[memo.priority]}" で検索`}
        >
          {priorityLabels[memo.priority]}
        </button>

        {/* ステータス */}
        {onStatusClick ? (
          <button
            onClick={() => onStatusClick(memo.status)}
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer',
              statusColors[memo.status]
            )}
            title={`ステータス "${statusLabels[memo.status]}" で検索`}
          >
            {statusLabels[memo.status]}
          </button>
        ) : (
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              statusColors[memo.status]
            )}
          >
            {statusLabels[memo.status]}
          </span>
        )}
      </div>

      {/* 作成/更新日時とユーザー情報 */}
      <div className="text-xs text-gray-400 text-left">
        <div className="flex items-center justify-between">
          <span>
            {memo.updated_at !== memo.created_at ? (
              <>更新: {formatRelativeTime(memo.updated_at)}</>
            ) : (
              <>作成: {formatRelativeTime(memo.created_at)}</>
            )}
          </span>
          {memo.user_id && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              ユーザーID: {memo.user_id}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MemoCard);
