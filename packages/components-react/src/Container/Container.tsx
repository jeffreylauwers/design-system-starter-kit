import React from 'react';
import { classNames } from '@dsn/core';
import './Container.css';

export type ContainerAs = 'div' | 'section' | 'article' | 'aside';

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * HTML-element — ontkoppelt semantiek van visuele stijl
   * @default 'div'
   */
  as?: ContainerAs;

  /**
   * Voegt een lichte schaduw toe voor een zwevend, kaart-achtig effect
   * @default false
   */
  elevated?: boolean;

  children?: React.ReactNode;
}

/**
 * Container component
 * Visuele groepering van gerelateerde content met achtergrond, border en optionele schaduw.
 *
 * @example
 * ```tsx
 * // Standaard
 * <Container>
 *   <Paragraph>Inhoud</Paragraph>
 * </Container>
 *
 * // Elevated (kaart-achtig)
 * <Container elevated>
 *   <Paragraph>Inhoud</Paragraph>
 * </Container>
 *
 * // Semantisch element
 * <Container as="section">
 *   <Heading level={2}>Sectietitel</Heading>
 *   <Paragraph>Inhoud</Paragraph>
 * </Container>
 * ```
 */
export const Container = React.forwardRef<HTMLElement, ContainerProps>(
  (
    { as: As = 'div', className, elevated = false, children, ...props },
    ref
  ) => {
    const classes = classNames(
      'dsn-container',
      elevated && 'dsn-container--elevated',
      className
    );

    return (
      <As ref={ref as React.Ref<HTMLDivElement>} className={classes} {...props}>
        {children}
      </As>
    );
  }
);

Container.displayName = 'Container';
