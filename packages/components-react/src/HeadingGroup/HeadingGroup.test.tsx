import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadingGroup } from './HeadingGroup';

describe('HeadingGroup', () => {
  it('renders children', () => {
    render(<HeadingGroup>Uw gegevens</HeadingGroup>);
    expect(screen.getByText('Uw gegevens')).toBeInTheDocument();
  });

  it('defaults to h2 element', () => {
    render(<HeadingGroup>Title</HeadingGroup>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders correct heading level', () => {
    render(<HeadingGroup level={1}>H1</HeadingGroup>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('has dsn-heading and dsn-heading-group classes', () => {
    render(<HeadingGroup>Label</HeadingGroup>);
    const el = screen.getByRole('heading');
    expect(el).toHaveClass('dsn-heading');
    expect(el).toHaveClass('dsn-heading-group');
  });

  it('defaults appearance to match level', () => {
    render(<HeadingGroup level={3}>Match</HeadingGroup>);
    expect(screen.getByRole('heading')).toHaveClass('dsn-heading--heading-3');
  });

  it('allows appearance independent of level', () => {
    render(
      <HeadingGroup level={2} appearance="heading-4">
        Mixed
      </HeadingGroup>
    );
    const el = screen.getByRole('heading', { level: 2 });
    expect(el).toHaveClass('dsn-heading--heading-4');
  });

  it('renders preHeading wrapped in dsn-pre-heading span', () => {
    const { container } = render(
      <HeadingGroup preHeading="Stap 2">Uw gegevens</HeadingGroup>
    );
    const preHeadingSpan = container.querySelector('.dsn-pre-heading');
    expect(preHeadingSpan).toBeInTheDocument();
    expect(preHeadingSpan).toHaveTextContent('Stap 2');
  });

  it('does not render dsn-pre-heading span when preHeading is not provided', () => {
    const { container } = render(<HeadingGroup>Heading</HeadingGroup>);
    expect(container.querySelector('.dsn-pre-heading')).not.toBeInTheDocument();
  });

  it('renders ReactNode preHeading', () => {
    const { container } = render(
      <HeadingGroup
        preHeading={
          <>
            Stap 2<span className="dsn-visually-hidden">:</span>
          </>
        }
      >
        Uw gegevens
      </HeadingGroup>
    );
    const preHeadingSpan = container.querySelector('.dsn-pre-heading');
    expect(preHeadingSpan).toBeInTheDocument();
    expect(preHeadingSpan).toHaveTextContent('Stap 2');
  });

  it('applies custom className', () => {
    render(<HeadingGroup className="custom">Label</HeadingGroup>);
    const el = screen.getByRole('heading');
    expect(el).toHaveClass('dsn-heading');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLHeadingElement | null };
    render(<HeadingGroup ref={ref}>Label</HeadingGroup>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });

  it('spreads additional HTML attributes', () => {
    render(<HeadingGroup data-testid="hgroup">Label</HeadingGroup>);
    expect(screen.getByTestId('hgroup')).toBeInTheDocument();
  });
});
