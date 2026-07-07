import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableOfContents } from './TableOfContents';

const items = [
  { id: 'sectie-1', label: 'Sectie 1' },
  { id: 'sectie-2', label: 'Sectie 2' },
];

describe('TableOfContents', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders as a nav landmark', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders default heading text', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByText('Op deze pagina')).toBeInTheDocument();
  });

  it('renders custom heading text', () => {
    render(<TableOfContents heading="Inhoud" items={items} />);
    expect(screen.getByText('Inhoud')).toBeInTheDocument();
  });

  it('renders a link for every item with the correct href', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByRole('link', { name: 'Sectie 1' })).toHaveAttribute(
      'href',
      '#sectie-1'
    );
    expect(screen.getByRole('link', { name: 'Sectie 2' })).toHaveAttribute(
      'href',
      '#sectie-2'
    );
  });

  // ===========================
  // Heading level
  // ===========================

  it('renders heading at level 2 by default', () => {
    render(<TableOfContents items={items} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Op deze pagina' })
    ).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'renders heading at level %i when headingLevel=%i',
    (level) => {
      render(<TableOfContents headingLevel={level} items={items} />);
      expect(
        screen.getByRole('heading', { level, name: 'Op deze pagina' })
      ).toBeInTheDocument();
    }
  );

  // ===========================
  // Appearance
  // ===========================

  it('does not add the plain modifier class by default (framed)', () => {
    const { container } = render(<TableOfContents items={items} />);
    expect(container.firstChild).not.toHaveClass(
      'dsn-table-of-contents--plain'
    );
  });

  it('renders the heading as heading-3 for the framed appearance', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByRole('heading')).toHaveClass('dsn-heading--heading-3');
  });

  it('adds the plain modifier class when appearance="plain"', () => {
    const { container } = render(
      <TableOfContents appearance="plain" items={items} />
    );
    expect(container.firstChild).toHaveClass('dsn-table-of-contents--plain');
  });

  it('renders the heading as heading-5 for the plain appearance', () => {
    render(<TableOfContents appearance="plain" items={items} />);
    expect(screen.getByRole('heading')).toHaveClass('dsn-heading--heading-5');
  });

  // ===========================
  // Landmark aria-labelledby
  // ===========================

  it('labels the nav via aria-labelledby pointing at the heading', () => {
    const { container } = render(<TableOfContents items={items} />);
    const nav = container.firstChild as HTMLElement;
    const headingId = nav.getAttribute('aria-labelledby');
    expect(headingId).toBeTruthy();
    expect(document.getElementById(headingId!)).toBeInTheDocument();
  });

  it('exposes the heading text as the nav accessible name', () => {
    render(<TableOfContents heading="Inhoud" items={items} />);
    expect(
      screen.getByRole('navigation', { name: 'Inhoud' })
    ).toBeInTheDocument();
  });

  // ===========================
  // Classes + ref + HTML attributes
  // ===========================

  it('always has base dsn-table-of-contents class', () => {
    const { container } = render(<TableOfContents items={items} />);
    expect(container.firstChild).toHaveClass('dsn-table-of-contents');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TableOfContents items={items} className="custom-toc" />
    );
    expect(container.firstChild).toHaveClass('dsn-table-of-contents');
    expect(container.firstChild).toHaveClass('custom-toc');
  });

  it('forwards ref to the nav element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<TableOfContents ref={ref} items={items} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.nodeName).toBe('NAV');
  });

  it('spreads additional HTML attributes', () => {
    render(<TableOfContents items={items} id="toc-1" data-testid="my-toc" />);
    expect(screen.getByTestId('my-toc')).toHaveAttribute('id', 'toc-1');
  });
});
