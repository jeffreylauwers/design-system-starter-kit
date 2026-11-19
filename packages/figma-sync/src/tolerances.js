/**
 * Hoeveel de waarde van een token van de gemeten waarde mag afwijken om nog
 * als dezelfde waarde te gelden.
 *
 * Gedeeld door de bindingen op lagen (`bindings.js`) en op schaduwen
 * (`effects.js`). Twee losse kopieën kunnen uit elkaar lopen, en dan bindt
 * hetzelfde token wel op een rand en niet in een schaduw.
 */

/** Voor maten en andere getallen, in px. */
export const NUMBER_TOLERANCE = 0.05;

/** Voor een kleurkanaal, op de schaal 0..1. */
export const CHANNEL_TOLERANCE = 0.005;
