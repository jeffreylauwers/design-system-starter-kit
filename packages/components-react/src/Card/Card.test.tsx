import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardPreHeader,
  CardHeader,
  CardBody,
  CardHeading,
  CardLabel,
  CardDescription,
  CardMeta,
  CardFooter,
  CardAffordance,
  CardGroup,
} from './Card';

// =============================================================================
// Card
// =============================================================================

describe('Card', () => {
  it('renders an <article> element as root', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe('ARTICLE');
  });

  it('always has base dsn-card class', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('dsn-card');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    expect(container.firstChild).toHaveClass('dsn-card');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the article element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('ARTICLE');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Card id="card-1" data-testid="my-card">
        Content
      </Card>
    );
    const el = screen.getByTestId('my-card');
    expect(el).toHaveAttribute('id', 'card-1');
  });

  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });
});

// =============================================================================
// CardPreHeader
// =============================================================================

describe('CardPreHeader', () => {
  it('renders a <div> element as root', () => {
    const { container } = render(<CardPreHeader />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-card__pre-header class', () => {
    const { container } = render(<CardPreHeader />);
    expect(container.firstChild).toHaveClass('dsn-card__pre-header');
  });

  it('renders placeholder when no children provided', () => {
    const { container } = render(<CardPreHeader />);
    expect(
      container.querySelector('.dsn-card__image-placeholder')
    ).toBeInTheDocument();
  });

  it('placeholder has aria-hidden="true"', () => {
    const { container } = render(<CardPreHeader />);
    const placeholder = container.querySelector('.dsn-card__image-placeholder');
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render placeholder when children provided', () => {
    const { container } = render(
      <CardPreHeader>
        <img src="/foto.jpg" alt="Foto" />
      </CardPreHeader>
    );
    expect(
      container.querySelector('.dsn-card__image-placeholder')
    ).not.toBeInTheDocument();
  });

  it('does not hide meaningful images from screenreaders', () => {
    const { container } = render(
      <CardPreHeader>
        <img src="/foto.jpg" alt="Tekst op de afbeelding" />
      </CardPreHeader>
    );
    expect(container.firstChild).not.toHaveAttribute('aria-hidden');
    expect(screen.getByAltText('Tekst op de afbeelding')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardPreHeader className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-card__pre-header');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardPreHeader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// CardHeader
// =============================================================================

describe('CardHeader', () => {
  it('renders a <div> element as root', () => {
    const { container } = render(<CardHeader>Content</CardHeader>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-card__header class', () => {
    const { container } = render(<CardHeader>Content</CardHeader>);
    expect(container.firstChild).toHaveClass('dsn-card__header');
  });

  it('does not render a placeholder when empty', () => {
    const { container } = render(<CardHeader />);
    expect(
      container.querySelector('.dsn-card__image-placeholder')
    ).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <CardHeader>
        <CardHeading>Titel</CardHeading>
      </CardHeader>
    );
    expect(screen.getByRole('heading', { name: 'Titel' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardHeader className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-card__header');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardHeader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// CardBody
// =============================================================================

describe('CardBody', () => {
  it('renders a <div> element as root', () => {
    const { container } = render(<CardBody>Content</CardBody>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-card__body class', () => {
    const { container } = render(<CardBody>Content</CardBody>);
    expect(container.firstChild).toHaveClass('dsn-card__body');
  });

  it('renders children', () => {
    render(<CardBody>Body content</CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardBody className="custom">Content</CardBody>
    );
    expect(container.firstChild).toHaveClass('dsn-card__body');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardBody ref={ref}>Content</CardBody>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// CardHeading
// =============================================================================

describe('CardHeading', () => {
  it('renders an <h2> element by default', () => {
    const { container } = render(<CardHeading>Titel</CardHeading>);
    expect(container.firstChild?.nodeName).toBe('H2');
  });

  it('renders <h3> when level={3}', () => {
    const { container } = render(<CardHeading level={3}>Titel</CardHeading>);
    expect(container.firstChild?.nodeName).toBe('H3');
  });

  it('renders <h4> when level={4}', () => {
    const { container } = render(<CardHeading level={4}>Titel</CardHeading>);
    expect(container.firstChild?.nodeName).toBe('H4');
  });

  it('always has base dsn-card__heading class', () => {
    const { container } = render(<CardHeading>Titel</CardHeading>);
    expect(container.firstChild).toHaveClass('dsn-card__heading');
  });

  it('renders children as plain text without link when no href in context', () => {
    const { container } = render(<CardHeading>Titel</CardHeading>);
    expect(container.querySelector('a')).not.toBeInTheDocument();
    expect(screen.getByText('Titel')).toBeInTheDocument();
  });

  it('renders a link when Card provides href via context', () => {
    render(
      <Card href="/artikel/slug">
        <CardHeading>Artikel titel</CardHeading>
      </Card>
    );
    const link = screen.getByRole('link', { name: 'Artikel titel' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/artikel/slug');
    expect(link).toHaveClass('dsn-card__link');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardHeading className="custom">Titel</CardHeading>
    );
    expect(container.firstChild).toHaveClass('dsn-card__heading');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the heading element', () => {
    const ref = { current: null as HTMLHeadingElement | null };
    render(<CardHeading ref={ref}>Titel</CardHeading>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

// =============================================================================
// CardLabel
// =============================================================================

describe('CardLabel', () => {
  it('renders a <p> element with dsn-card__label class', () => {
    const { container } = render(<CardLabel>Inloggen</CardLabel>);
    expect(container.firstChild?.nodeName).toBe('P');
    expect(container.firstChild).toHaveClass('dsn-card__label');
  });

  it('renders plain text without link when no href in context', () => {
    const { container } = render(<CardLabel>Inloggen</CardLabel>);
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  it('renders a stretched link when Card provides href via context', () => {
    render(
      <Card href="/inloggen">
        <CardLabel>Inloggen met DigiD</CardLabel>
      </Card>
    );
    const link = screen.getByRole('link', { name: 'Inloggen met DigiD' });
    expect(link).toHaveAttribute('href', '/inloggen');
    expect(link).toHaveClass('dsn-card__link');
  });

  it('forwards ref to the p element', () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<CardLabel ref={ref}>Label</CardLabel>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

// =============================================================================
// CardDescription en CardMeta
// =============================================================================

describe('CardDescription', () => {
  it('renders a <p> element with dsn-card__description class', () => {
    const { container } = render(<CardDescription>Tekst</CardDescription>);
    expect(container.firstChild?.nodeName).toBe('P');
    expect(container.firstChild).toHaveClass('dsn-card__description');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardDescription className="custom">Tekst</CardDescription>
    );
    expect(container.firstChild).toHaveClass('dsn-card__description');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the p element', () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<CardDescription ref={ref}>Tekst</CardDescription>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardMeta', () => {
  it('renders a <p> element with dsn-card__meta class', () => {
    const { container } = render(
      <CardMeta>
        <time dateTime="2026-09-25">25 september 2026</time>
      </CardMeta>
    );
    expect(container.firstChild?.nodeName).toBe('P');
    expect(container.firstChild).toHaveClass('dsn-card__meta');
    expect(container.querySelector('time')).toBeInTheDocument();
  });

  it('forwards ref to the p element', () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<CardMeta ref={ref}>Meta</CardMeta>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

// =============================================================================
// CardFooter
// =============================================================================

describe('CardFooter', () => {
  it('renders a <div> element as root', () => {
    const { container } = render(<CardFooter>Content</CardFooter>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-card__footer class', () => {
    const { container } = render(<CardFooter>Content</CardFooter>);
    expect(container.firstChild).toHaveClass('dsn-card__footer');
  });

  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardFooter className="custom">Content</CardFooter>
    );
    expect(container.firstChild).toHaveClass('dsn-card__footer');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardFooter ref={ref}>Content</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// CardAffordance
// =============================================================================

describe('CardAffordance', () => {
  it('renders a <span> with aria-hidden="true"', () => {
    const { container } = render(<CardAffordance>Lees meer</CardAffordance>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(container.firstChild).toHaveClass('dsn-card__affordance');
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('is not a link and adds no tab stop', () => {
    render(
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading>Artikeltitel</CardHeading>
        </CardHeader>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('forwards ref to the span element', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<CardAffordance ref={ref}>Lees meer</CardAffordance>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

// =============================================================================
// CardGroup
// =============================================================================

describe('CardGroup', () => {
  it('renders a <ul> element by default', () => {
    const { container } = render(
      <CardGroup>
        <li>Item</li>
      </CardGroup>
    );
    expect(container.firstChild?.nodeName).toBe('UL');
  });

  it('renders a <div> when as="div"', () => {
    const { container } = render(
      <CardGroup as="div">
        <div>Item</div>
      </CardGroup>
    );
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-card-group class', () => {
    const { container } = render(
      <CardGroup>
        <li>Item</li>
      </CardGroup>
    );
    expect(container.firstChild).toHaveClass('dsn-card-group');
  });

  it('adds role="list" when rendered as ul', () => {
    const { container } = render(
      <CardGroup>
        <li>Item</li>
      </CardGroup>
    );
    expect(container.firstChild).toHaveAttribute('role', 'list');
  });

  it('does not add role="list" when rendered as div', () => {
    const { container } = render(
      <CardGroup as="div">
        <div>Item</div>
      </CardGroup>
    );
    expect(container.firstChild).not.toHaveAttribute('role', 'list');
  });

  it('renders children', () => {
    render(
      <CardGroup>
        <li>Card 1</li>
        <li>Card 2</li>
      </CardGroup>
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardGroup className="custom">
        <li>Item</li>
      </CardGroup>
    );
    expect(container.firstChild).toHaveClass('dsn-card-group');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the root element', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <CardGroup ref={ref}>
        <li>Item</li>
      </CardGroup>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('UL');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <CardGroup data-testid="my-group">
        <li>Item</li>
      </CardGroup>
    );
    const el = screen.getByTestId('my-group');
    expect(el).toBeInTheDocument();
  });
});

// =============================================================================
// Integratie — volledige Card met alle sub-componenten
// =============================================================================

describe('Card — integratie', () => {
  it('rendert een volledige card met alle vier de secties', () => {
    render(
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading level={2}>Artikeltitel</CardHeading>
        </CardHeader>
        <CardPreHeader />
        <CardBody>
          <p>Korte beschrijving.</p>
        </CardBody>
        <CardFooter>
          <CardAffordance>Lees meer</CardAffordance>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Artikeltitel' })).toHaveAttribute(
      'href',
      '/artikel/slug'
    );
    expect(screen.getByText('Korte beschrijving.')).toBeInTheDocument();
  });

  it('header staat in de DOM vóór de pre-header (WCAG 1.3.2)', () => {
    const { container } = render(
      <Card href="/artikel/slug">
        <CardHeader>
          <CardHeading>Artikeltitel</CardHeading>
        </CardHeader>
        <CardPreHeader>
          <img src="/foto.jpg" alt="Tekst op de afbeelding" />
        </CardPreHeader>
      </Card>
    );
    const sections = Array.from(container.querySelectorAll('.dsn-card > *'));
    expect(sections.map((el) => el.className)).toEqual([
      'dsn-card__header',
      'dsn-card__pre-header',
    ]);
  });

  it('cards in CardGroup: meerdere cards worden gerenderd', () => {
    render(
      <CardGroup>
        <li>
          <Card href="/1">
            <CardHeader>
              <CardHeading>Kaart 1</CardHeading>
            </CardHeader>
          </Card>
        </li>
        <li>
          <Card href="/2">
            <CardHeader>
              <CardHeading>Kaart 2</CardHeading>
            </CardHeader>
          </Card>
        </li>
      </CardGroup>
    );

    expect(screen.getByRole('link', { name: 'Kaart 1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kaart 2' })).toBeInTheDocument();
  });
});
