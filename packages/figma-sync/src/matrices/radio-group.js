/**
 * Variant-matrix voor RadioGroup.
 *
 * Zelfde afweging als CheckboxGroup: één gap-token, maar wel een ontwerpbesluit
 * dat in Figma afleesbaar hoort te zijn.
 */

import { TEKST } from '../text.js';

export default {
  component: 'RadioGroup',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-react/src/Radio/Radio.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/radio-option/radio-option.css',
    '@dsn-starter-kit/components-html/src/radio-group/radio-group.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    options: ['two-options', 'three-options'],
  },

  render({ options }) {
    const count = options === 'two-options' ? 2 : 3;

    const option = (checked) =>
      `<label class="dsn-radio-option">
         <span class="dsn-radio">
           <input type="radio" name="demo" class="dsn-radio__input"${checked ? ' checked' : ''}>
           <span class="dsn-radio__control" aria-hidden="true">
             <span class="dsn-radio__inner-circle"></span>
           </span>
         </span>
         <span class="dsn-option-label">${TEKST}</span>
       </label>`;

    const items = Array.from({ length: count }, (_, index) =>
      option(index === 0)
    ).join('');

    return `<div class="dsn-radio-group" role="radiogroup" data-figma-root>${items}</div>`;
  },
};
