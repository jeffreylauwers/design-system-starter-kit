/**
 * Variant-matrix voor PageHeader.
 *
 * Het zwaarste component van het systeem: 603 regels CSS en drie layouts die
 * elkaar per viewport aflossen. De small-layout is altijd in de DOM en wordt
 * boven 64em met `display: none` verborgen; de large- en compact-layout zijn
 * daaronder onzichtbaar.
 *
 * Wij meten mobile-first op 375px, dus wat hier in Figma landt is de
 * small-layout. Dat is geen keuze maar een gevolg: de andere twee zijn op deze
 * breedte `display: none` en leveren dus niets op om te meten. Zie de warning
 * hieronder.
 *
 * `sticky` en `auto-hide` staan bewust niet op een as. Die veranderen `position`
 * en een `data-hidden`-attribuut, en dat is scrollgedrag: in Figma is er geen
 * verschil te zien tussen een sticky en een niet-sticky header.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'PageHeader',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/logo/logo.css',
    '@dsn-starter-kit/components-html/src/page-header/page-header.css',
  ],

  wrapperStyle: 'width: 375px;',

  warnings: [
    'alleen de small-layout komt mee. De large- en compact-layout zijn onder 64em `display: none`, en de meetviewport is mobile-first 375px. Die twee vragen om een eigen matrix op 1440px, met een eigen setnaam.',
  ],

  axes: {
    colorScheme: ['default', 'inverse'],
  },

  render({ colorScheme }) {
    const classes = [
      'dsn-page-header',
      colorScheme === 'inverse' && 'dsn-page-header--inverse',
    ]
      .filter(Boolean)
      .join(' ');

    const iconButton = (name, label) =>
      `<button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default">
         ${icon(name)}
         <span class="dsn-button__label">${label}</span>
       </button>`;

    return `<header class="${classes}" data-figma-root>
      <div class="dsn-page-header__small-layout">
        <div class="dsn-page-header__inner">
          <div class="dsn-page-header__start">${iconButton('menu', TEKST)}</div>
          <div class="dsn-page-header__logo">
            <svg class="dsn-logo" xmlns="http://www.w3.org/2000/svg" width="186" height="48" viewBox="0 0 186 48" fill="none" role="img" aria-label="Starter Kit">
              <path class="dsn-logo__primary" d="M0 0h185.491v48H0z"/>
              <path class="dsn-logo__label" d="M8 8h169.491v32H8z"/>
            </svg>
          </div>
          <div class="dsn-page-header__end">${iconButton('search', TEKST)}</div>
        </div>
      </div>
    </header>`;
  },
};
