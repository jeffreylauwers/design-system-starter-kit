/**
 * Variant-matrix voor ProgressBar.
 *
 * De balk zelf is een native `<progress>`. Dat element tekent zijn vulling in
 * de shadow DOM, dus er valt niets in te meten: in Figma komt het als één vlak
 * met de achtergrondkleur en de radius van de baan terug. De vulling en het
 * percentage zijn daarmee handwerk in Figma, en dat is de reden dat de
 * `value`-as er niet is: elke waarde zou dezelfde lege balk opleveren.
 *
 * Wat wél meekomt is de opbouw eromheen: de kop met het percentage, de balk en
 * de beschrijving eronder, met de juiste tokens voor spacing en typografie.
 */

import { TEKST } from '../text.js';

export default {
  component: 'ProgressBar',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/progress-bar/progress-bar.css',
  ],

  // Mobile-first: 375px viewport met 16px padding aan weerszijden.
  wrapperStyle: 'width: 343px;',

  axes: {
    value: ['with-value', 'no-value'],
    description: ['with-description', 'no-description'],
  },

  render({ value, description }) {
    const header =
      value === 'with-value'
        ? `<div class="dsn-progress-bar__header">
             <p class="dsn-paragraph dsn-progress-bar__percentage" aria-hidden="true" data-figma-slot="percentage">60%</p>
           </div>`
        : '';

    const descriptionMarkup =
      description === 'with-description'
        ? `<p class="dsn-paragraph dsn-progress-bar__description" data-figma-slot="description">${TEKST}</p>`
        : '';

    return `<div class="dsn-progress-bar" data-figma-root>
      ${header}
      <progress class="dsn-progress-bar__bar" value="60" max="100">60%</progress>
      ${descriptionMarkup}
    </div>`;
  },
};
