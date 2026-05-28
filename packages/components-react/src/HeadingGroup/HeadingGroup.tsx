import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import type { HeadingLevel, HeadingAppearance } from '../Heading/Heading';
import './HeadingGroup.css';

export interface HeadingGroupProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Semantic heading level — determines the HTML element (h1–h6)
   * @default 2
   */
  level?: HeadingLevel;

  /**
   * Visual appearance — controls font size, line height, and spacing.
   * Defaults to matching the level (e.g. level 2 → heading-2).
   */
  appearance?: HeadingAppearance;

  /**
   * Content of the pre-heading. Wrapped in a dsn-pre-heading span automatically.
   */
  preHeading?: React.ReactNode;

  children?: React.ReactNode;
  className?: string;
}

export const HeadingGroup = React.forwardRef<
  HTMLHeadingElement,
  HeadingGroupProps
>(
  (
    { level = 2, appearance, preHeading, className, children, ...props },
    ref
  ) => {
    const resolvedAppearance =
      appearance ?? (`heading-${level}` as HeadingAppearance);
    const Tag = `h${level}` as const;

    const classes = classNames(
      'dsn-heading',
      `dsn-heading--${resolvedAppearance}`,
      'dsn-heading-group',
      className
    );

    return (
      <Tag ref={ref} className={classes} {...props}>
        {preHeading != null && (
          <span className="dsn-pre-heading">{preHeading}</span>
        )}
        {children}
      </Tag>
    );
  }
);

HeadingGroup.displayName = 'HeadingGroup';
