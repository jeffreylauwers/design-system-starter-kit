import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders heading', () => {
    render(<Alert heading="Uw aanvraag wordt verwerkt" />);
    expect(screen.getByText('Uw aanvraag wordt verwerkt')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Alert heading="Bericht">
        <p>Dit kan enkele minuten duren.</p>
      </Alert>
    );
    expect(
      screen.getByText('Dit kan enkele minuten duren.')
    ).toBeInTheDocument();
  });

  it('renders without children', () => {
    render(<Alert heading="Alleen heading" />);
    expect(screen.getByText('Alleen heading')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('renders as a <div> element', () => {
    render(<Alert heading="Test" />);
    const alert = screen.getByRole('alert');
    expect(alert.tagName).toBe('DIV');
  });

  it('has role="alert"', () => {
    render(<Alert heading="Test" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // ===========================
  // Classes
  // ===========================

  it('always has base dsn-alert class', () => {
    render(<Alert heading="Test" />);
    expect(screen.getByRole('alert')).toHaveClass('dsn-alert');
  });

  it('does not add variant modifier class for info variant (default)', () => {
    render(<Alert heading="Test" />);
    const el = screen.getByRole('alert');
    expect(el).not.toHaveClass('dsn-alert--info');
  });

  it('does not add variant modifier class for explicit info variant', () => {
    render(<Alert variant="info" heading="Test" />);
    const el = screen.getByRole('alert');
    expect(el).not.toHaveClass('dsn-alert--info');
  });

  it.each(['positive', 'negative', 'warning'] as const)(
    'applies variant modifier class for %s variant',
    (variant) => {
      render(<Alert variant={variant} heading="Test" />);
      expect(screen.getByRole('alert')).toHaveClass(`dsn-alert--${variant}`);
    }
  );

  it('applies custom className', () => {
    render(<Alert heading="Test" className="custom-alert" />);
    const el = screen.getByRole('alert');
    expect(el).toHaveClass('dsn-alert');
    expect(el).toHaveClass('custom-alert');
  });

  // ===========================
  // Heading
  // ===========================

  it('renders heading as h2 by default', () => {
    render(<Alert heading="Standaard heading" />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Standaard heading' })
    ).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'renders heading at level %i when headingLevel=%i',
    (level) => {
      render(<Alert heading="Heading" headingLevel={level} />);
      expect(
        screen.getByRole('heading', { level, name: 'Heading' })
      ).toBeInTheDocument();
    }
  );

  it('applies dsn-alert__heading class to heading', () => {
    render(<Alert heading="Heading" />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('dsn-alert__heading');
  });

  // ===========================
  // Icon
  // ===========================

  it('renders preferred icon by default (info-circle for info)', () => {
    render(<Alert variant="info" heading="Info" />);
    const iconSpan = document.querySelector('.dsn-alert__icon');
    expect(iconSpan).toBeInTheDocument();
  });

  it('renders preferred icon for each variant', () => {
    const variants = ['info', 'positive', 'negative', 'warning'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Alert variant={variant} heading="Test" />);
      expect(document.querySelector('.dsn-alert__icon')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders no icon when iconStart={null}', () => {
    render(<Alert heading="Zonder icoon" iconStart={null} />);
    expect(document.querySelector('.dsn-alert__icon')).not.toBeInTheDocument();
  });

  it('adds dsn-alert--no-icon class when iconStart={null}', () => {
    render(<Alert heading="Zonder icoon" iconStart={null} />);
    expect(screen.getByRole('alert')).toHaveClass('dsn-alert--no-icon');
  });

  it('does not add dsn-alert--no-icon class when icon is shown', () => {
    render(<Alert heading="Met icoon" />);
    expect(screen.getByRole('alert')).not.toHaveClass('dsn-alert--no-icon');
  });

  it('renders custom icon when iconStart is provided as ReactNode', () => {
    render(
      <Alert
        heading="Custom icoon"
        iconStart={<svg data-testid="custom-icon" />}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    const iconSpan = document.querySelector('.dsn-alert__icon');
    expect(iconSpan).toBeInTheDocument();
  });

  // ===========================
  // Content
  // ===========================

  it('wraps children in dsn-alert__content div', () => {
    render(
      <Alert heading="Test">
        <p>Inhoud</p>
      </Alert>
    );
    const content = document.querySelector('.dsn-alert__content');
    expect(content).toBeInTheDocument();
    expect(content?.querySelector('p')).toBeInTheDocument();
  });

  it('does not render dsn-alert__content when no children', () => {
    render(<Alert heading="Test" />);
    expect(
      document.querySelector('.dsn-alert__content')
    ).not.toBeInTheDocument();
  });

  // ===========================
  // Ref + HTML attributes
  // ===========================

  it('forwards ref to the div element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Alert ref={ref} heading="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional HTML attributes', () => {
    render(<Alert heading="Test" id="alert-1" data-testid="my-alert" />);
    const el = screen.getByTestId('my-alert');
    expect(el).toHaveAttribute('id', 'alert-1');
  });

  // ===========================
  // Content examples
  // ===========================

  it('renders a validation error list as children', () => {
    render(
      <Alert variant="negative" heading="Er zijn fouten opgetreden">
        <ul>
          <li>Veld 1 is verplicht</li>
          <li>Veld 2 is ongeldig</li>
        </ul>
      </Alert>
    );
    expect(screen.getByText('Er zijn fouten opgetreden')).toBeInTheDocument();
    expect(screen.getByText('Veld 1 is verplicht')).toBeInTheDocument();
    expect(screen.getByText('Veld 2 is ongeldig')).toBeInTheDocument();
  });

  it('renders success message correctly', () => {
    render(
      <Alert variant="positive" heading="Gelukt">
        Uw gegevens zijn opgeslagen.
      </Alert>
    );
    expect(screen.getByRole('heading', { name: 'Gelukt' })).toBeInTheDocument();
    expect(
      screen.getByText('Uw gegevens zijn opgeslagen.')
    ).toBeInTheDocument();
  });
});
