/**
 * Wat pas aan het eind van een componentimport kan: absolute lagen vastpinnen,
 * effect styles leggen, de icoonkleuren als laatste zetten en controleren, en
 * de bindingen rapporteren.
 */

import { paintedNode } from './nodes.js';
import { recolorVectors } from './svg.js';

/**
 * Zet de constraints van absolute lagen, als alle maten vastliggen.
 *
 * Een frame krijgt zijn gemeten maat pas ná zijn kinderen (`applySizing`). Een
 * kind dat dan al aan de rechterrand hangt, schuift bij die resize mee: de knop
 * van DateInput kwam zo buiten het veld te staan, precies het verschil tussen
 * de breedte waarmee het frame begon en de gemeten breedte. Bij een tweede
 * import draagt een hergebruikte laag zijn constraints al, dus de plek gaat
 * hier ook opnieuw mee.
 */
export function pinAbsolute(context) {
  for (const { node, spec } of context.pinned) {
    try {
      if (spec.x !== undefined) node.x = spec.x;
      if (spec.y !== undefined) node.y = spec.y;
      node.constraints = spec.constraints;
    } catch (error) {
      context.log.warn(
        `${spec.name ?? spec.type}: constraints niet toegestaan (${error.message})`
      );
    }
  }
}

/**
 * Zet de icoonkleuren nog een keer, als allerlaatste stap van de import.
 *
 * Een icoon is een instance van het icooncomponent, en zijn kleur is een
 * override op de geneste `Group > Shape`. Alles wat Figma daarna met die
 * instance doet kan die override wegvagen: een instance swap property zet het
 * `mainComponent` van de laag, en bij zo'n verwisseling gooit Figma de
 * overrides weg. Het icoon valt dan terug op de neutrale kleur van het
 * icooncomponent, en dat is precies wat er in Figma gebeurde.
 *
 * Wie het laatst schrijft wint, dus schrijft de kleur het laatst. Dat scheelt
 * ook het uitzoeken wélke stap ertussen de override precies opruimt: de
 * volgorde doet er daarna niet meer toe.
 *
 * `node.children` wordt hier opnieuw gelezen en niet hergebruikt: na een
 * verwisseling zijn het andere lagen dan tijdens de bouw.
 */
export function recolorIcons(context) {
  for (const job of context.recolors) {
    recolorVectors(job.node.children ?? [], job.paints);
  }
  return context.recolors.length;
}

/**
 * Leest terug of de iconen hun variable daadwerkelijk dragen.
 *
 * Een icoon dat zijn binding kwijt is ziet er in Figma uit als een icoon dat
 * het gewoon doet, tot iemand naar dark mode schakelt. Stil laten gebeuren is
 * daarom geen optie; zie ook `reportBindings`.
 *
 * **Wat deze controle niet ziet.** Hij kijkt naar de laag ín de variant, en die
 * klopte bij issue #388 altijd al: de kleur ging pas verloren op een geplaatste
 * instance ervan. Een blijvend groene uitkomst hier is dus geen bewijs dat een
 * designer de goede kleur ziet. Die kant wordt met `diagnoseColors` gemeten, en
 * blijft daar omdat het een import bij 81 varianten anderhalve seconde langer
 * maakt voor iets wat sinds de fix niet meer stuk kan zonder dat de smoke test
 * het merkt. Om die reden blijft dit ook een waarschuwing en geen harde fout:
 * hij meet niet de plek waar het misging.
 */
export function verifyIconColors(context) {
  const lost = [];

  for (const job of context.recolors) {
    const expected = job.paints?.[0]?.boundVariables?.color?.id;
    if (!expected) continue;

    const paint = paintedNode(job.node)?.fills[0];
    if (paint?.boundVariables?.color?.id !== expected) {
      lost.push(job.name ?? 'icon');
    }
  }

  if (lost.length) {
    const unique = [...new Set(lost)];
    context.log.warn(
      `${lost.length} icoonlagen dragen hun kleur-variable niet (${unique.slice(0, 3).join(', ')}${unique.length > 3 ? ', ...' : ''}); ze volgen de theme-schakelaar niet`
    );
  }

  return lost.length;
}

/**
 * Hangt de lagen met een schaduw aan hun effect style.
 *
 * Aan het eind en niet tijdens de bouw: `setEffectStyleIdAsync` is asynchroon
 * (onder `documentAccess: dynamic-page` bestaat de synchrone setter niet
 * meer), en de bouw is synchroon. Tot dit moment staan de gemeten effects op
 * de laag, en die zijn gelijk aan de style; ontbreekt de style, dan blijven
 * ze staan. Dan ziet de laag er goed uit maar volgt hij een wijziging van de
 * style niet, en dat wordt gemeld.
 */
export async function applyEffectStyles(context) {
  const queue = context.effectStyleQueue;
  if (!queue.length) return { applied: 0, missing: [] };

  const styles = new Map(
    (await figma.getLocalEffectStylesAsync()).map((style) => [
      style.name,
      style,
    ])
  );
  let applied = 0;
  const missing = new Set();

  for (const { node, name, spec } of queue) {
    if (!name) {
      // Een override die de style van het component eraf haalt. Opnieuw
      // toewijzen koppelt los en houdt de effects die er staan.
      node.effects = [...node.effects];
      continue;
    }
    const style = styles.get(name);
    if (!style) {
      missing.add(name);
      continue;
    }
    try {
      await node.setEffectStyleIdAsync(style.id);
      applied += 1;
    } catch (error) {
      context.log.warn(
        `${spec.name ?? 'laag'}: effect style ${name} kon niet gelegd worden: ${error.message}`
      );
    }
  }

  for (const name of missing) {
    context.log.warn(
      `Effect style ${name} bestaat niet in dit bestand; de schaduw staat er als losse effects. Importeer variables.json opnieuw om de styles aan te maken.`
    );
  }
  return { applied, missing: [...missing] };
}

/**
 * Meldt hoeveel lagen aan een variable hangen, en wat er niet gelukt is.
 * Een ontbrekende variable is geen fout maar wel iets om te zien: die laag
 * houdt een vaste waarde en volgt de theme-schakelaar niet.
 */
export function reportBindings(payload, stats, log) {
  const expected = payload.bindings?.bound;
  log.info(
    `${stats.bound} lagen aan een variable gebonden${expected !== undefined ? ` van de ${expected} verwachte` : ''}`
  );

  for (const name of stats.missing) {
    log.warn(
      `Variable ${name} bestaat niet in dit bestand; vaste waarde blijft staan`
    );
  }

  return { ...stats, missing: [...stats.missing] };
}
