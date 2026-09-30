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
  onClose?: () => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
  headingId: '',
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

    usePopover({ popoverRef, triggerRef, isOpen, onClose, placement });

    const classes = classNames(
      'dsn-popover',
      `dsn-popover--placement-${placement}`,
      className
    );

    const ariaProps = label
      ? { 'aria-label': label }
      : { 'aria-labelledby': headingId };

    return (
      <PopoverContext.Provider value={{ headingId, onClose }}>
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
 */
export const PopoverHeading = React.forwardRef<
  HTMLHeadingElement,
  PopoverHeadingProps
>(({ className, level = 2, children, ...props }, ref) => {
  const { headingId } = React.useContext(PopoverContext);
  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag
      ref={ref}
      id={headingId}
      className={classNames('dsn-popover-heading', className)}
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
