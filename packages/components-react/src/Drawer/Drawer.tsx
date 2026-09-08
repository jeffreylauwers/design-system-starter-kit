import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { useFocusTrap } from '../utils/focusTrap';
import './Drawer.css';

// =============================================================================
// Context
// =============================================================================

interface DrawerContextValue {
  headingId: string;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
  onClose?: () => void;
}

const DrawerContext = React.createContext<DrawerContextValue>({
  headingId: '',
  headingRef: { current: null },
});

// =============================================================================
// Drawer (root)
// =============================================================================

export interface DrawerProps extends Omit<
  React.HTMLAttributes<HTMLDialogElement>,
  'children'
> {
  /**
   * Bepaalt of het zijpaneel getoond wordt.
   */
  isOpen: boolean;

  /**
   * Callback die wordt aangeroepen wanneer het zijpaneel sluit
   * (sluitknop, Escape-toets).
   */
  onClose?: () => void;

  /**
   * Modaal of non-modaal gedrag.
   * - `true` (standaard): opent via `.showModal()` — achtergrond geblokkeerd,
   *   focus blijft binnen het paneel, Escape sluit via `cancel`-event.
   * - `false`: opent via `.show()` — achtergrond blijft interactief en de
   *   gebruiker kan er met Tab naartoe, Escape sluit via `keydown`-listener.
   * @default true
   */
  modal?: boolean;

  /**
   * Ref naar het element dat het zijpaneel opent. Wanneer je die meegeeft,
   * houdt het zijpaneel `aria-expanded` op dat element synchroon met de
   * open-staat: `false` wanneer het paneel gesloten is, `true` wanneer het
   * open staat.
   */
  triggerRef?: React.RefObject<HTMLElement | null>;

  /**
   * De kant van de viewport vanwaar het zijpaneel inschuift.
   * @default "right"
   */
  side?: 'right' | 'left';

  /**
   * De subcomponenten van het zijpaneel:
   * `DrawerHeader`, `DrawerBody`, `DrawerFooter`
   */
  children?: React.ReactNode;
}

/**
 * Drawer component
 * Zijpaneel dat vanuit links of rechts de viewport inschuift.
 *
 * Gebruik `modal={true}` (standaard) voor gefocuste taken waarbij de achtergrond
 * geblokkeerd moet worden. Gebruik `modal={false}` als de gebruiker de achtergrondpagina
 * nodig heeft voor context.
 *
 * @example
 * ```tsx
 * <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <DrawerHeader>
 *     <DrawerHeading>Filteropties</DrawerHeading>
 *   </DrawerHeader>
 *   <DrawerBody>
 *     <Paragraph>Inhoud van het zijpaneel</Paragraph>
 *   </DrawerBody>
 *   <DrawerFooter>
 *     <ActionGroup>
 *       <Button variant="strong" onClick={() => setIsOpen(false)}>Toepassen</Button>
 *       <Button variant="default" onClick={() => setIsOpen(false)}>Annuleren</Button>
 *     </ActionGroup>
 *   </DrawerFooter>
 * </Drawer>
 * ```
 */
