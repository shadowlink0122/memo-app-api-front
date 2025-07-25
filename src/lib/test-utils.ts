// E2Eテスト用のテストユーザー作成とログイン
export const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123',
};

export const isTestEnvironment = () => {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    (typeof window !== 'undefined' &&
      window.location.search.includes('test=true'))
  );
};

export const mockAuthForTests = () => {
  if (typeof window !== 'undefined' && isTestEnvironment()) {
    // テスト環境でのモックユーザーを設定
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    localStorage.setItem('auth_token', 'mock-test-token');
    localStorage.setItem('user_info', JSON.stringify(mockUser));

    console.log('テスト認証を設定しました:', mockUser);

    return mockUser;
  }
  return null;
};

// テスト環境の初期化（ページロード時に自動実行）
if (typeof window !== 'undefined' && isTestEnvironment()) {
  console.log('テスト環境を検出しました');
  window.addEventListener('DOMContentLoaded', () => {
    mockAuthForTests();
  });
}
