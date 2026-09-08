import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { SearchInput } from '../SearchInput';
import { Drawer, DrawerBody, DrawerHeader, DrawerHeading } from '../Drawer';
import { Stack } from '../Stack';
import './PageHeader.css';

export type PageHeaderSticky = 'none' | 'sticky' | 'auto-hide';
export type PageHeaderLayout = 'default' | 'compact';
export type PageHeaderColorScheme = 'default' | 'inverse';

export interface PageHeaderProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  /**
   * Logo-inhoud — `<svg>`, `<img>`, of een `<a>` die een logo omhult.
   * De CSS past automatisch `max-block-size` toe op de directe child.
   */
  logoSlot: React.ReactNode;

  /**
   * Scrollgedrag van de header.
   * - `none` (standaard): header scrollt mee met de pagina
   * - `sticky`: header blijft bovenaan de viewport vastgeplakt
   * - `auto-hide`: sticky + verbergt bij scroll-down, toont bij scroll-up
   * @default 'none'
   */
  sticky?: PageHeaderSticky;

  /**
   * Lay-out van de header op large viewport (≥ 64em).
   * - `default`: twee horizontale banden — Masthead (logo + servicemenu + zoekveld)
   *   en Navigatiebalk (primaire navigatie op accent-1 achtergrond)
   * - `compact`: één enkele rij — logo (inline-start), primaire navigatie (gecentreerd),
   *   servicemenu + zoekknop (inline-end). Geeft `primaryNavigationLarge` voorrang
   *   boven `primaryNavigation` (en idem voor secondary) zodat de Drawer altijd
   *   de verticale variant ontvangt.
   * @default 'default'
   */
  layout?: PageHeaderLayout;

  /**
   * Kleurschema van de header.
   * - `default`: neutrale achtergrond met accent-1 navbar
   * - `inverse`: sterke accent-1-inverse achtergrond op navbar en compact balk
   *   voor prominente branding. Het masthead blijft altijd neutraal.
   *   Logo-kleuren passen zich automatisch aan via CSS context overrides.
   * @default 'default'
   */
  colorScheme?: PageHeaderColorScheme;

  /**
   * Initiële open-staat van het zoekpaneel (small viewport).
   * Handig voor Storybook en tests — het paneel kan daarna nog steeds
   * worden geopend/gesloten via de knop.
   * @default false
   */
  initialSearchOpen?: boolean;

  /**
   * Primaire navigatie-inhoud in de Drawer (small viewport) — doorgaans een verticale `<Menu>` met
   * `<MenuLink>`-items inclusief uitklapmogelijkheden voor sub-niveaus.
   */
  primaryNavigation?: React.ReactNode;

  /**
   * Primaire navigatie-inhoud in de Navigatiebalk (large viewport) — doorgaans een horizontale
   * `<Menu>` met alleen Level 1 `<MenuLink>`-items. Als niet meegegeven valt de component
   * terug op `primaryNavigation`.
   */
  primaryNavigationLarge?: React.ReactNode;

  /**
   * Servicemenu-inhoud in de Drawer (small viewport) — doorgaans een verticale `<Menu>`.
   */
  secondaryNavigation?: React.ReactNode;

  /**
   * Servicemenu-inhoud in de Masthead (large viewport) — doorgaans een horizontale `<Menu>`.
   * Als niet meegegeven valt de component terug op `secondaryNavigation`.
   */
  secondaryNavigationLarge?: React.ReactNode;

  /**
   * Inline zoekveld voor de Masthead op large viewport (SearchInput + zoekknop).
   * Optioneel — toont geen zoekveld als weggelaten.
   */
  searchSlot?: React.ReactNode;

  /**
   * Visuele badge-indicator bij de menuknop (small viewport), doorgaans een `<DotBadge>`.
   * Gebruik dit om ongelezen meldingen te signaleren. De badge is altijd `aria-hidden` —
   * geef de toegankelijke tekst mee via `menuButtonBadgeLabel`.
   */
  menuButtonBadge?: React.ReactNode;

  /**
   * Toegankelijke tekst die wordt toegevoegd aan het label van de menuknop als er een badge
   * aanwezig is, bijvoorbeeld `"2 nieuwe berichten"`. Wordt visueel verborgen getoond zodat
   * screenreadergebruikers de melding horen: "Menu, 2 nieuwe berichten".
   * Vereist als `menuButtonBadge` is meegegeven.
   */
  menuButtonBadgeLabel?: string;

  /**
   * Callback wanneer de navigatielade opent.
   */
  onMenuOpen?: () => void;

  /**
   * Callback wanneer de navigatielade sluit.
   */
  onMenuClose?: () => void;

  /**
   * Callback wanneer het zoekpaneel opent.
   */
  onSearchOpen?: () => void;

  /**
   * Callback wanneer het zoekpaneel sluit.
   */
  onSearchClose?: () => void;

  // ── i18n labels ────────────────────────────────────────────────────────────

  /**
   * Label van de menuknop en de Drawer-heading.
   * @default 'Menu'
   */
  menuButtonLabel?: string;

  /**
   * Label van de zoekknop wanneer het zoekpaneel gesloten is.
   * @default 'Zoeken'
   */
  searchButtonLabel?: string;

  /**
   * Label van de zoekknop wanneer het zoekpaneel open is.
   * @default 'Sluiten'
   */
  closeButtonLabel?: string;

  /**
   * Placeholder van het zoekveld in het zoekpaneel (small viewport en compact layout).
   * @default 'Zoeken…'
   */
  searchInputPlaceholder?: string;

  /**
   * `aria-label` van het zoekveld in het zoekpaneel.
   * @default 'Zoekopdracht'
   */
  searchInputAriaLabel?: string;

  /**
   * Label van de zoek-submitknop in het zoekpaneel.
   * @default 'Zoeken'
   */
  searchSubmitLabel?: string;

  /**
   * `aria-label` van de primaire navigatie-`<nav>` (large viewport) en
   * visueel verborgen heading in de Drawer.
   * @default 'Hoofd-navigatie'
   */
  primaryNavAriaLabel?: string;

  /**
   * `aria-label` van het servicemenu-`<nav>` (large viewport) en
   * visueel verborgen heading in de Drawer.
   * @default 'Service-navigatie'
   */
  secondaryNavAriaLabel?: string;

  /**
   * Verbergt de menuknop in de small viewport layout.
   * Gebruik dit wanneer er geen navigatie aanwezig is (bijv. formulierpagina's).
   * @default false
   */
  hideMenuButton?: boolean;

  /**
   * Verbergt de zoekknop in zowel de small viewport als compact layout.
   * Gebruik dit wanneer zoeken niet relevant is (bijv. formulierpagina's).
   * @default false
   */
  hideSearchButton?: boolean;

  className?: string;
}

