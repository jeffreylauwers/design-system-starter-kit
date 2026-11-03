import type { Decorator } from '@storybook/react';

// =============================================================================
// CANONICAL TEKSTEN
// =============================================================================

export const TEKST = 'Tekst';
export const WEINIG_TEKST = 'A';
export const VEEL_TEKST =
  'Dit is een tekst om te laten zien hoe dit component zich gedraagt bij veel tekst. ' +
  'Daardoor kunnen we zien wat er gebeurt als tekst over meerdere regels loopt.';

// Arabisch (voor RTL stories)
export const TEKST_AR = 'نص';
export const WEINIG_TEKST_AR = 'أ';
export const VEEL_TEKST_AR =
  'هذا نص لإظهار كيف يتصرف هذا المكون عند وجود نص كثير. ' +
  'وبذلك يمكننا رؤية ما يحدث عندما ينتقل النص إلى أسطر متعددة.';

// =============================================================================
// DECORATORS
// =============================================================================

/**
 * Simuleert right-to-left tekstrichting (bijv. Arabisch).
 * Voeg toe aan een story via: decorators: [rtlDecorator]
 */
export const rtlDecorator: Decorator = (Story) => (
  <div dir="rtl" lang="ar" style={{ textAlign: 'start' }}>
    <Story />
  </div>
);
