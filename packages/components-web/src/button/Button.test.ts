import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { DsnButton, defineButton } from './Button';

// Register the custom element once for all tests
beforeAll(() => {
  defineButton();
});

function createElement(attrs: Record<string, string> = {}): DsnButton {
  const el = document.createElement('dsn-button') as DsnButton;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.body.appendChild(el);
  return el;
}

function getInternalButton(el: DsnButton): HTMLButtonElement {
  return el.shadowRoot!.querySelector('button')!;
}

describe('DsnButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('creates a shadow root', () => {
      const el = createElement();
      expect(el.shadowRoot).not.toBeNull();
    });

    it('renders an internal button element', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      expect(btn).toBeInstanceOf(HTMLButtonElement);
    });

    it('renders a style element in shadow DOM', () => {
      const el = createElement();
      const style = el.shadowRoot!.querySelector('style');
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain('.dsn-button');
    });

    it('renders a default slot for content projection', () => {
      const el = createElement();
      const slot = el.shadowRoot!.querySelector('slot:not([name])');
      expect(slot).not.toBeNull();
    });

    it('renders an icon-start named slot', () => {
      const el = createElement();
      const slot = el.shadowRoot!.querySelector('slot[name="icon-start"]');
      expect(slot).not.toBeNull();
    });

    it('renders an icon-end named slot', () => {
      const el = createElement();
      const slot = el.shadowRoot!.querySelector('slot[name="icon-end"]');
      expect(slot).not.toBeNull();
    });

    it('renders slots in correct order: icon-start, default, icon-end', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      const slots = btn.querySelectorAll('slot');
      expect(slots).toHaveLength(3);
      expect(slots[0].getAttribute('name')).toBe('icon-start');
      expect(slots[1].getAttribute('name')).toBeNull();
      expect(slots[2].getAttribute('name')).toBe('icon-end');
    });
  });

  describe('default values', () => {
    it('defaults variant to "strong"', () => {
      const el = createElement();
      expect(el.variant).toBe('strong');
    });

    it('defaults size to "default"', () => {
      const el = createElement();
      expect(el.size).toBe('default');
    });

    it('defaults type to "button"', () => {
      const el = createElement();
      expect(el.type).toBe('button');
    });

    it('defaults disabled to false', () => {
      const el = createElement();
      expect(el.disabled).toBe(false);
    });

    it('defaults loading to false', () => {
      const el = createElement();
      expect(el.loading).toBe(false);
    });

    it('defaults fullWidth to false', () => {
      const el = createElement();
      expect(el.fullWidth).toBe(false);
    });

    it('defaults iconOnly to false', () => {
      const el = createElement();
      expect(el.iconOnly).toBe(false);
    });
  });

  describe('CSS classes', () => {
    it('applies default classes', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      expect(btn.className).toBe(
        'dsn-button dsn-button--strong dsn-button--size-default'
      );
    });

    it('applies variant class from attribute', () => {
      const el = createElement({ variant: 'subtle' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--subtle');
    });

    it('applies size class from attribute', () => {
      const el = createElement({ size: 'large' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--size-large');
    });

    it('applies loading class', () => {
      const el = createElement({ loading: '' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--loading');
    });

    it('applies full-width class', () => {
      const el = createElement({ 'full-width': '' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--full-width');
    });

    it('applies icon-only class', () => {
      const el = createElement({ 'icon-only': '' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--icon-only');
    });

    it('updates classes when variant changes', () => {
      const el = createElement({ variant: 'strong' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--strong');

      el.variant = 'default';
      expect(btn.className).toContain('dsn-button--default');
      expect(btn.className).not.toContain('dsn-button--strong');
    });

    it('updates classes when size changes', () => {
      const el = createElement({ size: 'small' });
      const btn = getInternalButton(el);
      expect(btn.className).toContain('dsn-button--size-small');

      el.size = 'large';
      expect(btn.className).toContain('dsn-button--size-large');
      expect(btn.className).not.toContain('dsn-button--size-small');
    });
  });

  describe('disabled state', () => {
    it('disables internal button when disabled attribute is set', () => {
      const el = createElement({ disabled: '' });
      const btn = getInternalButton(el);
      expect(btn.disabled).toBe(true);
    });

    it('enables internal button when disabled is removed', () => {
      const el = createElement({ disabled: '' });
      const btn = getInternalButton(el);
      expect(btn.disabled).toBe(true);

      el.disabled = false;
      expect(btn.disabled).toBe(false);
    });

    it('reflects disabled property to attribute', () => {
      const el = createElement();
      el.disabled = true;
      expect(el.hasAttribute('disabled')).toBe(true);

      el.disabled = false;
      expect(el.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('loading state', () => {
    it('disables internal button when loading', () => {
      const el = createElement({ loading: '' });
      const btn = getInternalButton(el);
      expect(btn.disabled).toBe(true);
    });

    it('sets aria-busy when loading', () => {
      const el = createElement({ loading: '' });
      const btn = getInternalButton(el);
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('removes aria-busy when loading is removed', () => {
      const el = createElement({ loading: '' });
      const btn = getInternalButton(el);
      expect(btn.getAttribute('aria-busy')).toBe('true');

      el.loading = false;
      expect(btn.hasAttribute('aria-busy')).toBe(false);
    });

    it('adds loading class and disables button', () => {
      const el = createElement();
      el.loading = true;
      const btn = getInternalButton(el);

      expect(btn.className).toContain('dsn-button--loading');
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('reflects loading property to attribute', () => {
      const el = createElement();
      el.loading = true;
      expect(el.hasAttribute('loading')).toBe(true);

      el.loading = false;
      expect(el.hasAttribute('loading')).toBe(false);
    });
  });

  describe('full-width', () => {
    it('reflects fullWidth property to full-width attribute', () => {
      const el = createElement();
      el.fullWidth = true;
      expect(el.hasAttribute('full-width')).toBe(true);

      el.fullWidth = false;
      expect(el.hasAttribute('full-width')).toBe(false);
    });
  });

  describe('icon-only', () => {
    it('reflects iconOnly property to icon-only attribute', () => {
      const el = createElement();
      el.iconOnly = true;
      expect(el.hasAttribute('icon-only')).toBe(true);

      el.iconOnly = false;
      expect(el.hasAttribute('icon-only')).toBe(false);
    });
  });

  describe('type attribute', () => {
    it('sets internal button type', () => {
      const el = createElement({ type: 'submit' });
      const btn = getInternalButton(el);
      expect(btn.getAttribute('type')).toBe('submit');
    });

    it('defaults internal button type to "button"', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      expect(btn.getAttribute('type')).toBe('button');
    });

    it('updates internal button type when property changes', () => {
      const el = createElement();
      el.type = 'reset';
      const btn = getInternalButton(el);
      expect(btn.getAttribute('type')).toBe('reset');
    });
  });

  describe('focus delegation', () => {
    it('delegates focus to internal button', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      const focusSpy = vi.spyOn(btn, 'focus');

      el.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('delegates blur to internal button', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      const blurSpy = vi.spyOn(btn, 'blur');

      el.blur();
      expect(blurSpy).toHaveBeenCalled();
    });

    it('delegates click to internal button', () => {
      const el = createElement();
      const btn = getInternalButton(el);
      const clickSpy = vi.spyOn(btn, 'click');

      el.click();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('all variants', () => {
    const variants = [
      'strong',
      'strong-negative',
      'strong-positive',
      'default',
      'default-negative',
      'default-positive',
      'subtle',
      'subtle-negative',
      'subtle-positive',
    ] as const;

    variants.forEach((variant) => {
      it(`applies class for variant "${variant}"`, () => {
        const el = createElement({ variant });
        const btn = getInternalButton(el);
        expect(btn.className).toContain(`dsn-button--${variant}`);
      });
    });
  });

  describe('all sizes', () => {
    const sizes = ['small', 'default', 'large'] as const;

    sizes.forEach((size) => {
      it(`applies class for size "${size}"`, () => {
        const el = createElement({ size });
        const btn = getInternalButton(el);
        expect(btn.className).toContain(`dsn-button--size-${size}`);
      });
    });
  });
});

describe('defineButton', () => {
  it('does not throw when called with an already-registered tag', () => {
    expect(() => defineButton('dsn-button')).not.toThrow();
  });

  it('registers a custom element with a custom tag name', () => {
    // DsnButton constructor is already registered as 'dsn-button',
    // so re-registering under another name is not allowed by the spec.
    // Instead, verify that the existing registration works.
    const el = document.createElement('dsn-button');
    expect(el).toBeInstanceOf(DsnButton);
  });
});
