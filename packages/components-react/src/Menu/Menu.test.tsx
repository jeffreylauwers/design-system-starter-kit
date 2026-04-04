import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Menu } from './Menu';

describe('Menu', () => {
  // ---------------------------------------------------------------------------
  // Structuur
  // ---------------------------------------------------------------------------

  it('rendert een <ul>-element', () => {
    const { container } = render(<Menu>content</Menu>);
    expect(container.firstChild?.nodeName).toBe('UL');
  });

  it('heeft de basis dsn-menu klasse', () => {
    const { container } = render(<Menu>content</Menu>);
    expect(container.firstChild).toHaveClass('dsn-menu');
  });

  it('rendert children', () => {
    const { container } = render(
      <Menu>
        <li>Item 1</li>
        <li>Item 2</li>
      </Menu>
    );
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  // ---------------------------------------------------------------------------
  // Oriëntatie
  // ---------------------------------------------------------------------------

  it('heeft geen --horizontal modifier bij standaard oriëntatie', () => {
    const { container } = render(<Menu>content</Menu>);
    expect(container.firstChild).not.toHaveClass('dsn-menu--horizontal');
  });

  it('heeft geen --horizontal modifier bij expliciet vertical', () => {
    const { container } = render(<Menu orientation="vertical">content</Menu>);
    expect(container.firstChild).not.toHaveClass('dsn-menu--horizontal');
  });

  it('heeft dsn-menu--horizontal klasse bij horizontal oriëntatie', () => {
    const { container } = render(<Menu orientation="horizontal">content</Menu>);
    expect(container.firstChild).toHaveClass('dsn-menu--horizontal');
  });

  // ---------------------------------------------------------------------------
  // className en ref
  // ---------------------------------------------------------------------------

  it('past className toe op het <ul>-element', () => {
    const { container } = render(<Menu className="custom">content</Menu>);
    expect(container.firstChild).toHaveClass('custom');
    expect(container.firstChild).toHaveClass('dsn-menu');
  });

  it('stuurt HTML-attributen door naar het <ul>-element', () => {
    const { container } = render(<Menu data-testid="my-menu">content</Menu>);
    expect(container.firstChild).toHaveAttribute('data-testid', 'my-menu');
  });

  it('forwards ref naar het <ul>-element', () => {
    const ref = { current: null as HTMLUListElement | null };
    render(<Menu ref={ref}>content</Menu>);
    expect(ref.current).toBeInstanceOf(HTMLUListElement);
  });
});
