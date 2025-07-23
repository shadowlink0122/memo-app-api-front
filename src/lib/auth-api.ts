import axios, { AxiosError } from 'axios';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserProfileResponse,
  GitHubAuthURLResponse,
  PublicUser,
  authResponseSchema,
  userProfileResponseSchema,
  githubAuthURLResponseSchema,
} from './auth-schemas';
import { errorResponseSchema } from './schemas';

// 認証APIクライアントの設定
const authApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000',
  withCredentials: false, // CORSの問題を避けるためfalseに設定
  timeout: 10000, // 10秒のタイムアウト
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング用のクラス
export class AuthApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

// レスポンスインターセプター
authApiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const errorData = errorResponseSchema.safeParse(error.response.data);
      if (errorData.success) {
        throw new AuthApiError(
          error.response.status,
          errorData.data.error,
          errorData.data.message || errorData.data.error
        );
      }
    }
    throw error;
  }
);

// トークン管理
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    // ローカルストレージから読み込み
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }

    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }

    // ローカルストレージから読み込み
    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refresh_token');
    }

    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenManager = new TokenManager();

// リクエストインターセプター（認証ヘッダー付与）
authApiClient.interceptors.request.use(
  config => {
    // ログインと登録の場合は認証ヘッダーを追加しない
    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/github');

    if (!isAuthEndpoint) {
      const token = tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log('AuthAPI: リクエストインターセプター:', {
      url: config.url,
      method: config.method,
      isAuthEndpoint,
      hasAuthHeader: !!config.headers.Authorization,
    });

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 認証API
export const authApi = {
  // 新規登録
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApiClient.post('/api/auth/register', data);
      const result = authResponseSchema.parse(response.data);

      // トークンを保存
      tokenManager.setTokens(
        result.data.access_token,
        result.data.refresh_token
      );

      // ユーザー情報もローカルストレージに保存（プロフィールAPI未実装対応）
      localStorage.setItem('user_info', JSON.stringify(result.data.user));

      return result;
    } catch (error) {
      throw error;
    }
  },

  // ログイン
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('AuthAPI: ログインリクエスト送信:', {
        email: data.email,
        passwordLength: data.password.length,
        apiUrl: authApiClient.defaults.baseURL,
        withCredentials: authApiClient.defaults.withCredentials,
        timeout: authApiClient.defaults.timeout,
      });

      console.log('AuthAPI: リクエスト前の設定確認:', {
        headers: authApiClient.defaults.headers,
        baseURL: authApiClient.defaults.baseURL,
      });

      let response;
      try {
        console.log('AuthAPI: axios.post実行前');
        response = await authApiClient.post('/api/auth/login', data);
        console.log('AuthAPI: axios.post実行後');
      } catch (requestError) {
        console.error('AuthAPI: axios.postでエラー発生:', requestError);
        throw requestError;
      }

      console.log('AuthAPI: ログインレスポンス受信:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataType: typeof response.data,
        dataKeys:
          response.data && typeof response.data === 'object'
            ? Object.keys(response.data)
            : 'not object',
      });

      let result;
      try {
        console.log('AuthAPI: スキーマパース開始');
        result = authResponseSchema.parse(response.data);
        console.log('AuthAPI: スキーマパース完了:', result);
      } catch (parseError) {
        console.error('AuthAPI: スキーマパースでエラー発生:', parseError);
        console.error('AuthAPI: 元データ:', response.data);
        throw parseError;
      }

      // トークンを保存
      try {
        console.log('AuthAPI: トークン保存開始');
        tokenManager.setTokens(
          result.data.access_token,
          result.data.refresh_token
        );

        // ユーザー情報もローカルストレージに保存（プロフィールAPI未実装対応）
        localStorage.setItem('user_info', JSON.stringify(result.data.user));
        console.log('AuthAPI: トークンとユーザー情報保存完了');
      } catch (storageError) {
        console.error('AuthAPI: ストレージ保存でエラー発生:', storageError);
        throw storageError;
      }

      return result;
    } catch (error) {
      console.error('AuthAPI: ログインエラー詳細:', {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : null,
        isAuthApiError: error instanceof AuthApiError,
        status: error instanceof AuthApiError ? error.status : null,
        errorCode: error instanceof AuthApiError ? error.errorCode : null,
      });

      // AxiosError の場合は追加の詳細を出力
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        console.error('AuthAPI: AxiosError詳細:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            baseURL: axiosError.config?.baseURL,
            headers: axiosError.config?.headers,
          },
        });
      }

      // ネットワークエラーの場合
      if (error && typeof error === 'object' && 'code' in error) {
        const networkError = error as { code?: string; message?: string };
        console.error('AuthAPI: ネットワークエラー詳細:', {
          code: networkError.code,
          message: networkError.message,
        });
      }

      throw error;
    }
  },

  // ログアウト
  async logout(): Promise<void> {
    try {
      // APIサーバーにログアウトリクエストを送信
      const response = await authApiClient.post('/api/auth/logout');
      console.log('ログアウトAPI成功:', response.status);
    } catch (error) {
      // ログアウトAPIが失敗してもローカルの認証情報は削除する
      console.warn(
        'ログアウトAPIの呼び出しに失敗しましたが、ローカル認証情報を削除します:',
        error
      );

      // 401エラーの場合は既にログアウト済みの可能性がある
      if (error instanceof AuthApiError && error.status === 401) {
        console.log('認証エラー: 既にログアウト済みの可能性があります');
      }
    } finally {
      // ローカルの認証情報を削除
      tokenManager.clearTokens();
      // ユーザー情報も削除
      localStorage.removeItem('user_info');
    }
  },

  // トークンリフレッシュ
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('リフレッシュトークンが見つかりません');
      }

      const response = await authApiClient.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });
      const result = authResponseSchema.parse(response.data);

      // 新しいトークンを保存
      tokenManager.setTokens(
        result.data.access_token,
        result.data.refresh_token
      );

      return result;
    } catch (error) {
      // リフレッシュに失敗した場合はログアウト
      tokenManager.clearTokens();
      throw error;
    }
  },

  // プロフィール取得
  async getProfile(): Promise<UserProfileResponse> {
    try {
      const response = await authApiClient.get('/api/profile');
      const result = userProfileResponseSchema.parse(response.data);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // GitHub認証URL取得
  async getGitHubAuthURL(): Promise<GitHubAuthURLResponse> {
    try {
      const response = await authApiClient.get('/api/auth/github/url');
      const result = githubAuthURLResponseSchema.parse(response.data);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 認証状態確認
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  // ローカルストレージからユーザー情報を取得
  getCachedUserInfo(): PublicUser | null {
    try {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('ユーザー情報の取得に失敗:', error);
      return null;
    }
  },

  // 現在のユーザー情報を取得（キャッシュあり）
  async getCurrentUser(): Promise<UserProfileResponse | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      // プロフィールAPIが実装されていない場合は、キャッシュされたユーザー情報を使用
      try {
        return await this.getProfile();
      } catch (profileError) {
        console.warn(
          'プロフィールAPI未実装のため、キャッシュされたユーザー情報を使用します',
          profileError
        );
        const cachedUser = this.getCachedUserInfo();
        if (cachedUser) {
          return { data: cachedUser };
        }
        return null;
      }
    } catch (error) {
      // 認証エラーの場合はログアウト
      if (error instanceof AuthApiError && error.status === 401) {
        await this.logout();
      }
      return null;
    }
  },
};

export default authApi;
