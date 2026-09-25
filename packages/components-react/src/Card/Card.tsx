import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './Card.css';

// =============================================================================
// Context — Card deelt href met CardHeading via React context
// =============================================================================

interface CardContextValue {
  href?: string;
}

const CardContext = React.createContext<CardContextValue>({});

// =============================================================================
// Card — root container
// =============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * URL voor de stretched link. `CardHeading` en `CardLabel` ontvangen `href`
   * automatisch via React context en zetten hun tekst in een `<a>`.
   */
  href?: string;

  /** Secties: `CardHeader`, `CardPreHeader`, `CardBody`, `CardFooter` */
  children?: React.ReactNode;

  className?: string;
}

/**
 * Card component
 * Configureerbare container met vier optionele secties: `CardPreHeader`,
 * `CardHeader`, `CardBody` en `CardFooter` (zie DR-2026-11).
 *
 * Zet `CardHeader` in de JSX altijd vóór `CardPreHeader`: zo kondigt een
 * screenreader de heading eerst aan. De CSS zet de pre-header visueel bovenaan.
 *
 * Met `href` wordt de heading een stretched link: de link dekt de volledige
 * card, en screenreaders lezen alleen de heading-tekst als linknaam.
 *
 * @example
 * ```tsx
 * <Card href="/artikel/slug">
 *   <CardHeader>
 *     <CardHeading level={2}>Artikeltitel</CardHeading>
 *   </CardHeader>
 *   <CardPreHeader>
 *     <Image src="/foto.jpg" alt="" width={800} height={450} ratio="16:9" />
 *   </CardPreHeader>
 *   <CardBody>
 *     <Paragraph>Korte beschrijving.</Paragraph>
 *   </CardBody>
 *   <CardFooter>
 *     <CardAffordance>Lees meer</CardAffordance>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, href, children, ...props }, ref) => {
    return (
      <CardContext.Provider value={{ href }}>
        <article
          ref={ref}
          className={classNames('dsn-card', className)}
          {...props}
        >
          {children}
        </article>
      </CardContext.Provider>
    );
  }
);

Card.displayName = 'Card';

// =============================================================================
// CardPreHeader — slot dat visueel bovenaan staat
// =============================================================================

export interface CardPreHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Afbeelding, badge, logo of icoon. Een `Image` als direct kind loopt door
   * tot de rand van de card. Zonder children → toont een placeholder met
   * `aspect-ratio: 16 / 9` voor visuele consistentie in een groep.
   *
   * Zet hier geen focusbare elementen in: de pre-header staat in de DOM ná de
   * header, dus de focusvolgorde zou afwijken van de visuele volgorde.
   */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardPreHeader sub-component
 * Staat in de DOM ná `CardHeader` en komt visueel bovenaan via `order: -1`.
 * Zonder children → toont automatisch een afbeeldingsplaceholder.
 */
export const CardPreHeader = React.forwardRef<
  HTMLDivElement,
  CardPreHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={classNames('dsn-card__pre-header', className)}
      {...props}
    >
      {children ? (
        children
      ) : (
        <div className="dsn-card__image-placeholder" aria-hidden="true" />
      )}
    </div>
  );
});

CardPreHeader.displayName = 'CardPreHeader';

