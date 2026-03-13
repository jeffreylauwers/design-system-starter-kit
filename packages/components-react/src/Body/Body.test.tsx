import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Body } from './Body';

describe('Body', () => {
  it('renders children', () => {
    render(
      <Body>
        <p>Inhoud</p>
      </Body>
    );
    expect(screen.getByText('Inhoud')).toBeInTheDocument();
  });

  it('renders as a <div> element', () => {
    const { container } = render(<Body />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-body class', () => {
    const { container } = render(<Body />);
    expect(container.firstChild).toHaveClass('dsn-body');
  });

  it('applies custom className', () => {
    const { container } = render(<Body className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-body');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the div element', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Body ref={ref} />);
    expect(ref.current).toBe(container.firstChild);
  });

  it('passes additional HTML attributes', () => {
    const { container } = render(<Body data-testid="body" id="root" />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'body');
    expect(container.firstChild).toHaveAttribute('id', 'root');
  });
});
