/**
 * Variant-matrix voor BreadcrumbNavigation.
 *
 * Een `<ol>` met per item een link, een chevron als scheiding en een laatste
 * item zonder link. De scheiding staat achter élk item; de CSS verbergt hem bij
 * het laatste, en de extractor slaat een verborgen element over.
 *
 * De compacte variant is een container query, geen andere markup: hij verbergt
 * alle items en toont alleen `:nth-last-child(2)`, het bovenliggende niveau,
 * met een pijl terug. Beide varianten renderen daarom dezelfde volledige lijst
 * en de CSS bepaalt wat er zichtbaar is. Met één item in de markup matcht die
 * selector niets en blijft het hele component leeg.
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
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/breadcrumb-navigation/breadcrumb-navigation.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    appearance: ['default', 'compact'],
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
