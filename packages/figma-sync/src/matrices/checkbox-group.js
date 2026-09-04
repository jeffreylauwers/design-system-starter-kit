/**
 * Variant-matrix voor CheckboxGroup.
 *
 * Een flexkolom met een vaste gap tussen de opties: precies één token, en
 * verder niets eigens. Dat maakt hem grensgeval voor de regel over
 * layoutcomponenten uit de README.
 *
 * Toch een matrix, en niet overgeslagen als "layoutgedrag": de gap is een
 * ontwerpbesluit dat je in Figma moet kunnen aflezen, en anders dan bij Stack
 * of Grid staat hier vast wát erin zit. Een designer die drie opties onder
 * elkaar zet moet niet zelf hoeven raden hoeveel ruimte ertussen hoort.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'CheckboxGroup',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/checkbox/checkbox.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/checkbox-option/checkbox-option.css',
    '@dsn-starter-kit/components-html/src/checkbox-group/checkbox-group.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    options: ['two-options', 'three-options'],
  },

  render({ options }) {
    const count = options === 'two-options' ? 2 : 3;

    const option = (checked) =>
      `<label class="dsn-checkbox-option">
         <span class="dsn-checkbox">
           <input type="checkbox" class="dsn-checkbox__input"${checked ? ' checked' : ''}>
           <span class="dsn-checkbox__control" aria-hidden="true">
             ${icon('check', { className: 'dsn-checkbox__icon' })}
           </span>
         </span>
         <span class="dsn-option-label">${TEKST}</span>
       </label>`;

    const items = Array.from({ length: count }, (_, index) =>
      option(index === 0)
    ).join('');

    return `<div class="dsn-checkbox-group" role="group" data-figma-root>${items}</div>`;
  },
};
