import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Menu } from '../Menu';
import { usePopover, type PopoverPlacement } from '../utils/popover';
import './PopoverMenu.css';

/*
 * Klikken op deze elementen activeert een item en sluit het menu. De
 * uitklapknop van een MenuLink met sub-items staat er bewust niet bij: die
 * toont meer items en is dus geen keuze.
 */
const ITEM_SELECTOR = '.dsn-menu-button__button, .dsn-menu-link__link';

export interface PopoverMenuProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * Bepaalt of het menu getoond wordt.
   */
  isOpen: boolean;

  /**
   * Callback bij sluiten: Escape, klik buiten het menu, of het activeren van
   * een `MenuButton` of `MenuLink`.
   */
  onClose?: () => void;

  /**
   * Referentie naar het triggerelement voor positionering, `aria-expanded`
   * en focusherstel.
   */
  triggerRef: React.RefObject<HTMLElement>;

  /**
   * Gewenste plaatsing relatief aan het triggerelement.
   * @default 'bottom'
   */
  placement?: PopoverPlacement;

  /**
   * Doorgegeven aan `Menu`: geeft aan dat de items een `iconStart` hebben.
   * @default false
   */
  iconStart?: boolean;

  /**
   * `MenuButton`- en/of `MenuLink`-items
   */
  children?: React.ReactNode;
}

/**
 * PopoverMenu component
 * Lijst met acties of links in een zwevend paneel, geopend vanuit een
 * triggerknop.
 *
 * Anders dan `Popover` is dit géén dialoogvenster: het paneel heeft geen rol,
 * de inhoud is een gewone lijst (`<ul role="list">`). Ook bewust geen
 * `role="menu"`: die rol belooft pijltjesnavigatie en zet screenreaders in
 * een applicatiemodus. De context komt uit het label van de trigger.
 *
 * Het menu sluit zichzelf zodra een item wordt geactiveerd, en zet de focus
 * dan terug op de trigger.
 *
 * @example
 * ```tsx
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button ref={triggerRef} onClick={() => setIsOpen((v) => !v)}>Acties</Button>
 * <PopoverMenu isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef}>
 *   <MenuButton onClick={edit}>Bewerken</MenuButton>
 *   <MenuButton onClick={duplicate}>Dupliceren</MenuButton>
 * </PopoverMenu>
 * ```
 */
export const PopoverMenu = React.forwardRef<HTMLDivElement, PopoverMenuProps>(
  (
    {
      className,
      isOpen,
      onClose,
      triggerRef,
      placement = 'bottom',
      iconStart = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const popoverRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;

    usePopover({ popoverRef, triggerRef, isOpen, onClose, placement });

    // Sluit na het activeren van een item. Het eigen onClick van het item is
    // dan al uitgevoerd, want dit event bubbelt vanaf het item omhoog.
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      const target = event.target as Element;
      if (target.closest(ITEM_SELECTOR)) {
        onClose?.();
      }
    };

    const classes = classNames(
      'dsn-popover-menu',
      `dsn-popover-menu--placement-${placement}`,
      className
    );

    return (
      <div
        ref={popoverRef}
        popover="auto"
        className={classes}
        onClick={handleClick}
        {...props}
      >
        <Menu role="list" iconStart={iconStart}>
          {children}
        </Menu>
      </div>
    );
  }
);

PopoverMenu.displayName = 'PopoverMenu';
