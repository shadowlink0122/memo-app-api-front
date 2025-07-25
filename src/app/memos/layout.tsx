import { ReactNode } from 'react';

export default function MemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="memos-section">
      <div className="container mx-auto px-4 py-8">
        <div className="memos-content">{children}</div>
      </div>
    </div>
  );
}
