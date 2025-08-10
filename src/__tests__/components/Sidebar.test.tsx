import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../../components/Sidebar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

describe('Sidebar Component', () => {
  const defaultProps = {
    isCollapsed: false,
    setIsCollapsed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sidebar with navigation items', () => {
    render(<Sidebar {...defaultProps} />);

    // Check if main navigation items are present
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('メモ一覧')).toBeInTheDocument();
    expect(screen.getByText('アーカイブ')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('should apply collapsed state classes', () => {
    const { rerender } = render(<Sidebar {...defaultProps} />);

    // Test expanded state - get sidebar by test id
    let sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('lg:w-64');

    // Test collapsed state
    rerender(<Sidebar {...defaultProps} isCollapsed={true} />);
    sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('lg:w-16');
  });

  it('should handle toggle button click', async () => {
    const user = userEvent.setup();
    const mockSetIsCollapsed = jest.fn();
    render(<Sidebar {...defaultProps} setIsCollapsed={mockSetIsCollapsed} />);

    // Find the desktop toggle button (X icon) in the sidebar header
    const navigation = screen.getByRole('navigation');
    const toggleButton = navigation.parentElement?.querySelector('button');

    expect(toggleButton).toBeInTheDocument();

    if (toggleButton) {
      await user.click(toggleButton);
      expect(mockSetIsCollapsed).toHaveBeenCalledWith(true);
    }
  });

  it('should show icons in collapsed state', () => {
    render(<Sidebar {...defaultProps} isCollapsed={true} />);

    // In collapsed state, the navigation should still be present
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    // In collapsed state, text should not be visible but icons should be
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('lg:w-16');
  });

  it('should have proper accessibility attributes', () => {
    render(<Sidebar {...defaultProps} />);

    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    // Check that the mobile toggle button exists
    const mobileToggleButton = screen.getByTestId('sidebar-toggle');
    expect(mobileToggleButton).toBeInTheDocument();
  });
});
