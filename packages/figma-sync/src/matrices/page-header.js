/**
 * Variant-matrix voor PageHeader.
 *
 * Het zwaarste component van het systeem: 603 regels CSS en drie layouts die
 * elkaar per viewport aflossen. De small-layout is altijd in de DOM en wordt
 * boven 64em met `display: none` verborgen; de large- en compact-layout zijn
 * daaronder onzichtbaar.
 *
 * Daarom meet deze matrix op twee viewports in plaats van op één. De `viewport`
 * -as kiest de breedte: `small` op 375px (de layout van een telefoon, en de
 * header loopt daar van rand tot rand, dus de wrapper is net zo breed als de
 * viewport) en `large` op 1440px. `modesForMatrix` leidt uit die breedte af
 * welke mode van `dsn/Density` geldt, dus de bindingen van de small-varianten
 * worden tegen `default-mobile` geverifieerd en die van de large-varianten
 * tegen `default-desktop`.
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
 * De navigatie en het zoekveld zijn hier gemeten lagen en geen instances van
 * Menu, MenuLink, SearchInput en Button. Zie issue #369.
 */

import { icon } from '../icons.js';

/** De logo-svg zoals PageHeader hem plaatst. */
const LOGO = `<div class="dsn-page-header__logo">
  <svg class="dsn-logo" xmlns="http://www.w3.org/2000/svg" width="186" height="48" viewBox="0 0 186 48" fill="none" role="img" aria-label="Starter Kit">
    <path class="dsn-logo__primary" d="M0 0h185.491v48H0z"/>
    <path class="dsn-logo__label" d="M8 8h169.491v32H8z"/>
  </svg>
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

const menu = (items) => `<ul class="dsn-menu dsn-menu--horizontal">
  ${items
    .map(
      (item) => `<li class="dsn-menu-link">
      <a class="dsn-menu-link__link" href="/"${item.current ? ' aria-current="page"' : ''}>
        <span class="dsn-menu-link__label">${item.label}</span>
      </a>
    </li>`
    )
    .join('\n  ')}
</ul>`;

const iconButton = (name, label) =>
  `<button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default">
     ${icon(name)}
     <span class="dsn-button__label">${label}</span>
   </button>`;

const SEARCHBOX = `<div class="dsn-page-header__searchbox">
  <div class="dsn-search-input-wrapper">
    ${icon('search', { className: 'dsn-search-input__icon' })}
    <input type="search" class="dsn-text-input dsn-search-input" placeholder="Zoeken" aria-label="Zoekopdracht">
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

  axes: {
    layout: ['default', 'compact'],
    colorScheme: ['default', 'inverse'],
    viewport: ['small', 'large'],
  },

  // De as die de meetbreedte kiest, en de breedtes zelf. Een header loopt van
  // rand tot rand en zet zijn eigen padding, dus de wrapper is hier net zo
  // breed als de viewport en niet 343 zoals bij een component dat binnen de
  // paginabreedte staat.
  viewportAxis: 'viewport',
  viewports: {
    small: { width: 375, wrapperStyle: 'width: 375px;' },
    large: { width: 1440, wrapperStyle: 'width: 1440px;' },
  },

  render({ layout, colorScheme }) {
    const classes = [
      'dsn-page-header',
      layout === 'compact' && 'dsn-page-header--compact',
      colorScheme === 'inverse' && 'dsn-page-header--inverse',
    ]
      .filter(Boolean)
      .join(' ');

    const smallLayout = `<div class="dsn-page-header__small-layout">
      <div class="dsn-page-header__inner">
        <div class="dsn-page-header__start">${iconButton('menu', 'Menu')}</div>
        ${LOGO}
        <div class="dsn-page-header__end">${iconButton('search', 'Zoeken')}</div>
      </div>
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
          ${iconButton('search', 'Zoeken')}
        </div>
      </div>
    </div>`;

    return `<header class="${classes}" data-figma-root>
      ${smallLayout}
      ${layout === 'compact' ? compactLayout : largeLayout}
    </header>`;
  },
};
