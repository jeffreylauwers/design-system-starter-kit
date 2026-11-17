/**
 * Variant-matrix voor IconList.
 *
 * Een slot met 3 instances van `__item` (`dsn-icon-list__item`) als
 * standaardinhoud. Het icoon is in het item een instance swap, dus kiest een
 * designer het per item; de set zelf heeft geen assen.
 *
 * IconList tekent zijn markering met een echt `<svg>` in plaats van met
 * `::marker`, en springt niet in. Het item is het BEM-element
 * `dsn-icon-list__item` en geen `cssBlock`, dus `data-figma-instance` wijst
 * het aan.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';
import { ITEM_COUNT } from './unordered-list.js';

export default {
  component: 'IconList',

  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/icon-list/icon-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  render() {
    const items = Array.from(
      { length: ITEM_COUNT },
      () =>
        `<li class="dsn-icon-list__item" data-figma-instance="dsn-icon-list__item">
           ${icon('check', { className: 'dsn-icon-list__icon', slot: 'icon' })}
           <span data-figma-slot="label">${TEKST}</span>
         </li>`
    ).join('');

    return `<ul class="dsn-icon-list" role="list" data-figma-root data-figma-children="slot">${items}</ul>`;
  },
};
