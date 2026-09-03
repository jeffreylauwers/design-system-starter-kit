/**
 * Canonieke voorbeeldteksten.
 *
 * Dezelfde waarden als `packages/storybook/src/story-helpers.tsx`, dat het
 * origineel is. Ze staan hier apart omdat dat bestand TSX is en tot het
 * storybook-package hoort; deze generator draait als kaal Node-script.
 * Wijzigt story-helpers, pas dit dan mee aan.
 */

export const TEKST = 'Tekst';
export const WEINIG_TEKST = 'A';

/** Voor varianten die moeten laten zien hoe tekst over meerdere regels loopt. */
export const VEEL_TEKST =
  'Dit is een tekst om te laten zien hoe dit component zich gedraagt bij veel tekst. ' +
  'Daardoor kunnen we zien wat er gebeurt als tekst over meerdere regels loopt.';

/** Voor koppen (h1 t/m h6). Storybook gebruikt hier ook 'Heading'. */
export const HEADING = 'Heading';
