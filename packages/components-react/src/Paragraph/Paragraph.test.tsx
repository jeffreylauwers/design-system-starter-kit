import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Paragraph } from './Paragraph';

describe('Paragraph', () => {
  it('renders children', () => {
    render(<Paragraph>Hello world</Paragraph>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as a <p> element', () => {
    render(<Paragraph>Text</Paragraph>);
    expect(screen.getByText('Text').tagName).toBe('P');
  });

  it('defaults to default variant — no modifier class added', () => {
    render(<Paragraph>Default</Paragraph>);
    const el = screen.getByText('Default');
    expect(el).toHaveClass('dsn-paragraph');
    expect(el).not.toHaveClass('dsn-paragraph--default');
  });

  it('applies lead variant class', () => {
    render(<Paragraph variant="lead">Lead text</Paragraph>);
    expect(screen.getByText('Lead text')).toHaveClass('dsn-paragraph--lead');
  });

  it('applies small-print variant class', () => {
    render(<Paragraph variant="small-print">Small print</Paragraph>);
    expect(screen.getByText('Small print')).toHaveClass(
      'dsn-paragraph--small-print'
    );
  });

  it('always has base dsn-paragraph class', () => {
    render(<Paragraph>Base</Paragraph>);
    expect(screen.getByText('Base')).toHaveClass('dsn-paragraph');
  });

  it('applies custom className', () => {
    render(<Paragraph className="custom">Custom</Paragraph>);
    const el = screen.getByText('Custom');
    expect(el).toHaveClass('dsn-paragraph');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<Paragraph ref={ref}>Ref</Paragraph>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Paragraph id="intro" data-testid="paragraph">
        Content
      </Paragraph>
    );
    const el = screen.getByTestId('paragraph');
    expect(el).toHaveAttribute('id', 'intro');
  });
});
