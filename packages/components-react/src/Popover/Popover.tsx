import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import './Popover.css';

/*
 * React 18 ondersteunt het `popover`-attribuut en `onToggle` niet natively in de
 * JSX-types. Module-uitbreiding voegt de ontbrekende types toe.
 */
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | '' | undefined;
    popoverTarget?: string | undefined;
    popoverTargetAction?: 'hide' | 'show' | 'toggle' | undefined;
  }
}

/*
 * HTMLElement.showPopover / hidePopover zijn nog niet in alle TypeScript DOM-libs.
 * Declaratie toegevoegd voor veilig gebruik.
 */
declare global {
  interface HTMLElement {
    showPopover(): void;
    hidePopover(): void;
  }
}

// =============================================================================
// Types
// =============================================================================

type Placement = 'top' | 'bottom' | 'start' | 'end';

// =============================================================================
// Positioneringshelper
// =============================================================================

const GAP = 4; // px afstand tussen trigger en popover

function positionPopover(
  popover: HTMLElement,
  trigger: HTMLElement,
  placement: Placement
): void {
  const triggerRect = trigger.getBoundingClientRect();
  // offsetWidth/offsetHeight — onaangepast door CSS transforms (zoals @starting-style scale).
  // getBoundingClientRect geeft de getransformeerde afmetingen, wat leidt tot onjuiste clamping.
  const popoverWidth = popover.offsetWidth;
  const popoverHeight = popover.offsetHeight;
  const popoverRect = { width: popoverWidth, height: popoverHeight };
  const isRTL =
    document.documentElement.dir === 'rtl' ||
    getComputedStyle(trigger).direction === 'rtl';

  let top: number;
  let left: number;

  switch (placement) {
    case 'bottom':
      top = triggerRect.bottom + GAP;
      left = isRTL ? triggerRect.right - popoverRect.width : triggerRect.left;
      break;
    case 'top':
      top = triggerRect.top - popoverRect.height - GAP;
      left = isRTL ? triggerRect.right - popoverRect.width : triggerRect.left;
      break;
    case 'end':
      top = triggerRect.top;
      left = isRTL
        ? triggerRect.left - popoverRect.width - GAP
        : triggerRect.right + GAP;
      break;
    case 'start':
      top = triggerRect.top;
      left = isRTL
        ? triggerRect.right + GAP
        : triggerRect.left - popoverRect.width - GAP;
      break;
    default:
      top = triggerRect.bottom + GAP;
      left = triggerRect.left;
  }

  // Klamp binnen het viewport (8px marge)
  const margin = 8;
  left = Math.max(
    margin,
    Math.min(left, window.innerWidth - popoverRect.width - margin)
  );
  top = Math.max(
    margin,
    Math.min(top, window.innerHeight - popoverRect.height - margin)
  );

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
  popover.style.right = 'auto';
  popover.style.bottom = 'auto';
}

// Zet focus op het eerste interactieve element in de popover
function focusFirstInteractive(container: HTMLElement): void {
  const selector = [
    'button:not(:disabled)',
    'a[href]',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  const first = container.querySelector<HTMLElement>(selector);
  if (first) {
    first.focus();
  } else {
    container.focus();
  }
}

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
  placement?: Placement;

  /**
   * Toegankelijke naam voor popovers zonder `PopoverHeader`/`PopoverHeading`.
   * Gebruik `aria-labelledby` via context wanneer er wél een heading is.
   */
  label?: string;

  /**
   * Subcomponenten: `PopoverHeader`, `PopoverBody`, `PopoverFooter`
   */
  children?: React.ReactNode;
}

