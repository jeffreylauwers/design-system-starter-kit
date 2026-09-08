import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ModalDialog,
  ModalDialogHeader,
  ModalDialogHeading,
  ModalDialogBody,
  ModalDialogFooter,
} from './ModalDialog';

// jsdom heeft geen volledige HTMLDialogElement implementatie.
// Mock showModal en close voor alle tests.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

const DefaultDialog = ({
  isOpen = true,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) => (
  <ModalDialog isOpen={isOpen} onClose={onClose}>
    <ModalDialogHeader>
      <ModalDialogHeading>Dialoogtitel</ModalDialogHeading>
    </ModalDialogHeader>
    <ModalDialogBody>
      <p>Dialooginhoud</p>
    </ModalDialogBody>
    <ModalDialogFooter>
      <button type="button">Bevestigen</button>
    </ModalDialogFooter>
  </ModalDialog>
);

describe('ModalDialog', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders as a <dialog> element', () => {
    const { container } = render(<DefaultDialog />);
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<DefaultDialog />);
    expect(screen.getByText('Dialooginhoud')).toBeInTheDocument();
  });

  it('applies dsn-modal-dialog class', () => {
    const { container } = render(<DefaultDialog />);
    expect(container.querySelector('dialog')).toHaveClass('dsn-modal-dialog');
  });

  it('applies custom className', () => {
    render(
      <ModalDialog isOpen={true} className="custom-dialog">
        <ModalDialogBody>Inhoud</ModalDialogBody>
      </ModalDialog>
    );
    expect(document.querySelector('dialog')).toHaveClass('custom-dialog');
  });

  // ===========================
  // isOpen / showModal / close
  // ===========================

  it('calls showModal when isOpen becomes true', () => {
    render(<DefaultDialog isOpen={true} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('does not call showModal when isOpen is false', () => {
    render(<DefaultDialog isOpen={false} />);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  // ===========================
  // aria-labelledby
  // ===========================

  it('has aria-labelledby that matches heading id', () => {
    render(<DefaultDialog />);
    const dialog = document.querySelector('dialog')!;
    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const heading = document.getElementById(labelledById!);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Dialoogtitel');
  });

  // ===========================
  // onClose callback
  // ===========================

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<DefaultDialog onClose={onClose} />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  // ===========================
  // Sub-components rendering
  // ===========================

  it('renders header with dsn-modal-dialog__header class', () => {
    const { container } = render(<DefaultDialog />);
    expect(
      container.querySelector('.dsn-modal-dialog__header')
    ).toBeInTheDocument();
  });

  it('renders body with dsn-modal-dialog__body class', () => {
    const { container } = render(<DefaultDialog />);
    expect(
      container.querySelector('.dsn-modal-dialog__body')
    ).toBeInTheDocument();
  });

  it('renders footer with dsn-modal-dialog__footer class', () => {
    const { container } = render(<DefaultDialog />);
    expect(
      container.querySelector('.dsn-modal-dialog__footer')
    ).toBeInTheDocument();
  });

  it('renders heading with dsn-modal-dialog-heading class', () => {
    const { container } = render(<DefaultDialog />);
    expect(
      container.querySelector('.dsn-modal-dialog-heading')
    ).toBeInTheDocument();
  });

  // ===========================
  // ModalDialogHeading levels
  // ===========================

  it('renders heading as h2 by default', () => {
    render(
      <ModalDialog isOpen={true}>
        <ModalDialogHeader>
          <ModalDialogHeading>Titel</ModalDialogHeading>
        </ModalDialogHeader>
        <ModalDialogBody>Inhoud</ModalDialogBody>
      </ModalDialog>
    );
    expect(
      document.querySelector('h2.dsn-modal-dialog-heading')
    ).toBeInTheDocument();
  });

  it('renders heading at specified level', () => {
    render(
      <ModalDialog isOpen={true}>
        <ModalDialogHeader>
          <ModalDialogHeading level={3}>Titel</ModalDialogHeading>
        </ModalDialogHeader>
        <ModalDialogBody>Inhoud</ModalDialogBody>
      </ModalDialog>
    );
    expect(
      document.querySelector('h3.dsn-modal-dialog-heading')
    ).toBeInTheDocument();
  });

  // ===========================
  // Ref forwarding
  // ===========================

  it('forwards ref to the dialog element', () => {
    const ref = { current: null as HTMLDialogElement | null };
    render(
      <ModalDialog ref={ref} isOpen={true}>
        <ModalDialogBody>Inhoud</ModalDialogBody>
      </ModalDialog>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIALOG');
  });

  // ===========================
  // HTML attributes
  // ===========================

  it('spreads additional HTML attributes', () => {
    render(
      <ModalDialog isOpen={true} data-testid="mijn-dialog">
        <ModalDialogBody>Inhoud</ModalDialogBody>
      </ModalDialog>
    );
    expect(screen.getByTestId('mijn-dialog')).toBeInTheDocument();
  });

  // ===========================
  // Focus bij openen (titel wordt voorgelezen)
  // ===========================

  it('gives the heading tabindex="-1" so it can receive focus', () => {
    render(<DefaultDialog />);
    expect(screen.getByText('Dialoogtitel')).toHaveAttribute('tabindex', '-1');
  });

  it('gives the dialog tabindex="-1" as fallback focus target', () => {
    const { container } = render(<DefaultDialog />);
    expect(container.querySelector('dialog')).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus to the heading when it opens', () => {
    render(<DefaultDialog />);
    expect(screen.getByText('Dialoogtitel')).toHaveFocus();
  });

  it('moves focus to the dialog itself when there is no heading', () => {
    render(
      <ModalDialog isOpen={true}>
        <ModalDialogBody>Inhoud</ModalDialogBody>
      </ModalDialog>
    );
    expect(document.querySelector('dialog')).toHaveFocus();
  });

  it('does not move focus while it is closed', () => {
    render(<DefaultDialog isOpen={false} />);
    expect(screen.getByText('Dialoogtitel')).not.toHaveFocus();
  });

  // ===========================
  // aria-expanded op de trigger
  // ===========================

  const DialogWithTrigger = ({ isOpen }: { isOpen: boolean }) => {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    return (
      <>
        <button type="button" ref={triggerRef}>
          Dialoogvenster
        </button>
        <ModalDialog isOpen={isOpen} triggerRef={triggerRef}>
          <ModalDialogHeader>
            <ModalDialogHeading>Dialoogtitel</ModalDialogHeading>
          </ModalDialogHeader>
          <ModalDialogBody>Inhoud</ModalDialogBody>
        </ModalDialog>
      </>
    );
  };

  it('sets aria-expanded="false" on the trigger while closed', () => {
    render(<DialogWithTrigger isOpen={false} />);
    expect(screen.getByText('Dialoogvenster')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('sets aria-expanded="true" on the trigger while open', () => {
    render(<DialogWithTrigger isOpen={true} />);
    expect(screen.getByText('Dialoogvenster')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('updates aria-expanded when the open state changes', () => {
    const { rerender } = render(<DialogWithTrigger isOpen={false} />);
    rerender(<DialogWithTrigger isOpen={true} />);
    expect(screen.getByText('Dialoogvenster')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    rerender(<DialogWithTrigger isOpen={false} />);
    expect(screen.getByText('Dialoogvenster')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('leaves the trigger alone when no triggerRef is given', () => {
    render(<DefaultDialog />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    expect(closeButton).not.toHaveAttribute('aria-expanded');
  });

  // ===========================
  // Focus-trap
  // ===========================

  it('wraps focus from the last to the first element on Tab', () => {
    render(<DefaultDialog />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    const confirmButton = screen.getByText('Bevestigen');

    confirmButton.focus();
    fireEvent.keyDown(confirmButton, { key: 'Tab' });

    expect(closeButton).toHaveFocus();
  });

  it('wraps focus from the first to the last element on Shift+Tab', () => {
    render(<DefaultDialog />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    const confirmButton = screen.getByText('Bevestigen');

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });

    expect(confirmButton).toHaveFocus();
  });

  it('wraps focus from the heading to the last element on Shift+Tab', () => {
    render(<DefaultDialog />);
    const heading = screen.getByText('Dialoogtitel');
    const confirmButton = screen.getByText('Bevestigen');

    expect(heading).toHaveFocus();
    fireEvent.keyDown(heading, { key: 'Tab', shiftKey: true });

    expect(confirmButton).toHaveFocus();
  });

  it('leaves other keys alone', () => {
    render(<DefaultDialog />);
    const confirmButton = screen.getByText('Bevestigen');

    confirmButton.focus();
    fireEvent.keyDown(confirmButton, { key: 'ArrowDown' });

    expect(confirmButton).toHaveFocus();
  });
});
