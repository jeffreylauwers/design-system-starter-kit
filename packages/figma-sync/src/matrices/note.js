/**
 * Variant-matrix voor Note.
 *
 * Dezelfde gridopbouw als Alert (`<icoon> 1fr` met expliciete `grid-column` en
 * `grid-row`), maar met een rand aan de inline-start in plaats van een volledig
 * gevuld vlak, en met `neutral` als standaardvariant.
 *
 * De `no-heading`-as staat er omdat die niet alleen een laag weglaat: zonder
 * kop schuift de inhoud naar rij 1 en verandert de rijverdeling van het grid.
 * Dat is een gemeten verschil en hoort dus op een as, niet op een boolean.
 *
 * De kop en de tekst zijn instances van `dsn-heading` en `dsn-paragraph`, net
 * als bij Alert.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';
import { axisValues } from '../manifest.js';

/** Het icoon per variant; gelijk aan PREFERRED_ICONS in Note.tsx. */
const ICON_NAMES = {
  neutral: 'info-circle',
  info: 'info-circle',
  positive: 'circle-check',
  negative: 'exclamation-circle',
  warning: 'alert-triangle',
};

/** Het voorleeslabel dat Note voor de kop zet; visueel verborgen. */
const LABELS = {
  neutral: '',
  info: 'Informatie: ',
  positive: 'Succes: ',
  negative: 'Foutmelding: ',
  warning: 'Let op: ',
};

export default {
  component: 'Note',

  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/note/note.css',
  ],

  // Mobile-first: 360px viewport met 16px padding aan weerszijden.
  wrapperStyle: 'width: 328px;',

  axes: {
    variant: axisValues('Note', 'variant'),
    heading: ['with-heading', 'no-heading'],
  },

  // Het icoon staat standaard aan, met het icoon van de variant. In code kan
  // het weg (`iconStart={null}`): de gridkolom blijft dan ook in de browser
  // staan, dus een verborgen laag is hetzelfde. Een eigen icoon kiest een
  // designer via `iconStart`.
  componentProperties: [
    {
      name: 'showIconStart',
      type: 'BOOLEAN',
      slot: 'icon-start',
      default: true,
    },
    {
      name: 'iconStart',
      type: 'INSTANCE_SWAP',
      slot: 'icon-start',
      default: 'info-circle',
    },
  ],

  render({ variant, heading }) {
    const classes = [
      'dsn-note',
      variant !== 'neutral' && `dsn-note--${variant}`,
      heading === 'no-heading' && 'dsn-note--no-heading',
    ]
      .filter(Boolean)
      .join(' ');

    const label = LABELS[variant]
      ? `<span class="dsn-visually-hidden">${LABELS[variant]}</span>`
      : '';

    const headingMarkup =
      heading === 'with-heading'
        ? `<h3 class="dsn-heading dsn-heading--heading-3 dsn-note__heading">${label}${HEADING}</h3>`
        : label;

    return `<div class="${classes}" data-figma-root>
      <span class="dsn-note__icon" aria-hidden="true">
        ${icon(ICON_NAMES[variant], { modifier: 'xl', slot: 'icon-start' })}
      </span>
      ${headingMarkup}
      <div class="dsn-note__content">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
    </div>`;
  },
};
