/**
 * Variant-matrix voor Heading.
 *
 * De eenvoudigste vorm die er is: één element dat alleen tekst bevat. De
 * extractor klapt dat tot één TEXT-node in plaats van een frame met een
 * tekstnode erin, dus dit is meteen de toets of die stap ook op een root
 * werkt.
 *
 * Twee assen, net als de twee props in React: `level` is het `<h*>`-element,
 * `appearance` is hoe de kop eruitziet (`dsn-heading--heading-2`). Die staan
 * los van elkaar: `<h1 class="dsn-heading dsn-heading--heading-3">` is geldig.
 *
 * Dat geeft 36 varianten, waarvan er per appearance zes er hetzelfde uitzien.
 * Daar is bewust voor gekozen (issue #400): Figma kent naast varianten geen
 * keuzelijst, en een level dat alleen in een laagnaam of beschrijving staat
 * ziet een designer niet in het paneel. Elke variant bindt aan de tokens van
 * zijn appearance; het level verandert geen gemeten waarde.
 */

import { HEADING } from '../text.js';

export default {
  component: 'Heading',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
  ],

  axes: {
    level: ['1', '2', '3', '4', '5', '6'],
    appearance: [
      'heading-1',
      'heading-2',
      'heading-3',
      'heading-4',
      'heading-5',
      'heading-6',
    ],
  },

  /**
   * Als instance in een andere set (de kop van een Alert) is het level niet
   * te meten: zes varianten zien er hetzelfde uit. Het staat wel in de markup,
   * als tag. Een `<h3>` wordt daarom een variant met `level=3`, en de meting
   * kiest daarbinnen de appearance. Zonder `<h*>`-element moet de host het
   * level zelf aanwijzen met `data-figma-variant`.
   */
  variantFromTag: {
    axis: 'level',
    tags: { h1: '1', h2: '2', h3: '3', h4: '4', h5: '5', h6: '6' },
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ level, appearance }) {
    return `<h${level} class="dsn-heading dsn-heading--${appearance}" data-figma-root data-figma-slot="label">${HEADING}</h${level}>`;
  },
};
