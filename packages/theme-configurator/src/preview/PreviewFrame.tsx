import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

const DOCUMENT =
  '<!doctype html><html lang="nl"><head></head><body></body></html>';

export interface PreviewFrameProps {
  /** Accessible name of the iframe. */
  title: string;
  /** Style sheets the frame's document links, before its own styles. */
  links?: { id: string; href: string }[];
  /** Style sheets for the frame's document, in cascade order. */
  styles: { id: string; css: string }[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * A same-origin iframe whose content React renders through portals. The
 * frame has its own document: its own `:root` for the tokens, and its own
 * viewport for the media queries of the components. Nothing set inside it
 * reaches the configurator around it, and the other way round.
 */
export function PreviewFrame({
  title,
  links = [],
  styles,
  className,
  style,
  children,
}: PreviewFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    // srcdoc gives a standards-mode document once it has loaded. Until then
    // (and in environments without srcdoc) the initial about:blank document
    // is used; the load event swaps it for the real one.
    const update = () => {
      const doc = iframe.contentDocument;
      if (doc?.body) setFrameDocument(doc);
    };
    iframe.addEventListener('load', update);
    update();
    return () => iframe.removeEventListener('load', update);
  }, []);

  return (
    <>
      <iframe
        ref={ref}
        title={title}
        srcDoc={DOCUMENT}
        className={className}
        style={style}
      />
      {frameDocument &&
        createPortal(
          <>
            {links.map(({ id, href }) => (
              <link
                key={id}
                rel="stylesheet"
                href={href}
                data-preview-style={id}
              />
            ))}
            {styles.map(({ id, css }) => (
              <style key={id} data-preview-style={id}>
                {css}
              </style>
            ))}
          </>,
          frameDocument.head
        )}
      {frameDocument && createPortal(children, frameDocument.body)}
    </>
  );
}
