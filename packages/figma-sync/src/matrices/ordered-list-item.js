/**
 * Variant-matrix voor het list item van OrderedList.
 *
 * Zelfde opbouw als het item van UnorderedList: een rij met een markerkolom en
 * de tekst, de kolom zo breed als de inspringing van de lijst. Het verschil is
 * de marker. Een nummer volgt in de browser uit de positie van het item, en dat
 * kan Figma niet: een instance weet niet waar hij staat. Het nummer is daarom
 * een TEXT-property, `number`, naast `label`. De lijst zet 1 tot en met 10 neer;
 * zet een designer er een uit, dan nummert hij zelf door.
 *
 * Een geneste OrderedList begint in de CSS weer bij 1, op elk niveau. Dat is
 * wat `level` hier laat zien: alleen de inspringing verschilt.
 */

import { TEKST } from '../text.js';

export default {
  component: 'OrderedListItem',
  setName: 'dsn-ordered-list-item',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/ordered-list/ordered-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    level: ['1', '2', '3'],
  },

  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    { name: 'number', type: 'TEXT', slot: 'number' },
  ],

  render({ level }) {
    // `data-figma-marker-slot` hangt de property aan de markerlaag die de
    // extractor maakt; in de markup is er geen element voor.
    const item = `<li data-figma-root data-figma-marker-slot="number"><span data-figma-slot="label">${TEKST}</span></li>`;

    let markup = `<ol class="dsn-ordered-list">${item}</ol>`;
    for (let depth = 1; depth < Number(level); depth += 1) {
      markup = `<ol class="dsn-ordered-list"><li>${TEKST}${markup}</li></ol>`;
    }
    return markup;
  },
};
