/**
 * Variant-matrix voor Hero.
 *
 * Een sectie over de volle breedte met een begrensde binnenkant. De varianten
 * verschillen structureel: `inverse` en `image` overschrijven de kleurtokens
 * van elk tekstcomponent erin, en `align-center` verandert de uitlijning van
 * de hele inhoud.
 *
 * `hero.css` importeert zelf twee gescoopte token-bestanden via de
 * package-exports van design-tokens. De extractor lost die op via de
 * `exports`-map, want daar wijkt de exportnaam af van de bestandsnaam
 * (`css/scoped/start-hero-image-light` -> `start-light-hero-image.css`).
 */

import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Hero',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/pre-heading/pre-heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/hero/hero.css',
  ],

  wrapperStyle: 'width: 375px;',

  axes: {
    variant: ['default', 'inverse', 'image'],
    align: ['start', 'center'],
  },

  render({ variant, align }) {
    const classes = [
      'dsn-hero',
      variant === 'inverse' && 'dsn-hero--inverse',
      variant === 'image' && 'dsn-hero--image',
      align === 'center' && 'dsn-hero--align-center',
    ]
      .filter(Boolean)
      .join(' ');

    return `<section class="${classes}" data-figma-root>
      <div class="dsn-hero__inner">
        <div class="dsn-hero__content">
          <span class="dsn-pre-heading">${TEKST}</span>
          <h1 class="dsn-heading dsn-heading--heading-1">${HEADING}</h1>
          <p class="dsn-paragraph dsn-paragraph--lead">${TEKST}</p>
        </div>
      </div>
    </section>`;
  },
};
