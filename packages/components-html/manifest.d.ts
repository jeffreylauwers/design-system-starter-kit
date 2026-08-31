/**
 * Type definitions for manifest.json
 *
 * The manifest describes every design system component at the conceptual level,
 * independent of framework. The HTML/CSS layer is the source of truth; React and
 * Web Components are wrappers on top.
 *
 * Import the manifest at runtime, and its types from the same path:
 *   import manifest from '@dsn-starter-kit/components-html/manifest';
 *   import type { Platform } from '@dsn-starter-kit/components-html/manifest';
 *
 * The "./manifest" entry in the exports map points its "types" condition at this
 * file and its "default" condition at manifest.json, so TypeScript reads the
 * declarations below while bundlers and Node load the JSON.
 *
 * Or read it with any JSON-capable tool: it requires no build step.
 *
 * manifest-schema.json describes the same structure as JSON Schema, for editors
 * and for the validation step in the build. Keep both in sync when the shape of
 * the manifest changes.
 */

export type Platform = 'html-css' | 'react' | 'web-components';

export type Category =
  | 'layout'
  | 'section'
  | 'content'
  | 'display-feedback'
  | 'branding'
  | 'accessibility'
  | 'navigation'
  | 'form-input'
  | 'form-option'
  | 'form-field';

export interface PropDefinition {
  /** Prop name as used in HTML (modifier suffix) or React (camelCase). */
  name: string;
  /** Allowed string or number values for enum-style props. */
  values?: (string | number)[];
  /** Type for non-enum props. */
  type?: 'string' | 'boolean' | 'number' | 'ReactNode';
  /** Default value. Null means the prop is optional with no default behaviour. */
  default?: string | number | boolean | null;
  /** Whether the prop is required. Omitting means optional. */
  required?: boolean;
}

export interface ComponentEntry {
  /** PascalCase component name matching the React export and the Storybook title. */
  name: string;
  /**
   * Primary CSS block class (BEM block), e.g. "dsn-button".
   * Components that share a CSS block (e.g. ButtonLink reuses "dsn-button")
   * are noted here; their distinction is semantic, not visual.
   */
  cssBlock: string;
  /** Functional category for grouping and filtering. */
  category: Category;
  /** One-sentence English description of the component's purpose. */
  purpose: string;
  /** Which platform implementations exist for this component. */
  platforms: Platform[];
  /**
   * The most important props an implementer needs to know about.
   * Not exhaustive — see the component's .docs.md for the full props table.
   */
  primaryProps: PropDefinition[];
}

export interface Manifest {
  $schema: string;
  version: string;
  description: string;
  components: ComponentEntry[];
}

/**
 * The parsed contents of manifest.json.
 *
 * This declaration is what makes `./manifest` usable from TypeScript: the
 * exports map points the `types` condition at this file, so the default import
 * is typed as `Manifest` instead of the wide types TypeScript would infer from
 * the JSON literal (`string[]` instead of `Platform[]`, and so on).
 */
declare const manifest: Manifest;

export default manifest;
