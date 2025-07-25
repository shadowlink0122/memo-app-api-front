async function globalSetup() {
  // テスト用の環境変数を設定
  process.env.NEXT_PUBLIC_DISABLE_AUTH = 'true';

  console.log('Playwright Global Setup: 環境変数を設定しました');
  console.log(
    'NEXT_PUBLIC_DISABLE_AUTH:',
    process.env.NEXT_PUBLIC_DISABLE_AUTH
  );
}

export default globalSetup;
