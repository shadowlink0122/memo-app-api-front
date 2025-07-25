import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoCard from '../MemoCard';

describe('MemoCard', () => {
  const mockMemo = {
    id: 1,
    title: 'テストタイトル',
    content: 'テスト内容',
    category: 'テスト',
    tags: ['tag1', 'tag2'],
    priority: 'medium' as const,
    status: 'active' as const,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    completed_at: null,
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('メモカードが正しくレンダリングされる', () => {
    render(
      <MemoCard memo={mockMemo} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    expect(screen.getByText('テスト内容')).toBeInTheDocument();
    expect(screen.getByText('テスト')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });
});
