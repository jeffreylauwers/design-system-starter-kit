import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  PopoverMenu,
  Button,
  Icon,
  MenuButton,
  MenuLink,
  NumberBadge,
} from '@dsn-starter-kit/components-react';
import {
  rtlDecorator,
  TEKST,
  VEEL_TEKST,
  VEEL_TEKST_AR,
} from './story-helpers';

type Placement = NonNullable<
  React.ComponentProps<typeof PopoverMenu>['placement']
>;

const meta: Meta<typeof PopoverMenu> = {
  title: 'Components/PopoverMenu',
  component: PopoverMenu,
  parameters: {
    dsn: {
      htmlTemplate: () => {
        return `<button
  type="button"
  class="dsn-button dsn-button--subtle dsn-button--size-default"
  popovertarget="popover-menu-acties"
>
  <span class="dsn-button__label">Acties</span>
</button>

<div
  id="popover-menu-acties"
  popover="auto"
  class="dsn-popover-menu dsn-popover-menu--placement-bottom"
>
  <ul class="dsn-menu" role="list">
    <li class="dsn-menu-button">
      <button type="button" class="dsn-menu-button__button">
        <span class="dsn-menu-button__label">Bewerken</span>
      </button>
    </li>
    <li class="dsn-menu-button">
      <button type="button" class="dsn-menu-button__button">
        <span class="dsn-menu-button__label">Dupliceren</span>
      </button>
    </li>
    <li class="dsn-menu-button">
      <button type="button" class="dsn-menu-button__button">
        <span class="dsn-menu-button__label">Verwijderen</span>
      </button>
    </li>
  </ul>
</div>`;
      },
    },
  },
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
    triggerRef: { control: false },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PopoverMenu>;

/**
 * Trigger + PopoverMenu met eigen open-staat. De items sluiten het menu zelf;
 * een eigen onClick is voor de actie, niet om te sluiten.
 */
function Demo({
  trigger,
  triggerIconEnd,
  placement,
  iconStart,
  padding = '4rem',
  children,
}: {
  trigger: React.ReactNode;
  triggerIconEnd?: React.ReactNode;
  placement?: Placement;
  iconStart?: boolean;
  padding?: string;
  children: React.ReactNode;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div style={{ padding, display: 'flex', justifyContent: 'center' }}>
      <Button
        ref={triggerRef}
        variant="subtle"
        iconEnd={triggerIconEnd}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {trigger}
      </Button>
      <PopoverMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        placement={placement}
        iconStart={iconStart}
      >
        {children}
      </PopoverMenu>
    </div>
  );
}

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: () => (
    <Demo trigger="Acties">
      <MenuButton>Bewerken</MenuButton>
      <MenuButton>Dupliceren</MenuButton>
      <MenuButton>Verwijderen</MenuButton>
    </Demo>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithLinks: Story = {
  render: () => (
    <Demo
      trigger="J. van Drouwen"
      triggerIconEnd={<Icon name="chevron-down" aria-hidden />}
    >
      <MenuLink href="#overzicht" level={1}>
        Overzicht
      </MenuLink>
      <MenuLink href="#berichten" level={1}>
        Berichten
      </MenuLink>
      <MenuLink href="#gegevens" level={1}>
        Gegevens
      </MenuLink>
      <MenuLink href="#uitloggen" level={1}>
        Uitloggen
      </MenuLink>
    </Demo>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Demo trigger="Acties" iconStart>
      <MenuButton iconStart={<Icon name="edit" aria-hidden />}>
        Bewerken
      </MenuButton>
      <MenuButton iconStart={<Icon name="archive" aria-hidden />}>
        Archiveren
      </MenuButton>
      <MenuButton iconStart={<Icon name="trash" aria-hidden />}>
        Verwijderen
      </MenuButton>
    </Demo>
  ),
};

export const WithNumberBadge: Story = {
  render: () => (
    <Demo trigger="Mijn omgeving">
      <MenuLink href="#overzicht" level={1}>
        Overzicht
      </MenuLink>
      <MenuLink
        href="#berichten"
        level={1}
        numberBadge={
          <NumberBadge variant="negative" aria-hidden>
            2
          </NumberBadge>
        }
      >
        Berichten
        <span className="dsn-visually-hidden"> (2 ongelezen)</span>
      </MenuLink>
      <MenuLink href="#gegevens" level={1}>
        Gegevens
      </MenuLink>
    </Demo>
  ),
};

function PlacementDemo({ placement }: { placement: Placement }) {
  return (
    <Demo
      trigger={`Plaatsing: ${placement}`}
      placement={placement}
      padding="6rem"
    >
      <MenuButton>Optie 1</MenuButton>
      <MenuButton>Optie 2</MenuButton>
    </Demo>
  );
}

export const PlacementTop: Story = {
  name: 'Placement: Top',
  render: () => <PlacementDemo placement="top" />,
};

export const PlacementEnd: Story = {
  name: 'Placement: End (right in LTR)',
  render: () => <PlacementDemo placement="end" />,
};

export const PlacementStart: Story = {
  name: 'Placement: Start (left in LTR)',
  render: () => <PlacementDemo placement="start" />,
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        padding: '6rem',
      }}
    >
      <PlacementDemo placement="bottom" />
      <PlacementDemo placement="top" />
      <PlacementDemo placement="end" />
      <PlacementDemo placement="start" />
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  render: () => (
    <Demo trigger={TEKST}>
      <MenuButton>{TEKST}</MenuButton>
      <MenuButton>{TEKST}</MenuButton>
    </Demo>
  ),
};

export const LongText: Story = {
  render: () => (
    <Demo trigger="Acties">
      <MenuButton>{VEEL_TEKST}</MenuButton>
      <MenuButton>Dupliceren</MenuButton>
    </Demo>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: () => (
    <Demo trigger="إجراءات" placement="end">
      <MenuButton>تعديل</MenuButton>
      <MenuButton>حذف</MenuButton>
    </Demo>
  ),
};

export const RTLLongText: Story = {
  decorators: [rtlDecorator],
  render: () => (
    <Demo trigger="إجراءات">
      <MenuButton>{VEEL_TEKST_AR}</MenuButton>
      <MenuButton>حذف</MenuButton>
    </Demo>
  ),
};
