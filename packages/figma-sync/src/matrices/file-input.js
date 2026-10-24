/**
 * Variant-matrix voor FileInput.
 *
 * Het enige veld dat zijn eigen knop meebrengt: `::file-selector-button` is een
 * pseudo-element, dus die knop is geen DOM-node en komt in Figma niet als
 * aparte laag terug. Wat er wel overkomt is het veld eromheen met zijn randen
 * en padding.
 *
 * Anders dan `::marker` bij de lijsten is er geen laag van te maken: de knop
 * heeft een eigen rand, padding en tekst, en die zijn niet als één teken na
 * te tekenen. Daarom expliciet gemeld in plaats van stil gelaten.
 */

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'FileInput',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/file-input/file-input.css',
  ],

  wrapperStyle: 'width: 328px;',

  warnings: [
    'de knop "Bestand kiezen" ontbreekt: die is `::file-selector-button`, een pseudo-element en dus geen DOM-node. Het veld eromheen komt wel volledig over.',
  ],

  axes: {
    state: ['default', 'hover', 'focus'],
    disabled: FLAG,
    invalid: FLAG,
  },

  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { state: 'default' },
  }),

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render(variant) {
    const disabled = variant.disabled === 'true' ? ' disabled' : '';
    const invalid = variant.invalid === 'true' ? ' aria-invalid="true"' : '';

    return `<input type="file" class="dsn-file-input"${disabled}${invalid} data-figma-root>`;
  },
};
