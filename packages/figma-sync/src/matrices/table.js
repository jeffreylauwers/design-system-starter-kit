/**
 * Variant-matrix voor Table.
 *
 * De zwaarste vertaling van allemaal: een `<table>` is `display: table`, een
 * layoutmodel dat Figma niet kent. Wat het wél is, is een verticale stapel
 * rijen waarvan de cellen naast elkaar staan, en dat is precies verticale en
 * horizontale auto layout. De promotie van blokelementen doet dat nu, en dit
 * component is de reden dat die ook horizontaal moest werken.
 *
 * De sorteerknop is een echte `dsn-button` in de subtle-variant, icon-only, met
 * alle drie de sorteericonen erin; de CSS toont de juiste op basis van
 * `aria-sort` op de `<th>`. Zonder een gesorteerde kolom in de matrix zie je in
 * Figma alleen de neutrale stand, dus die staat op een as.
 *
 * `table.css` declareert `@dsn-depends-on: button`, dus button.css hoort in de
 * css-lijst hieronder. Zonder die import krijgt de knop de standaard
 * knop-chrome van de browser en blijft het label naast het icoon staan.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'Table',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/table/table.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    caption: ['with-caption', 'no-caption'],
    sort: ['unsorted', 'ascending'],
  },

  render({ caption, sort }) {
    const captionMarkup =
      caption === 'with-caption'
        ? `<caption class="dsn-table__caption">${TEKST}</caption>`
        : '';

    // Alle drie de iconen staan in de knop; de CSS kiest op `aria-sort` welke
    // er zichtbaar is. Dat is ook waarom `sort` een as is en geen property: de
    // stand zit op de `<th>` en bepaalt wat er getekend wordt.
    const sortIcons = [
      icon('arrows-sort', { className: 'dsn-table__sort-icon--none' }),
      icon('sort-ascending', { className: 'dsn-table__sort-icon--ascending' }),
      icon('sort-descending', {
        className: 'dsn-table__sort-icon--descending',
      }),
    ].join('');

    const sortableHeader = () =>
      `<th scope="col" aria-sort="${sort === 'ascending' ? 'ascending' : 'none'}">
         <span class="dsn-table__header-content">
           ${TEKST}
           <button type="button" class="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button">
             ${sortIcons}
             <span class="dsn-button__label">Sorteer op ${TEKST}</span>
           </button>
         </span>
       </th>`;

    const bodyRow = () =>
      `<tr>
         <th scope="row">${TEKST}</th>
         <td>${TEKST}</td>
       </tr>`;

    return `<div class="dsn-table-wrapper" data-figma-root>
      <table class="dsn-table">
        ${captionMarkup}
        <thead><tr>${sortableHeader()}<th scope="col">${TEKST}</th></tr></thead>
        <tbody>${bodyRow()}${bodyRow()}</tbody>
      </table>
    </div>`;
  },
};
