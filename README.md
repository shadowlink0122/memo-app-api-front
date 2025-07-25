# メモアプリ フロントエンド

React + Next.js で構築されたメモアプリケーションのフロントエンドです。API サーバーと連携してメモの作成、編集、削除、検索機能を提供します。

## 特徴

- ✨ **モダンなUI**: Tailwind CSS を使用した美しく直感的なインターフェース
- 🔍 **高度な検索**: 全文検索、カテゴリ、タグ、優先度、ステータスでのフィルタリング
- 📝 **リアルタイム編集**: インラインでのメモ編集機能
- 🎯 **優先度管理**: 低・中・高の3段階の優先度設定
- 🏷️ **タグ機能**: 複数のタグによるメモの分類
- 📱 **レスポンシブデザイン**: モバイルからデスクトップまで対応
- ✅ **型安全性**: TypeScript + Zod による厳密な型チェック

## 技術スタック

- **フロントエンド**: React 19, Next.js 15
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **バリデーション**: Zod
- **フォーム管理**: React Hook Form
- **HTTP クライアント**: Axios
- **アイコン**: Lucide React

## 必要な環境

- Node.js 18.x 以上
- npm または yarn
- メモアプリ API サーバー（localhost:8000 で動作）

## セットアップ

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd memo-app-api-front
```

2. **依存関係のインストール**

```bash
npm install
```

3. **環境変数の設定**
   `.env.local` ファイルを作成し、以下を設定：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **開発サーバーの起動**

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## API 仕様

このフロントエンドは以下の API エンドポイントを使用します：

- `GET /api/memos` - メモ一覧取得
- `GET /api/memos/:id` - メモ詳細取得
- `POST /api/memos` - メモ作成
- `PUT /api/memos/:id` - メモ更新
- `DELETE /api/memos/:id` - メモ削除
- `GET /api/memos/search` - メモ検索

詳細な API 仕様は、API サーバーの Swagger ドキュメントを参照してください。

## 機能詳細

### メモ管理

- メモの作成、編集、削除
- タイトル、内容、カテゴリ、タグ、優先度、ステータスの管理
- リアルタイムでの変更反映

### 検索・フィルタリング

- 全文検索（タイトル・内容）
- カテゴリでの絞り込み
- タグでの絞り込み
- 優先度でのフィルタリング
- ステータス（アクティブ・アーカイブ）でのフィルタリング

### ページネーション

- 大量のメモを効率的に表示
- ページサイズの調整可能
- 直感的なページナビゲーション

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルCSS
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── MemoCard.tsx       # メモカード
│   ├── MemoForm.tsx       # メモ作成・編集フォーム
│   ├── MemoList.tsx       # メモ一覧
│   ├── Pagination.tsx     # ページネーション
│   └── SearchFilters.tsx  # 検索・フィルター
├── lib/                   # ユーティリティ・設定
│   ├── api.ts            # API クライアント
│   ├── schemas.ts        # Zod スキーマ定義
│   └── utils.ts          # ヘルパー関数
└── types/                # 型定義
```

## 開発

### コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lintチェック
npm run lint

# Lint自動修正
npm run lint:fix

# 型チェック
npm run type-check

# フォーマット（全体）
npm run format

# フォーマットチェック
npm run format:check

# Huskyの準備
npm run prepare

# pre-commitフック（自動実行）
npm run pre-commit
```

### 品質管理

このプロジェクトでは以下のツールを使用してコード品質を保証しています：

#### Pre-commit Hooks

- **Husky**: Git hooksの管理
- **lint-staged**: ステージされたファイルのみをlint
- **ESLint**: JavaScriptとTypeScriptのコード品質チェック
- **Prettier**: コードフォーマット統一
- **commitlint**: コミットメッセージの形式チェック

#### コミットメッセージルール

```
type(scope): description

例:
feat: add new memo editing feature
fix: resolve API connection issue
docs: update README documentation
style: format code with prettier
refactor: improve memo filtering logic
test: add unit tests for memo service
chore: update dependencies
```

#### CI/CD

GitHub Actionsで以下を自動実行：

- ESLintチェック
- TypeScript型チェック
- Prettierフォーマットチェック
- ビルドテスト
- コミットメッセージvalidation

### コーディング規約

- TypeScript strict モードを使用
- ESLint + Prettier でコードフォーマット
- Zod による実行時型チェック
- コンポーネントは関数コンポーネントで記述
- App Router（Next.js 13+）を使用
- Server Componentsを積極的に活用
- Client Componentsは必要な場合のみ使用

## トラブルシューティング

### よくある問題

1. **API サーバーに接続できない**
   - API サーバーが localhost:8000 で起動していることを確認
   - `.env.local` の `NEXT_PUBLIC_API_URL` が正しく設定されていることを確認

2. **CI環境でのビルドエラー**
   - CI環境では自動的にモックAPIが使用されます
   - `CI=true` 環境変数により、実際のAPIサーバーなしでビルド可能
   - モックデータにより基本的な動作確認が可能

3. **スタイルが適用されない**
   - `npm run dev` でサーバーを再起動
   - ブラウザのキャッシュをクリア

4. **TypeScript エラー**
   - `npm install` で依存関係を再インストール
   - `npm run type-check` で型エラーを確認

### CI/CD環境

本プロジェクトは以下のCI/CD機能を提供します：

#### GitHub Actions

- **自動lint**: ESLint、Prettier、TypeScriptの型チェック
- **自動ビルド**: モックAPIを使用したCI環境でのビルドテスト
- **複数Node.js バージョン**: 18.x、20.x での動作確認
- **コミットメッセージ検証**: conventional commits形式の強制

#### モックAPI機能

CI環境（`CI=true`）では以下の機能が利用可能：

- サンプルメモデータによる動作確認
- 実際のAPIサーバーなしでのビルド・テスト
- CRUD操作のシミュレーション

### 開発とCI環境の違い

| 項目        | 開発環境               | CI環境             |
| ----------- | ---------------------- | ------------------ |
| APIサーバー | 必要（localhost:8000） | 不要（モック使用） |
| データ      | 実際のAPIデータ        | サンプルデータ     |
| ビルド      | 通常ビルド             | 静的ビルド         |
| 画像最適化  | 有効                   | 無効               |

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の報告をお待ちしています。
