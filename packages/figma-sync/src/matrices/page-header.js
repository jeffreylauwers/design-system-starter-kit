/**
 * Variant-matrix voor PageHeader.
 *
 * Het zwaarste component van het systeem: 603 regels CSS en drie layouts die
 * elkaar per viewport aflossen. De small-layout is altijd in de DOM en wordt
 * boven 64em met `display: none` verborgen; de large- en compact-layout zijn
 * daaronder onzichtbaar.
 *
 * Daarom meet deze matrix op twee viewports in plaats van op één. De `viewport`
 * -as kiest de breedte: `small` op 360px (de layout van een telefoon, en de
 * header loopt daar van rand tot rand, dus de wrapper is net zo breed als de
 * viewport) en `large` op 1440px. `modesForMatrix` leidt uit die breedte af
 * welke mode van `dsn/Density` geldt, dus de bindingen van de small-varianten
 * worden tegen `start-default-vp-small` geverifieerd en die van de large-varianten
 * tegen `start-default-vp-large`.
 *
 * De assen volgen de props van Storybook, zodat een designer dezelfde knoppen
 * ziet als een developer: `layout` (default/compact) en `colorScheme`
 * (default/inverse). Op `viewport=small` is er tussen `layout=default` en
 * `layout=compact` geen verschil te zien, precies zoals in de browser: beide
 * layouts zijn daar verborgen en de mobiele balk staat er. Die twee varianten
 * zijn dus met opzet gelijk en niet weggelaten.
 *
 * `sticky` en `auto-hide` staan bewust niet op een as. Die veranderen `position`
 * en een `data-hidden`-attribuut, en dat is scrollgedrag: in Figma is er geen
 * verschil te zien tussen een sticky en een niet-sticky header.
 *
 * `searchOpen` is `initialSearchOpen`: het zoekpaneel onder de balk, met een
 * sluitknop. Alleen op small en in de compact-layout; de large-layout heeft
 * het zoekveld altijd in de balk.
 *
 * De knoppen zijn Button-instances en de zoekvelden SearchInput-instances,
 * exposed, zodat een designer de labels en de placeholder op de instance
 * aanpast. De navigatie blijft een gemeten laag (zie `menu`).
 */

import { icon } from '../icons.js';
import { axisValues } from '../manifest.js';
import { logo } from '../logo.js';
import { fieldTextAttributes } from '../field-text.js';

/** De logo-svg zoals PageHeader hem plaatst. */
const LOGO = `<div class="dsn-page-header__logo">
  ${logo()}
</div>`;

/** De items van de hoofdnavigatie; dezelfde als in de Storybook-template. */
const PRIMARY_ITEMS = [
  { label: 'Homepage' },
  { label: 'Level 1a', current: true },
  { label: 'Level 1b' },
  { label: 'Level 1c' },
];

/** De items van het servicemenu. */
const SECONDARY_ITEMS = [{ label: 'English' }, { label: 'Mijn omgeving' }];

/**
 * De navigatie blijft een gemeten laag. De horizontale menu-items wijken in
 * opbouw af van de MenuLink-set (geen icoon- en expand-lagen), en dat valt
 * buiten de open punten van #497.
 */
const menu = (
  items
) => `<ul class="dsn-menu dsn-menu--horizontal" data-figma-instance="none">
  ${items
    .map(
      (item) => `<li class="dsn-menu-link" data-figma-instance="none">
      <a class="dsn-menu-link__link" href="/"${item.current ? ' aria-current="page"' : ''}>
        <span class="dsn-menu-link__label">${item.label}</span>
      </a>
    </li>`
    )
    .join('\n  ')}
</ul>`;

/**
 * Een icoon dat in de Button-set een laag is maar hier niet getoond wordt. De
 * set heeft een icoon vooraan en achteraan; een instance moet die lagen ook
 * hebben. In de browser nemen ze zo geen ruimte in, in Figma staan ze uit.
 */
