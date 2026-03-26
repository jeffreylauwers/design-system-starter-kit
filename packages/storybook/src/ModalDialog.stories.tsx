import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ModalDialog,
  ModalDialogHeader,
  ModalDialogHeading,
  ModalDialogBody,
  ModalDialogFooter,
  ActionGroup,
  Button,
  Paragraph,
} from '@dsn/components-react';
import {
  TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof ModalDialog> = {
  title: 'Components/ModalDialog',
  component: ModalDialog,
  parameters: {
    dsn: {
      htmlTemplate: () => {
        return `<button type="button" class="dsn-button dsn-button--default dsn-button--size-medium" onclick="this.nextElementSibling.showModal()">
  <span class="dsn-button__label">Dialoogvenster openen</span>
</button>
<dialog class="dsn-modal-dialog" aria-labelledby="dialog-title">
  <div class="dsn-modal-dialog__header">
    <h2 class="dsn-modal-dialog-heading" id="dialog-title">Dialoogvenster titel</h2>
    <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only" onclick="this.closest('dialog').close()">
      <svg class="dsn-icon" aria-hidden="true"><!-- x --></svg>
      <span class="dsn-button__label">Sluiten</span>
    </button>
  </div>
  <div class="dsn-modal-dialog__body">
    <p class="dsn-paragraph">${TEKST}</p>
  </div>
  <div class="dsn-modal-dialog__footer">
    <div class="dsn-action-group">
      <button type="button" class="dsn-button dsn-button--strong dsn-button--size-medium" onclick="this.closest('dialog').close()">
        <span class="dsn-button__label">Bevestigen</span>
      </button>
      <button type="button" class="dsn-button dsn-button--default dsn-button--size-medium" onclick="this.closest('dialog').close()">
        <span class="dsn-button__label">Annuleren</span>
      </button>
    </div>
  </div>
</dialog>`;
      },
    },
  },
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ModalDialog>;

// =============================================================================
// Helper: trigger + dialog wrapper
// =============================================================================

function DialogWithTrigger({
  triggerLabel = 'Dialoogvenster openen',
  children,
}: {
  triggerLabel?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button variant="default" onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </Button>
      <ModalDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children(() => setIsOpen(false))}
      </ModalDialog>
    </>
  );
}

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: () => (
    <DialogWithTrigger>
      {(close) => (
        <>
          <ModalDialogHeader>
            <ModalDialogHeading>Dialoogvenster titel</ModalDialogHeading>
          </ModalDialogHeader>
          <ModalDialogBody>
            <Paragraph>{TEKST}</Paragraph>
          </ModalDialogBody>
          <ModalDialogFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                Bevestigen
              </Button>
              <Button variant="default" onClick={close}>
                Annuleren
              </Button>
            </ActionGroup>
          </ModalDialogFooter>
        </>
      )}
    </DialogWithTrigger>
  ),
};

// =============================================================================
// WITH LONG CONTENT
// =============================================================================

export const WithLongContent: Story = {
  name: 'With long content (scrollable body)',
  render: () => (
    <DialogWithTrigger triggerLabel="Uitgebreide informatie openen">
      {(close) => (
        <>
          <ModalDialogHeader>
            <ModalDialogHeading>Uitgebreide informatie</ModalDialogHeading>
          </ModalDialogHeader>
          <ModalDialogBody>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
            <Paragraph>{VEEL_TEKST}</Paragraph>
          </ModalDialogBody>
          <ModalDialogFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                Bevestigen
              </Button>
              <Button variant="default" onClick={close}>
                Annuleren
              </Button>
            </ActionGroup>
          </ModalDialogFooter>
        </>
      )}
    </DialogWithTrigger>
  ),
};

// =============================================================================
// SHORT TEXT
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: () => (
    <DialogWithTrigger triggerLabel="A">
      {(close) => (
        <>
          <ModalDialogHeader>
            <ModalDialogHeading>A</ModalDialogHeading>
          </ModalDialogHeader>
          <ModalDialogBody>
            <Paragraph>A</Paragraph>
          </ModalDialogBody>
          <ModalDialogFooter>
            <ActionGroup>
              <Button variant="strong" onClick={close}>
                A
              </Button>
            </ActionGroup>
          </ModalDialogFooter>
        </>
      )}
    </DialogWithTrigger>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <DialogWithTrigger triggerLabel={TEKST_AR}>
        {(close) => (
          <>
            <ModalDialogHeader>
              <ModalDialogHeading>{TEKST_AR}</ModalDialogHeading>
            </ModalDialogHeader>
            <ModalDialogBody>
              <Paragraph>{TEKST_AR}</Paragraph>
            </ModalDialogBody>
            <ModalDialogFooter>
              <ActionGroup>
                <Button variant="strong" onClick={close}>
                  {TEKST_AR}
                </Button>
              </ActionGroup>
            </ModalDialogFooter>
          </>
        )}
      </DialogWithTrigger>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <DialogWithTrigger triggerLabel={TEKST_AR}>
        {(close) => (
          <>
            <ModalDialogHeader>
              <ModalDialogHeading>{TEKST_AR}</ModalDialogHeading>
            </ModalDialogHeader>
            <ModalDialogBody>
              <Paragraph>{VEEL_TEKST_AR}</Paragraph>
              <Paragraph>{VEEL_TEKST_AR}</Paragraph>
              <Paragraph>{VEEL_TEKST_AR}</Paragraph>
            </ModalDialogBody>
            <ModalDialogFooter>
              <ActionGroup>
                <Button variant="strong" onClick={close}>
                  {TEKST_AR}
                </Button>
              </ActionGroup>
            </ModalDialogFooter>
          </>
        )}
      </DialogWithTrigger>
    </div>
  ),
};
