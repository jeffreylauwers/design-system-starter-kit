/**
 * Variant-matrix voor Checkbox.
 *
 * Checkbox is de test voor niet-stromende layout: de native input en de
 * custom control liggen allebei absoluut over elkaar heen. De input is
 * bovendien volledig doorzichtig en wordt door de extractor overgeslagen.
 *
 * Let op: de CSS van dit component staat in components-react en niet in
 * components-html, anders dan het twee-lagen-patroon voorschrijft. De css-lijst
 * hieronder wijst daarom naar een ander package dan bij de overige matrices.
 */

const ICONS = {
  check: `<path d="M5 12l5 5L20 7"/>`,
  minus: `<path d="M5 12h14"/>`,
};

export default {
  component: 'Checkbox',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-react/src/Checkbox/Checkbox.css',
  ],

  axes: {
    state: ['unchecked', 'checked', 'indeterminate'],
    interaction: ['default', 'hover', 'disabled'],
  },

  pseudoStates: { hover: 'hover' },

  /**
   * `:indeterminate` is geen attribuut maar een DOM-property, dus die is niet
   * in markup te zetten. Dit draait in de pagina voordat er gemeten wordt.
   */
  domSetup: `
    for (const input of document.querySelectorAll('input[data-indeterminate]')) {
      input.indeterminate = true;
    }
  `,

  render({ state, interaction }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = interaction === 'disabled' ? ' disabled' : '';
    const icon = state === 'indeterminate' ? ICONS.minus : ICONS.check;
    const indeterminate =
      state === 'indeterminate' ? ' data-indeterminate' : '';

    return `<div class="dsn-checkbox" data-figma-root>
      <input type="checkbox" class="dsn-checkbox__input"${checked}${disabled}${indeterminate}>
      <span class="dsn-checkbox__control" aria-hidden="true">
        <svg class="dsn-icon dsn-checkbox__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${icon}</svg>
      </span>
    </div>`;
  },
};
