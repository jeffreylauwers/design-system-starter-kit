import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormFieldStatus } from './FormFieldStatus';

describe('FormFieldStatus', () => {
  it('renders children', () => {
    render(<FormFieldStatus>45 karakters over</FormFieldStatus>);
    expect(screen.getByText('45 karakters over')).toBeInTheDocument();
  });

  it('renders as a <p> element', () => {
    render(<FormFieldStatus>Status text</FormFieldStatus>);
    expect(screen.getByText('Status text').tagName).toBe('P');
  });

  it('always has base dsn-form-field-status class', () => {
    render(<FormFieldStatus>Status</FormFieldStatus>);
    expect(screen.getByText('Status')).toHaveClass('dsn-form-field-status');
  });

  it('applies custom className', () => {
    render(<FormFieldStatus className="custom">Status</FormFieldStatus>);
    const el = screen.getByText('Status');
    expect(el).toHaveClass('dsn-form-field-status');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<FormFieldStatus ref={ref}>Status</FormFieldStatus>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <FormFieldStatus id="bio-status" data-testid="status">
        Character count
      </FormFieldStatus>
    );
    const el = screen.getByTestId('status');
    expect(el).toHaveAttribute('id', 'bio-status');
  });

  it('renders character counter content', () => {
    render(<FormFieldStatus>280 van 500 karakters gebruikt</FormFieldStatus>);
    expect(
      screen.getByText('280 van 500 karakters gebruikt')
    ).toBeInTheDocument();
  });

  it('renders password strength content', () => {
    render(<FormFieldStatus>Wachtwoord sterkte: Sterk</FormFieldStatus>);
    expect(screen.getByText('Wachtwoord sterkte: Sterk')).toBeInTheDocument();
  });

  it('renders validation feedback content', () => {
    render(<FormFieldStatus>Voldoet aan alle eisen</FormFieldStatus>);
    expect(screen.getByText('Voldoet aan alle eisen')).toBeInTheDocument();
  });

  it('is not a live region by default', () => {
    render(<FormFieldStatus>Tekst</FormFieldStatus>);
    const status = screen.getByText('Tekst');
    expect(status).not.toHaveAttribute('aria-live');
    expect(status).not.toHaveAttribute('aria-atomic');
  });

  it('becomes a polite live region when live is set', () => {
    render(<FormFieldStatus live>Tekst</FormFieldStatus>);
    const status = screen.getByText('Tekst');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });
});
