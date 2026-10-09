/**
 * Variant-matrix voor FormFieldDescription.
 *
 * Uitleg onder een label. Bewust één laag zonder opsmuk: uit toegankelijkheids-
 * onderzoek met VoiceOver volgde dat er geen lijst en geen link in een
 * description hoort, dus die staan hier ook niet in de matrix. Wat er wel in
 * mag is een regelafbreking, maar daarvoor is geen eigen variant nodig: de
 * laag staat op HUG en groeit mee met de tekst die de designer typt, dus de
 * regelhoogte is op elke lengte te zien.
 */

import { TEKST } from '../text.js';

export default {
  component: 'FormFieldDescription',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/form-field-description/form-field-description.css',
  ],

  wrapperStyle: 'width: 343px;',

  // Geen assen: dit component heeft niets dat per variant verschilt. Een
  // component set in Figma moet een as hebben, dus dit wordt geen set maar een
  // los component. Zie "Een matrix zonder assen" in de README.
  hugRoot: true,

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render() {
    return `<p class="dsn-form-field-description" data-figma-root data-figma-slot="label">${TEKST}</p>`;
  },
};
