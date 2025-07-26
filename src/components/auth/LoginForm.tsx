'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Github } from 'lucide-react';
import { LoginRequest, loginRequestSchema } from '@/lib/auth-schemas';
import { useAuth } from '@/contexts/AuthContext';
import { AuthApiError } from '@/lib/auth-api';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  // デモ用ログイン機能
  const handleDemoLogin = () => {
    setValue('email', 'demo@example.com');
    setValue('password', 'demo123456');
  };

  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setError('');

      console.log('LoginForm: ログイン試行開始:', {
        email: data.email,
        passwordLength: data.password.length,
        apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL,
        disableAuth: process.env.NEXT_PUBLIC_DISABLE_AUTH,
      });

      const response = await login(data.email, data.password);
      console.log('LoginForm: ログイン成功:', response);

      onSuccess?.();
    } catch (err) {
      console.error('LoginForm: ログインエラー（詳細）:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        name: err instanceof Error ? err.name : 'Unknown',
        status: err instanceof AuthApiError ? err.status : 'No status',
        errorCode: err instanceof AuthApiError ? err.errorCode : 'No code',
      });

      if (err instanceof AuthApiError) {
        switch (err.status) {
          case 401:
            setError('メールアドレスまたはパスワードが正しくありません');
            break;
          case 403:
            setError('アカウントが無効化されています');
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            setError(
              'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。'
            );
            break;
          default:
            setError(
              `認証エラー (${err.status}): ${err.message || 'ログインに失敗しました'}`
            );
        }
      } else {
        if (err instanceof Error) {
          if (
            err.message.includes('Network Error') ||
            err.message.includes('timeout')
          ) {
            setError(
              'ネットワークエラー: サーバーに接続できません。サーバーが起動しているか確認してください。'
            );
          } else {
            setError(`エラー: ${err.message}`);
          }
        } else {
          setError('予期しないエラーが発生しました。');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
        <p className="text-gray-600 mt-2">アカウントにサインインしてください</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            パスワード
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="パスワードを入力"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              ログイン中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <LogIn className="h-4 w-4 mr-2" />
              ログイン
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full mt-4"
          onClick={() => {
            // GitHub認証の実装は後で追加
            console.log('GitHub認証');
          }}
        >
          <Github className="h-4 w-4 mr-2" />
          GitHubでログイン
        </Button>

        {/* デモ用ログインボタン */}
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={handleDemoLogin}
        >
          デモ用ログイン情報を入力
        </Button>
      </div>

      {onSwitchToRegister && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              新規登録
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
