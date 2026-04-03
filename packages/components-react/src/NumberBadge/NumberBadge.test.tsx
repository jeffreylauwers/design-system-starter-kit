import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NumberBadge } from './NumberBadge';

describe('NumberBadge', () => {
  it('renders as a <span> element', () => {
    const { container } = render(<NumberBadge>5</NumberBadge>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('always has base dsn-number-badge class', () => {
    const { container } = render(<NumberBadge>5</NumberBadge>);
    expect(container.firstChild).toHaveClass('dsn-number-badge');
  });

  it('always has aria-hidden="true"', () => {
    const { container } = render(<NumberBadge>5</NumberBadge>);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies negative variant class by default', () => {
    const { container } = render(<NumberBadge>5</NumberBadge>);
    expect(container.firstChild).toHaveClass('dsn-number-badge--negative');
  });

  it.each(['positive', 'negative', 'warning', 'info', 'neutral'] as const)(
    'applies variant modifier class for %s variant',
    (variant) => {
      const { container } = render(
        <NumberBadge variant={variant}>5</NumberBadge>
      );
      expect(container.firstChild).toHaveClass(`dsn-number-badge--${variant}`);
    }
  );

  it('renders children as display value', () => {
    const { getByText } = render(<NumberBadge>42</NumberBadge>);
    expect(getByText('42')).toBeTruthy();
  });

  it('renders string children unchanged', () => {
    const { getByText } = render(<NumberBadge>99+</NumberBadge>);
    expect(getByText('99+')).toBeTruthy();
  });

  it('shows maxCount+ when children number exceeds maxCount', () => {
    const { getByText } = render(<NumberBadge maxCount={99}>128</NumberBadge>);
    expect(getByText('99+')).toBeTruthy();
  });

  it('shows actual count when children number equals maxCount', () => {
    const { getByText } = render(<NumberBadge maxCount={99}>99</NumberBadge>);
    expect(getByText('99')).toBeTruthy();
  });

  it('shows actual count when children number is below maxCount', () => {
    const { getByText } = render(<NumberBadge maxCount={99}>5</NumberBadge>);
    expect(getByText('5')).toBeTruthy();
  });

  it('does not apply maxCount truncation to non-numeric string children', () => {
    const { getByText } = render(<NumberBadge maxCount={99}>99+</NumberBadge>);
    expect(getByText('99+')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(
      <NumberBadge className="custom">5</NumberBadge>
    );
    expect(container.firstChild).toHaveClass('dsn-number-badge');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<NumberBadge ref={ref}>5</NumberBadge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional HTML attributes', () => {
    const { container } = render(
      <NumberBadge data-testid="badge">5</NumberBadge>
    );
    expect(container.firstChild).toHaveAttribute('data-testid', 'badge');
  });
});
