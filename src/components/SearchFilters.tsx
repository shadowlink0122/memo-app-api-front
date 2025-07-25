'use client';

import { useState, useEffect } from 'react';
import { SearchParams } from '@/lib/schemas';
import { priorityLabels, statusLabels } from '@/lib/utils';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  params: Partial<SearchParams>;
  onChange: (params: Partial<SearchParams>) => void;
  loading: boolean;
}

export default function SearchFilters({
  params,
  onChange,
  loading,
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localParams, setLocalParams] = useState<Partial<SearchParams>>(params);

  // 検索パラメータが外部から変更された場合に同期
  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  // 検索実行
  const handleSearch = () => {
    onChange(localParams);
  };

  // フィルターをクリア
  const handleClear = () => {
    const clearedParams = { page: 1 };
    setLocalParams(clearedParams);
    onChange(clearedParams);
  };

  // 入力値の変更
  const handleInputChange = (
    key: keyof SearchParams,
    value: string | undefined
  ) => {
    const newParams = { ...localParams, [key]: value, page: 1 };
    setLocalParams(newParams);
  };

  // Enterキーで検索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = Object.keys(localParams).some(
    key =>
      key !== 'page' &&
      key !== 'limit' &&
      localParams[key as keyof SearchParams]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 検索バー */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localParams.search || ''}
            onChange={e => handleInputChange('search', e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="メモを検索..."
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            showFilters || hasActiveFilters
              ? 'text-white bg-blue-600 hover:bg-blue-700'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          フィルター
        </button>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          検索
        </button>
      </div>

      {/* フィルタークリアボタン */}
      {hasActiveFilters && (
        <div className="mb-4">
          <button
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-1" />
            フィルターをクリア
          </button>
        </div>
      )}

      {/* フィルター */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <input
                type="text"
                value={localParams.category || ''}
                onChange={e => handleInputChange('category', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="カテゴリで絞り込み"
              />
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={localParams.status || ''}
                onChange={e =>
                  handleInputChange('status', e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先度
              </label>
              <select
                value={localParams.priority || ''}
                onChange={e =>
                  handleInputChange('priority', e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ
              </label>
              <input
                type="text"
                value={localParams.tags || ''}
                onChange={e => handleInputChange('tags', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="タグで絞り込み"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
