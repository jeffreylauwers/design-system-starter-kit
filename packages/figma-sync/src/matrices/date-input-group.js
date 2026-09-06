/**
 * Variant-matrix voor DateInputGroup.
 *
 * Drie losse velden voor dag, maand en jaar, elk met een eigen label erboven.
 * De buitenste flexrij lijnt uit op `flex-end`, zodat de velden op één lijn
 * staan ook als een label over twee regels loopt.
 *
 * De velden hierin zijn gemeten lagen en geen instances van de TextInput-set;
 * zie issue #369.
 */

/** Zoals in DateInputGroup.tsx: dag en maand krijgen `xs`, het jaar `sm`. */
const FIELDS = [
  { label: 'Dag', width: 'xs', value: '01' },
  { label: 'Maand', width: 'xs', value: '01' },
  { label: 'Jaar', width: 'sm', value: '2026' },
];

export default {
  component: 'DateInputGroup',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/form-field-label/form-field-label.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/date-input-group/date-input-group.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'invalid'],
  },

  render({ state }) {
    const invalid = state === 'invalid' ? ' aria-invalid="true"' : '';

    const fields = FIELDS.map(
      ({ label, width, value }) =>
        `<div class="dsn-date-input-group__field">
           <label class="dsn-date-input-group__label">${label}</label>
           <input type="text" inputmode="numeric" class="dsn-text-input dsn-text-input--width-${width}" value="${value}"${invalid}>
         </div>`
    ).join('');

    return `<div class="dsn-date-input-group" data-figma-root>${fields}</div>`;
  },
};
