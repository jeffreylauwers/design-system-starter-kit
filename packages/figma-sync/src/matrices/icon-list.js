/**
 * Variant-matrix voor IconList.
 *
 * De enige lijst die wél volledig overkomt. IconList zet `list-style: none` en
 * tekent zijn markering met een echt `<svg>`-element in plaats van met
 * `::marker`, dus er valt hier wel iets te meten. Dat is meteen het verschil
 * dat de twee andere lijsten laat zien: een marker die een element is komt in
 * Figma aan, een pseudo-element niet.
 *
 * Elk item is een flexrij met het icoon op `align-items: flex-start`, zodat
 * het icoon bij de eerste tekstregel blijft staan als de tekst afbreekt. Het
 * item met twee regels staat er daarom bewust in.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'IconList',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/icon-list/icon-list.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    icon: ['check', 'circle-check', 'x'],
  },

  render({ icon: iconName }) {
    const item = (text) =>
      `<li class="dsn-icon-list__item">
         ${icon(iconName, { className: 'dsn-icon-list__icon' })}
         <span>${text}</span>
       </li>`;

    return `<ul class="dsn-icon-list" role="list" data-figma-root>
      ${item(TEKST)}
      ${item(`${TEKST} ${TEKST} ${TEKST} ${TEKST} ${TEKST} ${TEKST} ${TEKST}`)}
    </ul>`;
  },
};
