'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Archive, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const navigation = [
  {
    name: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    name: 'メモ一覧',
    href: '/memos',
    icon: FileText,
  },
  {
    name: 'アーカイブ',
    href: '/archive',
    icon: Archive,
  },
  {
    name: '設定',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({
  className,
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);

  // 外部からpropsが渡されている場合はそれを使用、そうでなければ内部状態を使用
  const isCollapsed =
    externalIsCollapsed !== undefined
      ? externalIsCollapsed
      : internalIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed || setInternalIsCollapsed;

  return (
    <>
      {/* デスクトップサイドバー */}
      <div
        data-testid="sidebar"
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          className
        )}
      >
        {/* サイドバーヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">📝 メモアプリ</h1>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* 折りたたみボタン */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
                {!isCollapsed && (
                  <span className="ml-3 transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div
            className={cn(
              'text-xs text-gray-500 flex items-center',
              isCollapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {isCollapsed ? (
              <span title="バージョン 1.0.0">v1.0</span>
            ) : (
              <>
                <span>バージョン 1.0.0</span>
                <span className="text-green-500">●</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* モバイル用オーバーレイとサイドバー */}
      <MobileSidebar />
    </>
  );
}

function MobileSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* モバイルメニューボタン */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          data-testid="sidebar-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 bg-white border border-gray-300 hover:text-gray-900 hover:bg-gray-50 shadow-sm"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* モバイルオーバーレイ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* モバイルサイドバー */}
          <div className="relative flex flex-col w-64 bg-white border-r border-gray-200 shadow-lg">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h1 className="text-xl font-bold text-gray-900">📝 メモアプリ</h1>
              <div className="flex items-center space-x-2">
                {/* 閉じるボタン */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-500 group-hover:text-gray-700'
                      )}
                    />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* フッター */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>バージョン 1.0.0</span>
                <span className="text-green-500">●</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
