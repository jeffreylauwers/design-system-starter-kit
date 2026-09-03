/**
 * Variant-matrix voor Link.
 *
 * Link is een inline-flex met een icoonslot aan weerszijden, dus het icoon
 * hoort hier bij de tekst en niet in een eigen kolom. De maten zitten op een
 * as en niet op een property: `dsn-link--size-large` verandert font-size,
 * gap én icoongrootte, en dat zijn gemeten tokens.
 *
 * De uitgeschakelde stand komt van `aria-disabled="true"` en niet van het
 * `disabled`-attribuut: een `<a>` kent dat attribuut niet, en de CSS haakt op
 * het aria-attribuut aan.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

const ICON_START = icon('chevron-left', { slot: 'icon-start' });
const ICON_END = icon('chevron-right', { slot: 'icon-end' });

export default {
  component: 'Link',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
  ],

  axes: {
    size: ['small', 'default', 'large'],
    state: ['default', 'hover', 'disabled'],
  },

  pseudoStates: { hover: 'hover' },

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
    { name: 'showIconEnd', type: 'BOOLEAN', slot: 'icon-end', default: false },
    {
      name: 'iconEnd',
      type: 'INSTANCE_SWAP',
      slot: 'icon-end',
      default: 'chevron-right',
    },
  ],

  render({ size, state }) {
    const disabled = state === 'disabled' ? ' aria-disabled="true"' : '';

    return `<a href="#" class="dsn-link dsn-link--size-${size}"${disabled} data-figma-root>
      ${ICON_START}
      <span data-figma-slot="label">${TEKST}</span>
      ${ICON_END}
    </a>`;
  },
};
