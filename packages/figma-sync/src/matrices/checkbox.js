/**
 * Variant-matrix voor Checkbox.
 *
 * Checkbox is de test voor niet-stromende layout: de native input en de
 * custom control liggen allebei absoluut over elkaar heen. De input is
 * bovendien volledig doorzichtig en wordt door de extractor overgeslagen.
 *
 * Let op: de CSS van dit component staat in components-react en niet in
 * components-html, anders dan het twee-lagen-patroon voorschrijft. De css-lijst
 * hieronder wijst daarom naar een ander package dan bij de overige matrices.
 *
 * Het vinkje komt uit de assets-map, net als in `Checkbox.tsx` (`<Icon
 * name="check">`). Het stond hier eerst als overgetypt pad op `stroke-width=3`,
 * en dat is precies waarom overtypen niet werkt: het asset tekent op 2 met
 * ronde uiteinden, dus de Figma-checkbox week af van het component zonder dat
 * iets dat meldde.
 */

import { icon } from '../icons.js';

export default {
  component: 'Checkbox',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-react/src/Checkbox/Checkbox.css',
  ],

  axes: {
    state: ['unchecked', 'checked', 'indeterminate'],
    interaction: ['default', 'hover', 'disabled'],
  },

  pseudoStates: { hover: 'hover' },

  /**
   * `:indeterminate` is geen attribuut maar een DOM-property, dus die is niet
   * in markup te zetten. Dit draait in de pagina voordat er gemeten wordt.
   */
  domSetup: `
    for (const input of document.querySelectorAll('input[data-indeterminate]')) {
      input.indeterminate = true;
    }
  `,

  render({ state, interaction }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = interaction === 'disabled' ? ' disabled' : '';
    const iconName = state === 'indeterminate' ? 'minus' : 'check';
    const indeterminate =
      state === 'indeterminate' ? ' data-indeterminate' : '';

    return `<div class="dsn-checkbox" data-figma-root>
      <input type="checkbox" class="dsn-checkbox__input"${checked}${disabled}${indeterminate}>
      <span class="dsn-checkbox__control" aria-hidden="true">
        ${icon(iconName, { className: 'dsn-checkbox__icon' })}
      </span>
    </div>`;
  },
};
