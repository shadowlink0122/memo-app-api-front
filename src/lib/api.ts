import axios from 'axios';
import {
  CreateMemoRequest,
  UpdateMemoRequest,
  Memo,
  MemoListResponse,
  SearchParams,
  memoSchema,
  memoListSchema,
  errorResponseSchema,
} from './schemas';
import { tokenManager } from './auth-api';

// 認証ヘッダーの設定
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 認証トークンがある場合は追加
  const token = tokenManager.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// APIクライアントの設定
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

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

// APIエラーの処理
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

// レスポンスインターセプター
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const errorData = errorResponseSchema.safeParse(error.response.data);
      if (errorData.success) {
        throw new ApiError(
          error.response.status,
          errorData.data.error,
          errorData.data.message || errorData.data.error
        );
      }
    }
    throw error;
  }
);

// 開発用モックデータ管理システム
class MockDataManager {
  private memos: Memo[] = [
    {
      id: 1,
      title: '開発用サンプルメモ1',
      content:
        'これは開発用のサンプルデータです。認証エラーのため、モックデータを表示しています。',
      category: '開発',
      tags: ['サンプル', '開発'],
      priority: 'medium' as const,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    },
    {
      id: 2,
      title: '開発用サンプルメモ2',
      content:
        'APIサーバーの認証設定を確認し、適切なトークンを設定してください。',
      category: '設定',
      tags: ['認証', 'API'],
      priority: 'high' as const,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    },
    {
      id: 3,
      title: 'アーカイブされたメモサンプル',
      content:
        'これはアーカイブされたメモのサンプルです。完了したタスクや不要になった情報を保存しています。',
      category: 'アーカイブ',
      tags: ['完了', 'サンプル'],
      priority: 'low' as const,
      status: 'archived' as const,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間前
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 4,
      title:
        'RustのOwnershipとBorrowingの概念について詳しく学ぶための長いタイトルのサンプルメモです',
      content:
        'Rustプログラミング言語のメモリ安全性を支える重要な概念について詳しく学習します。',
      category: 'プログラミング',
      tags: ['Rust', '学習', 'Ownership', 'Borrowing'],
      priority: 'high' as const,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    },
  ];

  private nextId = 5;

