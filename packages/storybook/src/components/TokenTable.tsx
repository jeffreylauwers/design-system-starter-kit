import React, { useEffect, useState, useCallback } from 'react';

// Extend Window interface for our custom property
declare global {
  interface Window {
    __lastDsnToken?: string;
  }
}

interface Token {
  name: string;
  cssVar: string;
  value?: string; // Optional - will be computed live if not provided
}

type PreviewType =
  | 'color'
  | 'spacing'
  | 'typography-size'
  | 'border-radius'
  | 'shadow'
  | 'transition-duration'
  | 'transition-easing'
  | 'none';

interface TokenTableProps {
  tokens: Token[];
  previewType?: PreviewType;
  showLiveValue?: boolean; // When true, shows the computed CSS value
}

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--dsn-color-neutral-border-subtle, #e0e0e0)',
  fontSize: '13px',
  fontFamily: 'var(--dsn-text-font-family-monospace, monospace)',
  verticalAlign: 'middle',
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
        background: 'var(--dsn-color-action-1-bg-default, #3366cc)',
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
        border: '2px solid var(--dsn-color-action-1-border-default, #3366cc)',
        background: 'var(--dsn-color-action-1-bg-default, #e8eef5)',
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
            background: 'var(--dsn-color-action-1-bg-default, #3366cc)',
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
            background: 'var(--dsn-color-action-1-bg-default, #3366cc)',
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
    case 'none':
      return null;
  }
}

/**
 * Hook to get the computed CSS value for a CSS variable.
 * Automatically updates when theme/mode/density changes in Storybook.
 */
function useComputedCssValue(cssVar: string): string {
  const [value, setValue] = useState<string>('');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const updateValue = useCallback(() => {
    if (typeof window === 'undefined') return;

    const computed = getComputedStyle(
      document.documentElement
    ).getPropertyValue(cssVar);
    setValue(computed.trim() || '(not defined)');
  }, [cssVar]);

  // Force re-computation when updateTrigger changes
  useEffect(() => {
    updateValue();
  }, [updateValue, updateTrigger]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial computation
    updateValue();

    // Function to trigger update with delay (to allow styles to be applied)
    const triggerUpdate = () => {
      // Use multiple delayed updates to catch async stylesheet loading
      requestAnimationFrame(() => {
        setUpdateTrigger((t) => t + 1);
      });
      // Also update after a short delay for slower stylesheet loads
      setTimeout(() => {
        setUpdateTrigger((t) => t + 1);
      }, 100);
      // And once more for safety
      setTimeout(() => {
        setUpdateTrigger((t) => t + 1);
      }, 300);
    };

    // Observe changes to document.head for new stylesheets
    const headObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check for added link elements (stylesheet changes)
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
              // Wait for stylesheet to load
              node.addEventListener('load', triggerUpdate);
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
      link.addEventListener('load', triggerUpdate);
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

export function TokenTable({
  tokens,
  previewType = 'none',
  showLiveValue = true,
}: TokenTableProps) {
  const showPreview = previewType !== 'none';

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: 32,
      }}
    >
      <thead>
        <tr>
          {showPreview && <th style={headerStyle}>Preview</th>}
          <th style={headerStyle}>CSS Variable</th>
          <th style={headerStyle}>{showLiveValue ? 'Live Value' : 'Value'}</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.cssVar}>
            {showPreview && (
              <td
                style={{
                  ...cellStyle,
                  width: previewType === 'shadow' ? 140 : 60,
                }}
              >
                <Preview type={previewType} cssVar={token.cssVar} />
              </td>
            )}
            <td style={cellStyle}>{token.cssVar}</td>
            <td
              style={{
                ...cellStyle,
                color: 'var(--dsn-color-neutral-color-subtle, #666)',
              }}
            >
              {showLiveValue ? (
                <LiveValue cssVar={token.cssVar} />
              ) : (
                token.value
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
