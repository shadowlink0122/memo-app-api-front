// 開発用のモック認証フォーム
export function MockAuthForm() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          開発モード - 認証API未実装
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          APIサーバーの認証エンドポイントが実装されていません
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    認証API未実装
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>http://localhost:8000/api/auth/register</li>
                      <li>http://localhost:8000/api/auth/login</li>
                    </ul>
                    <p className="mt-2">
                      これらのエンドポイントが404エラーを返しています。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    対応方法
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>APIサーバーに認証エンドポイントを実装</li>
                      <li>または一時的にモック認証を使用</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                // 開発用: ローカルストレージにモックトークンを設定
                localStorage.setItem(
                  'auth_token',
                  'mock-jwt-token-for-development'
                );
                localStorage.setItem(
                  'refresh_token',
                  'mock-refresh-token-for-development'
                );
                window.location.reload();
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              開発用モック認証でログイン
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