const hiddenIcon = (name, slot) =>
  icon(name, { slot }).replace(
    '<svg ',
    '<svg style="position: absolute; clip-path: inset(50%);" '
  );

/**
 * Een knop als instance van de Button-set, met het icoon vooraan aan.
 * `slot` is de laag die een BOOLEAN-property van PageHeader aan- en uitzet.
 */
const iconButton = (name, label, slot) =>
  `<button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default" data-figma-slot="${slot}" data-figma-variant="variant=subtle,size=default,state=default" data-figma-properties="showIconStart=true">
     ${icon(name, { slot: 'icon-start' })}
     <span class="dsn-button__label" data-figma-slot="label">${label}</span>
     ${hiddenIcon('chevron-right', 'icon-end')}
   </button>`;

/** De icon-only zoekknop van de compact-layout. */
const iconOnlyButton = (name, label, slot) =>
  `<button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default dsn-button--icon-only" data-figma-slot="${slot}" data-figma-variant="variant=subtle,size=default,state=default">
     ${icon(name, { slot: 'icon' })}
     <span class="dsn-button__label" data-figma-slot="label">${label}</span>
   </button>`;

/** Een SearchInput-instance met alleen de placeholder. */
const searchInput = (
  placeholder
) => `<div class="dsn-search-input-wrapper" data-figma-instance="dsn-search-input" data-figma-variant="inlineSize=auto">
    ${icon('search', { className: 'dsn-search-input__icon' })}
    <input type="search" class="dsn-text-input dsn-search-input" data-figma-instance="none"${fieldTextAttributes({ showPlaceholder: 'true' }, { placeholder })} aria-label="Zoekopdracht">
  </div>`;

/** Het zoekveld rechtsboven in de large-layout (`searchSlot`). */
const SEARCHBOX = `<div class="dsn-page-header__searchbox" data-figma-slot="searchbox">
  ${searchInput('Zoeken')}
</div>`;

/**
 * Het zoekpaneel onder de balk, zoals React het rendert zodra de zoekknop
 * open is: een zoekveld en een knop. Alleen in de DOM bij `searchOpen=open`;
 * dicht heeft het `hidden` en meet het niets.
 */
const SEARCH_PANEL = `<div class="dsn-page-header__search-panel">
  <div class="dsn-page-header__search-inner">
    ${searchInput('Zoeken…')}
    <button type="button" class="dsn-button dsn-button--strong dsn-button--size-default" data-figma-slot="search-submit" data-figma-variant="variant=strong,size=default,state=default">
      ${hiddenIcon('chevron-left', 'icon-start')}
      <span class="dsn-button__label" data-figma-slot="label">Zoeken</span>
      ${hiddenIcon('chevron-right', 'icon-end')}
    </button>
  </div>
</div>`;