export const Drawer = React.forwardRef<HTMLDialogElement, DrawerProps>(
  (
    {
      className,
      isOpen,
      onClose,
      modal = true,
      triggerRef,
      side = 'right',
      children,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLDialogElement>(null);
    const dialogRef =
      (ref as React.RefObject<HTMLDialogElement>) ?? internalRef;
    const headingId = React.useId();
    const headingRef = React.useRef<HTMLHeadingElement | null>(null);

    React.useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (isOpen && !dialog.open) {
        if (modal) {
          dialog.showModal();
        } else {
          dialog.show();
        }

        /*
         * Zet de focus op de heading, niet op de sluitknop. De browser zet de
         * focus bij het openen zelf op het eerste focusbare element, en dat is
         * de sluitknop. VoiceOver in Safari leest die knop dan wel voor, maar
         * niet de titel uit `aria-labelledby`, en omdat de sluitknop na de
         * titel staat kom je de titel bij verder lezen ook niet meer tegen.
         *
         * Met de focus op de heading (die `tabindex="-1"` heeft) wordt de
         * titel als eerste voorgelezen en loopt de leesvolgorde daarna door
         * naar de sluitknop en de inhoud. Dit is het patroon uit de ARIA
         * Authoring Practices, en het houdt DOM-volgorde en visuele volgorde
         * gelijk.
         */
        (headingRef.current ?? dialog).focus();
      } else if (!isOpen && dialog.open) {
        dialog.close();
      }
    }, [isOpen, modal, dialogRef]);

    /*
     * Expliciete focus-trap bovenop de native trap van `.showModal()`.
     * Zie `utils/focusTrap.ts` voor waarom de native trap niet volstaat.
     * Non-modaal krijgt bewust geen trap: daar hoort de gebruiker juist
     * tussen paneel en achtergrondpagina te kunnen tabben.
     */
    useFocusTrap(dialogRef, isOpen && modal);

    // Synchroniseer aria-expanded op het triggerelement
    React.useEffect(() => {
      const trigger = triggerRef?.current;
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      return () => {
        trigger.setAttribute('aria-expanded', 'false');
      };
    }, [isOpen, triggerRef]);

    // Non-modaal: handmatige Escape-afhandeling via keydown
    React.useEffect(() => {
      if (modal) return;
      const dialog = dialogRef.current;
      if (!dialog || !isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose?.();
        }
      };

      dialog.addEventListener('keydown', handleKeyDown);
      return () => dialog.removeEventListener('keydown', handleKeyDown);
    }, [modal, isOpen, onClose, dialogRef]);

    // Modaal: native cancel-event (Escape via browser)
    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onClose?.();
    };

    const classes = classNames(
      'dsn-drawer',
      side === 'left' ? 'dsn-drawer--side-left' : 'dsn-drawer--side-right',
      className
    );

    return (
      <DrawerContext.Provider value={{ headingId, headingRef, onClose }}>
        <dialog
          ref={dialogRef}
          className={classes}
          aria-labelledby={headingId}
          onCancel={handleCancel}
          tabIndex={-1}
          {...props}
        >
          {children}
        </dialog>
      </DrawerContext.Provider>
    );
  }
);

Drawer.displayName = 'Drawer';

// =============================================================================
// DrawerHeader
// =============================================================================

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Inhoud van de header — doorgaans een `DrawerHeading`
   */
  children?: React.ReactNode;
}

/**
 * DrawerHeader
 * De headerstrook van het zijpaneel met heading en sluitknop.
 */
export const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const { onClose } = React.useContext(DrawerContext);

    return (
      <div
        ref={ref}
        className={classNames('dsn-drawer__header', className)}
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
  }
);

DrawerHeader.displayName = 'DrawerHeader';

// =============================================================================
// DrawerHeading
// =============================================================================

export interface DrawerHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Semantisch heading-niveau. Kies op basis van documenthiërarchie, niet visuele grootte.
   * @default 2
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * De zichtbare heading-tekst
   */
  children?: React.ReactNode;
}

/**
 * DrawerHeading
 * De heading van het zijpaneel. ID wordt automatisch gegenereerd voor aria-labelledby.
 * Krijgt `tabindex="-1"` zodat de Drawer er bij openen de focus op kan zetten.
 */
export const DrawerHeading = React.forwardRef<
  HTMLHeadingElement,
  DrawerHeadingProps
>(({ className, level = 2, children, ...props }, ref) => {
  const { headingId, headingRef } = React.useContext(DrawerContext);
  const Tag = `h${level}` as React.ElementType;

  // De Drawer heeft de heading nodig om er bij openen de focus op te zetten;
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
      className={classNames('dsn-drawer-heading', className)}
      tabIndex={-1}
      {...props}
    >
      {children}
    </Tag>
  );
});

DrawerHeading.displayName = 'DrawerHeading';

// =============================================================================
// DrawerBody
// =============================================================================

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * De hoofdinhoud van het zijpaneel
   */
  children?: React.ReactNode;
}

/**
 * DrawerBody
 * De scrollbare inhoudssectie van het zijpaneel met scroll-affordance schaduw.
 */
export const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('dsn-drawer__body', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DrawerBody.displayName = 'DrawerBody';

// =============================================================================
// DrawerFooter
// =============================================================================

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * De acties van het zijpaneel — doorgaans een `ActionGroup` met knoppen
   */
  children?: React.ReactNode;
}

/**
 * DrawerFooter
 * De voettekst van het zijpaneel met actieknoppen.
 */
export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('dsn-drawer__footer', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DrawerFooter.displayName = 'DrawerFooter';
