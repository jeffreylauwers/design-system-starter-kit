import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionGroup } from './ActionGroup';

describe('ActionGroup', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders children', () => {
    render(
      <ActionGroup>
        <button>Opslaan</button>
        <button>Annuleren</button>
      </ActionGroup>
    );
    expect(screen.getByText('Opslaan')).toBeInTheDocument();
    expect(screen.getByText('Annuleren')).toBeInTheDocument();
  });

  it('renders as a <ul> element', () => {
    const { container } = render(
      <ActionGroup>
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild?.nodeName).toBe('UL');
  });

  it('wraps each child in a <li class="dsn-action-group__item">', () => {
    const { container } = render(
      <ActionGroup>
        <button>Opslaan</button>
        <button>Annuleren</button>
      </ActionGroup>
    );
    const items = container.querySelectorAll('li.dsn-action-group__item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Opslaan');
    expect(items[1]).toHaveTextContent('Annuleren');
  });

  it('wraps each child in its own <li> even when passed as a single Fragment', () => {
    const { container } = render(
      <ActionGroup>
        <>
          <button>Opslaan</button>
          <button>Annuleren</button>
        </>
      </ActionGroup>
    );
    const items = container.querySelectorAll('li.dsn-action-group__item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Opslaan');
    expect(items[1]).toHaveTextContent('Annuleren');
  });

  it('renders with a single child', () => {
    render(
      <ActionGroup>
        <button>Enige actie</button>
      </ActionGroup>
    );
    expect(screen.getByText('Enige actie')).toBeInTheDocument();
  });

  // ===========================
  // Classes
  // ===========================

  it('always has base dsn-action-group class', () => {
    const { container } = render(
      <ActionGroup>
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).toHaveClass('dsn-action-group');
  });

  it('does not have vertical modifier by default', () => {
    const { container } = render(
      <ActionGroup>
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).not.toHaveClass('dsn-action-group--vertical');
  });

  it('does not have vertical modifier when direction is horizontal', () => {
    const { container } = render(
      <ActionGroup direction="horizontal">
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).not.toHaveClass('dsn-action-group--vertical');
  });

  it('has vertical modifier when direction is vertical', () => {
    const { container } = render(
      <ActionGroup direction="vertical">
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).toHaveClass('dsn-action-group');
    expect(container.firstChild).toHaveClass('dsn-action-group--vertical');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ActionGroup className="custom-group">
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).toHaveClass('dsn-action-group');
    expect(container.firstChild).toHaveClass('custom-group');
  });

  // ===========================
  // Ref + HTML attributes
  // ===========================

  it('forwards ref to the ul element', () => {
    const ref = { current: null as HTMLUListElement | null };
    render(
      <ActionGroup ref={ref}>
        <button>Actie</button>
      </ActionGroup>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('UL');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <ActionGroup id="action-group-1" data-testid="my-group">
        <button>Actie</button>
      </ActionGroup>
    );
    const el = screen.getByTestId('my-group');
    expect(el).toHaveAttribute('id', 'action-group-1');
  });

  // ===========================
  // Accessibility
  // ===========================

  it('has a default aria-label of "Acties"', () => {
    const { container } = render(
      <ActionGroup>
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).toHaveAttribute('aria-label', 'Acties');
  });

  it('allows aria-label to be overridden', () => {
    const { container } = render(
      <ActionGroup aria-label="Formulierknoppen">
        <button>Actie</button>
      </ActionGroup>
    );
    expect(container.firstChild).toHaveAttribute(
      'aria-label',
      'Formulierknoppen'
    );
  });
});
