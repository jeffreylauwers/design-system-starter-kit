/**
 * Geeft de sandbox even lucht zodat een voortgangsmelding de UI kan bereiken.
 *
 * Een verse import heeft in zijn lus geen enkel await-punt: alles wordt dan
 * pas bezorgd als de hele set al klaar is, en dan staat de indicator de hele
 * tijd stil op het eerste item. Bij een tweede import is er wél een await,
 * maar daarop leunen zou betekenen dat de voortgang alleen werkt in het geval
 * waar je hem het minst nodig hebt.
 *
 * Gedeeld door de variantlus van een component set en de lus van de iconset.
 */

/** Om de hoeveel items de lus de UI even aan de beurt laat. */
export const YIELD_EVERY = 8;

/** Eén tick wachten, zodat wachtende berichten de UI bereiken. */
export const yieldToUi = () => new Promise((resolve) => setTimeout(resolve, 0));
