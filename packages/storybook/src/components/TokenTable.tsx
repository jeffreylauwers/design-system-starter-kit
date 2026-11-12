import React, { useEffect, useState, useCallback } from 'react';
import tokenDocs from '@dsn-starter-kit/design-tokens/token-docs.json';
import {
  selectTokens,
  type TokenDoc,
  type TokenSelection,
} from './tokenSelection';

// Extend Window interface for our custom property
declare global {
  interface Window {
    __lastDsnToken?: string;
  }
}

type PreviewType =
  | 'color'
  | 'spacing'
  | 'typography-size'
  | 'border-radius'
  | 'shadow'
  | 'transition-duration'
  | 'transition-easing'
  /** Kleurvlak voor kleurtokens, geen preview voor de rest. */
  | 'auto'
  | 'none';

interface TokenTableProps extends TokenSelection {
  previewType?: PreviewType;
}

const allTokens: TokenDoc[] = tokenDocs.tokens;

function isColor(name: string): boolean {
  return /^--dsn-color-|-color$/.test(name);
}

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--dsn-color-neutral-border-subtle, #e0e0e0)',
  fontSize: '13px',
  fontFamily: 'var(--dsn-text-font-family-monospace, monospace)',
  verticalAlign: 'middle',
};

const descriptionStyle: React.CSSProperties = {
  ...cellStyle,
  minWidth: 240,
  fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
  fontSize: '14px',
};

const headerStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 600,
  fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
  textAlign: 'left',
  color: 'var(--dsn-color-neutral-color-subtle, #666)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function ColorPreview({ cssVar }: { cssVar: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        background: `var(${cssVar})`,
        border: '1px solid var(--dsn-color-neutral-border-subtle, #e0e0e0)',
      }}
    />
  );
}

function SpacingPreview({ cssVar }: { cssVar: string }) {
  return (
    <div
      style={{
        width: `var(${cssVar})`,
        height: 16,
        minWidth: 2,
        maxWidth: 200,
        borderRadius: 2,
        background: 'var(--dsn-color-accent-1-inverse-bg-default, #3366cc)',
      }}
    />
  );
}

function TypographySizePreview({ cssVar }: { cssVar: string }) {
  return (
    <span
      style={{
        fontSize: `var(${cssVar})`,
        lineHeight: 1.2,
        color: 'var(--dsn-color-neutral-color-document, #1b1b1b)',
      }}
    >
      Aa
    </span>
  );
}

function BorderRadiusPreview({ cssVar }: { cssVar: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: `var(${cssVar})`,
        background: 'var(--dsn-color-accent-1-inverse-bg-default, #3366cc)',
      }}
    />
  );
}

function ShadowPreview({ cssVar }: { cssVar: string }) {
  return (
    <div
      style={{
        padding: '6px 8px',
        background: 'var(--dsn-color-neutral-bg-document, #fcfcfc)',
        borderRadius: 6,
        boxShadow: `var(${cssVar})`,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
          color: 'var(--dsn-color-neutral-color-subtle, #666)',
          whiteSpace: 'nowrap',
        }}
      >
        {cssVar.replace('--dsn-box-shadow-', '')}
      </span>
    </div>
  );
}

