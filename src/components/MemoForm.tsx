'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemoSchema, updateMemoSchema } from '@/lib/schemas';
import type {
  CreateMemoRequest,
  UpdateMemoRequest,
  Memo,
  Priority,
} from '@/lib/schemas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { memoApi } from '@/lib/api';
import { priorityLabels, statusLabels } from '@/lib/utils';
import { X, Save, Tag } from 'lucide-react';

interface MemoFormProps {
  memo?: Memo;
  onClose: () => void;
  onSave: (memo: CreateMemoRequest | UpdateMemoRequest) => void;
}

export default function MemoForm({ memo, onClose, onSave }: MemoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!memo;
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const schema = isEditing ? updateMemoSchema : createMemoSchema;

  // デフォルト値を明示的に設定
  const getDefaultValues = () => {
    if (memo) {
      return {
        title: memo.title || '',
        content: memo.content || '',
        category: memo.category || '',
        tags: memo.tags || [],
        priority: memo.priority || ('medium' as Priority),
        // タイムゾーン付きの値をそのまま使う
        deadline: memo.deadline || '',
        ...(isEditing && { status: memo.status }),
      };
    } else {
      return {
        title: '',
        content: '',
        category: '',
        tags: [] as string[],
        priority: 'medium' as Priority,
        deadline: '',
      };
    }
  };

  // デバッグ用：フォームの値を監視
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    getValues,
    control,
  } = useForm<CreateMemoRequest | UpdateMemoRequest>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
    mode: 'onChange', // リアルタイムバリデーション
  });

  // 現在のフォーム値を監視
  const currentValues = watch();
  useEffect(() => {
    console.log('MemoForm: 現在のフォーム値:', currentValues);
  }, [currentValues]);

  // デバッグ用：フォームエラーをログ出力
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('MemoForm: バリデーションエラー詳細:', errors);
      console.log('各フィールドのエラー:', {
        title: errors.title?.message,
        content: errors.content?.message,
        category: errors.category?.message,
        tags: errors.tags?.message,
        priority: errors.priority?.message,
      });
    }
  }, [errors]);

  const [currentTagInput, setCurrentTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(memo?.tags || []);

  // メモが変更されたときにフォームをリセット
  useEffect(() => {
    if (memo) {
      const resetData = {
        title: memo.title,
        content: memo.content,
        category: memo.category || '',
        tags: memo.tags,
        priority: memo.priority,
        // タイムゾーン付きの値をそのまま渡す
        deadline: memo.deadline || '',
        ...(isEditing && { status: memo.status }),
      };
      reset(resetData);
      setTags(memo.tags);
      setCurrentTagInput('');
    } else {
      const resetData = {
        title: '',
        content: '',
        category: '',
        tags: [],
        priority: 'medium' as Priority,
        deadline: '',
      };
      reset(resetData);
      setTags([]);
      setCurrentTagInput('');
    }
  }, [memo, reset, isEditing]);

  // タグ変更をフォームに反映
  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  // タグ追加処理
  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTagInput('');
    }
  };

  // タグ削除処理
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Enterキーでタグ追加
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(currentTagInput);
    }
  };

  // モーダルが開いたときに最初の入力フィールドにフォーカス
  useEffect(() => {
    const timer = setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        // 強制的にスタイルを適用
        titleInputRef.current.style.color = '#111827';
        titleInputRef.current.style.backgroundColor = '#ffffff';
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: CreateMemoRequest | UpdateMemoRequest) => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== MemoForm onSubmit開始 ===');
      console.log('MemoForm: 送信データ（raw）:', data);
      console.log('MemoForm: 現在のフォーム値（getValues）:', getValues());
      console.log('MemoForm: 環境変数チェック:', {
        USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
        DISABLE_AUTH: process.env.NEXT_PUBLIC_DISABLE_AUTH,
        testModeFromUrl:
          typeof window !== 'undefined'
            ? window.location.search.includes('test=true')
            : false,
      });

      // データのクリーニング
      // deadlineをRFC3339形式（例: 2025-07-30T12:00:00+09:00）で送信
      let formattedDeadline: string | undefined = undefined;
      if (data.deadline) {
        const date = new Date(data.deadline);
        // タイムゾーンオフセット（例: +09:00）を取得
        const tzOffsetMin = date.getTimezoneOffset();
        const absOffset = Math.abs(tzOffsetMin);
        const tzSign = tzOffsetMin > 0 ? '-' : '+';
        const tzHour = String(Math.floor(absOffset / 60)).padStart(2, '0');
        const tzMin = String(absOffset % 60).padStart(2, '0');
        // yyyy-MM-ddTHH:mm:ss+09:00 形式
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        formattedDeadline = `${year}-${month}-${day}T${hour}:${minute}:${second}${tzSign}${tzHour}:${tzMin}`;
      }
      const cleanedData = {
        ...data,
        title: (data.title || '').trim(),
        content: (data.content || '').trim(),
        category: (data.category || '').trim(),
        tags: Array.isArray(data.tags)
          ? data.tags.filter(tag => tag.trim())
          : [],
        priority: data.priority || 'medium',
        deadline: formattedDeadline,
      };

      console.log('MemoForm: 送信データ（cleaned）:', cleanedData);

      // バリデーション前チェック
      if (!cleanedData.title) {
        throw new Error('タイトルは必須です');
      }
      if (!cleanedData.content) {
        throw new Error('内容は必須です');
      }

      if (isEditing && memo) {
        console.log('MemoForm: メモ更新中...', memo.id);
        await memoApi.updateMemo(memo.id, cleanedData as UpdateMemoRequest);
        console.log('MemoForm: メモ更新成功');
      } else {
        console.log('MemoForm: メモ作成中...');
        const result = await memoApi.createMemo(
          cleanedData as CreateMemoRequest
        );
        console.log('MemoForm: メモ作成成功:', result);
      }

      onSave(cleanedData);
    } catch (err) {
      console.error('MemoForm: 送信エラー（詳細）:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined,
      });

      let errorMessage = 'メモの保存に失敗しました';

      if (err instanceof Error) {
        errorMessage = err.message;

        // 特定のエラーパターンをより詳細に説明
        if (err.message.includes('invalid input')) {
          errorMessage =
            '入力内容に問題があります。必須項目を確認してください。';
        } else if (err.message.includes('400')) {
          errorMessage =
            'リクエストデータに問題があります。入力内容を確認してください。';
        } else if (err.message.includes('500')) {
          errorMessage =
            'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。';
        } else if (err.message.includes('Network Error')) {
          errorMessage =
            'ネットワークエラーが発生しました。接続を確認してください。';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={e => {
        // オーバーレイクリックでモーダルを閉じる
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900" id="dialog-title">
            {isEditing ? 'メモを編集' : '新しいメモ'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* タイトル */}
          <div>
            <label
              htmlFor="memo-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タイトル <span className="text-red-500">*</span>
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  id="memo-title"
                  {...field}
                  ref={titleInputRef}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="メモのタイトルを入力"
                  autoComplete="off"
                  onChange={e => {
                    console.log(
                      'Controller タイトル入力値変更:',
                      e.target.value
                    );
                    field.onChange(e);
                  }}
                  onFocus={() => console.log('タイトルフィールドにフォーカス')}
                  onBlur={e => {
                    console.log(
                      'タイトルフィールドからブラー:',
                      e.target.value
                    );
                    field.onBlur();
                  }}
                />
              )}
            />
            {errors.title && (
              <div className="mt-1">
                <p className="text-sm text-red-600">
                  {errors.title.message || 'invalid input'}
                </p>
                <p className="text-xs text-gray-500">
                  デバッグ: エラータイプ = {errors.title.type}, 値 = &quot;
                  {errors.title.ref?.value}&quot;
                </p>
              </div>
            )}
          </div>

          {/* 内容 */}
          <div>
            <label
              htmlFor="memo-content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              内容 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <textarea
                  id="memo-content"
                  {...field}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="メモの内容を入力"
                  autoComplete="off"
                  onChange={e => {
                    console.log('Controller 内容入力値変更:', e.target.value);
                    field.onChange(e);
                  }}
                />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>
          {/* 締め切り（内容入力の下に移動、グラフィカルUI） */}
          <div>
            <label
              htmlFor="memo-deadline"
              className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              締め切り
              <span className="text-xs text-gray-400">（任意）</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </label>
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="memo-deadline"
                  selected={
                    field.value ? new Date(field.value.replace(' ', 'T')) : null
                  }
                  onChange={(date: Date | null) => {
                    if (!date) {
                      field.onChange('');
                      return;
                    }
                    // JST (UTC+9) でISO文字列化
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hour = String(date.getHours()).padStart(2, '0');
                    const minute = String(date.getMinutes()).padStart(2, '0');
                    // yyyy-MM-ddTHH:mm+09:00 形式
                    const isoJst = `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
                    field.onChange(isoJst);
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholderText="締め切り日時を選択"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  isClearable
                />
              )}
            />
            {/* 締切バッジ（色分け） */}
            {(() => {
              const deadlineStr = getValues().deadline;
              if (!deadlineStr) return null;
              let deadline: Date;
              try {
                deadline = new Date(deadlineStr.replace(' ', 'T'));
              } catch {
                return null;
              }
              const now = new Date();
              const diffMs = deadline.getTime() - now.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              let badgeText = '';
              if (diffMs < 0) {
                badgeText = '期限切れ';
              } else if (diffDays === 0) {
                badgeText = '本日締切';
              } else if (diffDays === 1) {
                badgeText = 'あと1日';
              } else if (diffDays === 2) {
                badgeText = 'あと2日';
              } else if (diffDays === 3) {
                badgeText = 'あと3日';
              } else {
                badgeText = `${diffDays}日後`;
              }
              // メモの色（ピンク）と被らない色: 濃い紺色＋黄色文字＋黄色枠
              return (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-900 text-yellow-300 border border-yellow-400">
                  {badgeText}
                </span>
              );
            })()}
            <p className="mt-1 text-xs text-gray-500">例: 2025-07-31 23:59</p>
            <p className="mt-1 text-xs text-gray-400">
              締め切りを設定すると、期限管理ができます。未設定の場合は制限ありません。
            </p>
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deadline.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <input
                {...register('category')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
                placeholder="カテゴリを入力"
                autoComplete="off"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ステータス（編集時のみ） */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <input
              type="text"
              value={currentTagInput}
              onChange={e => setCurrentTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
              placeholder="タグを入力してEnterで確定"
              autoComplete="off"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
            <p className="mt-1 text-sm text-gray-500">
              タグを入力してEnterキーを押すと確定されます
            </p>

            {/* 確定済みタグの表示 */}
            {tags.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                      title={`"${tag}" を削除`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? '更新' : '作成'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
