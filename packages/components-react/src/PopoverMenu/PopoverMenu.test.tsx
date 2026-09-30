import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PopoverMenu } from './PopoverMenu';
import { MenuButton } from '../MenuButton';
import { MenuLink } from '../MenuLink';

// jsdom heeft geen volledige Popover API implementatie.
// Mock showPopover en hidePopover voor alle tests.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

// Simuleer het sluiten door de Popover API: beforetoggle vuurt synchroon
// vóór het verbergen, toggle erna.
function closeNatively(popover: Element) {
  for (const type of ['beforetoggle', 'toggle']) {
    const event = Object.assign(new Event(type), { newState: 'closed' });
    popover.dispatchEvent(event);
  }
}

function DefaultPopoverMenu({
  isOpen = true,
  onClose,
  onEdit,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={triggerRef} type="button">
        Acties
      </button>
      <button type="button">Elders</button>
      <PopoverMenu isOpen={isOpen} onClose={onClose} triggerRef={triggerRef}>
        <MenuButton onClick={onEdit}>Bewerken</MenuButton>
        <MenuButton>Dupliceren</MenuButton>
      </PopoverMenu>
    </>
  );
}

describe('PopoverMenu', () => {
  // ===========================
  // Rendering en semantiek
  // ===========================

  it('renders a div with the popover attribute and base classes', () => {
    const { container } = render(<DefaultPopoverMenu />);
    const panel = container.querySelector('.dsn-popover-menu');
    expect(panel?.tagName).toBe('DIV');
    expect(panel).toHaveAttribute('popover', 'auto');
    expect(panel).toHaveClass('dsn-popover-menu--placement-bottom');
  });

  it('is not a dialog: no role, aria-modal or accessible name on the panel', () => {
    const { container } = render(<DefaultPopoverMenu />);
    const panel = container.querySelector('.dsn-popover-menu')!;
    expect(panel).not.toHaveAttribute('role');
    expect(panel).not.toHaveAttribute('aria-modal');
    expect(panel).not.toHaveAttribute('aria-label');
    expect(panel).not.toHaveAttribute('aria-labelledby');
  });

  it('renders the items in a ul.dsn-menu with role="list"', () => {
    const { container } = render(<DefaultPopoverMenu />);
    const list = container.querySelector('.dsn-popover-menu > ul');
    expect(list).toHaveClass('dsn-menu');
    expect(list).toHaveAttribute('role', 'list');
    expect(list?.querySelectorAll('li')).toHaveLength(2);
  });

  it('does not use menu roles', () => {
    const { container } = render(<DefaultPopoverMenu />);
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(container.querySelector('[role="menuitem"]')).toBeNull();
  });

  it('applies the placement modifier', () => {
    function Placed() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button">
            Acties
          </button>
          <PopoverMenu isOpen triggerRef={triggerRef} placement="top">
            <MenuButton>Bewerken</MenuButton>
          </PopoverMenu>
        </>
      );
    }
    const { container } = render(<Placed />);
    expect(container.querySelector('.dsn-popover-menu')).toHaveClass(
      'dsn-popover-menu--placement-top'
    );
  });

  it('passes iconStart on to Menu', () => {
    function WithIcons() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button">
            Acties
          </button>
          <PopoverMenu isOpen triggerRef={triggerRef} iconStart>
            <MenuButton>Bewerken</MenuButton>
          </PopoverMenu>
        </>
      );
    }
    const { container } = render(<WithIcons />);
    expect(container.querySelector('.dsn-menu')).toHaveClass(
      'dsn-menu--icon-start'
    );
  });

  it('forwards ref to the panel', () => {
    const ref = React.createRef<HTMLDivElement>();
    function WithRef() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button">
            Acties
          </button>
          <PopoverMenu ref={ref} isOpen={false} triggerRef={triggerRef}>
            <MenuButton>Bewerken</MenuButton>
          </PopoverMenu>
        </>
      );
    }
    render(<WithRef />);
    expect(ref.current).toHaveClass('dsn-popover-menu');
  });

  // ===========================
  // Openen en trigger
  // ===========================

  it('calls showPopover when open and not when closed', () => {
    const { rerender } = render(<DefaultPopoverMenu isOpen={false} />);
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    rerender(<DefaultPopoverMenu isOpen />);
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('keeps aria-expanded on the trigger in sync', () => {
    const { rerender } = render(<DefaultPopoverMenu isOpen={false} />);
    const trigger = screen.getByText('Acties');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    rerender(<DefaultPopoverMenu isOpen />);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus to the first item on open', () => {
    render(<DefaultPopoverMenu />);
    expect(screen.getByText('Bewerken').closest('button')).toHaveFocus();
  });

  // ===========================
  // Sluiten
  // ===========================

  it('closes after a MenuButton is activated, after its own onClick', async () => {
    const calls: string[] = [];
    render(
      <DefaultPopoverMenu
        onEdit={() => calls.push('edit')}
        onClose={() => calls.push('close')}
      />
    );
    await userEvent.click(screen.getByText('Bewerken'));
    expect(calls).toEqual(['edit', 'close']);
  });

  it('closes after a MenuLink is activated', async () => {
    const onClose = vi.fn();
    function WithLinks() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button">
            Mijn omgeving
          </button>
          <PopoverMenu isOpen onClose={onClose} triggerRef={triggerRef}>
            <MenuLink href="#overzicht" level={1}>
              Overzicht
            </MenuLink>
          </PopoverMenu>
        </>
      );
    }
    render(<WithLinks />);
    await userEvent.click(screen.getByText('Overzicht'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the panel itself is clicked outside an item', async () => {
    const onClose = vi.fn();
    const { container } = render(<DefaultPopoverMenu onClose={onClose} />);
    await userEvent.click(container.querySelector('.dsn-popover-menu')!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on a click outside', async () => {
    const onClose = vi.fn();
    render(<DefaultPopoverMenu onClose={onClose} />);
    await userEvent.click(screen.getByText('Elders'));
    expect(onClose).toHaveBeenCalled();
  });

  it('returns focus to the trigger when closed from inside (Escape)', () => {
    const { container } = render(<DefaultPopoverMenu />);
    closeNatively(container.querySelector('.dsn-popover-menu')!);
    expect(screen.getByText('Acties')).toHaveFocus();
  });

  it('does not pull focus back to the trigger after a click outside', async () => {
    const { container } = render(<DefaultPopoverMenu />);
    const elsewhere = screen.getByText('Elders');
    await userEvent.click(elsewhere);
    closeNatively(container.querySelector('.dsn-popover-menu')!);
    expect(elsewhere).toHaveFocus();
  });
});
