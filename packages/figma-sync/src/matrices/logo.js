/**
 * Variant-matrix voor Logo.
 *
 * Twee kleurlagen, allebei aan een token gebonden, zodat het logo de
 * theme-schakelaar volgt. Verder is er niets: geen maten, geen states.
 *
 * De paden komen uit `logo_starter-kit.svg` (zie `src/logo.js`): een
 * rechthoek, een label-vlak erin en de letters. Een designer vervangt ze door
 * zijn eigen merk terwijl de tokenbinding blijft staan.
 */

import { logo } from '../logo.js';

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
    return logo('data-figma-root');
  },
};
