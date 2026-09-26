/**
 * Variant-matrix voor TextInput.
 *
 * Het referentieveld van het hele formulier: elk ander tekstveld erft zijn
 * padding, randen en `min-block-size` hiervan. Dat laatste is de 48px die het
 * aanraakdoel uit WCAG 2.5.5 haalt, en een leeg frame zonder auto layout zou
 * die maat in Figma verliezen.
 *
 * De maten staan op een as en niet op een property, want `--inline-size-md` zet een
 * `max-inline-size` en verandert dus de gemeten breedte. Geen maat opgeven is
 * ook een stand, en die heet hier `auto`.
 *
 * `invalid` komt van `aria-invalid="true"` en niet van `:invalid`: die tweede
 * hangt van een validatiepatroon af, en in een matrix zonder formulier levert
 * dat een toestand op die van de inhoud afhangt in plaats van van de variant.
 */

import {
  FIELD_TEXT_AXES,
  FIELD_TEXT_PROPERTIES,
  fieldTextAttributes,
} from '../field-text.js';
import { TEKST } from '../text.js';

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'TextInput',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'hover', 'focus'],
    disabled: FLAG,
    invalid: FLAG,
    ...FIELD_TEXT_AXES,
    inlineSize: ['auto', 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
  },

  componentProperties: FIELD_TEXT_PROPERTIES,

  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { state: 'default' },
  }),

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ inlineSize, ...variant }) {
    const classes = [
      'dsn-text-input',
      inlineSize !== 'auto' && `dsn-text-input--inline-size-${inlineSize}`,
    ]
      .filter(Boolean)
      .join(' ');

    const disabled = variant.disabled === 'true' ? ' disabled' : '';
    const invalid = variant.invalid === 'true' ? ' aria-invalid="true"' : '';

    const text = fieldTextAttributes(variant, {
      value: TEKST,
      placeholder: 'Placeholder',
    });

    return `<input type="text" class="${classes}"${text}${disabled}${invalid} data-figma-root>`;
  },
};
