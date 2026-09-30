import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { usePopover, type PopoverPlacement } from '../utils/popover';
import './Popover.css';

// =============================================================================
// Context
// =============================================================================

interface PopoverContextValue {
  headingId: string;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
  onClose?: () => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
  headingId: '',
  headingRef: { current: null },
});

// =============================================================================
// Popover (root)
// =============================================================================

export interface PopoverProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * Bepaalt of de popover getoond wordt.
   */
  isOpen: boolean;

  /**
   * Callback bij sluiten (Escape, klik buiten, sluitknop in header).
   */
  onClose?: () => void;

  /**
   * Referentie naar het triggerelement voor positionering en focus-herstel.
   */
  triggerRef: React.RefObject<HTMLElement>;

  /**
   * Gewenste plaatsing relatief aan het triggerelement.
   * @default 'bottom'
   */
  placement?: PopoverPlacement;

  /**
   * Toegankelijke naam voor een popover zonder `PopoverHeader`/`PopoverHeading`.
   * Een zichtbare heading heeft de voorkeur; die koppelt via `aria-labelledby`.
   */
  label?: string;

  /**
   * Subcomponenten: `PopoverHeader`, `PopoverBody`, `PopoverFooter`
   */
  children?: React.ReactNode;
}

/**
 * Popover component
 * Niet-modaal dialoogvenster verankerd aan een triggerelement
 * (`role="dialog"`, `aria-modal="false"`).
 *
 * Gebaseerd op de HTML Popover API (`popover="auto"`) voor ingebakken
 * light-dismiss en top-layer gedrag. Positionering via JavaScript.
 *
 * Voor een lijst met acties of links: gebruik `PopoverMenu`. Een lijst is
 * geen dialoogvenster.
 *
 * @example
 * ```tsx
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button ref={triggerRef} onClick={() => setIsOpen((v) => !v)}>Filters</Button>
 * <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef}>
 *   <PopoverHeader>
 *     <PopoverHeading>Filters</PopoverHeading>
 *   </PopoverHeader>
 *   <PopoverBody>...</PopoverBody>
 * </Popover>
 * ```
 */
export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      className,
      isOpen,
      onClose,
      triggerRef,
      placement = 'bottom',
      label,
      children,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const popoverRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;
    const headingId = React.useId();
    const headingRef = React.useRef<HTMLHeadingElement | null>(null);

    /*
     * Bij openen krijgt de heading de focus, niet de sluitknop: zo wordt de
     * titel als eerste voorgelezen, net als bij ModalDialog en Drawer. Zonder
     * heading krijgt de popover zelf de focus (die heeft `tabindex="-1"`).
     * Zie docs/decisions/DR-2026-12-dialogs-focus-bij-openen-op-de-heading.md.
     */
    usePopover({
      popoverRef,
      triggerRef,
      isOpen,
      onClose,
      placement,
      initialFocusRef: headingRef,
    });

    const classes = classNames(
      'dsn-popover',
      `dsn-popover--placement-${placement}`,
      className
    );

    const ariaProps = label
      ? { 'aria-label': label }
      : { 'aria-labelledby': headingId };

    return (
      <PopoverContext.Provider value={{ headingId, headingRef, onClose }}>
        <div
          ref={popoverRef}
          popover="auto"
          className={classes}
          role="dialog"
          aria-modal="false"
          tabIndex={-1}
          {...ariaProps}
          {...props}
        >
          {children}
        </div>
      </PopoverContext.Provider>
    );
  }
);

Popover.displayName = 'Popover';

// =============================================================================
// PopoverHeader
// =============================================================================

export interface PopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Inhoud van de header — doorgaans een `PopoverHeading`.
   * De sluitknop wordt automatisch geïnjecteerd.
   */
  children?: React.ReactNode;
}

/**
 * PopoverHeader
 * De headerstrook van de popover met heading en sluitknop.
 */
export const PopoverHeader = React.forwardRef<
  HTMLDivElement,
  PopoverHeaderProps
>(({ className, children, ...props }, ref) => {
  const { onClose } = React.useContext(PopoverContext);

  return (
    <div
      ref={ref}
      className={classNames('dsn-popover__header', className)}
      {...props}
    >
      {children}
      <Button
        variant="subtle"
        size="small"
        iconOnly
        onClick={onClose}
        iconStart={<Icon name="x" aria-hidden />}
      >
        Sluiten
      </Button>
    </div>
  );
});

PopoverHeader.displayName = 'PopoverHeader';

// =============================================================================
// PopoverHeading
// =============================================================================

export interface PopoverHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Semantisch heading-niveau. Kies op basis van documenthiërarchie.
   * @default 2
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * De zichtbare heading-tekst.
   */
  children?: React.ReactNode;
}

/**
 * PopoverHeading
 * De heading van de popover. ID wordt automatisch gegenereerd voor aria-labelledby.
 * Krijgt `tabindex="-1"` zodat de Popover er bij openen de focus op kan zetten.
 */
export const PopoverHeading = React.forwardRef<
  HTMLHeadingElement,
  PopoverHeadingProps
>(({ className, level = 2, children, ...props }, ref) => {
  const { headingId, headingRef } = React.useContext(PopoverContext);
  const Tag = `h${level}` as React.ElementType;

  // De Popover heeft de heading nodig om er bij openen de focus op te zetten;
  // een eventuele meegegeven ref blijft daarnaast gewoon werken.
  const setRef = React.useCallback(
    (node: HTMLHeadingElement | null) => {
      headingRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLHeadingElement | null>).current =
          node;
      }
    },
    [headingRef, ref]
  );

  return (
    <Tag
      ref={setRef}
      id={headingId}
      className={classNames('dsn-popover-heading', className)}
      tabIndex={-1}
      {...props}
    >
      {children}
    </Tag>
  );
});

PopoverHeading.displayName = 'PopoverHeading';

// =============================================================================
// PopoverBody
// =============================================================================

export interface PopoverBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * De hoofdinhoud van de popover — willekeurige slot-content.
   */
  children?: React.ReactNode;
}

/**
 * PopoverBody
 * De inhoudssectie van de popover.
 */
export const PopoverBody = React.forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('dsn-popover__body', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverBody.displayName = 'PopoverBody';

// =============================================================================
// PopoverFooter
// =============================================================================

export interface PopoverFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Actieknoppen of slotzin van de popover.
   */
  children?: React.ReactNode;
}

/**
 * PopoverFooter
 * De voettekst van de popover met actieknoppen.
 */
export const PopoverFooter = React.forwardRef<
  HTMLDivElement,
  PopoverFooterProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={classNames('dsn-popover__footer', className)}
      {...props}
    >
      {children}
    </div>
  );
});

PopoverFooter.displayName = 'PopoverFooter';
