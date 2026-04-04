import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuButton } from './MenuButton';

describe('MenuButton', () => {
  // ---------------------------------------------------------------------------
  // Structuur
  // ---------------------------------------------------------------------------

  it('renders een <li> met een <button> erin', () => {
    const { container } = render(<MenuButton>Label</MenuButton>);
    const li = container.firstChild;
    expect(li?.nodeName).toBe('LI');
    const button = li?.firstChild;
    expect(button?.nodeName).toBe('BUTTON');
  });

  it('heeft de basis dsn-menu-button klasse op het <li>-element', () => {
    const { container } = render(<MenuButton>Label</MenuButton>);
    expect(container.firstChild).toHaveClass('dsn-menu-button');
  });

  it('heeft de dsn-menu-button__button klasse op het <button>-element', () => {
    render(<MenuButton>Label</MenuButton>);
    const button = document.querySelector('button');
    expect(button).toHaveClass('dsn-menu-button__button');
  });

  it('rendert children in een dsn-menu-button__label span', () => {
    const { container } = render(<MenuButton>Label</MenuButton>);
    const label = container.querySelector('.dsn-menu-button__label');
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe('Label');
  });

  it('heeft type="button" als default', () => {
    render(<MenuButton>Label</MenuButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  // ---------------------------------------------------------------------------
  // Iconen
  // ---------------------------------------------------------------------------

  it('rendert iconStart voor het label', () => {
    const { container } = render(
      <MenuButton iconStart={<svg data-testid="icon-start" />}>
        Label
      </MenuButton>
    );
    const button = container.querySelector('button');
    const children = Array.from(button?.children ?? []);
    const iconIndex = children.findIndex(
      (c) => c.getAttribute('data-testid') === 'icon-start'
    );
    const labelIndex = children.findIndex((c) =>
      c.classList.contains('dsn-menu-button__label')
    );
    expect(iconIndex).toBeLessThan(labelIndex);
  });

  it('rendert iconEnd na het label', () => {
    const { container } = render(
      <MenuButton iconEnd={<svg data-testid="icon-end" />}>Label</MenuButton>
    );
    const button = container.querySelector('button');
    const children = Array.from(button?.children ?? []);
    const iconIndex = children.findIndex(
      (c) => c.getAttribute('data-testid') === 'icon-end'
    );
    const labelIndex = children.findIndex((c) =>
      c.classList.contains('dsn-menu-button__label')
    );
    expect(iconIndex).toBeGreaterThan(labelIndex);
  });

  it('rendert dotBadge in de dsn-menu-button__label span', () => {
    const { container } = render(
      <MenuButton
        dotBadge={<span data-testid="dot-badge" aria-hidden="true" />}
      >
        Label
      </MenuButton>
    );
    const label = container.querySelector('.dsn-menu-button__label');
    expect(label?.querySelector('[data-testid="dot-badge"]')).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Interactie
  // ---------------------------------------------------------------------------

  it('roept onClick aan bij klik', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<MenuButton onClick={handleClick}>Label</MenuButton>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  // ---------------------------------------------------------------------------
  // className en ref
  // ---------------------------------------------------------------------------

  it('past className toe op het <li>-element', () => {
    const { container } = render(
      <MenuButton className="custom">Label</MenuButton>
    );
    expect(container.firstChild).toHaveClass('custom');
    expect(container.firstChild).toHaveClass('dsn-menu-button');
  });

  it('stuurt HTML-attributen door naar het <button>-element', () => {
    render(<MenuButton data-testid="my-button">Label</MenuButton>);
    expect(screen.getByTestId('my-button').nodeName).toBe('BUTTON');
  });

  it('forwards ref naar het <button>-element', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<MenuButton ref={ref}>Label</MenuButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