function TransitionDurationPreview({ cssVar }: { cssVar: string }) {
  return (
    <>
      <style>{`
        @keyframes dsn-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(260%); }
        }
      `}</style>
      <div
        style={{
          width: 100,
          height: 12,
          borderRadius: 6,
          background: 'var(--dsn-color-neutral-border-subtle, #e0e0e0)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '30%',
            height: '100%',
            background: 'var(--dsn-color-accent-1-inverse-bg-default, #3366cc)',
            borderRadius: 6,
            animationName: 'dsn-sweep',
            animationDuration: `var(${cssVar}, 200ms)`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      </div>
    </>
  );
}

function TransitionEasingPreview({ cssVar }: { cssVar: string }) {
  return (
    <>
      <style>{`
        @keyframes dsn-easing-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(84px); }
        }
      `}</style>
      <div
        style={{
          width: 100,
          height: 16,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 8,
            right: 8,
            height: 2,
            background: 'var(--dsn-color-neutral-border-subtle, #e0e0e0)',
            transform: 'translateY(-50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--dsn-color-accent-1-inverse-bg-default, #3366cc)',
            top: 0,
            left: 0,
            animationName: 'dsn-easing-move',
            animationDuration: '1200ms',
            animationTimingFunction: `var(${cssVar})`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
          }}
        />
      </div>
    </>
  );
}

function Preview({ type, cssVar }: { type: PreviewType; cssVar: string }) {
  switch (type) {
    case 'color':
      return <ColorPreview cssVar={cssVar} />;
    case 'spacing':
      return <SpacingPreview cssVar={cssVar} />;
    case 'typography-size':
      return <TypographySizePreview cssVar={cssVar} />;
    case 'border-radius':
      return <BorderRadiusPreview cssVar={cssVar} />;
    case 'shadow':
      return <ShadowPreview cssVar={cssVar} />;
    case 'transition-duration':
      return <TransitionDurationPreview cssVar={cssVar} />;
    case 'transition-easing':
      return <TransitionEasingPreview cssVar={cssVar} />;
    case 'auto':
      return isColor(cssVar) ? <ColorPreview cssVar={cssVar} /> : null;
    case 'none':
      return null;
  }
}

/**
 * Hook to get the computed CSS value for a CSS variable.
 * Automatically updates when theme/mode/density changes in Storybook.
 */
function readCssValue(cssVar: string): string {
  if (typeof window === 'undefined') return '';

  const computed = getComputedStyle(document.documentElement).getPropertyValue(
    cssVar
  );
  return computed.trim() || '(not defined)';
}

function useComputedCssValue(cssVar: string): string {
  const [value, setValue] = useState<string>(() => readCssValue(cssVar));

  const updateValue = useCallback(() => {
    setValue(readCssValue(cssVar));
  }, [cssVar]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Herbereken na de eerste paint, en opnieuw zodra cssVar verandert.
    const initialFrame = requestAnimationFrame(updateValue);

    // Alle listeners en timers worden bij unmount opgeruimd
    const listeners = new AbortController();
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (delay: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        updateValue();
      }, delay);
      timeouts.add(id);
    };

    // Function to trigger update with delay (to allow styles to be applied)
    const triggerUpdate = () => {
      // Use multiple delayed updates to catch async stylesheet loading
      schedule(0);
      // Also update after a short delay for slower stylesheet loads
      schedule(100);
      // And once more for safety
      schedule(300);
    };

    // Observe changes to document.head for new stylesheets
    const headObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check for added link elements (stylesheet changes)
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
              // Wait for stylesheet to load
              node.addEventListener('load', triggerUpdate, {
                signal: listeners.signal,
              });
              // Also trigger immediately in case it's cached
              triggerUpdate();
            }
            // Also check for style elements
            if (node instanceof HTMLStyleElement) {
              triggerUpdate();
            }
          });
          // Handle removed stylesheets
          if (mutation.removedNodes.length > 0) {
            triggerUpdate();
          }
        }
        // Check for attribute changes on existing elements
        if (mutation.type === 'attributes') {
          triggerUpdate();
        }
      }
    });

    headObserver.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'data-dsn-theme-css'],
    });

    // Observe class changes on body (theme class changes)
    const bodyObserver = new MutationObserver(triggerUpdate);
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also observe class changes on document.documentElement (html element)
    const htmlObserver = new MutationObserver(triggerUpdate);
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-mode'],
    });

    // Listen for existing stylesheet load events (in case they haven't loaded yet)
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      link.addEventListener('load', triggerUpdate, {
        signal: listeners.signal,
      });
    });

    // Also listen for Storybook globals change event (custom event)
    const handleStorybookUpdate = () => triggerUpdate();
    window.addEventListener('storybook-globals-updated', handleStorybookUpdate);

    // Poll for changes as fallback (useful for docs-only pages where decorator doesn't run)
    // Check both the data attribute AND the actual CSS value to catch all changes
    const pollInterval = setInterval(() => {
      // Method 1: Check if data-dsn-tokens attribute changed
      const currentToken = document
        .querySelector('[data-dsn-tokens]')
        ?.getAttribute('data-dsn-tokens');
      if (currentToken && currentToken !== window.__lastDsnToken) {
        window.__lastDsnToken = currentToken;
        triggerUpdate();
        return;
      }

      // Method 2: Poll the actual CSS value to detect changes
      // This catches cases where tokens load but data attribute isn't set yet
      const currentValue = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();

      if (currentValue && currentValue !== window.__lastDsnToken) {
        window.__lastDsnToken = currentValue;
        triggerUpdate();
      }
    }, 500);

    return () => {
      cancelAnimationFrame(initialFrame);
      listeners.abort();
      timeouts.forEach(clearTimeout);
      headObserver.disconnect();
      bodyObserver.disconnect();
      htmlObserver.disconnect();
      clearInterval(pollInterval);
      window.removeEventListener(
        'storybook-globals-updated',
        handleStorybookUpdate
      );
    };
  }, [cssVar, updateValue]);

  return value;
}

function LiveValue({ cssVar }: { cssVar: string }) {
  const value = useComputedCssValue(cssVar);
  return <>{value}</>;
}

/**
 * Tabel met design tokens: preview, naam, description en de live waarde.
 *
 * Namen en descriptions komen uit `token-docs.json`, dat de token-build
 * schrijft. Je kiest tokens met `prefix` (en `exclude`) of met losse
 * `tokens`, nooit door ze over te typen:
 *
 *   <TokenTable prefix="--dsn-color-neutral-" exclude="--dsn-color-neutral-inverse-" previewType="color" />
 *   <TokenTable tokens="--dsn-text-font-family-default --dsn-heading-font-family" />
 *
 * De live waarde leest de custom property uit de pagina, dus die volgt het
 * thema, de mode en de density uit de toolbar.
 */
export function TokenTable({
  previewType = 'none',
  ...selection
}: TokenTableProps) {
  const tokens = selectTokens(allTokens, selection);
  const showPreview = previewType !== 'none';

  return (
    <div style={{ overflowX: 'auto', marginBottom: 32 }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {showPreview && <th style={headerStyle}>Preview</th>}
            <th style={headerStyle}>Token</th>
            <th style={headerStyle}>Beschrijving</th>
            <th style={headerStyle}>Live waarde</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.name}>
              {showPreview && (
                <td
                  style={{
                    ...cellStyle,
                    width: previewType === 'shadow' ? 140 : 60,
                  }}
                >
                  <Preview type={previewType} cssVar={token.name} />
                </td>
              )}
              <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                {token.name}
              </td>
              <td style={descriptionStyle}>
                {token.description ?? '⚠️ Onbekend token'}
              </td>
              <td
                style={{
                  ...cellStyle,
                  color: 'var(--dsn-color-neutral-color-subtle, #666)',
                }}
              >
                <LiveValue cssVar={token.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
