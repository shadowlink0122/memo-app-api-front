'use client';

import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  // 認証が無効化されているかチェック
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  // AuthContextからlogout関数とユーザー情報を取得
  const { logout, user } = useAuth();

  // ログアウト処理
  const handleLogout = async () => {
    console.log('[Header] 認証設定チェック:', {
      NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
      NEXT_PUBLIC_DISABLE_AUTH: process.env.NEXT_PUBLIC_DISABLE_AUTH,
      isAuthDisabled,
    });

    if (isAuthDisabled) {
      console.log(
        '[Header] 認証無効化モードのため、ログアウトをスキップします'
      );
      return;
    }

    try {
      console.log('[Header] ログアウト試行');
      await logout();
      console.log('[Header] ログアウト成功');
      // AuthContextがユーザー状態を管理するので、手動でのリロードは不要
    } catch (error) {
      console.error('[Header] ログアウトエラー:', error);
      // エラーが発生してもリロードして認証状態をリセット
      alert(
        'ログアウト処理中にエラーが発生しましたが、アプリケーションをリロードします。'
      );
      window.location.reload();
    }
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm ${className || ''}`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* 左側：空のスペース（将来的にタイトルやナビゲーションなど） */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
            📝 メモアプリ
          </h1>
        </div>

        {/* 右側：ユーザー情報とログアウトボタン */}
        {!isAuthDisabled && (
          <div className="flex items-center space-x-3">
            {/* ユーザーアイコン */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">
                {user?.username || user?.email || 'ユーザー'}
              </span>
            </div>

            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
