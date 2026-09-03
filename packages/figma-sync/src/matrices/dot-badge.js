/**
 * Variant-matrix voor DotBadge.
 *
 * Een stip zonder inhoud: geen tekst, geen icoon, alleen maat, kleur en een
 * ring. Dat maakt hem de kleinste toets die er is op de vraag of een element
 * zonder kinderen correct doorkomt.
 *
 * `dsn-dot-badge--pulse` zit bewust niet in de matrix. Dat is een animatie, en
 * de meetpagina zet animaties uit om te voorkomen dat er halverwege een
 * beweging gemeten wordt; als variant zou hij dus niet van de gewone stip te
 * onderscheiden zijn.
 */

export default {
  component: 'DotBadge',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/dot-badge/dot-badge.css',
  ],

  axes: {
    variant: ['neutral', 'info', 'positive', 'negative', 'warning'],
  },

  render({ variant }) {
    return `<span class="dsn-dot-badge dsn-dot-badge--${variant}" aria-hidden="true" data-figma-root></span>`;
  },
};
