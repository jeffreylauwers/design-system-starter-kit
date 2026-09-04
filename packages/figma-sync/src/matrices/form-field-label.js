/**
 * Variant-matrix voor FormFieldLabel.
 *
 * Het label met een optioneel suffix ("(optioneel)"), dat een eigen kleur en
 * gewicht heeft en dus een eigen laag met een eigen binding wordt.
 *
 * De marge onder het label verschilt met `:has(+ .dsn-form-field-description)`:
 * staat er een beschrijving achter, dan is de marge kleiner. Dat is een gemeten
 * verschil, dus het staat op een as en niet op een boolean. In Figma zelf zie
 * je die marge niet (een component set draagt geen marges naar buiten), maar de
 * binding legt wel vast wélk token het is.
 */

import { TEKST } from '../text.js';

export default {
  component: 'FormFieldLabel',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/form-field-label/form-field-label.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    suffix: ['with-suffix', 'no-suffix'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ suffix }) {
    const suffixMarkup =
      suffix === 'with-suffix'
        ? `<span class="dsn-form-field-label-suffix">(optioneel)</span>`
        : '';

    return `<label class="dsn-form-field-label" data-figma-root>
      <span data-figma-slot="label">${TEKST}</span>
      ${suffixMarkup}
    </label>`;
  },
};
