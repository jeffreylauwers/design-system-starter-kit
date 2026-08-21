/**
 * Variant-matrix voor Button.
 *
 * Bewust expliciet en niet afgeleid uit de stories: stories zijn losse
 * voorbeelden, terwijl een Figma component set een volledige matrix nodig heeft
 * met assen die een designer herkent. Deze matrix is de bron voor de
 * variant properties in Figma.
 */

/** Een klein inline-icoon, zodat er geen iconenregistratie nodig is. */
const CHEVRON = `<svg class="dsn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`;

export default {
  component: 'Button',

  /**
   * Webfonts die geladen moeten zijn voordat er gemeten wordt. Zonder dit valt
   * de browser terug op een systeemfont en kloppen de tekstbreedtes niet.
   * De naam moet overeenkomen met een font dat ook in Figma beschikbaar is.
   */
  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  /** CSS die geladen moet zijn voordat de computed styles kloppen. */
  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
  ],

  /**
   * De assen van de component set. Elke combinatie wordt één variant.
   * `state` bevat alleen toestanden die Figma als aparte variant kan tonen.
   */
  axes: {
    variant: ['strong', 'default', 'subtle'],
    size: ['small', 'default', 'large'],
    state: ['default', 'hover', 'disabled'],
  },

  /**
   * Toestanden die in de browser via een pseudo-klasse ontstaan en dus door
   * Playwright nagebootst moeten worden in plaats van via een class.
   */
  pseudoStates: { hover: 'hover' },

  /** Bouwt de markup voor één cel van de matrix. */
  render({ variant, size, state }) {
    const classes = [
      'dsn-button',
      `dsn-button--${variant}`,
      `dsn-button--size-${size}`,
    ].join(' ');
    const disabled = state === 'disabled' ? ' disabled' : '';

    return `<button type="button" class="${classes}"${disabled} data-figma-root>
      <span class="dsn-button__label">Knoptekst</span>
      ${CHEVRON}
    </button>`;
  },
};
