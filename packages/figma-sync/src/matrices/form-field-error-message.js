/**
 * Variant-matrix voor FormFieldErrorMessage.
 *
 * Een flexrij met een icoon dat via `color: inherit` de foutkleur van de
 * tekst overneemt. Dat is precies het geval waar de cascade-nabootsing voor
 * uitgebreid is: `inherit` is een verwijzing en geen waarde, dus zonder
 * doorlopen naar de ouder zou het icoon een vaste kleur krijgen en de
 * theme-schakelaar niet volgen.
 *
 * De tekstlengte is geen as: het frame staat op HUG (`hugRoot`) en groeit mee
 * met de foutmelding die de designer zelf typt.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'FormFieldErrorMessage',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/form-field-error-message/form-field-error-message.css',
  ],

  wrapperStyle: 'width: 343px;',

  // Geen assen: dit component heeft niets dat per variant verschilt. Een
  // component set in Figma moet een as hebben, dus dit wordt geen set maar een
  // los component. Zie "Een matrix zonder assen" in de README.
  hugRoot: true,

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render() {
    return `<p class="dsn-form-field-error-message" data-figma-root>
      ${icon('exclamation-circle')}
      <span data-figma-slot="label">${TEKST}</span>
    </p>`;
  },
};
