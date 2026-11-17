/**
 * Variant-matrix voor het list item van IconList.
 *
 * In code het BEM-element `dsn-icon-list__item`, geen eigen component. In Figma
 * een eigen set, zodat de IconList uit instances van één item bestaat.
 *
 * Het icoon is hier een instance swap en geen as. Welk icoon er staat
 * verandert geen gemeten token, alleen welke laag er staat; dat is de regel
 * uit "Wat wordt een as en wat wordt een property?". Daarmee heeft het item
 * geen assen, en kiest een designer per item een icoon.
 *
 * `iconColor` staat hier als as, en niet op de lijst. In code geldt de kleur
 * voor de hele lijst, maar in Figma staan de items in een slot, en wisselt een
 * designer de kleur per item.
 *
 * Geen geneste weergave: een IconList springt niet in (`padding-inline-start:
 * 0`) en tekent geen `::marker`.
 *
 * Elk item is een flexrij met het icoon op `align-items: flex-start`, zodat het
 * icoon bij de eerste tekstregel blijft staan als de tekst afbreekt.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

/**
 * De statuskleuren uit de docs van IconList. `iconColor` is in code een vrije
 * CSS-kleur en geen enum, dus de lijst staat hier en niet in de manifest;
 * `default` is de accentkleur (geen override). `info` staat er niet bij: in de
 * tokens is `info` een alias van `accent-1`, en dat is ook de standaardkleur
 * van IconList, dus in elk thema hetzelfde als `default`.
 */
const ICON_COLORS = ['default', 'positive', 'negative', 'warning'];

/** De statuskleur als inline custom property, zoals de `iconColor`-prop doet. */
function iconColorStyle(iconColor) {
  return iconColor === 'default'
    ? ''
    : ` style="--dsn-icon-list-icon-color: var(--dsn-color-${iconColor}-color-default)"`;
}

export default {
  component: 'IconListItem',
  setName: 'dsn-icon-list__item',

  // Hoort bij de lijst en wordt nooit los geplaatst. Daarom staat het op de
  // pagina van de lijst, links ervan, en heet het in Figma `__item`: met de
  // underscore ervoor publiceert Figma het niet naar de bibliotheek.
  partOf: 'IconList',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/icon-list/icon-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    iconColor: ICON_COLORS,
  },

  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    { name: 'icon', type: 'INSTANCE_SWAP', slot: 'icon', default: 'check' },
  ],

  render({ iconColor }) {
    return `<ul class="dsn-icon-list" role="list"${iconColorStyle(iconColor)}>
      <li class="dsn-icon-list__item" data-figma-root>
        ${icon('check', { className: 'dsn-icon-list__icon', slot: 'icon' })}
        <span data-figma-slot="label">${TEKST}</span>
      </li>
    </ul>`;
  },
};
