/**
 * Variant-matrix voor Radio.
 *
 * Zelfde opbouw als Checkbox: een doorzichtige native input met daarover een
 * absoluut gepositioneerde control. Het verschil is dat de gevulde staat hier
 * een geneste `<span>` is (`__inner-circle`) in plaats van een icoon, dus dit
 * toetst of een element dat alleen via border-radius rond is correct
 * doorkomt.
 *
 * Radio kent geen indeterminate-toestand.
 *
 * Let op: de CSS staat in components-react in plaats van components-html.
 * Zie het issue over de ontbrekende HTML/CSS-laag voor formuliercontrols.
 */

export default {
  component: 'Radio',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-react/src/Radio/Radio.css',
  ],

  axes: {
    state: ['unchecked', 'checked'],
    interaction: ['default', 'hover', 'disabled'],
  },

  pseudoStates: { hover: 'hover' },

  render({ state, interaction }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = interaction === 'disabled' ? ' disabled' : '';

    return `<div class="dsn-radio" data-figma-root>
      <input type="radio" name="demo" class="dsn-radio__input"${checked}${disabled}>
      <span class="dsn-radio__control" aria-hidden="true">
        <span class="dsn-radio__inner-circle"></span>
      </span>
    </div>`;
  },
};
