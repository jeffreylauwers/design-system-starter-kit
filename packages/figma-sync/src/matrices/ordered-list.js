/**
 * Variant-matrix voor OrderedList.
 *
 * Zelfde opbouw als UnorderedList: een slot met 3 instances van `__item`
 * (`dsn-ordered-list__item`) als standaardinhoud. Het nummer is in het item
 * een TEXT-property (`number`), en de lijst zet 1 tot en met 3 neer. Een
 * instance weet niet op welke plek hij staat, dus wie een item toevoegt of
 * weghaalt nummert zelf door; zie de toelichting bij het item.
 */

import { TEKST } from '../text.js';
import { ITEM_COUNT } from './unordered-list.js';

export default {
  component: 'OrderedList',

  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/ordered-list/ordered-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  render() {
    const items = Array.from(
      { length: ITEM_COUNT },
      () =>
        `<li data-figma-instance="dsn-ordered-list__item" data-figma-marker-slot="number"><span data-figma-slot="label">${TEKST}</span></li>`
    ).join('');

    return `<ol class="dsn-ordered-list" data-figma-root data-figma-children="slot">${items}</ol>`;
  },
};
