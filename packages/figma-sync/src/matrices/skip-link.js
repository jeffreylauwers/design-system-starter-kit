/**
 * Variant-matrix voor SkipLink.
 *
 * SkipLink is standaard weggeklipt met `clip-path: inset(50%)` en krijgt zijn
 * hele verschijning pas op `:focus-visible`. De onzichtbare stand meten heeft
 * geen zin (dat levert een leeg vlak op), dus de matrix rendert alleen de
 * gefocuste stand, met `focus` als pseudo-toestand.
 *
 * Die pseudo-toestand komt van een echte Tab-toets en niet van een
 * programmatische `.focus()`: Chromium zet `:focus-visible` alleen bij
 * toetsenbordfocus. De matrix rendert daarom precies één focusbaar element.
 */

export default {
  component: 'SkipLink',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/skip-link/skip-link.css',
  ],

  axes: {
    state: ['focus'],
  },

  pseudoStates: { focus: 'focus' },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render() {
    // De slot-markering hoort aan de tekstlaag, en de link zelf is in Figma een
    // frame; zie de toelichting bij NumberBadge.
    return `<a href="#main" class="dsn-skip-link" data-figma-root><span data-figma-slot="label">Ga direct naar de hoofdinhoud</span></a>`;
  },
};
