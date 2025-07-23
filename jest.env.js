// テスト環境用の環境変数設定
// 認証を無効にして、モックデータを使用
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
process.env.NEXT_PUBLIC_API_TOKEN = 'test-api-token';
process.env.NEXT_PUBLIC_DISABLE_AUTH = 'true'; // テスト時はモックデータを使用
