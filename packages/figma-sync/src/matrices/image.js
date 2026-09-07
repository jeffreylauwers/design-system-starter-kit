/**
 * Variant-matrix voor Image.
 *
 * De bron is een ingebakken data-URI en geen bestand: de meetpagina heeft geen
 * netwerk, en een `<img>` die niet laadt heeft geen intrinsieke maat, waardoor
 * de `aspect-ratio` niets zou opleveren om te meten.
 *
 * `object-fit` heeft in Figma een tegenhanger (de schaalmodus van een image
 * fill), maar de extractor levert hier een frame zonder vulling: er is geen
 * echte afbeelding om te plaatsen. Wat overkomt is de verhouding en het kader,
 * en dat is precies wat een designer nodig heeft om er zijn eigen beeld in te
 * zetten.
 */

import { TEKST } from '../text.js';

/** Eén grijze pixel; de verhouding komt van `aspect-ratio`, niet van de bron. */
const PIXEL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';

export default {
  component: 'Image',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/image/image.css',
  ],

  wrapperStyle: 'width: 343px;',

  warnings: [
    'de afbeelding zelf komt niet mee: de extractor levert een frame met de juiste verhouding en het juiste kader, maar zonder image fill. Een designer zet daar zijn eigen beeld in.',
  ],

  axes: {
    ratio: ['16-9', '4-3', '1-1'],
    caption: ['with-caption', 'no-caption'],
  },

  render({ ratio, caption }) {
    const classes = `dsn-image dsn-image--ratio-${ratio}`;

    const captionMarkup =
      caption === 'with-caption'
        ? `<figcaption class="dsn-image__caption">${TEKST}</figcaption>`
        : '';

    return `<figure class="${classes}" data-figma-root>
      <img class="dsn-image__img" src="${PIXEL}" alt="">
      ${captionMarkup}
    </figure>`;
  },
};
