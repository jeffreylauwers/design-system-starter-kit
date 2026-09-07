/**
 * Variant-matrix voor PageFooter.
 *
 * Een volle-breedte balk met een begrensde binnenkant. De inverse variant is
 * geen kleurtje: hij overschrijft de kleurtokens van élk tekstcomponent dat
 * erin staat, inclusief PreHeading. Dat is de regel uit CLAUDE.md over inverse
 * containers, en in Figma is per laag te zien of die override er ook echt is.
 */

import { HEADING, TEKST } from '../text.js';

export default {
  component: 'PageFooter',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/pre-heading/pre-heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/page-footer/page-footer.css',
  ],

  wrapperStyle: 'width: 375px;',

  axes: {
    colorScheme: ['default', 'inverse'],
  },

  render({ colorScheme }) {
    const classes = [
      'dsn-page-footer',
      colorScheme === 'inverse' && 'dsn-page-footer--inverse',
    ]
      .filter(Boolean)
      .join(' ');

    return `<footer class="${classes}" data-figma-root>
      <div class="dsn-page-footer__inner">
        <span class="dsn-pre-heading">${TEKST}</span>
        <h2 class="dsn-heading dsn-heading--heading-3">${HEADING}</h2>
        <p class="dsn-paragraph">${TEKST}</p>
        <a href="#" class="dsn-link">${TEKST}</a>
      </div>
    </footer>`;
  },
};
