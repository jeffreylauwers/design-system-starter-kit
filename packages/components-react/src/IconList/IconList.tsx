import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import './IconList.css';

// =============================================================================
// IconList
// =============================================================================

export interface IconListProps extends React.HTMLAttributes<
  HTMLUListElement | HTMLOListElement
> {
  /**
   * Semantic list element
   * @default 'ul'
   */
  as?: 'ul' | 'ol';

  /**
   * CSS color value that overrides `--dsn-icon-list-icon-color` for the whole
   * list; accepts any `var(--dsn-color-*-color-default)`
   */
  iconColor?: string;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * `IconListItem` elements
   */
  children?: React.ReactNode;
}

/**
 * List where every item carries an icon instead of a bullet or number
 *
 * `role="list"` is set explicitly: `list-style-type: none` makes
 * Safari/VoiceOver drop the list announcement, and the role restores it.
 *
 * @example
 * ```tsx
 * <IconList>
 *   <IconListItem icon="calendar-event">Afspraak op maandag 24 maart</IconListItem>
 *   <IconListItem icon="clock">Duurt 30 minuten</IconListItem>
 * </IconList>
 *
 * // Ordered steps
 * <IconList as="ol">
 *   <IconListItem icon="calendar-event">Maak een afspraak</IconListItem>
 *   <IconListItem icon="clock">Wacht op bevestiging</IconListItem>
 * </IconList>
 *
 * // Positive status color for the whole list
 * <IconList iconColor="var(--dsn-color-positive-color-default)">
 *   <IconListItem icon="check">Aanvraag goedgekeurd</IconListItem>
 * </IconList>
 * ```
 */
export const IconList = React.forwardRef<
  HTMLUListElement | HTMLOListElement,
  IconListProps
>(({ as = 'ul', iconColor, className, children, style, ...props }, ref) => {
  const Element = as;
  const classes = classNames('dsn-icon-list', className);

  const styles = iconColor
    ? ({
        ...style,
        '--dsn-icon-list-icon-color': iconColor,
      } as React.CSSProperties)
    : style;

  return (
    <Element
      ref={ref as React.Ref<HTMLUListElement & HTMLOListElement>}
      className={classes}
      role="list"
      style={styles}
      {...props}
    >
      {children}
    </Element>
  );
});

IconList.displayName = 'IconList';

// =============================================================================
// IconListItem
// =============================================================================

export interface IconListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /**
   * Icon name from the icon set; the icon is decorative and replaces the marker
   */
  icon: IconName;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Item text content
   */
  children?: React.ReactNode;
}

export const IconListItem = React.forwardRef<HTMLLIElement, IconListItemProps>(
  ({ icon, className, children, ...props }, ref) => {
    const classes = classNames('dsn-icon-list__item', className);

    return (
      <li ref={ref} className={classes} {...props}>
        <Icon name={icon} className="dsn-icon-list__icon" />
        {children}
      </li>
    );
  }
);

IconListItem.displayName = 'IconListItem';
