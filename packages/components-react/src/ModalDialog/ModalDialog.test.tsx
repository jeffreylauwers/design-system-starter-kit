import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
