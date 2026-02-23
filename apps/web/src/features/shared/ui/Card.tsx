import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardPadding = 'sm' | 'md' | 'lg';
export type CardShadow  = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Inner padding preset. Defaults to 'md'. */
  padding?: CardPadding;
  /** Box-shadow preset. Defaults to 'sm'. */
  shadow?: CardShadow;
  /** Render a 1px border. Defaults to false. */
  border?: boolean;
}

export interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

const shadowStyles: Record<CardShadow, string> = {
  none: '',
  sm:   'shadow-sm',
  md:   'shadow-md',
  lg:   'shadow-lg',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['px-5 py-4 border-b border-gray-100', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

function CardBody({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['p-5', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root Card component
// ---------------------------------------------------------------------------

/**
 * Composable Card with optional sub-components: Card.Header, Card.Body, Card.Footer.
 * Server Component — no client-side state or event handlers.
 *
 * @example
 * <Card shadow="md" border>
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Actions</Card.Footer>
 * </Card>
 */
function Card({ children, className = '', padding = 'md', shadow = 'sm', border = false }: CardProps) {
  const classes = [
    'bg-white rounded-2xl overflow-hidden',
    shadowStyles[shadow],
    border ? 'border border-gray-200' : '',
    paddingStyles[padding],
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;

export default Card;
