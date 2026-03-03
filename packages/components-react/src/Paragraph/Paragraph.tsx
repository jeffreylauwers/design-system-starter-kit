import React from 'react';
import { classNames } from '@dsn/core';
import './Paragraph.css';

export type ParagraphVariant = 'default' | 'lead' | 'small-print';

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Paragraph visual style
   * @default 'default'
   */
  variant?: ParagraphVariant;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Paragraph content
   */
  children?: React.ReactNode;
}

/**
 * Paragraph component with multiple variants
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Paragraph>Body text content</Paragraph>
 *
 * // Lead paragraph
 * <Paragraph variant="lead">Introductory text</Paragraph>
 *
 * // Small print
 * <Paragraph variant="small-print">Terms and conditions apply.</Paragraph>
 * ```
 */
export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const classes = classNames(
      'dsn-paragraph',
      variant !== 'default' && `dsn-paragraph--${variant}`,
      className
    );

    return (
      <p ref={ref} className={classes} {...props}>
        {children}
      </p>
    );
  }
);

Paragraph.displayName = 'Paragraph';
