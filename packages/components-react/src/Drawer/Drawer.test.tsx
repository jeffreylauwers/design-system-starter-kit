import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Drawer,
  DrawerHeader,
  DrawerHeading,
  DrawerBody,
  DrawerFooter,
} from './Drawer';

// jsdom heeft geen volledige HTMLDialogElement implementatie.
// Mock showModal, show en close voor alle tests.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.show = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

const DefaultDrawer = ({
  isOpen = true,
  onClose,
  modal = true,
  side = 'right' as const,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  modal?: boolean;
  side?: 'right' | 'left';
}) => (
  <Drawer isOpen={isOpen} onClose={onClose} modal={modal} side={side}>
    <DrawerHeader>
      <DrawerHeading>Drawertitel</DrawerHeading>
    </DrawerHeader>
    <DrawerBody>
      <p>Drawerinhoud</p>
    </DrawerBody>
    <DrawerFooter>
      <button type="button">Toepassen</button>
    </DrawerFooter>
  </Drawer>
);

describe('Drawer', () => {
  // ===========================
  // Rendering
  // ===========================

  it('renders as a <dialog> element', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<DefaultDrawer />);
    expect(screen.getByText('Drawerinhoud')).toBeInTheDocument();
  });

  it('applies dsn-drawer class', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('dialog')).toHaveClass('dsn-drawer');
  });

  it('applies custom className', () => {
    render(
      <Drawer isOpen={true} className="custom-drawer">
        <DrawerBody>Inhoud</DrawerBody>
      </Drawer>
    );
    expect(document.querySelector('dialog')).toHaveClass('custom-drawer');
  });

  // ===========================
  // Side modifier klassen
  // ===========================

  it('applies dsn-drawer--side-right by default', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('dialog')).toHaveClass(
      'dsn-drawer--side-right'
    );
  });

  it('applies dsn-drawer--side-right when side="right"', () => {
    const { container } = render(<DefaultDrawer side="right" />);
    expect(container.querySelector('dialog')).toHaveClass(
      'dsn-drawer--side-right'
    );
    expect(container.querySelector('dialog')).not.toHaveClass(
      'dsn-drawer--side-left'
    );
  });

  it('applies dsn-drawer--side-left when side="left"', () => {
    const { container } = render(<DefaultDrawer side="left" />);
    expect(container.querySelector('dialog')).toHaveClass(
      'dsn-drawer--side-left'
    );
    expect(container.querySelector('dialog')).not.toHaveClass(
      'dsn-drawer--side-right'
    );
  });

  // ===========================
  // isOpen / showModal / show / close
  // ===========================

  it('calls showModal when isOpen becomes true and modal=true', () => {
    render(<DefaultDrawer isOpen={true} modal={true} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
  });

  it('calls show when isOpen becomes true and modal=false', () => {
    render(<DefaultDrawer isOpen={true} modal={false} />);
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('does not call showModal or show when isOpen is false', () => {
    render(<DefaultDrawer isOpen={false} />);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
  });

  // ===========================
  // aria-labelledby
  // ===========================

  it('has aria-labelledby that matches heading id', () => {
    render(<DefaultDrawer />);
    const dialog = document.querySelector('dialog')!;
    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const heading = document.getElementById(labelledById!);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Drawertitel');
  });

  // ===========================
  // onClose callback
  // ===========================

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<DefaultDrawer onClose={onClose} />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  // ===========================
  // Sub-components rendering
  // ===========================

  it('renders header with dsn-drawer__header class', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('.dsn-drawer__header')).toBeInTheDocument();
  });

  it('renders body with dsn-drawer__body class', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('.dsn-drawer__body')).toBeInTheDocument();
  });

  it('renders footer with dsn-drawer__footer class', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('.dsn-drawer__footer')).toBeInTheDocument();
  });

  it('renders heading with dsn-drawer-heading class', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('.dsn-drawer-heading')).toBeInTheDocument();
  });

  // ===========================
  // DrawerHeading levels
  // ===========================

  it('renders heading as h2 by default', () => {
    render(
      <Drawer isOpen={true}>
        <DrawerHeader>
          <DrawerHeading>Titel</DrawerHeading>
        </DrawerHeader>
        <DrawerBody>Inhoud</DrawerBody>
      </Drawer>
    );
    expect(document.querySelector('h2.dsn-drawer-heading')).toBeInTheDocument();
  });

  it('renders heading at specified level', () => {
    render(
      <Drawer isOpen={true}>
        <DrawerHeader>
          <DrawerHeading level={3}>Titel</DrawerHeading>
        </DrawerHeader>
        <DrawerBody>Inhoud</DrawerBody>
      </Drawer>
    );
    expect(document.querySelector('h3.dsn-drawer-heading')).toBeInTheDocument();
  });

  // ===========================
  // Ref forwarding
  // ===========================

  it('forwards ref to the dialog element', () => {
    const ref = { current: null as HTMLDialogElement | null };
    render(
      <Drawer ref={ref} isOpen={true}>
        <DrawerBody>Inhoud</DrawerBody>
      </Drawer>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIALOG');
  });

  // ===========================
  // HTML attributes
  // ===========================

  it('spreads additional HTML attributes', () => {
    render(
      <Drawer isOpen={true} data-testid="mijn-drawer">
        <DrawerBody>Inhoud</DrawerBody>
      </Drawer>
    );
    expect(screen.getByTestId('mijn-drawer')).toBeInTheDocument();
  });

  // ===========================
  // Focus bij openen (titel wordt voorgelezen)
  // ===========================

  it('gives the heading tabindex="-1" so it can receive focus', () => {
    render(<DefaultDrawer />);
    expect(screen.getByText('Drawertitel')).toHaveAttribute('tabindex', '-1');
  });

  it('gives the dialog tabindex="-1" as fallback focus target', () => {
    const { container } = render(<DefaultDrawer />);
    expect(container.querySelector('dialog')).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus to the heading when it opens', () => {
    render(<DefaultDrawer />);
    expect(screen.getByText('Drawertitel')).toHaveFocus();
  });

  it('moves focus to the dialog itself when there is no heading', () => {
    render(
      <Drawer isOpen={true}>
        <DrawerBody>Inhoud</DrawerBody>
      </Drawer>
    );
    expect(document.querySelector('dialog')).toHaveFocus();
  });

  it('does not move focus while it is closed', () => {
    render(<DefaultDrawer isOpen={false} />);
    expect(screen.getByText('Drawertitel')).not.toHaveFocus();
  });

  // ===========================
  // aria-expanded op de trigger
  // ===========================

  const DrawerWithTrigger = ({ isOpen }: { isOpen: boolean }) => {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    return (
      <>
        <button type="button" ref={triggerRef}>
          Zijpaneel
        </button>
        <Drawer isOpen={isOpen} triggerRef={triggerRef}>
          <DrawerHeader>
            <DrawerHeading>Drawertitel</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>Inhoud</DrawerBody>
        </Drawer>
      </>
    );
  };

  it('sets aria-expanded="false" on the trigger while closed', () => {
    render(<DrawerWithTrigger isOpen={false} />);
    expect(screen.getByText('Zijpaneel')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('sets aria-expanded="true" on the trigger while open', () => {
    render(<DrawerWithTrigger isOpen={true} />);
    expect(screen.getByText('Zijpaneel')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('updates aria-expanded when the open state changes', () => {
    const { rerender } = render(<DrawerWithTrigger isOpen={false} />);
    rerender(<DrawerWithTrigger isOpen={true} />);
    expect(screen.getByText('Zijpaneel')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    rerender(<DrawerWithTrigger isOpen={false} />);
    expect(screen.getByText('Zijpaneel')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('leaves the trigger alone when no triggerRef is given', () => {
    render(<DefaultDrawer />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    expect(closeButton).not.toHaveAttribute('aria-expanded');
  });

  // ===========================
  // Focus-trap
  // ===========================

  it('wraps focus from the last to the first element on Tab', () => {
    render(<DefaultDrawer />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    const applyButton = screen.getByText('Toepassen');

    applyButton.focus();
    fireEvent.keyDown(applyButton, { key: 'Tab' });

    expect(closeButton).toHaveFocus();
  });

  it('wraps focus from the first to the last element on Shift+Tab', () => {
    render(<DefaultDrawer />);
    const closeButton = screen.getByText('Sluiten').closest('button')!;
    const applyButton = screen.getByText('Toepassen');

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });

    expect(applyButton).toHaveFocus();
  });

  it('wraps focus from the heading to the last element on Shift+Tab', () => {
    render(<DefaultDrawer />);
    const heading = screen.getByText('Drawertitel');
    const applyButton = screen.getByText('Toepassen');

    expect(heading).toHaveFocus();
    fireEvent.keyDown(heading, { key: 'Tab', shiftKey: true });

    expect(applyButton).toHaveFocus();
  });

  it('leaves other keys alone', () => {
    render(<DefaultDrawer />);
    const applyButton = screen.getByText('Toepassen');

    applyButton.focus();
    fireEvent.keyDown(applyButton, { key: 'ArrowDown' });

    expect(applyButton).toHaveFocus();
  });

  it('does not trap focus in the non-modal variant', () => {
    render(<DefaultDrawer modal={false} />);
    const applyButton = screen.getByText('Toepassen');

    applyButton.focus();
    fireEvent.keyDown(applyButton, { key: 'Tab' });

    // Zonder trap verplaatst jsdom de focus niet: hij blijft staan waar hij was
    expect(applyButton).toHaveFocus();
  });
});
