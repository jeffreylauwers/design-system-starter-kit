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
import { FLAG, skipFlagCombinations } from '../flags.js';

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

/**
 * Het icoon van een icon-only knop: een eigen slot, en niet `icon-start`.
 *
 * De standaardwaarde van een BOOLEAN-property geldt voor de hele set. Hing
 * het icoon van een icon-only knop aan `showIconStart`, dan was elke nieuwe
 * icon-only instance leeg, want die staat standaard uit. Dit slot heeft geen
 * boolean: het icoon staat er altijd. `settings` als standaard, net als het
 * voorbeeld in CLAUDE.md.
 */
const ICON = icon('settings', { slot: 'icon' });

/**
 * Icon-only bestaat alleen voor de drie nadrukken zonder sentiment. Een
 * knop met alleen een icoon is zelden negatief of positief, en zo groeit de
 * set met 36 varianten in plaats van 108.
 */
const ICON_ONLY_VARIANTS = new Set(['strong', 'default', 'subtle']);

const skipFlags = skipFlagCombinations({
  flags: ['disabled'],
  base: { state: 'default' },
});

export default {
  component: 'Button',

  /**
   * Webfonts die geladen moeten zijn voordat er gemeten wordt. Zonder dit valt
   * de browser terug op een systeemfont en kloppen de tekstbreedtes niet.
   * De naam moet overeenkomen met een font dat ook in Figma beschikbaar is.
   */
  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
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
    state: ['default', 'hover', 'active'],
    disabled: FLAG,
    // Een as en geen BOOLEAN: icon-only heeft eigen padding-tokens
    // (`button/size/*/icon-only-padding`), en een boolean kan alleen een
    // laag aan- of uitzetten binnen dezelfde meting. Zie issue #451.
    iconOnly: FLAG,
  },

  /**
   * Toestanden die in de browser via een pseudo-klasse ontstaan en dus door
   * Playwright nagebootst moeten worden in plaats van via een class.
   */
  skipVariant: (combination) =>
    skipFlags(combination) ||
    (combination.iconOnly === 'true' &&
      !ICON_ONLY_VARIANTS.has(combination.variant)),

  pseudoStates: { hover: 'hover', active: 'active' },

  /**
   * De component properties van de set, in de volgorde waarin Figma ze toont.
   *
   * `slot` verwijst naar een `data-figma-slot` in de markup hieronder. De
   * namen volgen de React-props: `iconStart` en `iconEnd` zíjn in code het
   * icoon, dus dat zijn hier de instance swaps. De boolean die ze aan- en
   * uitzet krijgt daarom `show`-ervoor; twee properties kunnen in Figma niet
   * dezelfde naam dragen.
   *
   * De vier icoon-properties horen bij de varianten met tekst, `icon` bij de
   * icon-only varianten; daarom zijn ze `optional`. Het label blijft ook in
   * een icon-only knop: daar is het de toegankelijke naam, als verborgen
   * laag met dezelfde TEXT-property.
   *
   * Bewust nog niet hier: `loading` en `fullWidth`. Die hebben eigen tokens
   * en eigen vragen, zie issue #323.
   */
  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    {
      name: 'showIconStart',
      optional: true,
      type: 'BOOLEAN',
      slot: 'icon-start',
      default: false,
    },
    {
      name: 'iconStart',
      optional: true,
      type: 'INSTANCE_SWAP',
      slot: 'icon-start',
      default: 'chevron-left',
    },
    {
      name: 'showIconEnd',
      optional: true,
      type: 'BOOLEAN',
      slot: 'icon-end',
      default: false,
    },
    {
      name: 'iconEnd',
      optional: true,
      type: 'INSTANCE_SWAP',
      slot: 'icon-end',
      default: 'chevron-right',
    },
    {
      name: 'icon',
      type: 'INSTANCE_SWAP',
      slot: 'icon',
      optional: true,
      default: 'settings',
    },
  ],

  /** Bouwt de markup voor één cel van de matrix. */
  render({ variant, size, disabled: isDisabled, iconOnly }) {
    const classes = [
      'dsn-button',
      `dsn-button--${variant}`,
      `dsn-button--size-${size}`,
      iconOnly === 'true' && 'dsn-button--icon-only',
    ]
      .filter(Boolean)
      .join(' ');
    const disabled = isDisabled === 'true' ? ' disabled' : '';
    const label = `<span class="dsn-button__label" data-figma-slot="label">${TEKST}</span>`;

    if (iconOnly === 'true') {
      return `<button type="button" class="${classes}"${disabled} data-figma-root>
        ${ICON}
        ${label}
      </button>`;
    }

    return `<button type="button" class="${classes}"${disabled} data-figma-root>
      ${ICON_START}
      ${label}
      ${ICON_END}
    </button>`;
  },
};
