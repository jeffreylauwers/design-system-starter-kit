import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Popover,
  PopoverHeader,
  PopoverHeading,
  PopoverBody,
  PopoverFooter,
  Button,
  Menu,
  MenuButton,
  ActionGroup,
  Paragraph,
} from '@dsn-starter-kit/components-react';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    dsn: {
      htmlTemplate: () => {
        return `<div class="dsn-popover-wrapper">
  <button
    type="button"
    class="dsn-button dsn-button--subtle dsn-button--size-default"
    popovertarget="popover-demo"
    aria-expanded="false"
  >
    <span class="dsn-button__label">Acties</span>
  </button>

  <div
    id="popover-demo"
    popover="auto"
    class="dsn-popover dsn-popover--placement-bottom"
    role="dialog"
    aria-modal="false"
    tabindex="-1"
    aria-label="Acties"
  >
    <div class="dsn-popover__body">
      <ul class="dsn-menu">
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
    </div>
  </div>
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
type Story = StoryObj<typeof Popover>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: () => {
    function Demo() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div
          style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            ref={triggerRef}
            variant="subtle"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Acties
          </Button>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            triggerRef={triggerRef}
            label="Acties"
          >
            <PopoverBody>
              <Menu>
                <MenuButton onClick={() => setIsOpen(false)}>
                  Bewerken
                </MenuButton>
                <MenuButton onClick={() => setIsOpen(false)}>
                  Dupliceren
                </MenuButton>
                <MenuButton onClick={() => setIsOpen(false)}>
                  Verwijderen
                </MenuButton>
              </Menu>
            </PopoverBody>
          </Popover>
        </div>
      );
    }
    return <Demo />;
  },
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithHeader: Story = {
  render: () => {
    function Demo() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div
          style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            ref={triggerRef}
            variant="default"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Filters
          </Button>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            triggerRef={triggerRef}
          >
            <PopoverHeader>
              <PopoverHeading>Filters</PopoverHeading>
            </PopoverHeader>
            <PopoverBody>
              <Paragraph>Pas filters toe op de resultaten.</Paragraph>
            </PopoverBody>
          </Popover>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithHeaderAndFooter: Story = {
  name: 'With Header and Footer',
  render: () => {
    function Demo() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div
          style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            ref={triggerRef}
            variant="default"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Filters
          </Button>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            triggerRef={triggerRef}
          >
            <PopoverHeader>
              <PopoverHeading>Filters</PopoverHeading>
            </PopoverHeader>
            <PopoverBody>
              <Paragraph>Selecteer de gewenste filters.</Paragraph>
            </PopoverBody>
            <PopoverFooter>
              <ActionGroup>
                <Button
                  variant="strong"
                  size="small"
                  onClick={() => setIsOpen(false)}
                >
                  Toepassen
                </Button>
                <Button
                  variant="default"
                  size="small"
                  onClick={() => setIsOpen(false)}
                >
                  Annuleren
                </Button>
              </ActionGroup>
            </PopoverFooter>
          </Popover>
        </div>
      );
    }
    return <Demo />;
  },
};

// =============================================================================
// PLAATSING
// =============================================================================

function PlacementDemo({
  placement,
}: {
  placement: NonNullable<React.ComponentProps<typeof Popover>['placement']>;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}>
      <Button
        ref={triggerRef}
        variant="default"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Plaatsing: {placement}
      </Button>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        placement={placement}
        label={`Popover ${placement}`}
      >
        <PopoverBody>
          <Menu>
            <MenuButton onClick={() => setIsOpen(false)}>Optie 1</MenuButton>
            <MenuButton onClick={() => setIsOpen(false)}>Optie 2</MenuButton>
          </Menu>
        </PopoverBody>
      </Popover>
    </div>
  );
}

export const PlacementBottom: Story = {
  name: 'Placement: Bottom (default)',
  render: () => <PlacementDemo placement="bottom" />,
};

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

export const AllPlacements: Story = {
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
  name: 'Short Content',
  render: () => {
    function Demo() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div
          style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            ref={triggerRef}
            variant="default"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Info
          </Button>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            triggerRef={triggerRef}
            label="Info"
          >
            <PopoverBody>
              <Paragraph>Korte tekst.</Paragraph>
            </PopoverBody>
          </Popover>
        </div>
      );
    }
    return <Demo />;
  },
};

export const LongText: Story = {
  name: 'Long Content',
  render: () => {
    function Demo() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div
          style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            ref={triggerRef}
            variant="default"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Meer informatie
          </Button>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            triggerRef={triggerRef}
          >
            <PopoverHeader>
              <PopoverHeading>Aanvullende informatie</PopoverHeading>
            </PopoverHeader>
            <PopoverBody>
              <Paragraph>
                Dit is een langere tekst die de maximale breedte van de popover
                kan benaderen. De popover heeft een max-width van 25rem (400px)
                en breekt automatisch naar meerdere regels wanneer de content
                breder is dan de beschikbare ruimte.
              </Paragraph>
            </PopoverBody>
          </Popover>
        </div>
      );
    }
    return <Demo />;
  },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL (start/end placement mirrored)',
  decorators: [rtlDecorator],
  render: () => {
    function Demo() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div
          style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            ref={triggerRef}
            variant="subtle"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            إجراءات
          </Button>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            triggerRef={triggerRef}
            label="إجراءات"
            placement="end"
          >
            <PopoverBody>
              <Menu>
                <MenuButton onClick={() => setIsOpen(false)}>تعديل</MenuButton>
                <MenuButton onClick={() => setIsOpen(false)}>حذف</MenuButton>
              </Menu>
            </PopoverBody>
          </Popover>
        </div>
      );
    }
    return <Demo />;
  },
};
