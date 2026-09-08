import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { useFocusTrap } from '../utils/focusTrap';
import './ModalDialog.css';

// =============================================================================
// Context
// =============================================================================

interface ModalDialogContextValue {
  headingId: string;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
  onClose?: () => void;
}

const ModalDialogContext = React.createContext<ModalDialogContextValue>({
  headingId: '',
  headingRef: { current: null },
});

// =============================================================================
// ModalDialog (root)
// =============================================================================

export interface ModalDialogProps extends Omit<
  React.HTMLAttributes<HTMLDialogElement>,
  'children'
> {
  /**
   * Bepaalt of het dialoogvenster getoond wordt.
   * Het dialoogvenster wordt via `.showModal()` geopend — nooit via `.show()`.
   */
  isOpen: boolean;

  /**
   * Callback die wordt aangeroepen wanneer het dialoogvenster sluit
   * (sluitknop, Escape-toets of klik buiten het venster).
   */
  onClose?: () => void;

  /**
   * Ref naar het element dat het dialoogvenster opent. Wanneer je die meegeeft,
   * houdt het dialoogvenster `aria-expanded` op dat element synchroon met de
   * open-staat: `false` wanneer het venster gesloten is, `true` wanneer het
   * open staat.
   */
  triggerRef?: React.RefObject<HTMLElement | null>;

  /**
   * De subcomponenten van het dialoogvenster:
   * `ModalDialogHeader`, `ModalDialogBody`, `ModalDialogFooter`
   */
  children?: React.ReactNode;
}

/**
 * ModalDialog component
 * Modaal dialoogvenster gebaseerd op het native `<dialog>` element.
 *
 * Gebruik altijd `.showModal()` (intern afgehandeld via `isOpen` prop), nooit `.show()`.
 * Dit garandeert aria-modal semantiek en het inert-attribuut op de achtergrond.
 * De focus blijft binnen het venster via de native focus-trap plus een
 * expliciete trap, en komt bij openen op de heading te staan.
 *
 * @example
 * ```tsx
 * <ModalDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <ModalDialogHeader>
 *     <ModalDialogHeading>Bevestig verwijderen</ModalDialogHeading>
 *   </ModalDialogHeader>
 *   <ModalDialogBody>
 *     <Paragraph>Weet u zeker dat u dit item wilt verwijderen?</Paragraph>
 *   </ModalDialogBody>
 *   <ModalDialogFooter>
 *     <ActionGroup>
 *       <Button variant="negative" onClick={() => setIsOpen(false)}>Verwijderen</Button>
 *       <Button variant="default" onClick={() => setIsOpen(false)}>Annuleren</Button>
 *     </ActionGroup>
 *   </ModalDialogFooter>
 * </ModalDialog>
 * ```
 */
export const ModalDialog = React.forwardRef<
  HTMLDialogElement,
  ModalDialogProps
>(({ className, isOpen, onClose, triggerRef, children, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDialogElement>(null);
  const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? internalRef;
  const headingId = React.useId();
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();

      /*
       * Zet de focus op de heading, niet op de sluitknop. De browser zet de
       * focus bij het openen zelf op het eerste focusbare element, en dat is
       * de sluitknop. VoiceOver in Safari leest die knop dan wel voor, maar
       * niet de titel uit `aria-labelledby`, en omdat de sluitknop na de
       * titel staat kom je de titel bij verder lezen ook niet meer tegen.
       *
       * Met de focus op de heading (die `tabindex="-1"` heeft) wordt de titel
       * als eerste voorgelezen en loopt de leesvolgorde daarna door naar de
       * sluitknop en de inhoud. Dit is het patroon uit de ARIA Authoring
       * Practices, en het houdt DOM-volgorde en visuele volgorde gelijk.
       */
      (headingRef.current ?? dialog).focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, dialogRef]);

  /*
   * Expliciete focus-trap bovenop de native trap van `.showModal()`.
   * Zie `utils/focusTrap.ts` voor waarom de native trap niet volstaat.
   */
  useFocusTrap(dialogRef, isOpen);

  // Synchroniseer aria-expanded op het triggerelement
  React.useEffect(() => {
    const trigger = triggerRef?.current;
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    return () => {
      trigger.setAttribute('aria-expanded', 'false');
    };
  }, [isOpen, triggerRef]);

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose?.();
  };

  const classes = classNames('dsn-modal-dialog', className);

  return (
    <ModalDialogContext.Provider value={{ headingId, headingRef, onClose }}>
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
    </ModalDialogContext.Provider>
  );
});

ModalDialog.displayName = 'ModalDialog';

// =============================================================================
// ModalDialogHeader
// =============================================================================

export interface ModalDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Inhoud van de header — doorgaans een `ModalDialogHeading`
   */
  children?: React.ReactNode;
}

/**
 * ModalDialogHeader
 * De headerstrook van het dialoogvenster met heading en sluitknop.
 */
export const ModalDialogHeader = React.forwardRef<
  HTMLDivElement,
  ModalDialogHeaderProps
>(({ className, children, ...props }, ref) => {
  const { onClose } = React.useContext(ModalDialogContext);

  return (
    <div
      ref={ref}
      className={classNames('dsn-modal-dialog__header', className)}
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

ModalDialogHeader.displayName = 'ModalDialogHeader';

// =============================================================================
// ModalDialogHeading
// =============================================================================

export interface ModalDialogHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
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
 * ModalDialogHeading
 * De heading van het dialoogvenster. ID wordt automatisch gegenereerd voor aria-labelledby.
 * Krijgt `tabindex="-1"` zodat het ModalDialog er bij openen de focus op kan zetten.
 */
export const ModalDialogHeading = React.forwardRef<
  HTMLHeadingElement,
  ModalDialogHeadingProps
>(({ className, level = 2, children, ...props }, ref) => {
  const { headingId, headingRef } = React.useContext(ModalDialogContext);
  const Tag = `h${level}` as React.ElementType;

  // Het ModalDialog heeft de heading nodig om er bij openen de focus op te
  // zetten; een eventuele meegegeven ref blijft daarnaast gewoon werken.
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
      className={classNames('dsn-modal-dialog-heading', className)}
      tabIndex={-1}
      {...props}
    >
      {children}
    </Tag>
  );
});

ModalDialogHeading.displayName = 'ModalDialogHeading';

// =============================================================================
// ModalDialogBody
// =============================================================================

export interface ModalDialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * De hoofdinhoud van het dialoogvenster
   */
  children?: React.ReactNode;
}

/**
 * ModalDialogBody
 * De scrollbare inhoudssectie van het dialoogvenster met scroll-affordance schaduw.
 */
export const ModalDialogBody = React.forwardRef<
  HTMLDivElement,
  ModalDialogBodyProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={classNames('dsn-modal-dialog__body', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ModalDialogBody.displayName = 'ModalDialogBody';

// =============================================================================
// ModalDialogFooter
// =============================================================================

export interface ModalDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * De acties van het dialoogvenster — doorgaans een `ActionGroup` met knoppen
   */
  children?: React.ReactNode;
}

/**
 * ModalDialogFooter
 * De voettekst van het dialoogvenster met actieknoppen.
 */
export const ModalDialogFooter = React.forwardRef<
  HTMLDivElement,
  ModalDialogFooterProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={classNames('dsn-modal-dialog__footer', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ModalDialogFooter.displayName = 'ModalDialogFooter';
