/**
 * Variant-matrix voor Table.
 *
 * De zwaarste vertaling van allemaal: een `<table>` is `display: table`, een
 * layoutmodel dat Figma niet kent. Wat het wél is, is een verticale stapel
 * rijen waarvan de cellen naast elkaar staan, en dat is precies verticale en
 * horizontale auto layout. De promotie van blokelementen doet dat nu, en dit
 * component is de reden dat die ook horizontaal moest werken.
 *
 * De sorteerknop in een kolomkop staat er bewust in: die is een echte
 * `<button>` met drie icoonstanden, en zonder een gesorteerde kolom in de
 * matrix zie je in Figma alleen de neutrale stand.
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

    const sortIcon =
      sort === 'ascending'
        ? icon('sort-ascending', {
            className: 'dsn-table__sort-icon dsn-table__sort-icon--ascending',
          })
        : icon('arrows-sort', {
            className: 'dsn-table__sort-icon dsn-table__sort-icon--none',
          });

    const headerCell = (sortable) =>
      sortable
        ? `<th scope="col">
             <button type="button" class="dsn-table__sort-button">
               <span class="dsn-table__header-content">${TEKST}${sortIcon}</span>
             </button>
           </th>`
        : `<th scope="col">${TEKST}</th>`;

    const bodyRow = () =>
      `<tr>
         <th scope="row">${TEKST}</th>
         <td>${TEKST}</td>
       </tr>`;

    return `<div class="dsn-table-wrapper" data-figma-root>
      <table class="dsn-table">
        ${captionMarkup}
        <thead><tr>${headerCell(true)}${headerCell(false)}</tr></thead>
        <tbody>${bodyRow()}${bodyRow()}</tbody>
      </table>
    </div>`;
  },
};