/**
 * PageHeader component
 * Primaire navigatieheader voor een pagina. Mobile-first implementatie.
 *
 * Op mobile toont de header drie elementen:
 * - Menuknop (inline-start) — opent een `Drawer` met primaire en service-navigatie
 * - Logo (gecentreerd, onafhankelijk van knopbreedte via CSS-grid 1fr auto 1fr)
 * - Zoekknop (inline-end) — opent een zoekpaneel direct onder de header
 *
 * @example
 * ```tsx
 * <PageHeader
 *   logoSlot={
 *     <a href="/">
 *       <Logo aria-hidden={true} />
 *       <span className="dsn-visually-hidden">Starter Kit — terug naar homepage</span>
 *     </a>
 *   }
 *   primaryNavigation={
 *     <Menu orientation="vertical">
 *       <MenuLink href="/home" level={1}>Home</MenuLink>
 *       <MenuLink href="/over" level={1}>Over ons</MenuLink>
 *     </Menu>
 *   }
 *   secondaryNavigation={
 *     <Menu orientation="vertical">
 *       <MenuLink href="/contact" level={1}>Contact</MenuLink>
 *     </Menu>
 *   }
 * />
 * ```
 */
export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      className,
      logoSlot,
      sticky = 'none',
      layout = 'default',
      colorScheme = 'default',
      initialSearchOpen = false,
      primaryNavigation,
      primaryNavigationLarge,
      secondaryNavigation,
      secondaryNavigationLarge,
      searchSlot,
      menuButtonBadge,
      menuButtonBadgeLabel,
      onMenuOpen,
      onMenuClose,
      onSearchOpen,
      onSearchClose,
      menuButtonLabel = 'Menu',
      searchButtonLabel = 'Zoeken',
      closeButtonLabel = 'Sluiten',
      searchInputPlaceholder = 'Zoeken…',
      searchInputAriaLabel = 'Zoekopdracht',
      searchSubmitLabel = 'Zoeken',
      primaryNavAriaLabel = 'Hoofd-navigatie',
      secondaryNavAriaLabel = 'Service-navigatie',
      hideMenuButton = false,
      hideSearchButton = false,
      ...props
    },
    ref
  ) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(initialSearchOpen);

    const headerRef = React.useRef<HTMLElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLElement>) ?? headerRef;

    const menuButtonRef = React.useRef<HTMLButtonElement>(null);
    const searchButtonRef = React.useRef<HTMLButtonElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const compactSearchButtonRef = React.useRef<HTMLButtonElement>(null);
    const compactSearchInputRef = React.useRef<HTMLInputElement>(null);

    const searchPanelId = React.useId();
    const compactSearchPanelId = React.useId();

    // Auto-hide: detecteer scrollrichting en toggle data-hidden attribuut
    React.useEffect(() => {
      if (sticky !== 'auto-hide') return;

      let lastScrollY = window.scrollY;

      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const isScrollingDown =
          currentScrollY > lastScrollY && currentScrollY > 100;
        combinedRef.current?.setAttribute(
          'data-hidden',
          String(isScrollingDown)
        );
        lastScrollY = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, [sticky, combinedRef]);

    // Drop-shadow: zet data-scrolled op "true" zodra de pagina gescrolled is.
    // Werkt voor zowel sticky als auto-hide — ongeacht scrollrichting.
    React.useEffect(() => {
      if (sticky === 'none') return;

      const updateScrolled = () => {
        combinedRef.current?.setAttribute(
          'data-scrolled',
          String(window.scrollY > 0)
        );
      };

      // Direct bij mount instellen (pagina kan al gescrolled zijn)
      updateScrolled();

      window.addEventListener('scroll', updateScrolled, { passive: true });
      return () => window.removeEventListener('scroll', updateScrolled);
    }, [sticky, combinedRef]);

    // Focus management: bij openen zoekpaneel → focus naar input (klein of compact)
    React.useEffect(() => {
      if (isSearchOpen) {
        searchInputRef.current?.focus();
        compactSearchInputRef.current?.focus();
      }
    }, [isSearchOpen]);

    const handleMenuOpen = () => {
      setIsMenuOpen(true);
      onMenuOpen?.();
    };

    const handleMenuClose = () => {
      setIsMenuOpen(false);
      onMenuClose?.();
      // Focus terug naar menuknop
      menuButtonRef.current?.focus();
    };

    const handleSearchToggle = () => {
      const opening = !isSearchOpen;
      setIsSearchOpen(opening);
      if (opening) {
        onSearchOpen?.();
      } else {
        onSearchClose?.();
        // Focus terug naar zoek/sluit-knop — afhankelijk van actieve layout
        searchButtonRef.current?.focus();
        compactSearchButtonRef.current?.focus();
      }
    };

    const classes = classNames(
      'dsn-page-header',
      sticky === 'sticky' && 'dsn-page-header--sticky',
      sticky === 'auto-hide' && 'dsn-page-header--auto-hide',
      layout === 'compact' && 'dsn-page-header--compact',
      colorScheme === 'inverse' && 'dsn-page-header--inverse',
      className
    );

    return (
      <>
        <header
          ref={combinedRef}
          className={classes}
          {...(sticky === 'auto-hide' ? { 'data-hidden': 'false' } : {})}
          {...props}
        >
          {/* ----------------------------------------------------------------
              Small viewport layout (verborgen boven 64em via CSS display:none)
              ---------------------------------------------------------------- */}
          <div className="dsn-page-header__small-layout">
            <div className="dsn-page-header__inner">
              {/* Inline-start: menuknop */}
              <div className="dsn-page-header__start">
                {!hideMenuButton && (
                  <Button
                    ref={menuButtonRef}
                    variant="subtle"
                    onClick={handleMenuOpen}
                    iconStart={<Icon name="menu" aria-hidden />}
                  >
                    {menuButtonLabel}
                    {menuButtonBadgeLabel && (
                      <span className="dsn-visually-hidden">
                        , {menuButtonBadgeLabel}
                      </span>
                    )}
                    {menuButtonBadge}
                  </Button>
                )}
              </div>

              {/* Gecentreerd logo */}
              <div className="dsn-page-header__logo">{logoSlot}</div>

              {/* Inline-end: zoekknop / sluitknop */}
              <div className="dsn-page-header__end">
                {!hideSearchButton && (
                  <Button
                    ref={searchButtonRef}
                    variant="subtle"
                    aria-expanded={isSearchOpen}
                    aria-controls={searchPanelId}
                    onClick={handleSearchToggle}
                    iconStart={
                      <Icon name={isSearchOpen ? 'x' : 'search'} aria-hidden />
                    }
                  >
                    {isSearchOpen ? closeButtonLabel : searchButtonLabel}
                  </Button>
                )}
              </div>
            </div>

            {/* Zoekpaneel */}
            <div
              id={searchPanelId}
              className="dsn-page-header__search-panel"
              hidden={!isSearchOpen}
            >
              <div className="dsn-page-header__search-inner">
                <SearchInput
                  ref={searchInputRef}
                  placeholder={searchInputPlaceholder}
                  aria-label={searchInputAriaLabel}
                />
                <Button variant="strong">{searchSubmitLabel}</Button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              Large viewport layout (zichtbaar boven 64em, alleen bij layout="default")
              ---------------------------------------------------------------- */}
          {layout === 'default' && (
            <div className="dsn-page-header__large-layout">
              {/* Masthead: neutrale achtergrond — logo + servicemenu + zoek */}
              <div className="dsn-page-header__masthead">
                <div className="dsn-page-header__masthead-inner">
                  <div className="dsn-page-header__logo">{logoSlot}</div>

                  <div className="dsn-page-header__secondary-nav">
                    {(secondaryNavigationLarge ?? secondaryNavigation) && (
                      <nav aria-label={secondaryNavAriaLabel}>
                        {secondaryNavigationLarge ?? secondaryNavigation}
                      </nav>
                    )}
                    {searchSlot && (
                      <div className="dsn-page-header__searchbox">
                        {searchSlot}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigatiebalk: accent-1 achtergrond — primaire navigatie (large viewport) */}
              <div className="dsn-page-header__navbar">
                <div className="dsn-page-header__navbar-inner">
                  {(primaryNavigationLarge ?? primaryNavigation) && (
                    <nav aria-label={primaryNavAriaLabel}>
                      {primaryNavigationLarge ?? primaryNavigation}
                    </nav>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              Compact layout (zichtbaar boven 64em wanneer layout="compact")
              Eén rij: logo (1fr) | primaire navigatie (auto) | servicemenu + zoek (1fr)
              ---------------------------------------------------------------- */}
          {layout === 'compact' && (
            <div className="dsn-page-header__compact-layout">
              <div className="dsn-page-header__compact-inner">
                {/* Logo — inline-start (eerste gridkolom) */}
                <div className="dsn-page-header__logo">{logoSlot}</div>

                {/* Primaire navigatie — gecentreerd (middelste gridkolom)
                    Gebruikt primaryNavigationLarge als aanwezig, anders primaryNavigation.
                    Dit garandeert dat de Drawer altijd de verticale variant ontvangt. */}
                <div className="dsn-page-header__compact-primary-nav">
                  {(primaryNavigationLarge ?? primaryNavigation) && (
                    <nav aria-label={primaryNavAriaLabel}>
                      {primaryNavigationLarge ?? primaryNavigation}
                    </nav>
                  )}
                </div>

                {/* Servicemenu + zoekknop (icon-only) — inline-end (derde gridkolom) */}
                <div className="dsn-page-header__compact-secondary">
                  {(secondaryNavigationLarge ?? secondaryNavigation) && (
                    <nav aria-label={secondaryNavAriaLabel}>
                      {secondaryNavigationLarge ?? secondaryNavigation}
                    </nav>
                  )}
                  {!hideSearchButton && (
                    <Button
                      ref={compactSearchButtonRef}
                      variant="subtle"
                      iconOnly
                      aria-expanded={isSearchOpen}
                      aria-controls={compactSearchPanelId}
                      onClick={handleSearchToggle}
                      iconStart={
                        <Icon
                          name={isSearchOpen ? 'x' : 'search'}
                          aria-hidden
                        />
                      }
                    >
                      {isSearchOpen ? closeButtonLabel : searchButtonLabel}
                    </Button>
                  )}
                </div>
              </div>

              {/* Zoekpaneel compact layout */}
              <div
                id={compactSearchPanelId}
                className="dsn-page-header__search-panel"
                hidden={!isSearchOpen}
              >
                <div className="dsn-page-header__search-inner">
                  <SearchInput
                    ref={compactSearchInputRef}
                    placeholder={searchInputPlaceholder}
                    aria-label={searchInputAriaLabel}
                  />
                  <Button variant="strong">{searchSubmitLabel}</Button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Navigatielade (sibling aan PageHeader, altijd in DOM) */}
        <Drawer
          isOpen={isMenuOpen}
          onClose={handleMenuClose}
          side="left"
          triggerRef={menuButtonRef}
        >
          <DrawerHeader>
            <DrawerHeading>{menuButtonLabel}</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Stack space="5xl">
              {primaryNavigation && (
                <nav aria-label={primaryNavAriaLabel}>{primaryNavigation}</nav>
              )}
              {secondaryNavigation && (
                <nav aria-label={secondaryNavAriaLabel}>
                  {secondaryNavigation}
                </nav>
              )}
            </Stack>
          </DrawerBody>
        </Drawer>
      </>
    );
  }
);

PageHeader.displayName = 'PageHeader';
