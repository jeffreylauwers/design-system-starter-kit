import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Backdrop } from './Backdrop';

describe('Backdrop', () => {
  it('renders as a <div> element', () => {
    const { container } = render(<Backdrop />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-backdrop class', () => {
    const { container } = render(<Backdrop />);
    expect(container.firstChild).toHaveClass('dsn-backdrop');
  });

  it('always has aria-hidden="true"', () => {
    const { container } = render(<Backdrop />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not apply no-blur class when blur is true (default)', () => {
    const { container } = render(<Backdrop />);
    expect(container.firstChild).not.toHaveClass('dsn-backdrop--no-blur');
  });

  it('applies no-blur class when blur is false', () => {
    const { container } = render(<Backdrop blur={false} />);
    expect(container.firstChild).toHaveClass('dsn-backdrop--no-blur');
  });

  it('applies custom className', () => {
    const { container } = render(<Backdrop className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-backdrop');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Backdrop ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional HTML attributes', () => {
    const { container } = render(<Backdrop data-testid="backdrop" />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'backdrop');
  });
});
