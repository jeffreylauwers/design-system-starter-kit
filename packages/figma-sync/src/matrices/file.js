/**
 * Variant-matrix voor File.
 *
 * Een bestand met een media-vlak, een naam, metadata en een actie-kolom. De
 * opbouw volgt File.tsx: wat er in de actie-kolom staat hangt af van de status
 * en van de acties, en die twee zijn hier de assen.
 *
 * - `status`: default, loading (Spinner), uploaded (vinkje) en error (rode rand
 *   en een FormFieldErrorMessage onder de naam).
 * - `actions`: none, delete (verwijderknop, `onDelete`), view (de hele rij is
 *   klikbaar: de naam is een stretched link) en download (een aparte
 *   downloadknop). In React volgen die uit `onDelete`, `href` en `ctaVariant`.
 * - `state`: hover en active, alleen bij view; alleen daar heeft de CSS ze.
 *
 * Alleen de combinaties die React echt rendert staan erin. Bij loading en
 * uploaded toont React geen verwijderknop, en view en download zijn er alleen
 * in de rusttoestand van de upload.
 *
 * Het media-vlak toont het icoon van `mediaType` (instance swap `mediaIcon`).
 * `showPreview` zet er een preview-laag overheen, zonder vulling: een designer
 * zet er zijn eigen beeld in als image fill. In code vervangt de `<img>` het
 * icoon; hier ligt de laag er absoluut overheen, zodat het icoon verdwijnt
 * zodra er een beeld in staat. Dat is een keuze voor Figma, geen nagebootste
 * CSS: daarom staat de positionering inline in de matrix.
 *
 * De knoppen in de actie-kolom zijn instances van de Link-set (zie
 * `linkInstance`), de foutmelding een instance van FormFieldErrorMessage. De
 * naam draagt `dsn-link` maar heeft een andere opbouw dan de Link-set, en de
 * Spinner heeft hier geen zichtbaar label: die blijven gemeten lagen
 * (`data-figma-instance="none"`).
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';
import { axisValues } from '../manifest.js';

/** De cirkel van de Spinner, zoals in de Spinner-matrix. */
const SPINNER = `<div class="dsn-spinner" role="status" data-figma-instance="none">
  <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="dsn-spinner__track" cx="12" cy="12" r="10"></circle>
    <circle class="dsn-spinner__arc" cx="12" cy="12" r="10"></circle>
  </svg>
</div>`;

/**
 * Een knop in de actie-kolom als instance van de Link-set: de verwijderknop is
 * in code een LinkButton (`<button class="dsn-link dsn-link-button">`), de
 * downloadknop een `<a class="dsn-link">`. LinkButton heeft geen eigen set; in
 * Figma is het een Link (zie "Welke componenten wel en niet een matrix
 * krijgen").
 *
 * De opbouw is die van de Link-set: icoon vooraan, label, icoon achteraan.
 * Het icoon vooraan staat aan (`data-figma-properties`) en wordt het icoon van
 * de knop via de instance swap. Het icoon achteraan staat in de set uit, en
 * staat hier visueel verborgen in de markup, zodat het in de browser geen
 * ruimte inneemt.
 */
function linkInstance(tag, iconName, label) {
  const href = tag === 'a' ? ' href="#"' : ' type="button"';
  return `<${tag}${href} class="dsn-link${tag === 'button' ? ' dsn-link-button' : ''} dsn-link--size-default" data-figma-instance="dsn-link" data-figma-properties="showIconStart=true">
      ${icon(iconName, { slot: 'icon-start' })}
      <span data-figma-slot="label">${label}</span>
      ${icon('chevron-right', { slot: 'icon-end' }).replace('<svg ', '<svg style="position: absolute; clip-path: inset(50%);" ')}
    </${tag}>`;
}

export default {
  component: 'File',

  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/link-button/link-button.css',
    '@dsn-starter-kit/components-html/src/spinner/spinner.css',
    '@dsn-starter-kit/components-html/src/form-field-error-message/form-field-error-message.css',
    '@dsn-starter-kit/components-html/src/file/file.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    status: axisValues('File', 'status'),
    actions: ['none', 'delete', 'view', 'download'],
    state: ['default', 'hover', 'active'],
  },

  skipVariant: ({ status, actions, state }) => {
    if (state !== 'default' && actions !== 'view') return true;
    if (actions === 'delete')
      return status === 'loading' || status === 'uploaded';
    if (actions === 'view' || actions === 'download')
      return status !== 'default';
    return false;
  },

  pseudoStates: { hover: 'hover', active: 'active' },
  // De active-stijl hangt aan `:has(.dsn-file__name--stretched:active)`: de
  // muis moet op de link zelf drukken. In het midden van de rij werd alleen
  // hover gemeten.
  pseudoTarget: '.dsn-file__name',

  // De preview-laag rekt mee met het media-vlak.
  absoluteConstraints: {
    preview: { horizontal: 'STRETCH', vertical: 'STRETCH' },
  },

  componentProperties: [
    { name: 'fileName', type: 'TEXT', slot: 'file-name' },
    { name: 'meta', type: 'TEXT', slot: 'meta' },
    {
      name: 'mediaIcon',
      type: 'INSTANCE_SWAP',
      slot: 'media-icon',
      default: 'file-description',
    },
    { name: 'showPreview', type: 'BOOLEAN', slot: 'preview', default: false },
  ],

  render({ status, actions }) {
    const interactive = actions === 'view' || actions === 'download';
    const stretched = actions === 'view';

    const classes = [
      'dsn-file',
      status === 'loading' && 'dsn-file--loading',
      status === 'uploaded' && 'dsn-file--uploaded',
      status === 'error' && 'dsn-file--error',
      stretched && 'dsn-file--interactive',
    ]
      .filter(Boolean)
      .join(' ');

    const name = interactive
      ? `<a href="#" class="dsn-file__name dsn-link${stretched ? ' dsn-file__name--stretched' : ''}" data-figma-instance="none" data-figma-slot="file-name">${TEKST}</a>`
      : `<span class="dsn-file__name" data-figma-slot="file-name">${TEKST}</span>`;

    const errorMessage =
      status === 'error'
        ? `<p class="dsn-form-field-error-message">
             ${icon('exclamation-circle', { slot: 'icon' })}
             <span data-figma-slot="label">${TEKST}</span>
           </p>`
        : '';

    // Zonder actie rendert React een lege kolom. Die blijft in het grid
    // staan, maar wordt geen laag: een leeg frame van 0x0 weigert Figma.
    let action = '';
    if (actions === 'delete') {
      action = linkInstance('button', 'trash', 'Verwijder');
    } else if (actions === 'download') {
      action = linkInstance('a', 'download', 'Download');
    } else if (actions === 'none' && status === 'loading') {
      action = SPINNER;
    } else if (actions === 'none' && status === 'uploaded') {
      action = icon('check', { className: 'dsn-file__status-icon' });
    }

    return `<div class="${classes}" data-figma-root>
      <div class="dsn-file__media" aria-hidden="true" style="position: relative;">
        ${icon('file-description', { slot: 'media-icon' })}
        <div class="dsn-file__preview" data-figma-slot="preview" style="position: absolute; inset: 0;"></div>
      </div>
      <div class="dsn-file__content">
        ${name}
        <span class="dsn-file__meta" data-figma-slot="meta">${TEKST}</span>
        ${errorMessage}
      </div>
      <div class="dsn-file__actions"${action ? '' : ' data-figma-unwrap'}>${action}</div>
    </div>`;
  },
};
