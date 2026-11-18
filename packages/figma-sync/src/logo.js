/**
 * Het logo voor in een matrix, uit hetzelfde bestand als het component.
 *
 * Logo, PageHeader en PageFooter tekenden het logo eerst met overgetypte
 * paden, en daar ontbraken de letters: in Figma stond een lege rechthoek. Hier
 * wordt `components-html/src/logo/logo_starter-kit.svg` gelezen, net zoals
 * `icons.js` de iconen uit de assets-map leest.
 *
 * In dat bestand dragen de paden een vaste kleur. In het component hangen ze
 * aan een klasse, en via `logo.css` aan een token: het eerste kleur wordt
 * `dsn-logo__primary` (de rechthoek en de letters), het tweede
 * `dsn-logo__label` (het vlak erbinnen), zoals in `Logo.tsx`.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(
  __dirname,
  '..',
  '..',
  'components-html',
  'src',
  'logo',
  'logo_starter-kit.svg'
);

/**
 * @param {string} [attributes] extra attributen op de `<svg>`, zoals
 *   `data-figma-root`
 */
export function logo(attributes = '') {
  const source = fs.readFileSync(file, 'utf8');
  const fills = [
    ...new Set([...source.matchAll(/ fill="([^"]+)"/g)].map((m) => m[1])),
  ].filter((fill) => fill !== 'none');
  if (fills.length !== 2) {
    throw new Error(
      `${path.basename(file)} heeft ${fills.length} kleuren; logo.js verwacht er twee (primair en label)`
    );
  }
  const classFor = {
    [fills[0]]: 'dsn-logo__primary',
    [fills[1]]: 'dsn-logo__label',
  };

  const paths = [...source.matchAll(/<path\b([^>]*?)\/?>/g)].map(([, rest]) => {
    const fill = rest.match(/ fill="([^"]+)"/)?.[1];
    const d = rest.match(/ d="([^"]+)"/)?.[1];
    return `<path class="${classFor[fill]}" d="${d}"/>`;
  });

  return `<svg class="dsn-logo" xmlns="http://www.w3.org/2000/svg" width="186" height="48" viewBox="0 0 186 48" fill="none" role="img" aria-label="Starter Kit"${attributes ? ` ${attributes}` : ''}>
  ${paths.join('\n  ')}
</svg>`;
}
