/**
 * Variant-matrix voor TextArea.
 *
 * Zelfde tokens als TextInput, maar met een eigen `min-block-size` voor
 * meerdere regels en `resize: vertical`. Dat laatste heeft in Figma geen
 * tegenhanger; wat overkomt is de hoogte waarmee het veld begint.
 */

export default {
  component: 'TextArea',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/text-area/text-area.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'hover', 'focus', 'disabled', 'invalid'],
    width: ['auto', 'md', 'full'],
  },

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ state, width }) {
    const classes = [
      'dsn-text-area',
      width !== 'auto' && `dsn-text-area--width-${width}`,
    ]
      .filter(Boolean)
      .join(' ');

    const disabled = state === 'disabled' ? ' disabled' : '';
    const invalid = state === 'invalid' ? ' aria-invalid="true"' : '';

    return `<textarea class="${classes}" placeholder="Tekst"${disabled}${invalid} data-figma-root></textarea>`;
  },
};
