/**
 * DSN Button Web Component
 *
 * A custom element that provides a styled button with multiple variants and sizes.
 * Uses the same CSS classes and design tokens as the HTML and React button components.
 *
 * @example
 * ```html
 * <dsn-button variant="strong" size="default">Save</dsn-button>
 * <dsn-button variant="strong-negative" size="small">Delete</dsn-button>
 * <dsn-button variant="default" loading>Loading...</dsn-button>
 * <dsn-button variant="subtle" icon-only aria-label="Close">×</dsn-button>
 * ```
 */

export type ButtonVariant =
  | 'strong'
  | 'strong-negative'
  | 'strong-positive'
  | 'default'
  | 'default-negative'
  | 'default-positive'
  | 'subtle'
  | 'subtle-negative'
  | 'subtle-positive';

export type ButtonSize = 'small' | 'default' | 'large';

// Auto-generated CSS from shared source — run `node scripts/build-css.js` to regenerate
import { buttonStyles } from './button-styles.generated';
import { iconPaths } from '../icon/icon-paths.generated';

export class DsnButton extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'variant',
      'size',
      'disabled',
      'loading',
      'full-width',
      'icon-only',
      'type',
    ];
  }

  private _button: HTMLButtonElement;
  private _iconStartSlot: HTMLSlotElement;
  private _loaderEl: SVGElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create the internal button element
    this._button = document.createElement('button');
    this._button.setAttribute('type', 'button');
    this._iconStartSlot = document.createElement('slot');
    this._iconStartSlot.setAttribute('name', 'icon-start');
    this._button.appendChild(this._iconStartSlot);
    this._button.appendChild(document.createElement('slot'));
    const iconEndSlot = document.createElement('slot');
    iconEndSlot.setAttribute('name', 'icon-end');
    this._button.appendChild(iconEndSlot);

    // Create style element with embedded CSS
    const style = document.createElement('style');
    style.textContent = buttonStyles;

    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(this._button);
  }

  connectedCallback(): void {
    this._updateClasses();
    this._updateDisabled();
    this._updateType();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    switch (name) {
      case 'variant':
      case 'size':
      case 'loading':
      case 'full-width':
      case 'icon-only':
        this._updateClasses();
        break;
      case 'disabled':
        this._updateDisabled();
        break;
      case 'type':
        this._updateType();
        break;
    }

    // Loading affects classes, disabled state, and loader icon
    if (name === 'loading') {
      this._updateDisabled();
      this._updateLoader();
    }
  }

  private _updateLoader(): void {
    if (this.loading) {
      if (!this._loaderEl) {
        this._loaderEl = this._createLoaderSvg();
      }
      // Hide the icon-start slot and show loader instead
      this._iconStartSlot.style.display = 'none';
      this._button.insertBefore(this._loaderEl, this._iconStartSlot);
    } else {
      if (this._loaderEl && this._loaderEl.parentNode) {
        this._loaderEl.remove();
      }
      this._iconStartSlot.style.display = '';
    }
  }

  private _createLoaderSvg(): SVGElement {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('dsn-icon', 'dsn-button__loader');

    const paths = iconPaths['loader'] || [];
    paths.forEach((d) => {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      // Skip the transparent fill path (bounding box)
      if (d === 'M0 0h24v24H0z') {
        path.setAttribute('stroke', 'none');
        path.setAttribute('fill', 'none');
      }
      svg.appendChild(path);
    });

    return svg;
  }

  private _updateClasses(): void {
    const variant = this.variant;
    const size = this.size;
    const loading = this.loading;
    const fullWidth = this.fullWidth;
    const iconOnly = this.iconOnly;

    const classes = [
      'dsn-button',
      `dsn-button--${variant}`,
      `dsn-button--size-${size}`,
    ];

    if (loading) {
      classes.push('dsn-button--loading');
    }
    if (fullWidth) {
      classes.push('dsn-button--full-width');
    }
    if (iconOnly) {
      classes.push('dsn-button--icon-only');
    }

    this._button.className = classes.join(' ');
  }

  private _updateDisabled(): void {
    const isDisabled = this.disabled || this.loading;
    if (isDisabled) {
      this._button.setAttribute('disabled', '');
    } else {
      this._button.removeAttribute('disabled');
    }

    if (this.loading) {
      this._button.setAttribute('aria-busy', 'true');
    } else {
      this._button.removeAttribute('aria-busy');
    }
  }

  private _updateType(): void {
    this._button.setAttribute('type', this.type);
  }

  // Property: variant
  get variant(): ButtonVariant {
    return (this.getAttribute('variant') as ButtonVariant) || 'strong';
  }

  set variant(value: ButtonVariant) {
    this.setAttribute('variant', value);
  }

  // Property: size
  get size(): ButtonSize {
    return (this.getAttribute('size') as ButtonSize) || 'default';
  }

  set size(value: ButtonSize) {
    this.setAttribute('size', value);
  }

  // Property: disabled
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  // Property: loading
  get loading(): boolean {
    return this.hasAttribute('loading');
  }

  set loading(value: boolean) {
    if (value) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  // Property: fullWidth (maps to full-width attribute)
  get fullWidth(): boolean {
    return this.hasAttribute('full-width');
  }

  set fullWidth(value: boolean) {
    if (value) {
      this.setAttribute('full-width', '');
    } else {
      this.removeAttribute('full-width');
    }
  }

  // Property: iconOnly (maps to icon-only attribute)
  get iconOnly(): boolean {
    return this.hasAttribute('icon-only');
  }

  set iconOnly(value: boolean) {
    if (value) {
      this.setAttribute('icon-only', '');
    } else {
      this.removeAttribute('icon-only');
    }
  }

  // Property: type
  get type(): string {
    return this.getAttribute('type') || 'button';
  }

  set type(value: string) {
    this.setAttribute('type', value);
  }

  // Expose the internal button for form submission
  get form(): HTMLFormElement | null {
    return this._button.form;
  }

  // Focus delegation
  focus(options?: FocusOptions): void {
    this._button.focus(options);
  }

  blur(): void {
    this._button.blur();
  }

  click(): void {
    this._button.click();
  }
}

// Register the custom element
export function defineButton(tagName = 'dsn-button'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, DsnButton);
  }
}