  getAllMemos(): Memo[] {
    // 全てのメモを最新順でソートして返す
    return [...this.memos].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // アクティブなメモのみを取得
  getActiveMemos(): Memo[] {
    return [...this.memos]
      .filter(memo => memo.status === 'active')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  getArchivedMemos(): Memo[] {
    // statusがarchivedのメモのみを返す
    return [...this.memos]
      .filter(memo => memo.status === 'archived')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  getMemoById(id: number): Memo | undefined {
    return this.memos.find(memo => memo.id === id);
  }

  createMemo(data: CreateMemoRequest): Memo {
    const newMemo: Memo = {
      id: this.nextId++,
      title: data.title,
      content: data.content,
      category: data.category || '',
      tags: data.tags || [],
      priority: data.priority || 'medium',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };
    this.memos.unshift(newMemo); // 新しいメモを先頭に追加
    return newMemo;
  }

  updateMemo(id: number, data: UpdateMemoRequest): Memo | null {
    const memoIndex = this.memos.findIndex(memo => memo.id === id);
    if (memoIndex === -1) return null;

    const updatedMemo: Memo = {
      ...this.memos[memoIndex],
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      updated_at: new Date().toISOString(),
    };

    this.memos[memoIndex] = updatedMemo;
    return updatedMemo;
  }

  // メモの段階的削除（アーカイブ）
  softDeleteMemo(id: number): Memo | null {
    const memoIndex = this.memos.findIndex(memo => memo.id === id);
    if (memoIndex === -1) return null;

    const memo = this.memos[memoIndex];
    const updatedMemo: Memo = {
      ...memo,
      status: 'archived',
      updated_at: new Date().toISOString(),
    };

    this.memos[memoIndex] = updatedMemo;
    return updatedMemo;
  }

  // メモの完全削除
  deleteMemo(id: number): boolean {
    const memoIndex = this.memos.findIndex(memo => memo.id === id);
    if (memoIndex === -1) return false;

    this.memos.splice(memoIndex, 1);
    return true;
  }

  searchMemos(params: Partial<SearchParams>): Memo[] {
    let filteredMemos = this.getAllMemos();

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredMemos = filteredMemos.filter(
        memo =>
          memo.title.toLowerCase().includes(searchTerm) ||
          memo.content.toLowerCase().includes(searchTerm) ||
          memo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (params.category) {
      filteredMemos = filteredMemos.filter(
        memo => memo.category === params.category
      );
    }

    if (params.status) {
      filteredMemos = filteredMemos.filter(
        memo => memo.status === params.status
      );
    }

    if (params.priority) {
      filteredMemos = filteredMemos.filter(
        memo => memo.priority === params.priority
      );
    }

    // 作成日時の降順（最新順）でソート
    return filteredMemos.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

// グローバルなモックデータマネージャーのインスタンス
const mockDataManager = new MockDataManager();

// API関数の定義
export const memoApi = {
  // メモ一覧取得
  async getMemos(
    params: Partial<SearchParams> = {}
  ): Promise<MemoListResponse> {
    // CI環境またはテストモードでのみモックデータを使用
    const isTestMode =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      (typeof window !== 'undefined' &&
        window.location.search.includes('test=true'));

    if (isTestMode) {
      console.log('テストモード: モックデータを返します', params);
      console.log('mockDataManagerの全メモ:', mockDataManager.getAllMemos());

      // statusパラメータに応じてメモを取得
      let memos: Memo[];
      if (params.status === 'archived') {
        memos = mockDataManager.getArchivedMemos();
        console.log('アーカイブメモを取得:', memos);
      } else if (params.status === 'active') {
        memos = mockDataManager.getActiveMemos();
        console.log('アクティブメモを取得:', memos);
      } else {
        // statusが指定されていない場合は全てのメモを取得（アクティブ＋アーカイブ）
        memos = mockDataManager.getAllMemos();
        console.log('全メモを取得:', memos);
      }

      // 最新のメモから30件を取得
      const limitedMemos = memos.slice(0, 30);
      console.log('返却するメモ:', limitedMemos);
      return {
        memos: limitedMemos,
        total: memos.length,
        page: 1,
        limit: 30,
        total_pages: Math.ceil(memos.length / 30),
      };
    }

    try {
      // デフォルトのlimitを30に設定
      const queryParams = {
        limit: 30,
        ...params,
      };
      const response = await apiClient.get('/api/memos', {
        params: queryParams,
      });
      const result = memoListSchema.parse(response.data);
      return result;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error.message
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモ詳細取得
  async getMemo(id: number): Promise<Memo> {
    try {
      const response = await apiClient.get(`/api/memos/${id}`);
      const result = memoSchema.parse(response.data);
      return result;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error.message
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモ作成
  async createMemo(data: CreateMemoRequest): Promise<Memo> {
    // CI環境またはテストモードでのみモックデータを使用
    const isTestMode =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      (typeof window !== 'undefined' &&
        window.location.search.includes('test=true'));

    if (isTestMode) {
      console.log('テストモード: モックデータでメモを作成します', data);
      const newMemo = mockDataManager.createMemo(data);
      return newMemo;
    }

    try {
      const response = await apiClient.post('/api/memos', data);
      const result = memoSchema.parse(response.data);
      return result;
    } catch (error) {
      // 認証エラーのチェックを改善
      let isAuthError = false;
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        isAuthError = true;
      } else if (
        (error as { response?: { status?: number } })?.response?.status ===
          401 ||
        (error as { response?: { status?: number } })?.response?.status === 403
      ) {
        isAuthError = true;
      } else if (
        (error as { message?: string })?.message?.includes(
          'Authorization header required'
        )
      ) {
        isAuthError = true;
      } else if (
        (error as { message?: string })?.message?.includes('Invalid token')
      ) {
        isAuthError = true;
      }

      if (isAuthError) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります'
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモ更新
  async updateMemo(id: number, data: UpdateMemoRequest): Promise<Memo> {
    try {
      const response = await apiClient.put(`/api/memos/${id}`, data);
      const result = memoSchema.parse(response.data);
      return result;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error.message
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモ削除（段階的削除 = アーカイブ）
  async deleteMemo(id: number): Promise<Memo> {
    // CI環境またはテストモードでのみモックデータを使用
    const isTestMode =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      (typeof window !== 'undefined' &&
        window.location.search.includes('test=true'));

    if (isTestMode) {
      console.log('テストモード: モックデータでアーカイブします', id);
      const archivedMemo = mockDataManager.softDeleteMemo(id);
      if (!archivedMemo) {
        throw new Error(`メモ（ID: ${id}）が見つかりません`);
      }
      return archivedMemo;
    }

    try {
      // まず既存のメモデータを取得
      const existingMemo = await this.getMemo(id);

      // statusをarchivedに変更してPUTで更新
      const updateData = {
        title: existingMemo.title,
        content: existingMemo.content,
        category: existingMemo.category,
        tags: existingMemo.tags,
        priority: existingMemo.priority,
        status: 'archived' as const,
      };

      console.log(`メモ${id}をアーカイブしています...`);
      const response = await apiClient.put(`/api/memos/${id}`, updateData);
      const result = memoSchema.parse(response.data);
      console.log(`メモ${id}のアーカイブが完了しました`);
      return result;
    } catch (error) {
      console.error('アーカイブ処理でエラーが発生:', error);

      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error.message
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモ完全削除（アーカイブから削除）
  async permanentlyDeleteMemo(id: number): Promise<void> {
    // CI環境またはテストモードでのみモックデータを使用
    const isTestMode =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      (typeof window !== 'undefined' &&
        window.location.search.includes('test=true'));

    if (isTestMode) {
      console.log('テストモード: モックデータから完全削除します', id);
      const success = mockDataManager.deleteMemo(id);
      if (!success) {
        throw new Error(`メモ（ID: ${id}）が見つかりません`);
      }
      return;
    }

    try {
      await apiClient.delete(`/api/memos/${id}`);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error.message
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモアーカイブ
  async archiveMemo(id: number): Promise<Memo> {
    console.log('アーカイブ開始:', { id, type: typeof id });
    try {
      const response = await apiClient.patch(`/api/memos/${id}/archive`);
      const result = memoSchema.parse(response.data);
      return result;
    } catch (error) {
      // APIエンドポイントが存在しない場合は、モックデータでアーカイブ
      console.warn(
        'アーカイブAPIが利用できないため、開発用モックデータでアーカイブします:',
        error instanceof Error ? error.message : error
      );
      console.log('モックデータでアーカイブ処理:', {
        id,
        availableMemos: mockDataManager.getAllMemos().map(m => m.id),
      });
      const archivedMemo = mockDataManager.updateMemo(id, {
        status: 'archived',
      });
      console.log('アーカイブ結果:', archivedMemo);
      if (!archivedMemo) {
        throw new Error(`メモ（ID: ${id}）が見つかりません`);
      }
      return archivedMemo;
    }
  },

  // メモ復元
  async restoreMemo(id: number): Promise<Memo> {
    // CI環境またはテストモードでのみモックデータを使用
    const isTestMode =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      (typeof window !== 'undefined' &&
        window.location.search.includes('test=true'));

    if (isTestMode) {
      console.log('テストモード: モックデータでメモを復元します', id);
      const restoredMemo = mockDataManager.updateMemo(id, { status: 'active' });
      if (!restoredMemo) {
        throw new Error(`メモ（ID: ${id}）が見つかりません`);
      }
      return restoredMemo;
    }

    try {
      // まず既存のメモデータを取得
      const existingMemo = await this.getMemo(id);

      // statusをactiveに変更してPUTで更新
      const updateData = {
        title: existingMemo.title,
        content: existingMemo.content,
        category: existingMemo.category,
        tags: existingMemo.tags,
        priority: existingMemo.priority,
        status: 'active' as const,
      };

      console.log(`メモ${id}を復元しています...`);
      const response = await apiClient.put(`/api/memos/${id}`, updateData);
      const result = memoSchema.parse(response.data);
      console.log(`メモ${id}の復元が完了しました`);
      return result;
    } catch (error) {
      console.error('復元処理でエラーが発生:', error);

      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error instanceof Error ? error.message : error
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },

  // メモ検索
  async searchMemos(params: Partial<SearchParams>): Promise<MemoListResponse> {
    try {
      // デフォルトのlimitを30に設定
      const queryParams = {
        limit: 30,
        ...params,
      };
      const response = await apiClient.get('/api/memos/search', {
        params: queryParams,
      });
      const result = memoListSchema.parse(response.data);
      return result;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.warn(
          'APIアクセスに失敗しました。APIサーバーが起動していない可能性があります:',
          error.message
        );
        throw error; // ローカル環境ではエラーをそのまま投げる
      }
      throw error;
    }
  },
};

// ヘルスチェック
export const healthApi = {
  async check() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export { apiClient };
export default apiClient;
