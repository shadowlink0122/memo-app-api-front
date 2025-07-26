import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoForm from '../MemoForm';
import '@testing-library/jest-dom';

// 実際のAPIを使用するため、Mockは削除

describe('MemoForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('新規作成モードで正しくレンダリングされる', () => {
    render(<MemoForm onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText('新しいメモ')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('メモのタイトルを入力')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('メモの内容を入力')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /作成/ })).toBeInTheDocument();
  });

  it('編集モードで初期値が設定される', () => {
    const editMemo = {
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

    render(
      <MemoForm memo={editMemo} onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(screen.getByText('メモを編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テストタイトル')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト内容')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tag1, tag2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /更新/ })).toBeInTheDocument();
  });

  it('フォーム送信時にバリデーションが動作する', async () => {
    const user = userEvent.setup();

    render(<MemoForm onClose={mockOnClose} onSave={mockOnSave} />);

    // 空のフォームで送信を試行
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
      expect(screen.getByText('内容は必須です')).toBeInTheDocument();
    });

    // onSaveが呼ばれていないことを確認（バリデーションエラーのため）
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('有効なデータで送信が成功する', async () => {
    const user = userEvent.setup();

    render(<MemoForm onClose={mockOnClose} onSave={mockOnSave} />);

    // フォームに入力
    await user.type(
      screen.getByPlaceholderText('メモのタイトルを入力'),
      'テストタイトル'
    );
    await user.type(
      screen.getByPlaceholderText('メモの内容を入力'),
      'テスト内容'
    );

    // 送信
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);

    // 実際のAPIが呼ばれて成功した場合、onSaveが呼ばれることを確認
    // （APIの実際の動作に依存するため、タイムアウトを長めに設定）
    await waitFor(
      () => {
        expect(mockOnSave).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it('タイトルの文字数制限が動作する', async () => {
    const user = userEvent.setup();

    render(<MemoForm onClose={mockOnClose} onSave={mockOnSave} />);

    const titleInput = screen.getByPlaceholderText('メモのタイトルを入力');
    const longTitle = 'a'.repeat(101); // 100文字制限を超える

    await user.type(titleInput, longTitle);

    // 送信を試行
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('タイトルは100文字以内で入力してください')
      ).toBeInTheDocument();
    });

    // バリデーションエラーによりonSaveが呼ばれないことを確認
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
