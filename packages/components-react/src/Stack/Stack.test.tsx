import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as a <div> element', () => {
    const { container } = render(<Stack />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-stack class', () => {
    const { container } = render(<Stack />);
    expect(container.firstChild).toHaveClass('dsn-stack');
  });

  it('does not add space modifier class for default (md)', () => {
    const { container } = render(<Stack />);
    expect(container.firstChild).not.toHaveClass('dsn-stack--space-md');
  });

  it('does not add space modifier class for explicit md', () => {
    const { container } = render(<Stack space="md" />);
    expect(container.firstChild).not.toHaveClass('dsn-stack--space-md');
  });

  it.each(['sm', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const)(
    'applies space modifier class for %s',
    (space) => {
      const { container } = render(<Stack space={space} />);
      expect(container.firstChild).toHaveClass(`dsn-stack--space-${space}`);
    }
  );

  it('applies custom className', () => {
    const { container } = render(<Stack className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-stack');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the div element', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Stack ref={ref} />);
    expect(ref.current).toBe(container.firstChild);
  });

  it('passes additional HTML attributes', () => {
    const { container } = render(<Stack data-testid="stack" role="list" />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'stack');
    expect(container.firstChild).toHaveAttribute('role', 'list');
  });
});
