/**
 * Variant-matrix voor Card.
 *
 * Card is de test voor nesting: een flex-kolom met pre-header, header, body en
 * footer, waarbij de secties zelf ook weer flex-kolommen zijn. Als de generator
 * hier een bruikbare boom oplevert, houdt de aanpak ook voor samengestelde
 * componenten.
 *
 * De header staat in de DOM vóór de pre-header (DR-2026-11); de pre-header komt
 * visueel bovenaan via `order: -1`. De generator meet posities, dus in Figma
 * staat de pre-header gewoon bovenaan.
 *
 * Card gebruikt daarnaast box-shadow en overflow:hidden, dus dit is meteen de
 * test of die twee correct als waarschuwing respectievelijk clipsContent
 * terechtkomen.
 */

import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Card',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/card/card.css',
  ],

  // Mobile-first: 375px viewport met 16px padding aan weerszijden.
  wrapperStyle: 'width: 343px;',

  axes: {
    preHeader: ['with-pre-header', 'no-pre-header'],
    footer: ['with-footer', 'no-footer'],
  },

  render({ preHeader, footer }) {
    const preHeaderMarkup =
      preHeader === 'with-pre-header'
        ? `<div class="dsn-card__pre-header">
             <div class="dsn-card__image-placeholder"></div>
           </div>`
        : '';

    const footerMarkup =
      footer === 'with-footer'
        ? `<div class="dsn-card__footer">
             <span class="dsn-card__affordance">${TEKST}</span>
           </div>`
        : '';

    return `<div class="dsn-card" data-figma-root>
      <div class="dsn-card__header">
        <h3 class="dsn-card__heading">${HEADING}</h3>
      </div>
      ${preHeaderMarkup}
      <div class="dsn-card__body">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
      ${footerMarkup}
    </div>`;
  },
};
