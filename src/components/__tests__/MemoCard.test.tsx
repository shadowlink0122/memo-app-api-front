import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoCard from '../MemoCard';

describe('MemoCard', () => {
  const mockMemo = {
    id: 1,
    title: 'テストタイトル',
    content: 'テスト内容',
    category: 'テスト',
    user_id: 1,
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
    // コンソールログをモック
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('削除ボタンをクリックするとonDeleteが呼ばれる', () => {
    render(
      <MemoCard memo={mockMemo} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByTestId('memo-delete-button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('削除ボタンクリック時にログが出力される', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <MemoCard memo={mockMemo} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByTestId('memo-delete-button');
    fireEvent.click(deleteButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Delete button clicked for memo:',
      1
    );
  });

  it('アーカイブされたメモでは完全削除ボタンが表示される', () => {
    const archivedMemo = { ...mockMemo, status: 'archived' as const };
    render(
      <MemoCard
        memo={archivedMemo}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('memo-delete-button');
    expect(deleteButton).toHaveAttribute('title', '完全削除');
  });

  it('アクティブなメモではアーカイブボタンが表示される', () => {
    render(
      <MemoCard memo={mockMemo} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByTestId('memo-delete-button');
    expect(deleteButton).toHaveAttribute('title', 'アーカイブ');
  });
});