/**
 * Popover component
 * Lichtgewicht, contextgebonden overlay verankerd aan een triggerelement.
 *
 * Gebaseerd op de HTML Popover API (`popover="auto"`) voor ingebakken
 * light-dismiss en top-layer gedrag. Positionering via JavaScript.
 *
 * @example
 * ```tsx
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button ref={triggerRef} onClick={() => setIsOpen(true)}>Opties</Button>
 * <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} label="Opties">
 *   <PopoverBody>
 *     <Menu>...</Menu>
 *   </PopoverBody>
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

    /*
     * Focus gaat bij sluiten alleen terug naar de trigger wanneer dat zinvol
     * is: als de focus op dat moment nog in de popover stond (Escape, de
     * sluitknop, een actie in de popover). Klikt de gebruiker ergens anders,
     * dan blijft de focus daar; terugspringen naar de trigger zou die klik
     * tenietdoen.
     *
     * `restoreFocusRef` wordt gezet in `beforetoggle`, dat synchroon vóór het
     * verbergen vuurt. In `toggle` is het te laat om het te meten: de popover
     * is dan al verborgen en de browser heeft de focus al verplaatst.
     */
    const restoreFocusRef = React.useRef(false);
    const dismissedByPointerRef = React.useRef(false);

    // Toon/verberg popover via de Popover API
    React.useEffect(() => {
      const el = popoverRef.current;
      if (!el) return;

      if (isOpen) {
        dismissedByPointerRef.current = false;
        el.showPopover();
        const trigger = triggerRef.current;
        if (trigger) {
          positionPopover(el, trigger, placement);
        }
        focusFirstInteractive(el);
      } else {
        // hidePopover gooit een fout als de popover al gesloten is
        try {
          el.hidePopover();
        } catch {
          // popover was al gesloten — geen actie nodig
        }
      }
    }, [isOpen, placement, triggerRef, popoverRef]);

    // Synchroniseer aria-expanded op het triggerelement
    React.useEffect(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      return () => {
        trigger.setAttribute('aria-expanded', 'false');
      };
    }, [isOpen, triggerRef]);

    // Verwerk het toggle-event van de Popover API (Escape / klik buiten binnen hetzelfde document)
    // onToggle is niet beschikbaar als JSX-prop op div in React 18 — gebruik addEventListener.
    // Gebruik een ref voor onClose zodat de listener stabiel blijft en nooit stale is.
    const onCloseRef = React.useRef(onClose);
    onCloseRef.current = onClose;

    React.useEffect(() => {
      const el = popoverRef.current;
      if (!el) return;

      const handleBeforeToggle = (event: Event) => {
        const toggleEvent = event as Event & { newState?: string };
        if (toggleEvent.newState === 'closed') {
          restoreFocusRef.current =
            !dismissedByPointerRef.current &&
            el.contains(document.activeElement);
        }
      };

      const handleToggle = (event: Event) => {
        const toggleEvent = event as Event & { newState?: string };
        if (toggleEvent.newState === 'closed') {
          onCloseRef.current?.();
          if (restoreFocusRef.current) {
            triggerRef.current?.focus();
          }
          restoreFocusRef.current = false;
        }
      };

      el.addEventListener('beforetoggle', handleBeforeToggle);
      el.addEventListener('toggle', handleToggle);
      return () => {
        el.removeEventListener('beforetoggle', handleBeforeToggle);
        el.removeEventListener('toggle', handleToggle);
      };
    }, [triggerRef, popoverRef]);

    // Fallback light-dismiss via pointerdown — vangt klikken buiten het popover op
    // in contexten waar de Popover API's native light-dismiss niet bereikbaar is
    // (bijv. iframe-grenzen, of oudere browsers zonder Popover API).
    React.useEffect(() => {
      if (!isOpen) return;
      const el = popoverRef.current;
      if (!el) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        // Sluit niet als er op de popover zelf of het triggerelement geklikt wordt
        if (el.contains(target) || triggerRef.current?.contains(target)) return;
        // Light dismiss: de focus volgt de klik, niet de trigger
        dismissedByPointerRef.current = true;
        onCloseRef.current?.();
      };

      document.addEventListener('pointerdown', handlePointerDown);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen, triggerRef, popoverRef]);

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
