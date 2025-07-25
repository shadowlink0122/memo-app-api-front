import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoForm from '../MemoForm';

describe('MemoForm - 基本テスト', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  it('コンポーネントが正しくレンダリングされる', () => {
    render(<MemoForm onClose={mockOnClose} onSave={mockOnSave} />);

    // 基本的な要素が存在することを確認
    expect(screen.getByText('新しいメモ')).toBeInTheDocument();
  });
});
