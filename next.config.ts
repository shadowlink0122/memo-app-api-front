import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // CI環境では静的ビルドのみ実行（動的ルートは使用しない）
  ...(process.env.CI === 'true' && {
    // output: 'export' は動的ルートがある場合は使用できないため、
    // CI環境では通常のビルドを実行
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
