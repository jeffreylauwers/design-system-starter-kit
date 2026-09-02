/**
 * Variant-matrix voor Alert.
 *
 * Alert is de test voor CSS Grid: de component gebruikt
 * `grid-template-columns: <icon> 1fr` met expliciete `grid-column` en
 * `grid-row` per kind. Dat mapt op Figma's GRID-layoutmodus met anchors.
 *
 * De `dsn-visually-hidden` variant-labels in de heading worden door de
 * extractor overgeslagen: die hebben in Figma geen tegenhanger.
 */

import { icon as renderIcon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

/** Het icoon per variant; de naam wordt ook de naam van de laag in Figma. */
const ICON_NAMES = {
  info: 'info-circle',
  positive: 'circle-check',
  negative: 'exclamation-circle',
  warning: 'alert-triangle',
};

const LABELS = {
  info: 'Informatie: ',
  positive: 'Succes: ',
  negative: 'Foutmelding: ',
  warning: 'Let op: ',
};

export default {
  component: 'Alert',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/alert/alert.css',
  ],

  axes: {
    variant: ['info', 'positive', 'negative', 'warning'],
    icon: ['with-icon', 'no-icon'],
  },

  /**
   * Mobile-first: een small-viewport ontwerp is 375px breed met 16px padding
   * links en rechts, dus een blok-component is in de basis 343px.
   */
  wrapperStyle: 'width: 343px;',

  render({ variant, icon }) {
    const classes = [
      'dsn-alert',
      variant !== 'info' && `dsn-alert--${variant}`,
      icon === 'no-icon' && 'dsn-alert--no-icon',
    ]
      .filter(Boolean)
      .join(' ');

    const iconMarkup =
      icon === 'with-icon'
        ? `<span class="dsn-alert__icon" aria-hidden="true">
             ${renderIcon(ICON_NAMES[variant], { modifier: 'xl' })}
           </span>`
        : '';

    return `<div class="${classes}" role="alert" data-figma-root>
      ${iconMarkup}
      <h2 class="dsn-heading dsn-heading--heading-3 dsn-alert__heading"><span class="dsn-visually-hidden">${LABELS[variant]}</span>${HEADING}</h2>
      <div class="dsn-alert__content">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
    </div>`;
  },
};
