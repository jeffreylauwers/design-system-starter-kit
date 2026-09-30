import React from 'react';

/**
 * Gedeeld gedrag voor componenten op basis van de HTML Popover API.
 *
 * `Popover` (niet-modale dialog) en `PopoverMenu` (lijst zonder rol) zien er
 * anders uit en hebben andere semantiek, maar openen, positioneren, sluiten en
 * de focus terugzetten gaat bij beide hetzelfde. Dat gedrag staat hier op één
 * plek. Deze module wordt niet geëxporteerd uit het package.
 */

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

export type PopoverPlacement = 'top' | 'bottom' | 'start' | 'end';

// =============================================================================
// Positioneringshelper
// =============================================================================

const GAP = 4; // px afstand tussen trigger en popover

function positionPopover(
  popover: HTMLElement,
  trigger: HTMLElement,
  placement: PopoverPlacement
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
// Hook
// =============================================================================

export interface UsePopoverOptions {
  /** Het element met het `popover`-attribuut. */
  popoverRef: React.RefObject<HTMLElement | null>;
  /** Het element dat de popover opent. */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Of de popover open staat. */
  isOpen: boolean;
  /** Wordt aangeroepen wanneer de popover sluit. */
  onClose?: () => void;
  /** Plaatsing ten opzichte van de trigger. */
  placement: PopoverPlacement;
  /**
   * Element dat bij openen de focus krijgt. Is de ref leeg, dan krijgt de
   * popover zelf de focus. Zonder deze optie gaat de focus naar het eerste
   * interactieve element.
   *
   * `Popover` geeft hier de heading mee, net als ModalDialog en Drawer: zie
   * docs/decisions/DR-2026-12-dialogs-focus-bij-openen-op-de-heading.md.
   * `PopoverMenu` laat hem weg: dat paneel heeft geen titel.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Opent en sluit een element met `popover="auto"` synchroon met `isOpen`,
 * positioneert het bij de trigger en houdt `aria-expanded` op de trigger bij.
 *
 * Bij openen gaat de focus naar `initialFocusRef` (of de popover zelf als die
 * ref leeg is), en anders naar het eerste interactieve element. Bij sluiten
 * gaat de focus alleen terug naar de trigger wanneer dat zinvol is: als de
 * focus op dat moment nog in de popover stond (Escape, een sluitknop, een
 * actie in de popover). Klikt de gebruiker ergens anders, dan blijft de focus
 * daar; terugspringen naar de trigger zou die klik tenietdoen.
 */
export function usePopover({
  popoverRef,
  triggerRef,
  isOpen,
  onClose,
  placement,
  initialFocusRef,
}: UsePopoverOptions): void {
  /*
   * `restoreFocusRef` wordt gezet in `beforetoggle`, dat synchroon vóór het
   * verbergen vuurt. In `toggle` is het te laat om het te meten: de popover
   * is dan al verborgen en de browser heeft de focus al verplaatst.
   */
  const restoreFocusRef = React.useRef(false);
  const dismissedByPointerRef = React.useRef(false);

  // Gebruik een ref voor onClose zodat de listeners stabiel blijven en nooit stale zijn.
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  // Toon/verberg de popover via de Popover API
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
      if (initialFocusRef) {
        (initialFocusRef.current ?? el).focus();
      } else {
        focusFirstInteractive(el);
      }
    } else {
      // hidePopover gooit een fout als de popover al gesloten is
      try {
        el.hidePopover();
      } catch {
        // popover was al gesloten — geen actie nodig
      }
    }
  }, [isOpen, placement, triggerRef, popoverRef, initialFocusRef]);

  // Synchroniseer aria-expanded op het triggerelement
  React.useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    return () => {
      trigger.setAttribute('aria-expanded', 'false');
    };
  }, [isOpen, triggerRef]);

  // Verwerk de toggle-events van de Popover API (Escape / klik buiten binnen hetzelfde document).
  // onToggle is niet beschikbaar als JSX-prop op div in React 18 — gebruik addEventListener.
  React.useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const handleBeforeToggle = (event: Event) => {
      const toggleEvent = event as Event & { newState?: string };
      if (toggleEvent.newState === 'closed') {
        restoreFocusRef.current =
          !dismissedByPointerRef.current && el.contains(document.activeElement);
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

  // Fallback light-dismiss via pointerdown — vangt klikken buiten de popover op
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
}
