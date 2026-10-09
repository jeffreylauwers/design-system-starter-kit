/**
 * Variant-matrix voor PageFooter.
 *
 * Een volle-breedte balk met een begrensde binnenkant. De opbouw erin is niet
 * vrij: `PageFooter.tsx` zet in `__inner` een `Grid` met vier `GridItem`s, één
 * per slot, elk met `colSpan={12}` en `colSpanLg={3}`. Die `lg`-klassen zitten
 * in `grid.css` achter `@media (min-width: 64em)`, dus de vier slots stapelen
 * op een telefoon en staan vanaf 64em in vier kolommen naast elkaar.
 *
 * Daarom meet deze matrix op twee viewports: `small` op 375px en `large` op
 * 1440px. Een footer loopt van rand tot rand en zet zijn eigen
 * `padding-inline`, dus de wrapper is net zo breed als de viewport.
 *
 * De vier slots zijn gevuld zoals de Storybook-template ze vult: een logo, een
 * alinea met een link, en twee lijsten met links. Dat is geen willekeurige
 * keuze. De inverse variant overschrijft precies de kleurtokens van die vier
 * componenten (`--dsn-logo-color-primary`, `--dsn-logo-color-label`,
 * `--dsn-paragraph-color`, `--dsn-link-color`, `--dsn-link-hover-color`,
 * `--dsn-link-text-decoration-color`, `--dsn-unordered-list-color` en
 * `--dsn-unordered-list-marker-color`), dus met deze inhoud is per laag in
 * Figma te zien of die override er ook echt is.
 *
 * Een Heading of PreHeading in een slot zou die override níet krijgen; die
 * staan niet in de lijst van de footer. Dat is een vraag voor de codekant en
 * niet voor de generator, dus hier staat alleen de inhoud die de inverse
 * variant wél dekt.
 *
 * Grid en GridItem zijn layoutcomponenten en hebben geen eigen set in Figma
 * (ze tekenen niets). Ze komen hier als gemeten laag mee, net als bij elk
 * ander samengesteld component; zie issue #369.
 */

/** Het logo zoals PageFooter het in slot 1 krijgt. */
const LOGO = `<a href="/">
  <svg class="dsn-logo" xmlns="http://www.w3.org/2000/svg" width="186" height="48" viewBox="0 0 186 48" fill="none" role="img" aria-label="Starter Kit">
    <path class="dsn-logo__primary" d="M0 0h185.491v48H0z"/>
    <path class="dsn-logo__label" d="M8 8h169.491v32H8z"/>
  </svg>
</a>`;

const linkList = (items) => `<ul class="dsn-unordered-list">
  ${items.map((label) => `<li><a class="dsn-link" href="/">${label}</a></li>`).join('\n  ')}
</ul>`;

const SLOTS = [
  LOGO,
  `<p class="dsn-paragraph">Dit is een voorbeeldorganisatie. <a class="dsn-link" href="/">Meer informatie</a>.</p>`,
  linkList(['Nieuws', 'Over ons', 'Werken bij', 'Klachten']),
  linkList(['Privacyverklaring', 'Toegankelijkheid', 'Cookies', 'Contact']),
];

export default {
  component: 'PageFooter',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/grid/grid.css',
    '@dsn-starter-kit/components-html/src/logo/logo.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/unordered-list/unordered-list.css',
    '@dsn-starter-kit/components-html/src/page-footer/page-footer.css',
  ],

  axes: {
    colorScheme: ['default', 'inverse'],
    viewport: ['small', 'large'],
  },

  viewportAxis: 'viewport',
  viewports: {
    small: { width: 375, wrapperStyle: 'width: 375px;' },
    large: { width: 1440, wrapperStyle: 'width: 1440px;' },
  },

  render({ colorScheme }) {
    const classes = [
      'dsn-page-footer',
      colorScheme === 'inverse' && 'dsn-page-footer--inverse',
    ]
      .filter(Boolean)
      .join(' ');

    const items = SLOTS.map(
      (content) => `<div class="dsn-col-12 dsn-col-lg-3">${content}</div>`
    ).join('\n        ');

    return `<footer class="${classes}" data-figma-root>
      <div class="dsn-page-footer__inner">
        <div class="dsn-grid">
        ${items}
        </div>
      </div>
    </footer>`;
  },
};
