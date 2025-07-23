// APIレスポンステスト用
const testApiResponse = {
  data: {
    user: {
      id: 28,
      username: 'testuser2',
      email: 'test2@example.com',
      is_active: true,
      created_at: '2025-07-24T04:17:13.148641Z',
    },
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    expires_in: 86400,
  },
  message: 'Login successful',
};

console.log('Test API Response:', testApiResponse);
