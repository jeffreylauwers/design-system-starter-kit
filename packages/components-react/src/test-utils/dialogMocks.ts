import { vi } from 'vitest';

/*
 * jsdom implementeert de dialog-methodes en de Popover API niet, maar
 * behandelt de inhoud van een gesloten <dialog> of [popover] wel als niet
 * zichtbaar en dus niet focusbaar, net als een browser. Een lege mock laat de
 * dialog daardoor dicht, en dan kan geen enkel element erin de focus krijgen.
 *
 * Deze mocks doen daarom wat de browser doet: ze zetten de open-toestand.
 */

const POPOVER_OPEN_ATTRIBUTE = 'data-test-popover-open';

export function mockDialogApi(): void {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
}

export function mockPopoverApi(): void {
  /*
   * jsdom kent `:popover-open` niet (jsdom/jsdom#3721), dus zijn eigen
   * stylesheet verbergt elke [popover]. Een open popover krijgt hier een
   * attribuut, en deze stylesheet maakt hem dan weer zichtbaar. De
   * `!important` is nodig omdat jsdom zijn eigen regel op specificiteit laat
   * winnen in plaats van op herkomst.
   */
  if (!document.getElementById(POPOVER_OPEN_ATTRIBUTE)) {
    const style = document.createElement('style');
    style.id = POPOVER_OPEN_ATTRIBUTE;
    style.textContent = `[popover][${POPOVER_OPEN_ATTRIBUTE}] { display: block !important; }`;
    document.head.appendChild(style);
  }

  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute(POPOVER_OPEN_ATTRIBUTE, '');
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute(POPOVER_OPEN_ATTRIBUTE);
  });
}
