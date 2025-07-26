import { z } from 'zod';

// APIスキーマ定義
export const prioritySchema = z.enum(['low', 'medium', 'high']);
export const statusSchema = z.enum(['active', 'archived']);

// メモ作成リクエストスキーマ
export const createMemoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください')
    .transform(str => (str || '').trim()), // nullやundefinedも処理
  content: z
    .string()
    .min(1, '内容は必須です')
    .transform(str => (str || '').trim()), // nullやundefinedも処理
  category: z
    .string()
    .max(50, 'カテゴリは50文字以内で入力してください')
    .transform(str => (str || '').trim())
    .default(''), // デフォルト値を空文字列に設定
  tags: z.array(z.string()).default([]),
  priority: prioritySchema.default('medium'),
});

// メモ更新リクエストスキーマ
export const updateMemoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
  priority: prioritySchema.optional(),
  status: statusSchema.optional(),
});

// メモレスポンススキーマ
export const memoSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  tags: z.union([z.string(), z.array(z.string())]).transform(val => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return [val];
      }
    }
    return [];
  }),
  priority: prioritySchema,
  status: statusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  // completed_atフィールドはAPIレスポンスに含まれていないためオプションに
  completed_at: z.string().nullable().optional(),
  // ユーザーIDフィールド（APIがuser_idを必須で返すように修正されたため必須フィールドに変更）
  user_id: z.preprocess(val => {
    if (val == null) return 0;
    if (typeof val === 'string' || typeof val === 'number') return Number(val);
    return 0;
  }, z.number()),
});

// メモ一覧レスポンススキーマ
export const memoListSchema = z.object({
  memos: z.array(memoSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
});

// 検索パラメータスキーマ
export const searchParamsSchema = z.object({
  category: z.string().optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// エラーレスポンススキーマ
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

// TypeScriptの型定義をエクスポート
export type Priority = z.infer<typeof prioritySchema>;
export type Status = z.infer<typeof statusSchema>;
export type CreateMemoRequest = z.infer<typeof createMemoSchema>;
export type UpdateMemoRequest = z.infer<typeof updateMemoSchema>;
export type Memo = z.infer<typeof memoSchema>;
export type MemoListResponse = z.infer<typeof memoListSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
