import { useState } from 'react';
import { formatColor } from '@dsn-starter-kit/theme-engine';
import type { SwatchData, DisplayFormat } from '../types';
import './ColorSwatch.css';

interface Props {
  data: SwatchData;
  label: string;
  format: DisplayFormat;
}

export function ColorSwatch({ data, label, format }: Props) {
  const [copied, setCopied] = useState(false);

  const displayValue = formatColor(data.oklch, format);

  function handleClick() {
    const doCopy = async () => {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(displayValue);
        return;
      }
      // Fallback for HTTP or denied permissions
      const el = document.createElement('textarea');
      el.value = displayValue;
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    };

    doCopy()
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Copy not available in this environment
      });
  }

  const showContrast = data.contrastVsBgDefault !== undefined;
  const pass = data.contrastPass;
  const isFallback = data.isFallback;

  const contrastLabel = showContrast
    ? ` — contrast: ${data.contrastVsBgDefault?.toFixed(2)}:1${isFallback ? ' (zelfde als color-default; subtle-variant haalt 4.5:1 niet zelfstandig)' : ''}`
    : '';

  return (
    <button
      className="color-swatch"
      style={{ backgroundColor: data.hex }}
      onClick={handleClick}
      aria-label={`${label} — ${displayValue}${contrastLabel}${copied ? ', gekopieerd' : ''}`}
    >
      <span className="color-swatch__tooltip" aria-hidden="true">
        {displayValue}
      </span>
      {showContrast && !isFallback && (
        <span
          className={`color-swatch__badge ${pass ? 'color-swatch__badge--pass' : 'color-swatch__badge--fail'}`}
          aria-hidden="true"
        >
          {pass ? '✓' : '✗'}
        </span>
      )}
      {isFallback && (
        <span
          className="color-swatch__badge color-swatch__badge--fallback"
          aria-hidden="true"
        >
          ≈
        </span>
      )}
      {copied && (
        <span className="color-swatch__copied" aria-hidden="true">
          Gekopieerd
        </span>
      )}
    </button>
  );
}
