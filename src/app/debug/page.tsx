'use client';

import { useEffect, useState } from 'react';
import { memoApi } from '@/lib/api';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<{ [key: string]: unknown }>({});

  useEffect(() => {
    const loadDebugInfo = async () => {
      const info: { [key: string]: unknown } = {
        disableAuth: process.env.NEXT_PUBLIC_DISABLE_AUTH,
        isTestEnv:
          typeof window !== 'undefined' &&
          window.location.search.includes('test=true'),
        localStorage:
          typeof window !== 'undefined'
            ? {
                authToken: localStorage.getItem('auth_token'),
                userInfo: localStorage.getItem('user_info'),
              }
            : null,
      };

      try {
        const memos = await memoApi.getMemos();
        info.memos = memos;
      } catch (error) {
        info.error = error instanceof Error ? error.message : String(error);
      }

      setDebugInfo(info);
    };

    loadDebugInfo();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">デバッグ情報</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
