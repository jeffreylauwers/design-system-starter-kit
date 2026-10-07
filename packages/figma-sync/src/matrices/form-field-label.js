/**
 * Variant-matrix voor FormFieldLabel.
 *
 * Het label met een optioneel suffix ("(optioneel)"), dat een eigen kleur en
 * gewicht heeft en dus een eigen laag met een eigen binding wordt.
 *
 * Het suffix staat altijd in de markup en is in Figma een BOOLEAN-property,
 * net als de iconen van Button. Dat is de enige opzet waarin een designer
 * zowel het suffix aan en uit kan zetten als zijn tekst kan typen: een
 * TEXT-property moet in élke variant een laag hebben, en op een as met
 * `false` zou die laag er niet zijn. Figma toont een BOOLEAN net zo als een
 * as met twee waarden, namelijk als schakelaar, dus in het panel is het
 * verschil er niet.
 *
 * De marge onder het label verschilt met `:has(+ .dsn-form-field-description)`:
 * staat er een beschrijving achter, dan is de marge kleiner. In Figma zie je
 * die marge niet (een component set draagt geen marges naar buiten), maar de
 * binding legt wel vast wélk token het is.
 */

import { TEKST } from '../text.js';

export default {
  component: 'FormFieldLabel',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/form-field-label/form-field-label.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    appearance: ['default'],
  },

  // Twee properties op dezelfde laag: de boolean zet hem aan en uit, de
  // TEXT-property vult zijn tekst. Dezelfde opzet als `showIconStart` en
  // `iconStart` bij Button.
  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    { name: 'showSuffix', type: 'BOOLEAN', slot: 'suffix', default: false },
    { name: 'suffix', type: 'TEXT', slot: 'suffix' },
  ],

  render() {
    return `<label class="dsn-form-field-label" data-figma-root>
      <span data-figma-slot="label">${TEKST}</span>
      <span class="dsn-form-field-label-suffix" data-figma-slot="suffix">(optioneel)</span>
    </label>`;
  },
};
