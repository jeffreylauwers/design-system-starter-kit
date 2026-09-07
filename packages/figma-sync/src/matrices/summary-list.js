/**
 * Variant-matrix voor SummaryList.
 *
 * Een `<dl>` met per rij een key, een value en optioneel een actie. De termen
 * heten in de docs bewust key en value, niet sleutelcel en waardecel.
 *
 * Let op de meetviewport: vanaf een bredere viewport zet de CSS de rij op
 * `display: grid` met `grid-template-columns: subgrid`. Wij meten mobile-first
 * op 375px, dus wat in Figma landt is de gestapelde flex-variant. De
 * kolomindeling van de desktopweergave zit er dus niet in.
 */

import { TEKST } from '../text.js';

export default {
  component: 'SummaryList',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/summary-list/summary-list.css',
  ],

  wrapperStyle: 'width: 343px;',

  warnings: [
    'gemeten op 375px, dus dit is de gestapelde weergave. Vanaf een bredere viewport zet de CSS de rij op `display: grid` met `subgrid`, en die kolomindeling zit hier niet in.',
  ],

  axes: {
    border: ['with-border', 'no-border'],
    actions: ['with-actions', 'no-actions'],
  },

  render({ border, actions }) {
    const classes = [
      'dsn-summary-list',
      border === 'no-border' && 'dsn-summary-list--no-border',
    ]
      .filter(Boolean)
      .join(' ');

    const actionMarkup =
      actions === 'with-actions'
        ? `<dd class="dsn-summary-list__actions">
             <ul class="dsn-summary-list__actions-list">
               <li class="dsn-summary-list__actions-list-item"><span class="dsn-link">${TEKST}</span></li>
             </ul>
           </dd>`
        : '';

    const row = () =>
      `<div class="dsn-summary-list__row">
         <dt class="dsn-summary-list__key">${TEKST}</dt>
         <dd class="dsn-summary-list__value">${TEKST}</dd>
         ${actionMarkup}
       </div>`;

    return `<dl class="${classes}" data-figma-root>${row()}${row()}</dl>`;
  },
};
