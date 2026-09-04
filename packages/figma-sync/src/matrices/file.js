/**
 * Variant-matrix voor File.
 *
 * Een geüpload bestand met een pictogram, een naam, metadata en acties. De
 * `error`-variant kleurt de rand en het pictogram; `interactive` maakt de hele
 * rij klikbaar.
 *
 * De preview is bewust een leeg `dsn-file__media`-blok zonder `<img>`: net als
 * bij Image is er geen echte afbeelding om te plaatsen, en een frame met de
 * juiste maat is wat een designer nodig heeft.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'File',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/file/file.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    variant: ['default', 'error'],
    actions: ['with-actions', 'no-actions'],
  },

  render({ variant, actions }) {
    const classes = ['dsn-file', variant === 'error' && 'dsn-file--error']
      .filter(Boolean)
      .join(' ');

    const actionMarkup =
      actions === 'with-actions'
        ? `<div class="dsn-file__actions">
             ${icon('check', { className: 'dsn-file__status-icon' })}
             <span class="dsn-link dsn-link--size-default">${TEKST}</span>
           </div>`
        : '';

    return `<div class="${classes}" data-figma-root>
      <div class="dsn-file__media" aria-hidden="true"></div>
      <div class="dsn-file__content">
        <span class="dsn-file__name">${TEKST}</span>
        <span class="dsn-file__meta">${TEKST}</span>
      </div>
      ${actionMarkup}
    </div>`;
  },
};
