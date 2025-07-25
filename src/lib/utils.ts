import { Priority, Status } from './schemas';

// 優先度の表示用ラベル
export const priorityLabels: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

// ステータスの表示用ラベル
export const statusLabels: Record<Status, string> = {
  active: 'アクティブ',
  archived: 'アーカイブ',
};

// 優先度の色
export const priorityColors: Record<Priority, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

// ステータスの色
export const statusColors: Record<Status, string> = {
  active: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-800',
};

// 日付フォーマット関数
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 相対時間フォーマット関数
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'たった今';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  } else if (diffInDays < 7) {
    return `${diffInDays}日前`;
  } else {
    return formatDate(dateString);
  }
};

// タグ文字列をパース
export const parseTags = (tagsString: string): string[] => {
  if (!tagsString.trim()) return [];
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

// タグ配列を文字列に変換
export const stringifyTags = (tags: string[]): string => {
  return tags.join(', ');
};

// クラス名を結合するユーティリティ
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};
