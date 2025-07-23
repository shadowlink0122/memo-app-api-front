'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, Github } from 'lucide-react';
import { RegisterRequest, registerRequestSchema } from '@/lib/auth-schemas';
import { useAuth } from '@/contexts/AuthContext';
import { AuthApiError } from '@/lib/auth-api';
import { Button } from '@/components/ui/Button';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError('');

      await registerUser(data.username, data.email, data.password);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AuthApiError) {
        switch (err.status) {
          case 409:
            setError('ユーザー名またはメールアドレスが既に登録されています');
            break;
          case 429:
            setError(
              '登録の試行回数が上限に達しました。しばらく時間をおいて再度お試しください。'
            );
            break;
          default:
            setError(
              '登録に失敗しました。しばらく時間をおいて再度お試しください。'
            );
        }
      } else {
        setError('ネットワークエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">新規登録</h2>
        <p className="text-gray-600 mt-2">
          アカウントを作成してメモアプリを始めましょう
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="user_name"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            3-30文字の英数字とアンダースコア
          </p>
        </div>

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
              autoComplete="new-password"
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

          {/* パスワード強度インジケーター */}
          {watchPassword && (
            <div className="mt-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength
                        ? passwordStrength <= 2
                          ? 'bg-red-500'
                          : passwordStrength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                大小文字・数字・記号を含む8文字以上
              </p>
            </div>
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
              登録中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <UserPlus className="h-4 w-4 mr-2" />
              アカウント作成
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
          GitHubで登録
        </Button>
      </div>

      {onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ログイン
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
