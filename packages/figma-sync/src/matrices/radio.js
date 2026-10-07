/**
 * Variant-matrix voor Radio.
 *
 * Zelfde opbouw als Checkbox: een doorzichtige native input met daarover een
 * absoluut gepositioneerde control. Het verschil is dat de gevulde staat hier
 * een geneste `<span>` is (`__inner-circle`) in plaats van een icoon, dus dit
 * toetst of een element dat alleen via border-radius rond is correct
 * doorkomt.
 *
 * Radio kent geen indeterminate-toestand.
 *
 * Zelfde valkuil als bij Checkbox: deze matrix wees naar de re-export in
 * components-react, en die is nog maar een `@import`. Een `@import` lost in een
 * inline `<style>` niet op, dus de Radio werd ongestyled gemeten.
 */

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'Radio',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/radio/radio.css',
  ],

  axes: {
    state: ['unchecked', 'checked'],
    interaction: ['default', 'hover', 'active'],
    disabled: FLAG,
    invalid: FLAG,
  },

  // `invalid` staat net als `disabled` alleen op de rustende stand: de CSS
  // heeft geen eigen stijl voor invalid én hover.
  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { interaction: 'default' },
  }),

  pseudoStates: { hover: 'hover', active: 'active' },

  render({ state, disabled: isDisabled, invalid }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = isDisabled === 'true' ? ' disabled' : '';
    const inputClasses = [
      'dsn-radio__input',
      invalid === 'true' && 'dsn-radio__input--invalid',
    ]
      .filter(Boolean)
      .join(' ');

    return `<div class="dsn-radio" data-figma-root>
      <input type="radio" name="demo" class="${inputClasses}"${checked}${disabled}>
      <span class="dsn-radio__control" aria-hidden="true">
        <span class="dsn-radio__inner-circle"></span>
      </span>
    </div>`;
  },
};
