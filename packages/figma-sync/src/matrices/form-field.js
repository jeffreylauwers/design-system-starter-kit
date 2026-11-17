/**
 * Variant-matrix voor FormField.
 *
 * De omhulling die label, beschrijving, foutmelding, control en status bij
 * elkaar houdt. De `invalid`-stand is geen kleurtje maar een echte
 * layoutwijziging: een dikke rand aan de inline-start plus extra
 * `padding-inline-start`, dus dat hoort op een as.
 *
 * Let op: de tekstvelden en labels hierin zijn gemeten lagen en geen instances
 * van de FormFieldLabel- en TextInput-sets. Dat is de kern van issue #369; tot
 * dat opgelost is levert een wijziging aan FormFieldLabel geen wijziging op in
 * de FormField-set, en moet die opnieuw gegenereerd worden.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

import { FLAG } from '../flags.js';

export default {
  component: 'FormField',

  // Het label, de beschrijving, de foutmelding en het veld zijn instances van
  // hun eigen sets. Het label rendert daarom dezelfde opbouw als
  // FormFieldLabel, mét de suffix: die staat in de instance uit via
  // `showSuffix`, net als in de losse set. Zonder die laag verschilt de opbouw
  // en is er niets om een override op te leggen.
  //
  // De breedte van het veld staat er expliciet bij. De varianten van
  // `inlineSize` verschillen alleen in breedte, en breedte vergelijkt de
  // generator bewust niet (die hoort bij de plek in de host), dus de meting
  // kan er niet tussen kiezen.
  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/form-field-label/form-field-label.css',
    '@dsn-starter-kit/components-html/src/form-field-description/form-field-description.css',
    '@dsn-starter-kit/components-html/src/form-field-error-message/form-field-error-message.css',
    '@dsn-starter-kit/components-html/src/form-field-status/form-field-status.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/form-field/form-field.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    invalid: FLAG,
    description: ['with-description', 'no-description'],
    // `no-status` eerst: bij een herimport gaat een bestaande variant over in
    // de eerste waarde van een nieuwe as, en die had geen status.
    status: ['no-status', 'with-status'],
  },

  // De statusregel onder het veld is een FormFieldStatus-instance. Een as en
  // geen boolean: de varianten met een beschrijving hebben geen auto layout
  // (de ruimte komt uit ongelijke marges), en daar liet een verborgen laag 32px
  // lege ruimte onder het veld staan. De variant (`statusVariant` in code)
  // kiest een designer op de instance; die is exposed.
  render({ invalid: isInvalid, description, status }) {
    const invalid = isInvalid === 'true';

    const classes = ['dsn-form-field', invalid && 'dsn-form-field--invalid']
      .filter(Boolean)
      .join(' ');

    const descriptionMarkup =
      description === 'with-description'
        ? `<p class="dsn-form-field-description">${TEKST}</p>`
        : '';

    const errorMarkup = invalid
      ? `<p class="dsn-form-field-error-message">
           ${icon('exclamation-circle')}
           <span>${TEKST}</span>
         </p>`
      : '';

    const statusMarkup =
      status === 'with-status'
        ? `<p class="dsn-form-field-status"><span data-figma-slot="label">${TEKST}</span></p>`
        : '';

    return `<div class="${classes}" data-figma-root>
      <label class="dsn-form-field-label">
        <span>${TEKST}</span>
        <span class="dsn-form-field-label-suffix">(niet verplicht)</span>
      </label>
      ${descriptionMarkup}
      ${errorMarkup}
      <input type="text" class="dsn-text-input" data-figma-variant="inlineSize=auto"${invalid ? ' aria-invalid="true"' : ''}>
      ${statusMarkup}
    </div>`;
  },
};
