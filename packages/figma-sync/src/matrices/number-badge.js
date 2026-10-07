/**
 * Variant-matrix voor NumberBadge.
 *
 * De badge is rond zolang het getal binnen de `min-inline-size` past en wordt
 * daarna een pil. Dat hoeft geen as te zijn: het frame hugt om zijn tekst en
 * houdt zijn `minWidth`, dus een designer die "99+" typt ziet de pilvorm
 * meteen in dezelfde variant.
 */

export default {
  component: 'NumberBadge',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/number-badge/number-badge.css',
  ],

  axes: {
    variant: ['neutral', 'info', 'positive', 'negative', 'warning'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ variant }) {
    const classes = [
      'dsn-number-badge',
      variant !== 'neutral' && `dsn-number-badge--${variant}`,
    ]
      .filter(Boolean)
      .join(' ');

    // De slot-markering zit op een span binnen de badge en niet op de badge
    // zelf: een TEXT-property hoort aan een tekstlaag, en de badge is in Figma
    // een frame. De span kost geen extra laag, want de extractor klapt een
    // element dat alleen tekst bevat tot één TEXT-node in.
    return `<span class="${classes}" aria-hidden="true" data-figma-root><span data-figma-slot="label">3</span></span>`;
  },
};
