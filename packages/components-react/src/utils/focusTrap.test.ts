import { describe, it, expect } from 'vitest';
import { getFocusableElements } from './focusTrap';

function makeContainer(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

describe('getFocusableElements', () => {
  it('returns focusable elements in DOM order', () => {
    const container = makeContainer(`
      <button type="button">Eerste</button>
      <a href="/ergens">Link</a>
      <input type="text" />
      <textarea></textarea>
      <select></select>
    `);
    const focusable = getFocusableElements(container);
    expect(focusable.map((el) => el.tagName)).toEqual([
      'BUTTON',
      'A',
      'INPUT',
      'TEXTAREA',
      'SELECT',
    ]);
  });

  it('skips disabled controls', () => {
    const container = makeContainer(`
      <button type="button">Actief</button>
      <button type="button" disabled>Uitgeschakeld</button>
      <input type="text" disabled />
    `);
    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);
    expect(focusable[0]).toHaveTextContent('Actief');
  });

  it('skips elements with a negative tabindex', () => {
    const container = makeContainer(`
      <h2 tabindex="-1">Titel</h2>
      <div tabindex="0">Focusbaar</div>
    `);
    const focusable = getFocusableElements(container);
    expect(focusable.map((el) => el.tagName)).toEqual(['DIV']);
  });

  it('skips hidden, inert and aria-hidden subtrees', () => {
    const container = makeContainer(`
      <button type="button">Zichtbaar</button>
      <div hidden><button type="button">Verborgen</button></div>
      <div inert><button type="button">Inert</button></div>
      <div aria-hidden="true"><button type="button">Aria-hidden</button></div>
    `);
    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);
    expect(focusable[0]).toHaveTextContent('Zichtbaar');
  });

  it('skips hidden inputs', () => {
    const container = makeContainer(`
      <input type="hidden" value="x" />
      <input type="text" />
    `);
    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);
    expect(focusable[0]).toHaveAttribute('type', 'text');
  });

  it('returns an empty list when there is nothing to focus', () => {
    const container = makeContainer('<p>Alleen tekst</p>');
    expect(getFocusableElements(container)).toEqual([]);
  });
});
