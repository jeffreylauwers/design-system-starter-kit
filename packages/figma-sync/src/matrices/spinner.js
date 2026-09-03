/**
 * Variant-matrix voor Spinner.
 *
 * De enige component in deze reeks met een eigen SVG die geen icoon uit de
 * assets-map is: twee cirkels waarvan de ene een `stroke-dasharray` heeft.
 * Dat is precies wat de spinner zijn vorm geeft, dus hij gaat als markup mee
 * in plaats van via de icoonhelper.
 *
 * De rotatie zelf komt niet mee. De meetpagina zet animaties uit, want
 * `getComputedStyle` leest tijdens een animatie de tussenwaarde; in Figma
 * staat de boog dus stil op zijn beginstand. Dat is de juiste weergave voor
 * een statisch ontwerp.
 */

const CIRCLE = `<svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
  <circle class="dsn-spinner__track" cx="12" cy="12" r="10"></circle>
  <circle class="dsn-spinner__arc" cx="12" cy="12" r="10"></circle>
</svg>`;

export default {
  component: 'Spinner',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/spinner/spinner.css',
  ],

  /**
   * Geen as voor het verborgen label. `hideLabel` maakt het label
   * `dsn-visually-hidden`, en die elementen slaat de extractor over: in Figma
   * zou dat een variant zonder labellaag opleveren, en dan heeft de
   * `label`-property daar niets om aan te hangen. Wie in Figma een spinner
   * zonder label wil, zet de tekstlaag uit.
   */
  axes: {
    size: ['default', 'large'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ size }) {
    const classes = ['dsn-spinner', size === 'large' && 'dsn-spinner--large']
      .filter(Boolean)
      .join(' ');

    return `<div class="${classes}" role="status" data-figma-root>
      ${CIRCLE}
      <span class="dsn-spinner__label" data-figma-slot="label">Laden...</span>
    </div>`;
  },
};
