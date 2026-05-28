import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './PreHeading.css';

export interface PreHeadingProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
}

export const PreHeading = React.forwardRef<HTMLSpanElement, PreHeadingProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={classNames('dsn-pre-heading', className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

PreHeading.displayName = 'PreHeading';
