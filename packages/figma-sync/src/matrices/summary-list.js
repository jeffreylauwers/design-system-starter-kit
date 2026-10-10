/**
 * Variant-matrix voor SummaryList.
 *
 * Een `<dl>` met per rij een key, een value en optioneel een actie. De termen
 * heten in de docs bewust key en value, niet sleutelcel en waardecel.
 *
 * Twee weergaven, en ze staan allebei in Figma. Onder 44em is de rij een
 * gestapelde flexkolom; vanaf 44em zet de CSS de lijst op `display: grid` met
 * drie kolommen en de rij op `grid-template-columns: subgrid`. De `viewport`-as
 * kiest de meetbreedte: `small` op 375px met een wrapper van 343, `large` op
 * 1440px met een wrapper van 1168. Die 1168 is waar SummaryList in een pagina
 * staat: `--dsn-page-max-inline-size` (75rem) min twee keer
 * `--dsn-page-body-padding-inline` (16px).
 *
 * Figma kent geen subgrid. De rij krijgt daarom de tracks van de lijst
 * opgelegd; zie `resolveSubgrid` in to-figma.js.
 */

import { TEKST } from '../text.js';

export default {
  component: 'SummaryList',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/summary-list/summary-list.css',
  ],

  axes: {
    border: ['with-border', 'no-border'],
    actions: ['with-actions', 'no-actions'],
    viewport: ['small', 'large'],
  },

  // SummaryList staat binnen `dsn-page-body__inner`, dus de brede meting is de
  // inhoudsbreedte van een desktoppagina: `--dsn-page-max-inline-size` (75rem)
  // min twee keer `--dsn-page-body-padding-inline` (16px). De viewport zelf
  // moet wel 1440 zijn, want de layout-switch is een media query op 44em.
  viewportAxis: 'viewport',
  viewports: {
    small: { width: 375, wrapperStyle: 'width: 343px;' },
    large: { width: 1440, wrapperStyle: 'width: 1168px;' },
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
