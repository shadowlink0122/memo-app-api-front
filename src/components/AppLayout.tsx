'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import AuthPage from '@/components/auth/AuthPage';
import Header from '@/components/Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  console.log('AppLayout: レンダリング', {
    user,
    loading,
    isUserTruthy: !!user,
    userType: typeof user,
    userKeys: user ? Object.keys(user) : 'no user',
    disableAuth: process.env.NEXT_PUBLIC_DISABLE_AUTH,
  });

  // 認証が無効化されている場合は認証チェックをバイパス
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  if (isAuthDisabled) {
    console.log('AppLayout: 認証無効化モード、メインアプリを表示');
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        {/* メインコンテンツエリア */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
            isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <Header />
          <main
            role="main"
            className="flex-1 overflow-auto p-4 lg:p-6 bg-white"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('AppLayout: ローディング表示');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    console.log('AppLayout: 認証ページ表示');
    return <AuthPage />;
  }

  console.log('AppLayout: メインアプリ表示');

  // 認証済みの場合は通常のレイアウト
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      {/* メインコンテンツエリア */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <Header />
        <main role="main" className="flex-1 overflow-auto p-4 lg:p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
