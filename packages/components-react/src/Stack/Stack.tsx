import React from 'react';
import { classNames } from '@dsn/core';
import './Stack.css';

export type StackSpace =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Verticale ruimte tussen directe child-elementen
   * @default 'md'
   */
  space?: StackSpace;

  /**
   * Child-elementen om verticaal te stapelen
   */
  children?: React.ReactNode;
}

/**
 * Stack layout component
 * Brengt consistente verticale ruimte aan tussen directe child-elementen via flexbox + gap.
 *
 * @example
 * ```tsx
 * // Default (md = 8px)
 * <Stack>
 *   <Paragraph>Eerste paragraaf</Paragraph>
 *   <Paragraph>Tweede paragraaf</Paragraph>
 * </Stack>
 *
 * // Grote ruimte tussen secties
 * <Stack space="3xl">
 *   <section>...</section>
 *   <section>...</section>
 * </Stack>
 * ```
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, space = 'md', children, ...props }, ref) => {
    const classes = classNames(
      'dsn-stack',
      space !== 'md' && `dsn-stack--space-${space}`,
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
