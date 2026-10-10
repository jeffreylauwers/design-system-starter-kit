/**
 * Variant-matrix voor BreadcrumbNavigation.
 *
 * Een `<ol>` met per item een link, een chevron als scheiding en een laatste
 * item zonder link. De scheiding staat achter élk item; de CSS verbergt hem bij
 * het laatste, en de extractor slaat een verborgen element over.
 *
 * De compacte variant is een container query, geen andere markup: onder 32rem
 * verbergt hij alle items en toont alleen `:nth-last-child(2)`, het
 * bovenliggende niveau, met een pijl terug. Boven die breedte toont hij
 * hetzelfde volledige kruimelpad als de default-variant. Beide varianten
 * renderen daarom dezelfde volledige lijst en de CSS bepaalt wat er zichtbaar
 * is. Met één item in de markup matcht die selector niets en blijft het hele
 * component leeg.
 *
 * Daarom staat die breedte op een as. Op `viewport=small` is de compacte
 * variant ingeklapt, op `large` niet; de default-variant verschilt tussen de
 * twee in breedte en in de fluid typografie.
 *
 * Het terug-icoon staat in élk item; het is standaard `display: none` en de
 * container query zet het alleen in het ouder-item aan. De extractor slaat een
 * verborgen element over, dus in Figma komt het terecht op de plek waar het
 * zichtbaar is.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'BreadcrumbNavigation',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/breadcrumb-navigation/breadcrumb-navigation.css',
  ],

  axes: {
    appearance: ['default', 'compact'],
    viewport: ['small', 'large'],
  },

  // De compacte variant klapt in zolang het component zelf 32rem (512px) of
  // smaller is, en dat hangt aan de wrapper en niet aan de viewport: het is een
  // container query. De viewport schuift toch mee, want een breadcrumb van
  // 1168px staat in werkelijkheid op een desktoppagina, en daar staat de fluid
  // typografie op haar bovengrens en `dsn/Density` op `default-desktop`. Zou de
  // viewport op 375 blijven, dan kwam er een variant uit die in de browser niet
  // bestaat: desktopbreedte met mobiele typografie.
  viewportAxis: 'viewport',
  viewports: {
    small: { width: 375, wrapperStyle: 'width: 343px;' },
    large: { width: 1440, wrapperStyle: 'width: 1168px;' },
  },

  render({ appearance }) {
    const separator = icon('chevron-right', {
      className: 'dsn-breadcrumb-navigation__separator',
    });
    const backIcon = icon('arrow-left', {
      className: 'dsn-breadcrumb-navigation__back-icon',
    });

    const item = (current) =>
      current
        ? `<li class="dsn-breadcrumb-navigation__item dsn-breadcrumb-navigation__item--current" aria-current="page">${TEKST}${separator}</li>`
        : `<li class="dsn-breadcrumb-navigation__item">
             <a href="#" class="dsn-breadcrumb-navigation__link">${backIcon}${TEKST}</a>
             ${separator}
           </li>`;

    const classes = [
      'dsn-breadcrumb-navigation',
      appearance === 'compact' && 'dsn-breadcrumb-navigation--compact',
    ]
      .filter(Boolean)
      .join(' ');

    return `<nav class="${classes}" data-figma-root>
      <ol class="dsn-breadcrumb-navigation__list">
        ${item(false)}${item(false)}${item(true)}
      </ol>
    </nav>`;
  },
};
