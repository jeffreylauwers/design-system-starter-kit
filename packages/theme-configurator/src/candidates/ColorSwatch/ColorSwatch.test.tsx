import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSwatch } from './ColorSwatch';

describe('ColorSwatch', () => {
  it('is een knop met naam, waarde en actie als toegankelijke naam', () => {
    render(<ColorSwatch color="#0057b0" name="bg-default" value="#0057b0" />);
    expect(
      screen.getByRole('button', { name: 'bg-default: #0057b0, kopieer' })
    ).toHaveClass('dsn-color-swatch');
  });

  it('geeft de kleur door als custom property', () => {
    render(<ColorSwatch color="oklch(0.5 0.1 250)" name="a" value="b" />);
    expect(
      screen
        .getByRole('button')
        .style.getPropertyValue('--dsn-color-swatch-color')
    ).toBe('oklch(0.5 0.1 250)');
  });

  it('toont voldoende contrast met icoon en tekst, niet alleen met kleur', () => {
    render(
      <ColorSwatch
        color="#000"
        name="color-default"
        value="#000000"
        contrast={{ ratio: 4.623, required: 4.5 }}
      />
    );
    const contrast = screen
      .getByRole('button')
      .querySelector('.dsn-color-swatch__contrast');
    expect(contrast).not.toHaveClass('dsn-color-swatch__contrast--fail');
    expect(screen.getByRole('button')).toHaveAccessibleName(
      'color-default: #000000, contrast 4,62:1, haalt 4,5:1, kopieer'
    );
    expect(contrast).toHaveTextContent('4,62:1');
  });

  it('markeert te weinig contrast', () => {
    render(
      <ColorSwatch
        color="#777"
        name="border-default"
        value="#777777"
        contrast={{ ratio: 2.9, required: 3 }}
      />
    );
    expect(
      screen.getByRole('button').querySelector('.dsn-color-swatch__contrast')
    ).toHaveClass('dsn-color-swatch__contrast--fail');
    expect(screen.getByRole('button')).toHaveAccessibleName(/haalt 3:1 niet/);
  });

  it('roept onClick aan, ook met het toetsenbord', async () => {
    const onClick = vi.fn();
    render(
      <ColorSwatch color="#fff" name="a" value="#ffffff" onClick={onClick} />
    );
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('toont een opmerking en leest die voor', () => {
    render(
      <ColorSwatch
        color="#000"
        name="color-subtle"
        value="#000000"
        note="gelijk aan color-default"
      />
    );
    expect(screen.getByRole('button')).toHaveAccessibleName(
      'color-subtle: #000000, gelijk aan color-default, kopieer'
    );
  });
});
