import React from 'react';
import { classNames } from '@dsn/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import './ModalDialog.css';

// =============================================================================
// Context
// =============================================================================

interface ModalDialogContextValue {
  headingId: string;
  onClose?: () => void;
}

const ModalDialogContext = React.createContext<ModalDialogContextValue>({
  headingId: '',
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
   * De subcomponenten van het dialoogvenster:
   * `ModalDialogHeader`, `ModalDialogBody`, `ModalDialogFooter`
   */
  children?: React.ReactNode;
}

/**
 * ModalDialog component
 * Modaal dialoogvenster gebaseerd op het native `<dialog>` element.
 *
 * Gebruik altijd `.showModal()` (intern afgehandeld via `isOpen` prop) — nooit `.show()`.
 * Dit garandeert natieve focus-trap, aria-modal semantiek en inert-attribuut op de achtergrond.
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
>(({ className, isOpen, onClose, children, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDialogElement>(null);
  const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? internalRef;
  const headingId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, dialogRef]);

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose?.();
  };

  const classes = classNames('dsn-modal-dialog', className);

  return (
    <ModalDialogContext.Provider value={{ headingId, onClose }}>
      <dialog
        ref={dialogRef}
        className={classes}
        aria-labelledby={headingId}
        onCancel={handleCancel}
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
 */
export const ModalDialogHeading = React.forwardRef<
  HTMLHeadingElement,
  ModalDialogHeadingProps
>(({ className, level = 2, children, ...props }, ref) => {
  const { headingId } = React.useContext(ModalDialogContext);
  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag
      ref={ref}
      id={headingId}
      className={classNames('dsn-modal-dialog-heading', className)}
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