export default {
  component: 'PageHeader',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/logo/logo.css',
    '@dsn-starter-kit/components-html/src/menu/menu.css',
    '@dsn-starter-kit/components-html/src/menu-link/menu-link.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/search-input/search-input.css',
    '@dsn-starter-kit/components-html/src/page-header/page-header.css',
  ],

  instances: true,

  axes: {
    layout: axisValues('PageHeader', 'layout'),
    colorScheme: axisValues('PageHeader', 'colorScheme'),
    viewport: ['small', 'large'],
    // `initialSearchOpen`: het zoekpaneel onder de balk, en de zoekknop wordt
    // een sluitknop. Een as en geen boolean: het paneel verandert de hoogte,
    // en de knop krijgt een ander icoon en label.
    searchOpen: ['closed', 'open'],
  },

  // Op large is er bij `layout=default` geen zoekknop en geen paneel: het
  // zoekveld staat daar altijd in de balk.
  skipVariant: ({ layout, viewport, searchOpen }) =>
    searchOpen === 'open' && viewport === 'large' && layout === 'default',

  /**
   * Aan en uit, zoals `hideMenuButton`, `hideSearchButton` en `searchSlot` in
   * React. Optioneel: de menuknop bestaat alleen op small, de zoekknop op
   * small en in de compact-layout, het zoekveld alleen in de large-layout.
   */
  componentProperties: [
    {
      name: 'showMenuButton',
      type: 'BOOLEAN',
      slot: 'menu-button',
      default: true,
      optional: true,
    },
    {
      name: 'showSearchButton',
      type: 'BOOLEAN',
      slot: 'search-button',
      default: true,
      optional: true,
    },
    {
      name: 'showSearchbox',
      type: 'BOOLEAN',
      slot: 'searchbox',
      default: true,
      optional: true,
    },
  ],

  // De as die de meetbreedte kiest, en de breedtes zelf. Een header loopt van
  // rand tot rand en zet zijn eigen padding, dus de wrapper is hier net zo
  // breed als de viewport en niet 328 zoals bij een component dat binnen de
  // paginabreedte staat.
  viewportAxis: 'viewport',
  viewports: {
    small: { width: 360, wrapperStyle: 'width: 360px;' },
    large: { width: 1440, wrapperStyle: 'width: 1440px;' },
  },

  render({ layout, colorScheme, searchOpen }) {
    const open = searchOpen === 'open';
    const searchButton = open
      ? iconButton('x', 'Sluiten', 'search-button')
      : iconButton('search', 'Zoeken', 'search-button');
    const compactSearchButton = open
      ? iconOnlyButton('x', 'Sluiten', 'search-button')
      : iconOnlyButton('search', 'Zoeken', 'search-button');

    const classes = [
      'dsn-page-header',
      layout === 'compact' && 'dsn-page-header--compact',
      colorScheme === 'inverse' && 'dsn-page-header--inverse',
    ]
      .filter(Boolean)
      .join(' ');

    const smallLayout = `<div class="dsn-page-header__small-layout">
      <div class="dsn-page-header__inner">
        <div class="dsn-page-header__start">${iconButton('menu', 'Menu', 'menu-button')}</div>
        ${LOGO}
        <div class="dsn-page-header__end">${searchButton}</div>
      </div>
      ${open ? SEARCH_PANEL : ''}
    </div>`;

    // Net als in `PageHeader.tsx`: de large-layout staat alleen in de DOM bij
    // `layout="default"` en de compact-layout alleen bij `layout="compact"`.
    const largeLayout = `<div class="dsn-page-header__large-layout">
      <div class="dsn-page-header__masthead">
        <div class="dsn-page-header__masthead-inner">
          ${LOGO}
          <div class="dsn-page-header__secondary-nav">
            <nav aria-label="Service-navigatie">${menu(SECONDARY_ITEMS)}</nav>
            ${SEARCHBOX}
          </div>
        </div>
      </div>
      <div class="dsn-page-header__navbar">
        <div class="dsn-page-header__navbar-inner">
          <nav aria-label="Hoofd-navigatie">${menu(PRIMARY_ITEMS)}</nav>
        </div>
      </div>
    </div>`;

    const compactLayout = `<div class="dsn-page-header__compact-layout">
      <div class="dsn-page-header__compact-inner">
        ${LOGO}
        <div class="dsn-page-header__compact-primary-nav">
          <nav aria-label="Hoofd-navigatie">${menu(PRIMARY_ITEMS)}</nav>
        </div>
        <div class="dsn-page-header__compact-secondary">
          <nav aria-label="Service-navigatie">${menu(SECONDARY_ITEMS)}</nav>
          ${compactSearchButton}
        </div>
      </div>
      ${open ? SEARCH_PANEL : ''}
    </div>`;

    return `<header class="${classes}" data-figma-root>
      ${smallLayout}
      ${layout === 'compact' ? compactLayout : largeLayout}
    </header>`;
  },
};
