import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DotBadge } from './DotBadge';

describe('DotBadge', () => {
  it('renders as a <span> element', () => {
    const { container } = render(<DotBadge />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('always has base dsn-dot-badge class', () => {
    const { container } = render(<DotBadge />);
    expect(container.firstChild).toHaveClass('dsn-dot-badge');
  });

  it('always has aria-hidden="true"', () => {
    const { container } = render(<DotBadge />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies negative variant class by default', () => {
    const { container } = render(<DotBadge />);
    expect(container.firstChild).toHaveClass('dsn-dot-badge--negative');
  });

  it.each(['positive', 'negative', 'warning', 'info', 'neutral'] as const)(
    'applies variant modifier class for %s variant',
    (variant) => {
      const { container } = render(<DotBadge variant={variant} />);
      expect(container.firstChild).toHaveClass(`dsn-dot-badge--${variant}`);
    }
  );

  it('does not apply pulse class when pulse is false (default)', () => {
    const { container } = render(<DotBadge />);
    expect(container.firstChild).not.toHaveClass('dsn-dot-badge--pulse');
  });

  it('applies pulse class when pulse is true', () => {
    const { container } = render(<DotBadge pulse />);
    expect(container.firstChild).toHaveClass('dsn-dot-badge--pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<DotBadge className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-dot-badge');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<DotBadge ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional HTML attributes', () => {
    const { container } = render(<DotBadge data-testid="dot" />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'dot');
  });
});
