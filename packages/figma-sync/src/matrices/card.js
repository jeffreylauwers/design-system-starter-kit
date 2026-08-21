/**
 * Variant-matrix voor Card.
 *
 * Card is de test voor nesting: een flex-kolom met header, body en footer,
 * waarbij de body zelf ook weer een flex-kolom is. Als de generator hier een
 * bruikbare boom oplevert, houdt de aanpak ook voor samengestelde componenten.
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
    header: ['with-header', 'no-header'],
    footer: ['with-footer', 'no-footer'],
  },

  render({ header, footer }) {
    const headerMarkup =
      header === 'with-header'
        ? `<div class="dsn-card__header">
             <div class="dsn-card__image-placeholder"></div>
           </div>`
        : '';

    const footerMarkup =
      footer === 'with-footer'
        ? `<div class="dsn-card__footer">
             <span class="dsn-link">${TEKST}</span>
           </div>`
        : '';

    return `<div class="dsn-card" data-figma-root>
      ${headerMarkup}
      <div class="dsn-card__body">
        <h3 class="dsn-card-heading">${HEADING}</h3>
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
      ${footerMarkup}
    </div>`;
  },
};
