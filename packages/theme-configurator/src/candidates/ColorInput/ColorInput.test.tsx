import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorInput } from './ColorInput';

function renderInput(props: Partial<Parameters<typeof ColorInput>[0]> = {}) {
  const onChange = vi.fn();
  render(
    <>
      <label htmlFor="accent">Basiskleur</label>
      <ColorInput
        id="accent"
        value="oklch(0.468 0.164 255.8)"
        pickerValue="#0057b0"
        pickerLabel="Kleurkiezer voor accent-1"
        onChange={onChange}
        {...props}
      />
    </>
  );
  return onChange;
}

describe('ColorInput', () => {
  it('heeft een tekstveld met het label en een kleurkiezer met een eigen naam', () => {
    renderInput();
    const text = screen.getByRole('textbox', { name: 'Basiskleur' });
    expect(text).toHaveValue('oklch(0.468 0.164 255.8)');
    expect(text).toHaveClass('dsn-text-input', 'dsn-color-input__text');
    const picker = screen.getByLabelText('Kleurkiezer voor accent-1');
    expect(picker).toHaveAttribute('type', 'color');
    expect(picker).toHaveValue('#0057b0');
  });

  it('geeft getypte tekst door', async () => {
    const onChange = renderInput({ value: '' });
    await userEvent.type(screen.getByRole('textbox'), '#f');
    expect(onChange).toHaveBeenCalledWith('#');
  });

  it('geeft een gekozen kleur door, aan onPick als die er is', () => {
    const onChange = renderInput();
    fireEvent.input(screen.getByLabelText('Kleurkiezer voor accent-1'), {
      target: { value: '#ff0000' },
    });
    expect(onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('meldt een ongeldige waarde met aria-invalid', () => {
    renderInput({ invalid: true });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('schakelt beide velden uit', () => {
    renderInput({ disabled: true });
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByLabelText('Kleurkiezer voor accent-1')).toBeDisabled();
  });
});
