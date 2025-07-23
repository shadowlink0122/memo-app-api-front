'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  initialMode?: AuthMode;
  redirectTo?: string;
}

const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  redirectTo = '/',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const router = useRouter();

  const handleSuccess = () => {
    router.push(redirectTo);
  };

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">📝</h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">メモアプリ</h2>
          <p className="mt-2 text-sm text-gray-600">
            あなたのアイデアを整理しましょう
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={handleSwitchToRegister}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2025 メモアプリ. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
