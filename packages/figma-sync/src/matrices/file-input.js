/**
 * Variant-matrix voor FileInput.
 *
 * Het enige veld dat zijn eigen knop meebrengt: `::file-selector-button` is een
 * pseudo-element, dus die knop is geen DOM-node en komt in Figma niet als
 * aparte laag terug. Wat er wel overkomt is het veld eromheen met zijn randen
 * en padding.
 *
 * Zelfde soort beperking als `::marker` bij de lijsten, en om dezelfde reden
 * expliciet gemeld in plaats van stil gelaten.
 */

export default {
  component: 'FileInput',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/file-input/file-input.css',
  ],

  wrapperStyle: 'width: 343px;',

  warnings: [
    'de knop "Bestand kiezen" ontbreekt: die is `::file-selector-button`, een pseudo-element en dus geen DOM-node. Het veld eromheen komt wel volledig over.',
  ],

  axes: {
    state: ['default', 'hover', 'focus', 'disabled', 'invalid'],
  },

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ state }) {
    const disabled = state === 'disabled' ? ' disabled' : '';
    const invalid = state === 'invalid' ? ' aria-invalid="true"' : '';

    return `<input type="file" class="dsn-file-input"${disabled}${invalid} data-figma-root>`;
  },
};
