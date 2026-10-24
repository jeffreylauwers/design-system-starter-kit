/**
 * Variant-matrix voor het list item van IconList.
 *
 * In code het BEM-element `dsn-icon-list__item`, geen eigen component. In Figma
 * een eigen set, zodat de IconList uit instances van één item bestaat.
 *
 * Het icoon is hier een instance swap en geen as. Welk icoon er staat
 * verandert geen gemeten token, alleen welke laag er staat; dat is de regel
 * uit "Wat wordt een as en wat wordt een property?". Daarmee heeft het item
 * geen assen, en kiest een designer per item een icoon.
 *
 * Geen geneste weergave: een IconList springt niet in (`padding-inline-start:
 * 0`) en tekent geen `::marker`.
 *
 * Elk item is een flexrij met het icoon op `align-items: flex-start`, zodat het
 * icoon bij de eerste tekstregel blijft staan als de tekst afbreekt.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'IconListItem',
  setName: 'dsn-icon-list-item',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/icon-list/icon-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    { name: 'icon', type: 'INSTANCE_SWAP', slot: 'icon', default: 'check' },
  ],

  render() {
    return `<ul class="dsn-icon-list" role="list">
      <li class="dsn-icon-list__item" data-figma-root>
        ${icon('check', { className: 'dsn-icon-list__icon', slot: 'icon' })}
        <span data-figma-slot="label">${TEKST}</span>
      </li>
    </ul>`;
  },
};
