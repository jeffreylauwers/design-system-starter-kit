/**
 * Variant-matrix voor Logo.
 *
 * Twee kleurlagen, allebei aan een token gebonden, zodat het logo de
 * theme-schakelaar volgt. Verder is er niets: geen maten, geen states.
 *
 * De vorm hieronder is de plaatshouder uit `logo.css`, niet een echt merklogo:
 * een rechthoek met een label-vlak erin. Dat is precies wat het component in
 * de starter kit ook is, en een designer vervangt de paden door zijn eigen
 * merk terwijl de tokenbinding blijft staan.
 */

export default {
  component: 'Logo',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/logo/logo.css',
  ],

  // Geen assen: dit component heeft niets dat per variant verschilt. Een
  // component set in Figma moet een as hebben, dus dit wordt geen set maar een
  // los component. Zie "Een matrix zonder assen" in de README.
  render() {
    return `<svg class="dsn-logo" xmlns="http://www.w3.org/2000/svg" width="186" height="48" viewBox="0 0 186 48" fill="none" role="img" aria-label="Starter Kit" data-figma-root>
      <path class="dsn-logo__primary" d="M0 0h185.491v48H0z"/>
      <path class="dsn-logo__label" d="M8 8h169.491v32H8z"/>
    </svg>`;
  },
};
