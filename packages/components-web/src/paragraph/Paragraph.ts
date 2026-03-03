/**
 * DSN Paragraph Web Component
 *
 * A custom element that provides a styled paragraph with multiple variants.
 * Uses the same CSS classes and design tokens as the HTML and React paragraph components.
 *
 * @example
 * ```html
 * <dsn-paragraph>Default body text</dsn-paragraph>
 * <dsn-paragraph variant="lead">Introductory text</dsn-paragraph>
 * <dsn-paragraph variant="small-print">Terms and conditions apply.</dsn-paragraph>
 * ```
 */

export type ParagraphVariant = 'default' | 'lead' | 'small-print';

// Auto-generated CSS from shared source — run `node scripts/build-css.js` to regenerate
import { paragraphStyles } from './paragraph-styles.generated';

export class DsnParagraph extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['variant'];
  }

  private _paragraph: HTMLParagraphElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create the internal paragraph element
    this._paragraph = document.createElement('p');
    this._paragraph.innerHTML = '<slot></slot>';

    // Create style element with embedded CSS
    const style = document.createElement('style');
    style.textContent = paragraphStyles;

    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(this._paragraph);
  }

  connectedCallback(): void {
    this._updateClasses();
  }

  attributeChangedCallback(): void {
    this._updateClasses();
  }

  private _updateClasses(): void {
    const variant = this.variant;

    const classes = [
      'dsn-paragraph',
      variant !== 'default' && `dsn-paragraph--${variant}`,
    ].filter(Boolean) as string[];

    this._paragraph.className = classes.join(' ');
  }

  // Property: variant
  get variant(): ParagraphVariant {
    return (this.getAttribute('variant') as ParagraphVariant) || 'default';
  }

  set variant(value: ParagraphVariant) {
    this.setAttribute('variant', value);
  }
}

// Register the custom element
export function defineParagraph(tagName = 'dsn-paragraph'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, DsnParagraph);
  }
}
