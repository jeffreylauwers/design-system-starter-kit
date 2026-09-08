import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageHeader } from './PageHeader';

// De menuknop opent een Drawer, en jsdom heeft geen volledige
// HTMLDialogElement implementatie. Mock showModal, show en close.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.show = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

const defaultLogo = (
  <a href="/">
    <span>Logo</span>
  </a>
);

describe('PageHeader', () => {
  // ---------------------------------------------------------------------------
  // Structuur
  // ---------------------------------------------------------------------------

  it('rendert een <header>-element', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(container.querySelector('header')).toBeTruthy();
  });

  it('heeft de basis dsn-page-header klasse', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(container.querySelector('header')).toHaveClass('dsn-page-header');
  });

  it('rendert de inner-wrapper met dsn-page-header__inner', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(container.querySelector('.dsn-page-header__inner')).toBeTruthy();
  });

  it('rendert dsn-page-header__small-layout', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(
      container.querySelector('.dsn-page-header__small-layout')
    ).toBeTruthy();
  });

  it('rendert dsn-page-header__large-layout', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(
      container.querySelector('.dsn-page-header__large-layout')
    ).toBeTruthy();
  });

  it('rendert het logo in dsn-page-header__logo', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const logoSlot = container.querySelector('.dsn-page-header__logo');
    expect(logoSlot).toBeTruthy();
    expect(logoSlot?.querySelector('a')).toBeTruthy();
  });

  it('rendert een menuknop in dsn-page-header__start', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const start = container.querySelector('.dsn-page-header__start');
    expect(start?.querySelector('button')).toBeTruthy();
  });

  it('rendert een zoekknop in dsn-page-header__end', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const end = container.querySelector('.dsn-page-header__end');
    expect(end?.querySelector('button')).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Zoekpaneel
  // ---------------------------------------------------------------------------

  it('zoekpaneel is standaard verborgen', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const panel = container.querySelector('.dsn-page-header__search-panel');
    expect(panel).toHaveAttribute('hidden');
  });

  it('menuknop heeft aria-expanded="false" bij gesloten menu', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const menuButton = container.querySelector(
      '.dsn-page-header__start button'
    );
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('menuknop heeft aria-expanded="true" bij geopend menu', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const menuButton = container.querySelector<HTMLButtonElement>(
      '.dsn-page-header__start button'
    )!;
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('zoekknop heeft aria-expanded="false" bij gesloten paneel', () => {
    render(<PageHeader logoSlot={defaultLogo} />);
    const searchButton = screen.getByRole('button', { name: /zoeken/i });
    expect(searchButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('zoekpaneel opent bij klik op zoekknop', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const searchButton = screen.getByRole('button', { name: /zoeken/i });
    fireEvent.click(searchButton);
    const panel = container.querySelector('.dsn-page-header__search-panel');
    expect(panel).not.toHaveAttribute('hidden');
  });

  it('zoekknop heeft aria-expanded="true" bij geopend paneel', () => {
    render(<PageHeader logoSlot={defaultLogo} />);
    const searchButton = screen.getByRole('button', { name: /zoeken/i });
    fireEvent.click(searchButton);
    expect(searchButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('zoekknop toont "Sluiten" tekst bij geopend paneel', () => {
    render(<PageHeader logoSlot={defaultLogo} />);
    const searchButton = screen.getByRole('button', { name: /zoeken/i });
    fireEvent.click(searchButton);
    expect(screen.getByRole('button', { name: /sluiten/i })).toBeTruthy();
  });

  it('zoekpaneel sluit bij klik op sluitknop', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const searchButton = screen.getByRole('button', { name: /zoeken/i });
    fireEvent.click(searchButton);
    const closeButton = screen.getByRole('button', { name: /sluiten/i });
    fireEvent.click(closeButton);
    const panel = container.querySelector('.dsn-page-header__search-panel');
    expect(panel).toHaveAttribute('hidden');
  });

  it('zoekpaneel heeft aria-controls dat verwijst naar het zoekpaneel-id', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const searchButton = screen.getByRole('button', { name: /zoeken/i });
    const panelId = searchButton.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(container.querySelector(`#${CSS.escape(panelId!)}`)).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Drawer
  // ---------------------------------------------------------------------------

  it('drawer is standaard gesloten', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    const drawer = container.querySelector('.dsn-drawer');
    expect(drawer).toBeTruthy();
    expect(drawer).not.toHaveAttribute('open');
  });

  it('rendert primaire navigatie in de drawer', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        primaryNavigation={
          <ul>
            <li>Home</li>
          </ul>
        }
      />
    );
    // Navigatie verschijnt in de Drawer (small layout) én in de navbar (large layout)
    expect(container.querySelector('.dsn-drawer')?.textContent).toContain(
      'Home'
    );
  });

  it('rendert service-navigatie in de drawer', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        secondaryNavigation={
          <ul>
            <li>Contact</li>
          </ul>
        }
      />
    );
    // Navigatie verschijnt in de Drawer (small layout) én in de masthead (large layout)
    expect(container.querySelector('.dsn-drawer')?.textContent).toContain(
      'Contact'
    );
  });

  // ---------------------------------------------------------------------------
  // Large viewport layout
  // ---------------------------------------------------------------------------

  it('rendert masthead in large layout', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(container.querySelector('.dsn-page-header__masthead')).toBeTruthy();
  });

  it('rendert navbar in large layout', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(container.querySelector('.dsn-page-header__navbar')).toBeTruthy();
  });

  it('rendert primaire navigatie in de navbar', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        primaryNavigation={
          <ul>
            <li>Home</li>
          </ul>
        }
      />
    );
    const navbar = container.querySelector('.dsn-page-header__navbar');
    expect(navbar?.textContent).toContain('Home');
  });

  it('rendert servicemenu in de masthead', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        secondaryNavigation={
          <ul>
            <li>Contact</li>
          </ul>
        }
      />
    );
    const masthead = container.querySelector('.dsn-page-header__masthead');
    expect(masthead?.textContent).toContain('Contact');
  });

  it('rendert searchSlot in dsn-page-header__searchbox', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        searchSlot={<button type="button">Zoekknop</button>}
      />
    );
    const searchbox = container.querySelector('.dsn-page-header__searchbox');
    expect(searchbox).toBeTruthy();
    expect(searchbox?.querySelector('button')).toBeTruthy();
  });

  it('toont geen dsn-page-header__searchbox zonder searchSlot', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(container.querySelector('.dsn-page-header__searchbox')).toBeNull();
  });

  it('drawer primaire nav heeft aria-label="Hoofd-navigatie"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} primaryNavigation={<span>nav</span>} />
    );
    const nav = container.querySelector(
      '.dsn-drawer nav[aria-label="Hoofd-navigatie"]'
    );
    expect(nav).toBeTruthy();
  });

  it('drawer service nav heeft aria-label="Service-navigatie"', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        secondaryNavigation={<span>nav</span>}
      />
    );
    const nav = container.querySelector(
      '.dsn-drawer nav[aria-label="Service-navigatie"]'
    );
    expect(nav).toBeTruthy();
  });

  it('masthead nav heeft aria-label="Service-navigatie"', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        secondaryNavigation={<span>nav</span>}
      />
    );
    const nav = container.querySelector('.dsn-page-header__masthead nav');
    expect(nav).toHaveAttribute('aria-label', 'Service-navigatie');
  });

  it('navbar nav heeft aria-label="Hoofd-navigatie"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} primaryNavigation={<span>nav</span>} />
    );
    const nav = container.querySelector('.dsn-page-header__navbar nav');
    expect(nav).toHaveAttribute('aria-label', 'Hoofd-navigatie');
  });

  // ---------------------------------------------------------------------------
  // Sticky modifiers
  // ---------------------------------------------------------------------------

  it('heeft geen sticky modifier bij sticky="none"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} sticky="none" />
    );
    const header = container.querySelector('header');
    expect(header).not.toHaveClass('dsn-page-header--sticky');
    expect(header).not.toHaveClass('dsn-page-header--auto-hide');
  });

  it('heeft dsn-page-header--sticky bij sticky="sticky"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} sticky="sticky" />
    );
    expect(container.querySelector('header')).toHaveClass(
      'dsn-page-header--sticky'
    );
  });

  it('heeft dsn-page-header--auto-hide bij sticky="auto-hide"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} sticky="auto-hide" />
    );
    expect(container.querySelector('header')).toHaveClass(
      'dsn-page-header--auto-hide'
    );
  });

  it('heeft data-hidden="false" bij sticky="auto-hide"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} sticky="auto-hide" />
    );
    expect(container.querySelector('header')).toHaveAttribute(
      'data-hidden',
      'false'
    );
  });

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------

  it('roept onSearchOpen aan bij openen zoekpaneel', () => {
    const onSearchOpen = vi.fn();
    render(<PageHeader logoSlot={defaultLogo} onSearchOpen={onSearchOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /zoeken/i }));
    expect(onSearchOpen).toHaveBeenCalledOnce();
  });

  it('roept onSearchClose aan bij sluiten zoekpaneel', () => {
    const onSearchClose = vi.fn();
    render(<PageHeader logoSlot={defaultLogo} onSearchClose={onSearchClose} />);
    fireEvent.click(screen.getByRole('button', { name: /zoeken/i }));
    fireEvent.click(screen.getByRole('button', { name: /sluiten/i }));
    expect(onSearchClose).toHaveBeenCalledOnce();
  });

  // ---------------------------------------------------------------------------
  // initialSearchOpen
  // ---------------------------------------------------------------------------

  it('zoekpaneel is open bij initialSearchOpen={true}', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} initialSearchOpen={true} />
    );
    const panel = container.querySelector('.dsn-page-header__search-panel');
    expect(panel).not.toHaveAttribute('hidden');
  });

  it('zoekknop heeft aria-expanded="true" bij initialSearchOpen={true}', () => {
    render(<PageHeader logoSlot={defaultLogo} initialSearchOpen={true} />);
    const searchButton = screen.getByRole('button', { name: /sluiten/i });
    expect(searchButton).toHaveAttribute('aria-expanded', 'true');
  });

  // ---------------------------------------------------------------------------
  // Compact layout
  // ---------------------------------------------------------------------------

  it('heeft geen dsn-page-header--compact bij layout="default"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} layout="default" />
    );
    expect(container.querySelector('header')).not.toHaveClass(
      'dsn-page-header--compact'
    );
  });

  it('heeft dsn-page-header--compact bij layout="compact"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} layout="compact" />
    );
    expect(container.querySelector('header')).toHaveClass(
      'dsn-page-header--compact'
    );
  });

  it('rendert dsn-page-header__compact-layout bij layout="compact"', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} layout="compact" />
    );
    expect(
      container.querySelector('.dsn-page-header__compact-layout')
    ).toBeTruthy();
  });

  it('rendert geen dsn-page-header__compact-layout bij layout="default"', () => {
    const { container } = render(<PageHeader logoSlot={defaultLogo} />);
    expect(
      container.querySelector('.dsn-page-header__compact-layout')
    ).toBeNull();
  });

  it('compact layout rendert primaire navigatie', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        layout="compact"
        primaryNavigation={
          <ul>
            <li>Home</li>
          </ul>
        }
      />
    );
    const compactLayout = container.querySelector(
      '.dsn-page-header__compact-layout'
    );
    expect(compactLayout?.textContent).toContain('Home');
  });

  it('compact layout rendert servicemenu', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        layout="compact"
        secondaryNavigation={
          <ul>
            <li>Contact</li>
          </ul>
        }
      />
    );
    const compactLayout = container.querySelector(
      '.dsn-page-header__compact-layout'
    );
    expect(compactLayout?.textContent).toContain('Contact');
  });

  it('compact layout primaire nav heeft aria-label="Hoofd-navigatie"', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        layout="compact"
        primaryNavigation={<span>nav</span>}
      />
    );
    const nav = container.querySelector(
      '.dsn-page-header__compact-primary-nav nav'
    );
    expect(nav).toHaveAttribute('aria-label', 'Hoofd-navigatie');
  });

  it('compact layout servicemenu nav heeft aria-label="Service-navigatie"', () => {
    const { container } = render(
      <PageHeader
        logoSlot={defaultLogo}
        layout="compact"
        secondaryNavigation={<span>nav</span>}
      />
    );
    const nav = container.querySelector(
      '.dsn-page-header__compact-secondary nav'
    );
    expect(nav).toHaveAttribute('aria-label', 'Service-navigatie');
  });

  it('compact layout heeft een zoekpaneel', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} layout="compact" />
    );
    const compactLayout = container.querySelector(
      '.dsn-page-header__compact-layout'
    );
    expect(
      compactLayout?.querySelector('.dsn-page-header__search-panel')
    ).toBeTruthy();
  });

  it('compact zoekpaneel is standaard verborgen', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} layout="compact" />
    );
    const compactLayout = container.querySelector(
      '.dsn-page-header__compact-layout'
    );
    const panel = compactLayout?.querySelector(
      '.dsn-page-header__search-panel'
    );
    expect(panel).toHaveAttribute('hidden');
  });

  it('compact layout rendert het logo', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} layout="compact" />
    );
    const compactLayout = container.querySelector(
      '.dsn-page-header__compact-layout'
    );
    expect(compactLayout?.querySelector('.dsn-page-header__logo')).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // className en ref
  // ---------------------------------------------------------------------------

  it('accepteert extra className', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} className="custom" />
    );
    expect(container.querySelector('header')).toHaveClass(
      'dsn-page-header',
      'custom'
    );
  });

  it('stuurt HTML-attributen door', () => {
    const { container } = render(
      <PageHeader logoSlot={defaultLogo} data-testid="ph" />
    );
    expect(container.querySelector('header')).toHaveAttribute(
      'data-testid',
      'ph'
    );
  });
});
