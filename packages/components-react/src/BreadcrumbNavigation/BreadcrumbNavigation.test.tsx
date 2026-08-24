import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { BreadcrumbNavigationItem } from './BreadcrumbNavigationItem';

const renderBreadcrumb = (props = {}) =>
  render(
    <BreadcrumbNavigation {...props}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/categorie">
        Categorie
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem current>Product</BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  );

describe('BreadcrumbNavigation', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders as a <nav> element', () => {
    const { container } = renderBreadcrumb();
    expect(container.firstChild?.nodeName).toBe('NAV');
  });

  it('renders an <ol> inside the nav', () => {
    const { container } = renderBreadcrumb();
    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  it('renders all items', () => {
    renderBreadcrumb();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Categorie')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  // ===========================
  // Classes
  // ===========================

  it('always has base dsn-breadcrumb-navigation class', () => {
    const { container } = renderBreadcrumb();
    expect(container.firstChild).toHaveClass('dsn-breadcrumb-navigation');
  });

  it('does not add compact modifier by default', () => {
    const { container } = renderBreadcrumb();
    expect(container.firstChild).not.toHaveClass(
      'dsn-breadcrumb-navigation--compact'
    );
  });

  it('adds compact modifier when variant="compact"', () => {
    const { container } = renderBreadcrumb({ variant: 'compact' });
    expect(container.firstChild).toHaveClass(
      'dsn-breadcrumb-navigation--compact'
    );
  });

  it('applies custom className', () => {
    const { container } = renderBreadcrumb({ className: 'custom-class' });
    expect(container.firstChild).toHaveClass('dsn-breadcrumb-navigation');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('ol has dsn-breadcrumb-navigation__list class', () => {
    const { container } = renderBreadcrumb();
    expect(container.querySelector('ol')).toHaveClass(
      'dsn-breadcrumb-navigation__list'
    );
  });

  // ===========================
  // Accessibility
  // ===========================

  it('has default aria-label "Broodkruimelpad"', () => {
    const { container } = renderBreadcrumb();
    expect(container.firstChild).toHaveAttribute(
      'aria-label',
      'Broodkruimelpad'
    );
  });

  it('accepts custom aria-label', () => {
    const { container } = renderBreadcrumb({ 'aria-label': 'Navigatiepad' });
    expect(container.firstChild).toHaveAttribute('aria-label', 'Navigatiepad');
  });

  // ===========================
  // Back icon injection (compact)
  // ===========================

  it('does not inject back-icon by default', () => {
    const { container } = renderBreadcrumb();
    expect(
      container.querySelectorAll('.dsn-breadcrumb-navigation__back-icon')
    ).toHaveLength(0);
  });

  it('injects back-icon in the parent item when variant="compact"', () => {
    const { container } = renderBreadcrumb({ variant: 'compact' });
    const backIcons = container.querySelectorAll(
      '.dsn-breadcrumb-navigation__back-icon'
    );
    expect(backIcons).toHaveLength(1);
    // Back-icon is in the second-to-last item (parent of current)
    const items = container.querySelectorAll('li');
    const parentItem = items[items.length - 2];
    expect(
      parentItem.querySelector('.dsn-breadcrumb-navigation__back-icon')
    ).toBeInTheDocument();
  });

  // ===========================
  // Ref + HTML attributes
  // ===========================

  it('forwards ref to the nav element', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <BreadcrumbNavigation ref={ref}>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('spreads additional HTML attributes', () => {
    renderBreadcrumb({ 'data-testid': 'breadcrumb' });
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });
});

describe('BreadcrumbNavigationItem', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders as a <li> element', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    const items = container.querySelectorAll('li');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders an <a> element with correct href', () => {
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(screen.getByText('Home').closest('a')).toHaveAttribute(
      'href',
      '/home'
    );
  });

  it('renders link text as children', () => {
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  // ===========================
  // Classes
  // ===========================

  it('always has base dsn-breadcrumb-navigation__item class', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    const items = container.querySelectorAll('li');
    items.forEach((item) => {
      expect(item).toHaveClass('dsn-breadcrumb-navigation__item');
    });
  });

  it('adds --current modifier when current prop is set', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    const currentItem = container.querySelector(
      '.dsn-breadcrumb-navigation__item--current'
    );
    expect(currentItem).toBeInTheDocument();
  });

  it('link has dsn-breadcrumb-navigation__link class', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    const links = container.querySelectorAll(
      '.dsn-breadcrumb-navigation__link'
    );
    expect(links.length).toBeGreaterThan(0);
  });

  // ===========================
  // Accessibility
  // ===========================

  it('adds aria-current="page" on the current <li>', () => {
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(screen.getByText('Huidig').closest('li')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('does not add aria-current on non-current items', () => {
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(screen.getByText('Home').closest('li')).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('does not render the current page as a link', () => {
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(screen.getByText('Huidig').closest('a')).toBeNull();
    // Alleen de bovenliggende items zijn nog links
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('ignores href on the current item', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem href="/huidig" current>
          Huidig
        </BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(container.querySelector('a[href="/huidig"]')).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders as plain text when href is omitted on a non-current item', () => {
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem>Zonder href</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    // Nooit een <a> zonder href: die is niet focusbaar en heeft geen linkrol
    expect(screen.getByText('Zonder href').closest('a')).toBeNull();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('separator icon has aria-hidden', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    const separators = container.querySelectorAll(
      '.dsn-breadcrumb-navigation__separator'
    );
    separators.forEach((sep) => {
      expect(sep).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ===========================
  // Separator
  // ===========================

  it('renders a separator icon in each item', () => {
    const { container } = render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem href="/categorie">
          Categorie
        </BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    const separators = container.querySelectorAll(
      '.dsn-breadcrumb-navigation__separator'
    );
    // Every item has a separator (CSS handles hiding the last one)
    expect(separators).toHaveLength(3);
  });

  // ===========================
  // Ref
  // ===========================

  it('forwards ref to the li element', () => {
    const ref = { current: null as HTMLLIElement | null };
    render(
      <BreadcrumbNavigation>
        <BreadcrumbNavigationItem ref={ref} href="/home">
          Home
        </BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem current>Huidig</BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('LI');
  });
});
