import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import { STORAGE_KEY } from './model/storage';

function frameDocument(): Document {
  const iframe = screen.getByTitle(/^Voorbeeld van het thema/);
  const doc = (iframe as HTMLIFrameElement).contentDocument;
  if (!doc) throw new Error('De iframe heeft geen document');
  return doc;
}

function previewStyle(id: string): string {
  return (
    frameDocument().querySelector(`style[data-preview-style="${id}"]`)
      ?.textContent ?? ''
  );
}

/** Every custom property the app sets in the configurator's own document. */
function tokensInMainDocument(): string[] {
  const inStyles = [...document.querySelectorAll('style')].flatMap(
    (style) => style.textContent?.match(/--dsn-[\w-]+/g) ?? []
  );
  const inline = [...document.querySelectorAll<HTMLElement>('[style]')]
    .filter((element) => !element.closest('iframe'))
    .flatMap((element) =>
      [...element.style].filter((name) => name.startsWith('--dsn-color'))
    );
  return [...inStyles, ...inline];
}

describe('theme configurator', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('toont de preview in een iframe met een titel, met Start als basis', async () => {
    render(<App />);
    await waitFor(() => expect(previewStyle('tokens')).not.toBe(''));
    expect(previewStyle('tokens')).toContain('--dsn-color-accent-1-bg-default');
    expect(
      frameDocument().querySelector('link[data-preview-style="components"]')
    ).toHaveAttribute('rel', 'stylesheet');
    // Start's own config: nothing to override.
    expect(previewStyle('overrides')).toBe('');
    expect(frameDocument().querySelector('h1')?.textContent).toBe(
      'Componenten'
    );
  });

  it('een wijziging raakt alleen de preview; het paneel blijft Start dark', async () => {
    render(<App />);
    await waitFor(() => expect(previewStyle('tokens')).not.toBe(''));
    const before = tokensInMainDocument();

    fireEvent.change(
      screen.getByLabelText('Basiskleur', { selector: '#group-accent-1' }),
      {
        target: { value: '#7c3aed' },
      }
    );

    await waitFor(() =>
      expect(previewStyle('overrides')).toContain(
        '--dsn-color-accent-1-bg-default'
      )
    );
    // accent-2 refers to accent-1 with var(), so it is not overridden itself.
    expect(previewStyle('overrides')).not.toContain('--dsn-color-accent-2-');
    // Nothing in the configurator's own document changed.
    expect(tokensInMainDocument()).toEqual(before);
    expect(document.documentElement.getAttribute('style')).toBeNull();
  });

  it('het paneel laadt Start dark, en alleen dat', () => {
    const main = fs.readFileSync(path.join(__dirname, 'main.tsx'), 'utf-8');
    const tokenImports = main.match(/@dsn-starter-kit\/design-tokens[^'"]*/g);
    expect(tokenImports).toEqual(['@dsn-starter-kit/design-tokens/css/dark']);
  });

  it('wisselt op een klein scherm tussen Instellen en Voorbeeld', () => {
    const { container } = render(<App />);
    const app = container.querySelector('.tc-app');
    expect(app).toHaveAttribute('data-view', 'settings');
    fireEvent.click(screen.getByRole('radio', { name: 'Voorbeeld' }));
    expect(app).toHaveAttribute('data-view', 'preview');
  });

  it('heeft logische koppen en landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Theme configurator' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Instellen' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Voorbeeld' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Onderdelen van het thema' })
    ).toBeInTheDocument();
  });
});
