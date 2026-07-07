import React, { useId } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Heading, type HeadingLevel } from '../Heading';
import { Link } from '../Link';
import { UnorderedList } from '../UnorderedList';
import './TableOfContents.css';

export type TableOfContentsAppearance = 'framed' | 'plain';

export interface TableOfContentsItem {
  /**
   * Anchor target — moet overeenkomen met het `id` van de bijbehorende H2 op de pagina
   */
  id: string;

  /**
   * Zichtbare linktekst
   */
  label: string;
}

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Zichtbare heading-tekst
   * @default 'Op deze pagina'
   */
  heading?: string;

  /**
   * Semantisch heading-niveau
   * @default 2
   */
  headingLevel?: HeadingLevel;

  /**
   * Visuele weergave:
   * - `'framed'` — accent-1 achtergrond + linkerborder, heading als heading-3 (voor gebruik inline in de content-flow)
   * - `'plain'` — geen kader, heading als heading-5 (voor gebruik in een losstaande kolom)
   * @default 'framed'
   */
  appearance?: TableOfContentsAppearance;

  /**
   * Secties waarnaar gelinkt wordt — alleen H2's horen hierin opgenomen te worden
   */
  items: TableOfContentsItem[];

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * TableOfContents component
 * Inhoudsopgave met ankerlinks naar de H2-secties op de huidige pagina.
 *
 * @example
 * ```tsx
 * // Framed (default) — inline in de content-flow
 * <TableOfContents
 *   items={[
 *     { id: 'sectie-1', label: 'Sectie 1' },
 *     { id: 'sectie-2', label: 'Sectie 2' },
 *   ]}
 * />
 *
 * // Plain — in een losstaande kolom naast de hoofdinhoud
 * <TableOfContents appearance="plain" items={items} />
 * ```
 */
export const TableOfContents = React.forwardRef<
  HTMLElement,
  TableOfContentsProps
>(
  (
    {
      heading = 'Op deze pagina',
      headingLevel = 2,
      appearance = 'framed',
      items,
      className,
      ...props
    },
    ref
  ) => {
    const headingId = useId();

    const classes = classNames(
      'dsn-table-of-contents',
      appearance === 'plain' && 'dsn-table-of-contents--plain',
      className
    );

    return (
      <nav
        ref={ref as React.Ref<HTMLElement>}
        className={classes}
        aria-labelledby={headingId}
        {...props}
      >
        <Heading
          level={headingLevel}
          appearance={appearance === 'plain' ? 'heading-5' : 'heading-3'}
          className="dsn-table-of-contents__heading"
          id={headingId}
        >
          {heading}
        </Heading>
        <UnorderedList>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`#${item.id}`}>{item.label}</Link>
            </li>
          ))}
        </UnorderedList>
      </nav>
    );
  }
);

TableOfContents.displayName = 'TableOfContents';
