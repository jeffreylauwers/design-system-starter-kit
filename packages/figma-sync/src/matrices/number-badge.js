/**
 * Variant-matrix voor NumberBadge.
 *
 * Eén cijfer of meer verandert de breedte: de badge is rond zolang het getal
 * binnen de `min-inline-size` past en wordt daarna een pil. Beide standen
 * staan daarom op een as; met alleen "8" in de matrix zou een designer die
 * pilvorm in Figma nooit zien.
 */

export default {
  component: 'NumberBadge',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/number-badge/number-badge.css',
  ],

  axes: {
    variant: ['neutral', 'info', 'positive', 'negative', 'warning'],
    count: ['single-digit', 'multiple-digits'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ variant, count }) {
    const classes = [
      'dsn-number-badge',
      variant !== 'neutral' && `dsn-number-badge--${variant}`,
    ]
      .filter(Boolean)
      .join(' ');

    const value = count === 'single-digit' ? '3' : '99+';

    // De slot-markering zit op een span binnen de badge en niet op de badge
    // zelf: een TEXT-property hoort aan een tekstlaag, en de badge is in Figma
    // een frame. De span kost geen extra laag, want de extractor klapt een
    // element dat alleen tekst bevat tot één TEXT-node in.
    return `<span class="${classes}" aria-hidden="true" data-figma-root><span data-figma-slot="label">${value}</span></span>`;
  },
};
