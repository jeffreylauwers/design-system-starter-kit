/**
 * Toestanden die in Figma een eigen as horen te zijn.
 *
 * `disabled` en `invalid` zijn in code geen waarde van één toestand maar een
 * eigen schakelaar: een veld kan tegelijk hover en invalid zijn. Zolang ze
 * waarden van de `state`-as waren, moest een designer kiezen.
 *
 * Het worden variant-assen met `false` en `true`, geen BOOLEAN-properties: die
 * kunnen in Figma alleen een laag tonen of verbergen, en deze toestanden
 * veranderen kleuren en randen. Een as met precies deze twee waarden toont
 * Figma als schakelaar, dus in het properties panel is het verschil er niet.
 */

export const FLAG = ['false', 'true'];

/**
 * Laat de combinaties weg die niets betekenen.
 *
 * Een uitgeschakelde knop heeft geen hover, en een veld is niet tegelijk
 * disabled en invalid. Zonder deze uitsluiting zou elke as het aantal
 * varianten verdubbelen met standen die een designer nooit kiest.
 *
 * @param {{flags: string[], base?: Record<string, string>}} options
 *   `flags` zijn de assen met `false`/`true`; `base` is de stand die de andere
 *   assen moeten hebben zodra een van die vlaggen aan staat.
 */
export function skipFlagCombinations({ flags, base = {} }) {
  return (combination) => {
    const active = flags.filter((flag) => combination[flag] === 'true');
    if (active.length > 1) return true;
    if (!active.length) return false;
    return Object.entries(base).some(
      ([axis, value]) => combination[axis] !== value
    );
  };
}
