import React from 'react';

/**
 * Focus-trap hulpfuncties voor dialoogachtige componenten.
 *
 * Gebaseerd op de techniek van Hidde de Vries:
 * https://hidde.blog/using-javascript-to-trap-focus-in-an-element/
 *
 * Het native `<dialog>` element trapt de focus zelf zodra het via `.showModal()`
 * geopend wordt. Die native trap is echter niet overal betrouwbaar: zodra het
 * dialoogvenster in een `<iframe>` staat (Storybook, embeds, previews) laat
 * Safari de focus alsnog over de iframe-grens ontsnappen naar de pagina
 * eromheen. Deze expliciete trap staat daarbovenop en maakt het gedrag
 * browseronafhankelijk.
 */

/**
 * Selector voor elementen die standaard in de tabvolgorde staan.
 * Uitgeschakelde controls en `tabindex="-1"` vallen er bewust buiten.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  'details > summary:first-of-type',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

/**
 * Elementen die de focus niet kunnen krijgen omdat ze (of een voorouder)
 * verborgen of inert zijn. `[hidden]` en `[inert]` halen een element uit de
 * tabvolgorde, `[aria-hidden="true"]` hoort geen focusbare inhoud te bevatten.
 */
function isReachable(element: HTMLElement): boolean {
  return !element.closest('[hidden], [inert], [aria-hidden="true"]');
}

/**
 * Alle bereikbare focusbare elementen binnen een container, in DOM-volgorde.
 *
 * De trap staat of valt met die volgorde: het eerste en het laatste element
 * bepalen waar Tab en Shift+Tab omslaan. Daarom lopen we alle elementen langs
 * en toetsen we ze met `matches`, in plaats van `querySelectorAll` met de hele
 * selectorlijst. Browsers geven daar documentvolgorde bij terug, maar jsdom
 * groepeert het resultaat per losse selector, en dan zou de trap in tests
 * ander gedrag vertonen dan in het echt.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).filter(
    (element) => element.matches(FOCUSABLE_SELECTOR) && isReachable(element)
  );
}

/**
 * Houdt de toetsenbordfocus binnen `containerRef` zolang `active` waar is.
 *
 * De listener hangt aan de container zelf, niet aan het document: hij grijpt
 * alleen in wanneer de focus al binnen de container zit, en laat de rest van de
 * pagina met rust.
 *
 * Elementen met `tabindex="-1"` (zoals de heading die bij openen focus krijgt)
 * staan niet in de tabvolgorde. Vanaf zo'n element wrapt Shift+Tab naar het
 * laatste focusbare element, zodat de focus ook daar niet naar buiten valt.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean
): void {
  React.useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(container);

      // Geen focusbare inhoud: houd de focus waar hij is
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const isInTabOrder = current ? focusable.includes(current) : false;

      if (event.shiftKey) {
        // Terug vanaf het eerste element, of vanaf een element buiten de
        // tabvolgorde zoals de heading, wrapt naar het laatste element
        if (current === first || !isInTabOrder) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active, containerRef]);
}
