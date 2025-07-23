'use client';

import { useState } from 'react';
import axios from 'axios';
import { authApi, AuthApiError } from '@/lib/auth-api';

export default function LoginDebugPage() {
  const [email, setEmail] = useState('user2025@example.com');
  const [password, setPassword] = useState('secure123');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('ログイン試行中...');

    try {
      console.log('=== ログインテスト開始 ===');
      console.log('環境変数:', {
        NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_DISABLE_AUTH: process.env.NEXT_PUBLIC_DISABLE_AUTH,
      });

      const response = await authApi.login({ email, password });
      console.log('=== ログインテスト成功 ===');
      setResult(`✅ ログイン成功!\n${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.log('=== ログインテスト失敗 ===');
      console.error('Detailed error:', error);

      if (error instanceof AuthApiError) {
        setResult(
          `❌ ログイン失敗 (AuthApiError):\nステータス: ${error.status}\nエラーコード: ${error.errorCode}\nメッセージ: ${error.message}`
        );
      } else if (error instanceof Error) {
        setResult(
          `❌ ログイン失敗 (Error):\nエラー名: ${error.name}\nメッセージ: ${error.message}\nスタック: ${error.stack}`
        );
      } else {
        setResult(`❌ ログイン失敗 (不明なエラー):\n${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setResult('直接API呼び出し中...');

    try {
      console.log('=== 直接API呼び出し開始 ===');

      // シンプルなaxiosテスト
      const axiosResponse = await axios.post(
        'http://localhost:8000/api/auth/login',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false,
          timeout: 10000,
        }
      );

      console.log('=== 直接axios成功 ===', axiosResponse);
      setResult(
        `✅ 直接axios成功!\nステータス: ${axiosResponse.status}\nデータ: ${JSON.stringify(axiosResponse.data, null, 2)}`
      );
      return;

      const apiUrl =
        process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000';
      const loginUrl = `${apiUrl}/api/auth/login`;

      console.log('リクエスト詳細:', {
        url: loginUrl,
        method: 'POST',
        body: { email, password: '***' },
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('レスポンス詳細:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ 直接API成功!\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(
          `❌ 直接API失敗!\nステータス: ${response.status}\nステータステキスト: ${response.statusText}\nレスポンス: ${JSON.stringify(data, null, 2)}`
        );
      }
    } catch (error) {
      console.error('直接API例外:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setResult(
          `❌ 直接API例外 (ネットワークエラー)!\nメッセージ: ${error.message}\n\nこれはCORSエラーまたはネットワーク接続の問題の可能性があります。`
        );
      } else {
        setResult(
          `❌ 直接API例外!\n${error instanceof Error ? error.message : String(error)}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ログインデバッグ</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-x-4 mb-6">
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? '実行中...' : 'authApi.loginテスト'}
        </button>
        <button
          onClick={testDirectAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading ? '実行中...' : '直接API呼び出しテスト'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-medium mb-2">結果:</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {result || '結果がここに表示されます'}
        </pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>このページはログイン機能のデバッグ用です。</p>
        <p>ブラウザのコンソールも確認してください。</p>
      </div>
    </div>
  );
}
