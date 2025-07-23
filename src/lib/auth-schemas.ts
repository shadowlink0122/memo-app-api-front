import { z } from 'zod';

// 認証リクエストスキーマ
export const registerRequestSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(30, 'ユーザー名は30文字以内で入力してください')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'ユーザー名は英数字とアンダースコアのみ使用できます'
    ),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'パスワードは大小文字・数字・記号を含む必要があります'
    ),
});

export const loginRequestSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export const refreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

// ユーザースキーマ
export const publicUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  github_username: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
});

// 認証レスポンススキーマ
export const authResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    user: publicUserSchema,
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
  }),
});

export const userProfileResponseSchema = z.object({
  data: publicUserSchema,
});

export const githubAuthURLResponseSchema = z.object({
  auth_url: z.string(),
  state: z.string(),
});

// TypeScript型の生成
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type GitHubAuthURLResponse = z.infer<typeof githubAuthURLResponseSchema>;
