/**
 * Variant-matrix voor RadioGroup.
 *
 * Zelfde afweging als CheckboxGroup: één gap-token, maar wel een ontwerpbesluit
 * dat in Figma afleesbaar hoort te zijn. En net als daar staan de opties in
 * een slot, met drie RadioOptions als standaardinhoud.
 */

import { TEKST } from '../text.js';

export default {
  component: 'RadioGroup',

  instances: true,

  // Een RadioOption is in CSS `width: fit-content`, net als een
  // CheckboxOption: hij krimpt om zijn tekst en breekt pas af bij de rand van
  // de groep. In Figma vullen de opties de groep, zie CheckboxGroup.
  fillRootChildren: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/radio/radio.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/radio-option/radio-option.css',
    '@dsn-starter-kit/components-html/src/radio-group/radio-group.css',
  ],

  wrapperStyle: 'width: 328px;',

  render() {
    // De opties staan in een slot; een designer zet er zelf opties bij of
    // haalt ze weg. Drie is de standaardinhoud.
    const count = 3;

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

    return `<div class="dsn-radio-group" role="radiogroup" data-figma-root data-figma-children="slot">${items}</div>`;
  },
};
