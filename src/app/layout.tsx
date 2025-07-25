import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'メモアプリ',
  description: 'Next.jsで構築されたメモ管理アプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-white font-sans">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
