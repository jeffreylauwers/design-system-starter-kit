import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { DsnParagraph, defineParagraph } from './Paragraph';

// Register the custom element once for all tests
beforeAll(() => {
  defineParagraph();
});

function createElement(attrs: Record<string, string> = {}): DsnParagraph {
  const el = document.createElement('dsn-paragraph') as DsnParagraph;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.body.appendChild(el);
  return el;
}

function getInternalParagraph(el: DsnParagraph): HTMLParagraphElement {
  return el.shadowRoot!.querySelector('p')!;
}

describe('DsnParagraph', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('creates a shadow root', () => {
      const el = createElement();
      expect(el.shadowRoot).not.toBeNull();
    });

    it('renders an internal paragraph element', () => {
      const el = createElement();
      const p = getInternalParagraph(el);
      expect(p).toBeInstanceOf(HTMLParagraphElement);
    });

    it('renders a style element in shadow DOM', () => {
      const el = createElement();
      const style = el.shadowRoot!.querySelector('style');
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain('.dsn-paragraph');
    });

    it('renders a slot for content projection', () => {
      const el = createElement();
      const slot = el.shadowRoot!.querySelector('slot');
      expect(slot).not.toBeNull();
    });
  });

  describe('variant attribute', () => {
    it('defaults to "default" variant — no modifier class added', () => {
      const el = createElement();
      const p = getInternalParagraph(el);
      expect(p.className).toContain('dsn-paragraph');
      expect(p.className).not.toContain('dsn-paragraph--default');
    });

    it('applies "lead" variant', () => {
      const el = createElement({ variant: 'lead' });
      const p = getInternalParagraph(el);
      expect(p.className).toContain('dsn-paragraph--lead');
    });

    it('applies "small-print" variant', () => {
      const el = createElement({ variant: 'small-print' });
      const p = getInternalParagraph(el);
      expect(p.className).toContain('dsn-paragraph--small-print');
    });

    it('updates classes when variant changes', () => {
      const el = createElement({ variant: 'default' });
      const p = getInternalParagraph(el);
      expect(p.className).not.toContain('dsn-paragraph--default');

      el.setAttribute('variant', 'lead');
      expect(p.className).toContain('dsn-paragraph--lead');
      expect(p.className).not.toContain('dsn-paragraph--default');
    });
  });

  describe('variant property', () => {
    it('returns "default" when no attribute set', () => {
      const el = createElement();
      expect(el.variant).toBe('default');
    });

    it('reflects the attribute value', () => {
      const el = createElement({ variant: 'lead' });
      expect(el.variant).toBe('lead');
    });

    it('sets the attribute when property is set', () => {
      const el = createElement();
      el.variant = 'small-print';
      expect(el.getAttribute('variant')).toBe('small-print');
    });

    it('updates classes when property is set', () => {
      const el = createElement();
      const p = getInternalParagraph(el);

      el.variant = 'lead';
      expect(p.className).toContain('dsn-paragraph--lead');
    });
  });

  describe('base class', () => {
    it('always includes dsn-paragraph base class', () => {
      const el = createElement();
      const p = getInternalParagraph(el);
      expect(p.className).toContain('dsn-paragraph');
    });

    it('includes base class with lead variant', () => {
      const el = createElement({ variant: 'lead' });
      const p = getInternalParagraph(el);
      expect(p.className).toContain('dsn-paragraph');
      expect(p.className).toContain('dsn-paragraph--lead');
    });

    it('includes base class with small-print variant', () => {
      const el = createElement({ variant: 'small-print' });
      const p = getInternalParagraph(el);
      expect(p.className).toContain('dsn-paragraph');
      expect(p.className).toContain('dsn-paragraph--small-print');
    });
  });

  describe('custom element registration', () => {
    it('is defined as dsn-paragraph', () => {
      expect(customElements.get('dsn-paragraph')).toBe(DsnParagraph);
    });

    it('does not re-register if already defined', () => {
      // Should not throw
      defineParagraph();
      expect(customElements.get('dsn-paragraph')).toBe(DsnParagraph);
    });
  });
});
