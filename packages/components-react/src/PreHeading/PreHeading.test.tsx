import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreHeading } from './PreHeading';

describe('PreHeading', () => {
  it('renders children', () => {
    render(<PreHeading>Stap 2</PreHeading>);
    expect(screen.getByText('Stap 2')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<PreHeading>Label</PreHeading>);
    expect(screen.getByText('Label').tagName).toBe('SPAN');
  });

  it('has dsn-pre-heading class', () => {
    render(<PreHeading>Label</PreHeading>);
    expect(screen.getByText('Label')).toHaveClass('dsn-pre-heading');
  });

  it('applies custom className', () => {
    render(<PreHeading className="custom">Label</PreHeading>);
    const el = screen.getByText('Label');
    expect(el).toHaveClass('dsn-pre-heading');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<PreHeading ref={ref}>Label</PreHeading>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional HTML attributes', () => {
    render(<PreHeading data-testid="pre-heading">Label</PreHeading>);
    expect(screen.getByTestId('pre-heading')).toBeInTheDocument();
  });

  it('renders nested elements as children', () => {
    render(
      <PreHeading>
        Stap 2<span className="dsn-visually-hidden">:</span>
      </PreHeading>
    );
    expect(screen.getByText('Stap 2')).toBeInTheDocument();
  });
});
