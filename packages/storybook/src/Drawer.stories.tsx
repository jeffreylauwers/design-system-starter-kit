import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Drawer,
  DrawerHeader,
  DrawerHeading,
  DrawerBody,
  DrawerFooter,
  ActionGroup,
  Button,
  Paragraph,
} from '@dsn-starter-kit/components-react';
import {
  TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    dsn: {
      htmlTemplate: () => {
        return `<button type="button" class="dsn-button dsn-button--default dsn-button--size-default" onclick="this.nextElementSibling.showModal()">
  <span class="dsn-button__label">Zijpaneel openen</span>
</button>
<dialog class="dsn-drawer dsn-drawer--side-right" aria-labelledby="drawer-title">
  <div class="dsn-drawer__header">
    <h2 class="dsn-drawer-heading" id="drawer-title">Zijpaneel titel</h2>
    <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only" onclick="this.closest('dialog').close()">
      <svg class="dsn-icon" aria-hidden="true"><!-- x --></svg>
      <span class="dsn-button__label">Sluiten</span>
    </button>
  </div>
  <div class="dsn-drawer__body">
    <p class="dsn-paragraph">${TEKST}</p>
  </div>
  <div class="dsn-drawer__footer">
    <ul class="dsn-action-group" aria-label="Acties">
      <li class="dsn-action-group__item">
        <button type="button" class="dsn-button dsn-button--strong dsn-button--size-default" onclick="this.closest('dialog').close()">
          <span class="dsn-button__label">Toepassen</span>
        </button>
      </li>
      <li class="dsn-action-group__item">
        <button type="button" class="dsn-button dsn-button--default dsn-button--size-default" onclick="this.closest('dialog').close()">
          <span class="dsn-button__label">Annuleren</span>
        </button>
      </li>
    </ul>
  </div>
</dialog>`;
      },
    },
  },
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
    children: { control: false },
    modal: {
      control: 'boolean',
      description:
        'Modaal (`true`): achtergrond geblokkeerd via `.showModal()`. Non-modaal (`false`): achtergrond blijft interactief.',
    },
    side: {
      control: 'radio',
      options: ['right', 'left'],
      description: 'De kant van de viewport vanwaar het zijpaneel inschuift.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

// =============================================================================
// Helper: trigger + drawer wrapper
// =============================================================================

function DrawerWithTrigger({
  triggerLabel = 'Zijpaneel openen',
  modal = true,
  side = 'right' as const,
  children,
}: {
  triggerLabel?: string;
  modal?: boolean;
  side?: 'right' | 'left';
  children: (close: () => void) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button variant="default" onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        modal={modal}
        side={side}
      >
        {children(() => setIsOpen(false))}
      </Drawer>
    </>
  );
}

// =============================================================================
// DEFAULT (modal, side-right)
// =============================================================================

export const Default: Story = {
  args: {
    modal: true,
    side: 'right',
  },
  render: (args) => (
    <DrawerWithTrigger modal={args.modal} side={args.side}>
      {(close) => (
        <>
          <DrawerHeader>
            <DrawerHeading>Zijpaneel titel</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Paragraph>{TEKST}</Paragraph>
          </DrawerBody>
          <DrawerFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                Toepassen
              </Button>
              <Button variant="default" onClick={close}>
                Annuleren
              </Button>
            </ActionGroup>
          </DrawerFooter>
        </>
      )}
    </DrawerWithTrigger>
  ),
};

// =============================================================================
// NON-MODAL
// =============================================================================

export const NonModal: Story = {
  name: 'Non-modal (achtergrond interactief)',
  render: () => (
    <DrawerWithTrigger triggerLabel="Non-modal zijpaneel openen" modal={false}>
      {(close) => (
        <>
          <DrawerHeader>
            <DrawerHeading>Filteropties</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Paragraph>
              De achtergrondpagina blijft interactief. Gebruik dit voor
              filtervensters waarbij de gebruiker de resultaten live wil
              bijwerken.
            </Paragraph>
          </DrawerBody>
          <DrawerFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                Filters toepassen
              </Button>
              <Button variant="default" onClick={close}>
                Wissen
              </Button>
            </ActionGroup>
          </DrawerFooter>
        </>
      )}
    </DrawerWithTrigger>
  ),
};

// =============================================================================
// SIDE LEFT
// =============================================================================

export const SideLeft: Story = {
  name: 'Side: Left',
  render: () => (
    <DrawerWithTrigger triggerLabel="Zijpaneel links openen" side="left">
      {(close) => (
        <>
          <DrawerHeader>
            <DrawerHeading>Navigatie</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Paragraph>{TEKST}</Paragraph>
          </DrawerBody>
          <DrawerFooter>
            <ActionGroup>
              <Button variant="default" onClick={close}>
                Sluiten
              </Button>
            </ActionGroup>
          </DrawerFooter>
        </>
      )}
    </DrawerWithTrigger>
  ),
};

// =============================================================================
// WITH LONG CONTENT
// =============================================================================

export const WithLongContent: Story = {
  name: 'With long content (scrollable body)',
  render: () => (
    <DrawerWithTrigger triggerLabel="Uitgebreid zijpaneel openen">
      {(close) => (
        <>
          <DrawerHeader>
            <DrawerHeading>Uitgebreide informatie</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
          </DrawerBody>
          <DrawerFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                Toepassen
              </Button>
              <Button variant="default" onClick={close}>
                Annuleren
              </Button>
            </ActionGroup>
          </DrawerFooter>
        </>
      )}
    </DrawerWithTrigger>
  ),
};

// =============================================================================
// SHORT TEXT
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <DrawerWithTrigger triggerLabel="A">
      {(close) => (
        <>
          <DrawerHeader>
            <DrawerHeading>A</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Paragraph>A</Paragraph>
          </DrawerBody>
          <DrawerFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                A
              </Button>
            </ActionGroup>
          </DrawerFooter>
        </>
      )}
    </DrawerWithTrigger>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <DrawerWithTrigger triggerLabel={TEKST_AR}>
        {(close) => (
          <>
            <DrawerHeader>
              <DrawerHeading>{TEKST_AR}</DrawerHeading>
            </DrawerHeader>
            <DrawerBody>
              <Paragraph>{TEKST_AR}</Paragraph>
            </DrawerBody>
            <DrawerFooter>
              <ActionGroup>
                <Button variant="strong" onClick={close}>
                  {TEKST_AR}
                </Button>
              </ActionGroup>
            </DrawerFooter>
          </>
        )}
      </DrawerWithTrigger>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <DrawerWithTrigger triggerLabel={TEKST_AR}>
        {(close) => (
          <>
            <DrawerHeader>
              <DrawerHeading>{TEKST_AR}</DrawerHeading>
            </DrawerHeader>
            <DrawerBody>
              <Paragraph>{VEEL_TEKST_AR}</Paragraph>
              <Paragraph>{VEEL_TEKST_AR}</Paragraph>
              <Paragraph>{VEEL_TEKST_AR}</Paragraph>
            </DrawerBody>
            <DrawerFooter>
              <ActionGroup>
                <Button variant="strong" onClick={close}>
                  {TEKST_AR}
                </Button>
              </ActionGroup>
            </DrawerFooter>
          </>
        )}
      </DrawerWithTrigger>
    </div>
  ),
};
