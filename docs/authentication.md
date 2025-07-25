# 認証機能の実装

## 概要

メモアプリフロントエンドでは、APIサーバーとの通信で Bearer トークン認証を使用しています。すべてのAPI呼び出しは実際のAPIサーバーに対して行われ、Mock機能はテスト専用となっています。

## 環境変数設定

### `.env.local`（開発環境）

```bash
# APIサーバーのURL
NEXT_PUBLIC_API_URL=http://localhost:8000

# APIトークン（実際のトークンに置き換えてください）
NEXT_PUBLIC_API_TOKEN=your-actual-api-token-here

# 認証を無効にする場合（開発用）
# 実際のAPIサーバーを使用する場合はコメントアウト
# NEXT_PUBLIC_DISABLE_AUTH=true
```

### `.env.ci`（CI環境）

```bash
# CI環境用の環境変数
NEXT_PUBLIC_API_URL=http://localhost:3001
CI=true
```

## 認証ヘッダーの実装

### 1. 動的な認証ヘッダー設定

`src/lib/api.ts`では、リクエストインターセプターを使用して、毎回のAPIリクエストで動的に認証ヘッダーを設定しています：

```typescript
// 認証ヘッダーの設定
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 認証が無効でない場合のみ、認証ヘッダーを追加
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    } else {
      // デフォルトの認証ヘッダー（開発用）
      headers['Authorization'] = 'Bearer development-token';
    }
  }

  return headers;
};

// リクエストインターセプター（動的に認証ヘッダーを追加）
apiClient.interceptors.request.use(
  config => {
    // 毎回のリクエストで認証ヘッダーを設定
    const authHeaders = getAuthHeaders();
    Object.entries(authHeaders).forEach(([key, value]) => {
      config.headers.set(key, value);
    });
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
```

### 2. エラーハンドリング

APIエラーが発生した場合、適切なエラーメッセージを表示します：

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## 使用方法

### 1. 開発時（認証無効）

開発時に認証を無効にしたい場合：

```bash
# .env.localに追加
NEXT_PUBLIC_DISABLE_AUTH=true
```

この設定により、認証ヘッダーは送信されません。

### 2. 実際のAPIサーバーとの連携

実際のAPIサーバーと連携する場合：

1. `.env.local`で`NEXT_PUBLIC_DISABLE_AUTH`をコメントアウト
2. `NEXT_PUBLIC_API_TOKEN`に実際のAPIトークンを設定
3. `NEXT_PUBLIC_API_URL`に正しいAPIサーバーのURLを設定

## セキュリティ考慮事項

- APIトークンは環境変数で管理し、ソースコードに直接記述しない
- 本番環境では`NEXT_PUBLIC_DISABLE_AUTH`を`false`または未設定にする
- APIトークンの定期的な更新を推奨
- HTTPS通信を使用してトークンの盗聴を防ぐ

## 対応API一覧

以下のすべてのAPI関数で認証ヘッダーが自動的に付与されます：

- `memoApi.getMemos()` - メモ一覧取得
- `memoApi.getMemo(id)` - メモ詳細取得
- `memoApi.createMemo(data)` - メモ作成
- `memoApi.updateMemo(id, data)` - メモ更新
- `memoApi.deleteMemo(id)` - メモ削除
- `memoApi.searchMemos(params)` - メモ検索
- `healthApi.check()` - ヘルスチェック

## Mock機能について

Mock機能はテスト専用となっており、本番コードからは完全に削除されています。テストでMockが必要な場合は、テスト用のライブラリ（Jest、MSW等）を使用してください。
