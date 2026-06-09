import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashCell } from '@/components/grid/FlashCell';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

describe('FlashCell', () => {
  it('renders value', () => {
    render(<FlashCell symbol="TEST" field="price" value="$100.00" />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders fallback on error', () => {
    const Thrower = () => { throw new Error('Test error'); };
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
