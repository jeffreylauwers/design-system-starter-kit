import React from 'react';
import { classNames } from '@dsn/core';
import './Body.css';

export interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Child-elementen die de document-level stijlen erven
   */
  children?: React.ReactNode;
}

/**
 * Body component
 * Stelt document-level CSS stijlen in via CSS inheritance zodat alle child-elementen
 * automatisch de juiste typografie, kleur en achtergrond erven.
 *
 * @example
 * ```tsx
 * // In een applicatie: wrap de root-content
 * <Body>
 *   <h1>Mijn pagina</h1>
 *   <p>Inhoud met geërfde stijlen</p>
 * </Body>
 *
 * // Of pas de CSS class direct toe op het <body> element
 * // <body class="dsn-body">
 * ```
 */
export const Body = React.forwardRef<HTMLDivElement, BodyProps>(
  ({ className, children, ...props }, ref) => {
    const classes = classNames('dsn-body', className);

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Body.displayName = 'Body';
