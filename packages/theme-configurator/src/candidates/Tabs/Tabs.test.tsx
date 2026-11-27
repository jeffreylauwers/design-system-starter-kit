import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

const TABS = [
  { id: 'kleur', label: 'Kleur', content: <p>Kleurinstellingen</p> },
  { id: 'typografie', label: 'Typografie', content: <p>Lettertypen</p> },
  { id: 'vorm', label: 'Vorm', content: <p>Hoeken</p> },
];

describe('Tabs', () => {
  it('volgt het tabs-patroon: tablist, tabs en gekoppelde panelen', () => {
    render(<Tabs label="Onderdelen" tabs={TABS} />);
    expect(
      screen.getByRole('tablist', { name: 'Onderdelen' })
    ).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: 'Kleur' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel', { name: 'Kleur' });
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveTextContent('Kleurinstellingen');
  });

  it('heeft alleen de geselecteerde tab in de tabvolgorde', () => {
    render(<Tabs label="Onderdelen" tabs={TABS} />);
    expect(screen.getByRole('tab', { name: 'Kleur' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('tab', { name: 'Vorm' })).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  it('wisselt met klikken en houdt de andere panelen verborgen', async () => {
    render(<Tabs label="Onderdelen" tabs={TABS} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Typografie' }));
    expect(screen.getByRole('tabpanel', { name: 'Typografie' })).toBeVisible();
    expect(
      screen.getByText('Kleurinstellingen').closest('[role]')
    ).toHaveAttribute('hidden');
  });

  it('gaat met pijltjes, Home en End naar een andere tab en selecteert hem', async () => {
    const onSelect = vi.fn();
    render(<Tabs label="Onderdelen" tabs={TABS} onSelect={onSelect} />);
    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'Kleur' })).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Vorm' })).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('vorm');

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Kleur' })).toHaveFocus();

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Vorm' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Kleur' })).toHaveFocus();
  });

  it('volgt selectedId als hij gecontroleerd wordt', () => {
    render(<Tabs label="Onderdelen" tabs={TABS} selectedId="vorm" />);
    expect(screen.getByRole('tab', { name: 'Vorm' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
