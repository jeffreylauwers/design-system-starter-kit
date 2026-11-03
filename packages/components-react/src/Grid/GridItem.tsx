import React from 'react';
import { classNames } from '@dsn-starter-kit/core';

export type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridColPosition =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Aantal kolommen dat dit item beslaat (1–12).
   * Zonder colSpan beslaat het item de volledige breedte (12 kolommen).
   */
  colSpan?: GridColSpan;

  /**
   * Kolomspanning vanaf sm-breakpoint (36em ~576px).
   * Overschrijft colSpan op dit breekpunt.
   */
  colSpanSm?: GridColSpan;

  /**
   * Kolomspanning vanaf md-breakpoint (44em ~704px).
   * Overschrijft colSpan op dit breekpunt.
   */
  colSpanMd?: GridColSpan;

  /**
   * Kolomspanning vanaf lg-breakpoint (64em ~1024px).
   * Overschrijft colSpan op dit breekpunt.
   */
  colSpanLg?: GridColSpan;

  /** Startkolom (grid-column-start, 1–13). */
  colStart?: GridColPosition;
  /** Startkolom vanaf sm-breakpoint. */
  colStartSm?: GridColPosition;
  /** Startkolom vanaf md-breakpoint. */
  colStartMd?: GridColPosition;
  /** Startkolom vanaf lg-breakpoint. */
  colStartLg?: GridColPosition;

  /** Eindkolom (grid-column-end, 1–13). */
  colEnd?: GridColPosition;
  /** Eindkolom vanaf sm-breakpoint. */
  colEndSm?: GridColPosition;
  /** Eindkolom vanaf md-breakpoint. */
  colEndMd?: GridColPosition;
  /** Eindkolom vanaf lg-breakpoint. */
  colEndLg?: GridColPosition;

  /**
   * Breekt visueel uit tot de buitenrand van de grid container.
   * Het item beslaat de volledige breedte inclusief de grid margin.
   * Gebruik dit voor achtergrondvlakken die edge-to-edge lopen.
   * @default false
   */
  fullBleed?: boolean;

  /**
   * Child-elementen van het grid item.
   */
  children?: React.ReactNode;
}

/**
 * GridItem component
 * Directe child van Grid met kolomspanning en optionele responsive varianten.
 *
 * @example
 * ```tsx
 * // Vaste kolomverdeling
 * <Grid>
 *   <GridItem colSpan={8}>Hoofdinhoud</GridItem>
 *   <GridItem colSpan={4}>Sidebar</GridItem>
 * </Grid>
 *
 * // Responsive: 12 kolommen op mobiel, 6 op md, 4 op lg
 * <Grid contained>
 *   <GridItem colSpan={12} colSpanMd={6} colSpanLg={4}>Item</GridItem>
 *   <GridItem colSpan={12} colSpanMd={6} colSpanLg={4}>Item</GridItem>
 *   <GridItem colSpan={12} colSpanMd={12} colSpanLg={4}>Item</GridItem>
 * </Grid>
 *
 * // Full-bleed: breekt uit tot de container-randen
 * <Grid contained>
 *   <GridItem colSpan={8}>Normale content</GridItem>
 *   <GridItem fullBleed>
 *     <div style={{ background: 'var(--dsn-color-brand-bg)', padding: '2rem' }}>
 *       Edge-to-edge sectie
 *     </div>
 *   </GridItem>
 * </Grid>
 * ```
 */
export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      className,
      colSpan,
      colSpanSm,
      colSpanMd,
      colSpanLg,
      colStart,
      colStartSm,
      colStartMd,
      colStartLg,
      colEnd,
      colEndSm,
      colEndMd,
      colEndLg,
      fullBleed,
      children,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      colSpan && `dsn-col-${colSpan}`,
      colSpanSm && `dsn-col-sm-${colSpanSm}`,
      colSpanMd && `dsn-col-md-${colSpanMd}`,
      colSpanLg && `dsn-col-lg-${colSpanLg}`,
      colStart && `dsn-col-start-${colStart}`,
      colStartSm && `dsn-col-start-sm-${colStartSm}`,
      colStartMd && `dsn-col-start-md-${colStartMd}`,
      colStartLg && `dsn-col-start-lg-${colStartLg}`,
      colEnd && `dsn-col-end-${colEnd}`,
      colEndSm && `dsn-col-end-sm-${colEndSm}`,
      colEndMd && `dsn-col-end-md-${colEndMd}`,
      colEndLg && `dsn-col-end-lg-${colEndLg}`,
      fullBleed && 'dsn-full-bleed',
      className
    );

    return (
      <div ref={ref} className={classes || undefined} {...props}>
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';
