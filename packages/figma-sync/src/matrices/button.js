/**
 * Variant-matrix voor Button.
 *
 * Bewust expliciet en niet afgeleid uit de stories: stories zijn losse
 * voorbeelden, terwijl een Figma component set een volledige matrix nodig heeft
 * met assen die een designer herkent. Deze matrix is de bron voor de
 * variant properties in Figma.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

/**
 * De twee icoonslots.
 *
 * `data-icon` wordt de naam van de laag in Figma en wijst de plugin naar het
 * icooncomponent waar deze laag een instance van wordt. `data-figma-slot` is
 * waar de component properties aan hangen.
 *
 * Beide slots worden altijd gerenderd, ook al staan ze in Figma standaard uit.
 * Een Figma-property kan alleen een laag aan- of uitzetten die er is; een
 * variant die het slot niet rendert zou de property de helft van de tijd niets
 * laten doen.
 */
const ICON_START = icon('chevron-left', { slot: 'icon-start' });
const ICON_END = icon('chevron-right', { slot: 'icon-end' });

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
  /**
   * De volgorde volgt de `ButtonVariant`-union in `Button.tsx`, niet de
   * volgorde in de CSS: Figma toont de waarden in de volgorde waarin ze
   * binnenkomen, en zo staan de drie sentimenten van dezelfde nadruk bij
   * elkaar. Een designer kiest immers eerst nadruk en dan sentiment.
   */
  axes: {
    variant: [
      'strong',
      'strong-negative',
      'strong-positive',
      'default',
      'default-negative',
      'default-positive',
      'subtle',
      'subtle-negative',
      'subtle-positive',
    ],
    size: ['small', 'default', 'large'],
    state: ['default', 'hover', 'disabled'],
  },

  /**
   * Toestanden die in de browser via een pseudo-klasse ontstaan en dus door
   * Playwright nagebootst moeten worden in plaats van via een class.
   */
  pseudoStates: { hover: 'hover' },

  /**
   * De component properties van de set, in de volgorde waarin Figma ze toont.
   *
   * `slot` verwijst naar een `data-figma-slot` in de markup hieronder. De
   * namen volgen de React-props: `iconStart` en `iconEnd` zíjn in code het
   * icoon, dus dat zijn hier de instance swaps. De boolean die ze aan- en
   * uitzet krijgt daarom `show`-ervoor; twee properties kunnen in Figma niet
   * dezelfde naam dragen.
   *
   * Bewust nog niet hier: `iconOnly`, `loading` en `fullWidth`. Dat zijn
   * losse booleans met eigen tokens en eigen vragen, zie issue #323.
   */
  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    {
      name: 'showIconStart',
      type: 'BOOLEAN',
      slot: 'icon-start',
      default: false,
    },
    {
      name: 'iconStart',
      type: 'INSTANCE_SWAP',
      slot: 'icon-start',
      default: 'chevron-left',
    },
    {
      name: 'showIconEnd',
      type: 'BOOLEAN',
      slot: 'icon-end',
      default: false,
    },
    {
      name: 'iconEnd',
      type: 'INSTANCE_SWAP',
      slot: 'icon-end',
      default: 'chevron-right',
    },
  ],

  /** Bouwt de markup voor één cel van de matrix. */
  render({ variant, size, state }) {
    const classes = [
      'dsn-button',
      `dsn-button--${variant}`,
      `dsn-button--size-${size}`,
    ].join(' ');
    const disabled = state === 'disabled' ? ' disabled' : '';

    return `<button type="button" class="${classes}"${disabled} data-figma-root>
      ${ICON_START}
      <span class="dsn-button__label" data-figma-slot="label">${TEKST}</span>
      ${ICON_END}
    </button>`;
  },
};
