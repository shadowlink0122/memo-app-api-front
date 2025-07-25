import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>);

    expect(
      screen.getByRole('button', { name: 'テストボタン' })
    ).toBeInTheDocument();
  });

  it('プライマリバリアントが適用される', () => {
    render(<Button variant="primary">プライマリボタン</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('セカンダリバリアントが適用される', () => {
    render(<Button variant="secondary">セカンダリボタン</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200');
  });

  it('disabled状態が正しく動作する', () => {
    render(<Button disabled>無効ボタン</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });
});
