import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Note } from './Note';

describe('Note', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders children content', () => {
    render(<Note>Aanvullende informatie.</Note>);
    expect(screen.getByText('Aanvullende informatie.')).toBeInTheDocument();
  });

  it('renders heading when provided', () => {
    render(<Note heading="Let op">Inhoud</Note>);
    expect(screen.getByText('Let op')).toBeInTheDocument();
  });

  it('renders without heading when not provided', () => {
    render(<Note>Inhoud</Note>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders without children', () => {
    render(<Note heading="Alleen heading" />);
    expect(screen.getByText('Alleen heading')).toBeInTheDocument();
    expect(
      document.querySelector('.dsn-note__content')
    ).not.toBeInTheDocument();
  });

  it('renders as a <div> element by default', () => {
    const { container } = render(<Note>Inhoud</Note>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it.each(['div', 'aside', 'nav', 'section'] as const)(
    'renders as <%s> when as="%s"',
    (tag) => {
      const { container } = render(<Note as={tag}>Inhoud</Note>);
      expect(container.firstChild?.nodeName).toBe(tag.toUpperCase());
    }
  );

  // ===========================
  // Classes
  // ===========================

  it('always has base dsn-note class', () => {
    const { container } = render(<Note>Inhoud</Note>);
    expect(container.firstChild).toHaveClass('dsn-note');
  });

  it('does not add variant modifier for neutral variant (default)', () => {
    const { container } = render(<Note>Inhoud</Note>);
    expect(container.firstChild).not.toHaveClass('dsn-note--neutral');
  });

  it('does not add variant modifier for explicit neutral variant', () => {
    const { container } = render(<Note variant="neutral">Inhoud</Note>);
    expect(container.firstChild).not.toHaveClass('dsn-note--neutral');
  });

  it.each(['info', 'positive', 'negative', 'warning'] as const)(
    'applies variant modifier class for %s variant',
    (variant) => {
      const { container } = render(<Note variant={variant}>Inhoud</Note>);
      expect(container.firstChild).toHaveClass(`dsn-note--${variant}`);
    }
  );

  it('adds dsn-note--no-heading class when no heading provided', () => {
    const { container } = render(<Note>Inhoud</Note>);
    expect(container.firstChild).toHaveClass('dsn-note--no-heading');
  });

  it('does not add dsn-note--no-heading class when heading is provided', () => {
    const { container } = render(<Note heading="Heading">Inhoud</Note>);
    expect(container.firstChild).not.toHaveClass('dsn-note--no-heading');
  });

  it('applies custom className', () => {
    const { container } = render(<Note className="custom-note">Inhoud</Note>);
    expect(container.firstChild).toHaveClass('dsn-note');
    expect(container.firstChild).toHaveClass('custom-note');
  });

  // ===========================
  // Heading
  // ===========================

  it('renders heading at level 3 by default', () => {
    render(<Note heading="Standaard heading">Inhoud</Note>);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Standaard heading' })
    ).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'renders heading at level %i when headingLevel=%i',
    (level) => {
      render(
        <Note heading="Heading" headingLevel={level}>
          Inhoud
        </Note>
      );
      expect(
        screen.getByRole('heading', { level, name: 'Heading' })
      ).toBeInTheDocument();
    }
  );

  it('applies dsn-note__heading class to heading', () => {
    render(<Note heading="Heading">Inhoud</Note>);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('dsn-note__heading');
  });

  // ===========================
  // Icon
  // ===========================

  it('renders preferred icon by default', () => {
    const { container } = render(<Note heading="Test">Inhoud</Note>);
    expect(container.querySelector('.dsn-note__icon')).toBeInTheDocument();
  });

  it('renders no icon when iconStart={null}', () => {
    const { container } = render(
      <Note heading="Test" iconStart={null}>
        Inhoud
      </Note>
    );
    expect(container.querySelector('.dsn-note__icon')).not.toBeInTheDocument();
  });

  it('renders custom icon when iconStart is a ReactNode', () => {
    render(
      <Note heading="Test" iconStart={<svg data-testid="custom-icon" />}>
        Inhoud
      </Note>
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(document.querySelector('.dsn-note__icon')).toBeInTheDocument();
  });

  // ===========================
  // Content
  // ===========================

  it('wraps children in dsn-note__content div', () => {
    render(
      <Note heading="Test">
        <p>Inhoud</p>
      </Note>
    );
    const content = document.querySelector('.dsn-note__content');
    expect(content).toBeInTheDocument();
    expect(content?.querySelector('p')).toBeInTheDocument();
  });

  it('does not render dsn-note__content when no children', () => {
    render(<Note heading="Test" />);
    expect(
      document.querySelector('.dsn-note__content')
    ).not.toBeInTheDocument();
  });

  // ===========================
  // Landmark aria-labelledby
  // ===========================

  it('does not add aria-labelledby on div', () => {
    const { container } = render(<Note heading="Test">Inhoud</Note>);
    expect(container.firstChild).not.toHaveAttribute('aria-labelledby');
  });

  it('adds aria-labelledby on nav when heading is provided', () => {
    const { container } = render(
      <Note as="nav" heading="Op deze pagina">
        Inhoud
      </Note>
    );
    const nav = container.firstChild as HTMLElement;
    expect(nav).toHaveAttribute('aria-labelledby');
    const headingId = nav.getAttribute('aria-labelledby');
    expect(document.getElementById(headingId!)).toBeInTheDocument();
  });

  it('adds aria-labelledby on aside when heading is provided', () => {
    const { container } = render(
      <Note as="aside" heading="Achtergrondinformatie">
        Inhoud
      </Note>
    );
    const aside = container.firstChild as HTMLElement;
    expect(aside).toHaveAttribute('aria-labelledby');
  });

  it('adds aria-labelledby on section when heading is provided', () => {
    const { container } = render(
      <Note as="section" heading="Sectie">
        Inhoud
      </Note>
    );
    expect(container.firstChild).toHaveAttribute('aria-labelledby');
  });

  it('does not add aria-labelledby on nav without heading', () => {
    const { container } = render(
      <Note as="nav" aria-label="Navigatie">
        Inhoud
      </Note>
    );
    expect(container.firstChild).not.toHaveAttribute('aria-labelledby');
  });

  it('does not override explicit aria-labelledby', () => {
    const { container } = render(
      <Note as="nav" heading="Test" aria-labelledby="custom-id">
        Inhoud
      </Note>
    );
    expect(container.firstChild).toHaveAttribute(
      'aria-labelledby',
      'custom-id'
    );
  });

  // ===========================
  // Ref + HTML attributes
  // ===========================

  it('forwards ref to the wrapper element', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Note ref={ref} heading="Test">
        Inhoud
      </Note>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Note heading="Test" id="note-1" data-testid="my-note">
        Inhoud
      </Note>
    );
    const el = screen.getByTestId('my-note');
    expect(el).toHaveAttribute('id', 'note-1');
  });

  // ===========================
  // Content examples
  // ===========================

  it('renders inhoudsopgave patroon (as="nav")', () => {
    render(
      <Note as="nav" heading="Op deze pagina" headingLevel={2}>
        <ul>
          <li>Sectie 1</li>
          <li>Sectie 2</li>
        </ul>
      </Note>
    );
    expect(
      screen.getByRole('navigation', { name: 'Op deze pagina' })
    ).toBeInTheDocument();
    expect(screen.getByText('Sectie 1')).toBeInTheDocument();
  });

  it('renders aside patroon', () => {
    render(
      <Note as="aside" variant="info" heading="Achtergrondinformatie">
        Extra context.
      </Note>
    );
    expect(
      screen.getByRole('complementary', { name: 'Achtergrondinformatie' })
    ).toBeInTheDocument();
  });
});