// =============================================================================
// CardHeader — heading of label, plus bijbehorende badges
// =============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `CardHeading` of `CardLabel`, optioneel gevolgd door een `StatusBadge` */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardHeader sub-component
 * Bevat de heading of het label van de card. Zet hem in de JSX vóór
 * `CardPreHeader`.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('dsn-card__header', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// =============================================================================
// CardBody — inhoudssectie
// =============================================================================

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `Paragraph`, `CardDescription`, `CardMeta` of andere inhoud */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardBody sub-component
 * Inhoudssectie onder de header.
 */
export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('dsn-card__body', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// =============================================================================
// CardHeading — heading met stretched link
// =============================================================================

export interface CardHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Semantisch heading-niveau. Visuele appearance is altijd "card-heading".
   * @default 2
   */
  level?: 2 | 3 | 4;

  /** Heading-tekst */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardHeading sub-component
 * Ontvangt `href` automatisch via React context van de parent `Card`.
 * Wanneer `href` beschikbaar is, staat de heading-tekst in een `<a class="dsn-card__link">`.
 * Het `::before` pseudo-element dekt de volledige card (stretched link).
 */
export const CardHeading = React.forwardRef<
  HTMLHeadingElement,
  CardHeadingProps
>(({ className, level = 2, children, ...props }, ref) => {
  const { href } = React.useContext(CardContext);
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4';

  return (
    <Tag
      ref={ref}
      className={classNames('dsn-card__heading', className)}
      {...props}
    >
      {href ? (
        <a href={href} className="dsn-card__link">
          {children}
        </a>
      ) : (
        children
      )}
    </Tag>
  );
});

CardHeading.displayName = 'CardHeading';

// =============================================================================
// CardLabel — compacte aanduiding zonder heading-semantiek
// =============================================================================

export interface CardLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Label-tekst */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardLabel sub-component
 * Gebruik in plaats van `CardHeading` wanneer de card geen nieuw onderwerp
 * introduceert, zoals bij login-opties of instellingen. Ontvangt `href` via
 * context, net als `CardHeading`.
 */
export const CardLabel = React.forwardRef<HTMLParagraphElement, CardLabelProps>(
  ({ className, children, ...props }, ref) => {
    const { href } = React.useContext(CardContext);

    return (
      <p
        ref={ref}
        className={classNames('dsn-card__label', className)}
        {...props}
      >
        {href ? (
          <a href={href} className="dsn-card__link">
            {children}
          </a>
        ) : (
          children
        )}
      </p>
    );
  }
);

CardLabel.displayName = 'CardLabel';

// =============================================================================
// CardDescription — korte omschrijving
// =============================================================================

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardDescription sub-component
 * Korte omschrijving met eigen typografie-tokens.
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={classNames('dsn-card__description', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

// =============================================================================
// CardMeta — aanvullende gegevens, zoals een datum
// =============================================================================

export interface CardMetaProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Bijv. een `<time>`-element of een auteur */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardMeta sub-component
 * Aanvullende gegevens bij de card, zoals een datum.
 */
export const CardMeta = React.forwardRef<HTMLParagraphElement, CardMetaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={classNames('dsn-card__meta', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardMeta.displayName = 'CardMeta';

// =============================================================================
// CardFooter — voettekst
// =============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `CardAffordance`, of een `Link` / `ButtonLink` naar een andere bestemming */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardFooter sub-component
 * Staat altijd onderaan de card. Links en buttons staan boven de stretched
 * link en blijven zelfstandig klikbaar. Voor een visuele "Lees meer" naar
 * dezelfde bestemming als de card: gebruik `CardAffordance`.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('dsn-card__footer', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// =============================================================================
// CardAffordance — visuele hint zonder eigen interactie
// =============================================================================

export interface CardAffordanceProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Bijv. "Lees meer" */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardAffordance sub-component
 * Een `<span aria-hidden="true">` die eruitziet als een link. De stretched
 * link vangt de klik al af, dus er is geen tweede tabstop nodig.
 */
export const CardAffordance = React.forwardRef<
  HTMLSpanElement,
  CardAffordanceProps
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={classNames('dsn-card__affordance', className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  );
});

CardAffordance.displayName = 'CardAffordance';

// =============================================================================
// CardGroup — layout wrapper
// =============================================================================

export interface CardGroupProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Semantisch container-element.
   * Gebruik `div` wanneer cards geen lijst-context hebben.
   * @default 'ul'
   */
  as?: 'ul' | 'div';

  /** `Card` componenten */
  children?: React.ReactNode;

  className?: string;
}

/**
 * CardGroup sub-component
 * Flexbox wrapper die gelijke hoogte garandeert en de footer in elke card onderaan uitlijnt.
 * Rendert `role="list"` wanneer `as="ul"` — nodig omdat CSS-resets de lijstsemantiek verwijderen.
 */
export const CardGroup = React.forwardRef<HTMLElement, CardGroupProps>(
  ({ className, as: Tag = 'ul', children, ...props }, ref) => {
    const roleProps = Tag === 'ul' ? { role: 'list' as const } : {};

    return (
      <Tag
        ref={ref as React.Ref<HTMLUListElement & HTMLDivElement>}
        className={classNames('dsn-card-group', className)}
        {...roleProps}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

CardGroup.displayName = 'CardGroup';
