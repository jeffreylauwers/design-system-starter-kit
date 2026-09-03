/**
 * Variant-matrix voor UnorderedList.
 *
 * Let op de beperking hieronder: de bolletjes komen niet mee. `::marker` is
 * een pseudo-element en dus geen DOM-node, terwijl de extractor de DOM
 * afloopt. Wat er wél in Figma landt is alles wat het component verder is:
 * typografie, kleur, de inspringing (`padding-inline-start`) en de afstand
 * tussen items.
 *
 * Toch genereren en niet overslaan: die tokens zijn het component, en een
 * designer die de lijst in Figma nabouwt heeft ze nodig. Het bolletje zet hij
 * er met een Figma-lijststijl bij.
 */

import { TEKST } from '../text.js';

export default {
  component: 'UnorderedList',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/unordered-list/unordered-list.css',
  ],

  wrapperStyle: 'width: 343px;',

  warnings: [
    'de bolletjes ontbreken: `::marker` is een pseudo-element en geen DOM-node, dus er valt niets te meten. De inspringing en de afstand tussen items komen wel mee; zet het bolletje in Figma met een lijststijl.',
  ],

  axes: {
    length: ['single-item', 'multiple-items'],
  },

  render({ length }) {
    const items =
      length === 'single-item' ? [TEKST] : [TEKST, `${TEKST} ${TEKST}`, TEKST];

    return `<ul class="dsn-unordered-list" data-figma-root>
      ${items.map((item) => `<li>${item}</li>`).join('')}
    </ul>`;
  },
};
