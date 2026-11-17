/**
 * Variant-matrix voor MenuLink.
 *
 * Een item in een Menu, met een niveau dat de inspringing bepaalt en een
 * uitklapknop voor een submenu. Die knop is een echte `dsn-button`, wat
 * `menu-link.css` ook declareert met `@dsn-depends-on: button`.
 *
 * Het niveau is een as en geen property: `--level-2` en hoger zetten een eigen
 * `padding-inline-start` en een eigen typografie, dus dat zijn gemeten tokens.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';
import { axisValues } from '../manifest.js';
import { FLAG } from '../flags.js';

export default {
  component: 'MenuLink',

  // De uitklapknop is een instance van de icon-only Button, met
  // `chevron-down` via de instance swap `icon`. De NumberBadge is een
  // instance van zijn eigen set; variant en getal kiest een designer daar.
  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/number-badge/number-badge.css',
    '@dsn-starter-kit/components-html/src/menu-link/menu-link.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    level: axisValues('MenuLink', 'level'),
    state: ['default', 'current'],
    expand: ['with-expand', 'no-expand'],
    interaction: ['default', 'hover', 'active'],
    expanded: FLAG,
  },

  // `expanded` draait in code alleen de chevron van de uitklapknop, via
  // `aria-expanded` en `rotate(180deg)`. Die knop is een instance van de
  // Button-set, en een draaiing gaat niet als override mee. Daarom rendert
  // de matrix bij `expanded=true` `chevron-up`, via de instance swap `icon`,
  // en zonder `aria-expanded`: anders draaide de CSS die pijl weer om.
  // Dat bestaat dus
  // alleen met een uitklapknop, en hover en active zitten op de link, niet op
  // de knop: die combinaties voegen niets toe.
  skipVariant: ({ expand, interaction, expanded }) =>
    expanded === 'true' &&
    (expand !== 'with-expand' || interaction !== 'default'),

  // De iconen en de badge zetten alleen een laag aan of uit, dus properties en
  // geen assen; dezelfde vier icoon-properties als MenuButton. Ze staan
  // standaard uit, zodat een nieuwe instance eruitziet als voorheen.
  componentProperties: [
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
      default: 'settings',
    },
    {
      name: 'showNumberBadge',
      type: 'BOOLEAN',
      slot: 'number-badge',
      default: false,
    },
    { name: 'showIconEnd', type: 'BOOLEAN', slot: 'icon-end', default: false },
    {
      name: 'iconEnd',
      type: 'INSTANCE_SWAP',
      slot: 'icon-end',
      default: 'chevron-right',
    },
  ],

  // Hover en active hangen aan de link. Met een uitklapknop valt het midden
  // van de root daar niet altijd in, dus de muis mikt op de link zelf.
  pseudoStates: { hover: 'hover', active: 'active' },
  pseudoTarget: '.dsn-menu-link__link',

  render({ level, state, expand, expanded }) {
    const classes = [
      'dsn-menu-link',
      level !== '1' && `dsn-menu-link--level-${level}`,
    ]
      .filter(Boolean)
      .join(' ');

    const expandMarkup =
      expand === 'with-expand'
        ? `<span class="dsn-menu-link__divider" aria-hidden="true"></span>
           <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-menu-link__expand-button">
             ${icon(expanded === 'true' ? 'chevron-up' : 'chevron-down')}
             <span class="dsn-button__label">Submenu openen</span>
           </button>`
        : '';

    return `<li class="${classes}" data-figma-root>
      <a href="#" class="dsn-menu-link__link"${state === 'current' ? ' aria-current="page"' : ''}>
        ${icon('settings', { slot: 'icon-start' })}
        <span class="dsn-menu-link__label">${TEKST}</span>
        <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true" data-figma-slot="number-badge"><span data-figma-slot="label">5</span></span>
        ${icon('chevron-right', { slot: 'icon-end' })}
      </a>
      ${expandMarkup}
    </li>`;
  },
};
