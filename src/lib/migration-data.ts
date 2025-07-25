// APIサーバーのマイグレーションデータを参照
// このファイルにAPIサーバーのサンプルデータをコピーしてください

export const migrationSampleData = {
  memos: [
    // ここにAPIサーバーのmigration/seedデータを貼り付け
    // 例:
    // {
    //   id: 1,
    //   title: 'プロジェクト計画書作成',
    //   content: 'Q1のプロジェクト計画書を作成する必要がある...',
    //   category: 'work',
    //   tags: ['project', 'planning', 'Q1'],
    //   priority: 'high',
    //   status: 'active',
    //   created_at: '2024-01-15T09:00:00Z',
    //   updated_at: '2024-01-15T09:00:00Z',
    //   completed_at: null,
    // }
  ],
};

// 使用方法: api.tsでimportして使用
// import { migrationSampleData } from './migration-data';
