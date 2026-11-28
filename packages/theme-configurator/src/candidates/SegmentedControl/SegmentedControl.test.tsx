import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

function renderControl(onChange = vi.fn()) {
  render(
    <SegmentedControl
      legend="Modus"
      options={[...OPTIONS]}
      value="light"
      onChange={onChange}
    />
  );
  return onChange;
}

describe('SegmentedControl', () => {
  it('is een groep radioknoppen met de legend als naam', () => {
    renderControl();
    expect(screen.getByRole('group', { name: 'Modus' })).toHaveClass(
      'dsn-segmented-control'
    );
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked();
  });

  it('meldt de keuze bij klikken', async () => {
    const onChange = renderControl();
    await userEvent.click(screen.getByText('Dark'));
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('kiest met de pijltjestoetsen', async () => {
    const onChange = renderControl();
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('verbergt de legend alleen visueel', () => {
    render(
      <SegmentedControl
        legend="Weergave"
        hideLegend
        options={[...OPTIONS]}
        value="dark"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Weergave')).toHaveClass('dsn-visually-hidden');
    expect(screen.getByRole('group', { name: 'Weergave' })).toBeInTheDocument();
  });

  it('slaat een uitgeschakelde optie over', () => {
    render(
      <SegmentedControl
        legend="Modus"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
        ]}
        value="a"
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();
  });
});
