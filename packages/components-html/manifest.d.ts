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
 * manifest.json is generated from one src/<dir>/<name>.manifest.json file per
 * component by scripts/build-manifest.js. Edit those files, not manifest.json.
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
  type?: 'string' | 'boolean' | 'number' | 'ReactNode' | 'function' | 'object';
  /** Default value. Null means the prop is optional with no default behaviour. */
  default?: string | number | boolean | null;
  /** Whether the prop is required. Omitting means optional. */
  required?: boolean;
}

/**
 * How a part of the API appears in the generated Figma component set.
 *
 * - `variant`: an axis of the component set (`property` names the axis), or
 *   one value of it (`value`)
 * - `boolean`, `text`, `instance-swap`: a component property
 * - `slot`: a Figma slot, `data-figma-children` in the matrix
 * - `none`: deliberately not in Figma; `reason` says why
 */
export type FigmaBindingKind =
  'variant' | 'boolean' | 'text' | 'instance-swap' | 'slot' | 'none';

export interface FigmaBinding {
  kind: FigmaBindingKind;
  /** Axis, component property or slot name in the Figma matrix. Absent for `none`. */
  property?: string;
  /**
   * Variant bindings of props and states: the one value on the axis this part
   * stands for (`checked` on Checkbox's `state` axis). Without it, a prop owns
   * the whole axis.
   */
  value?: string;
  /**
   * A component property of a nested, exposed instance rather than of this
   * set: the name of that component (the label of CheckboxOption lives on
   * its OptionLabel).
   */
  instance?: string;
  /**
   * An enum prop without a default: the axis value that stands for the prop
   * not being set (`auto` on the `inlineSize` axis of TextInput). It comes
   * first on the axis.
   */
  unset?: string;
  /**
   * A binding that owns a whole axis: the axis values in Figma when they
   * differ from what the prop implies. Another spelling (`16-9` for `16:9`),
   * a subset of an enum, or labels for `false` and `true` of a boolean
   * (`with-border`, `no-border` for `noBorder`), or for present and absent.
   */
  values?: string[];
  /**
   * Something about this binding is not known yet: why the part is not in
   * Figma (`none`), or what is missing from it (a subset of an enum). The
   * `reason` says what. The script `report:figma-open` lists every open
   * binding.
   */
  open?: boolean;
  /** Required for `none`; otherwise an optional explanation. */
  reason?: string;
}

export interface ApiProp extends PropDefinition {
  /**
   * Inherited from the element's React attributes (`disabled`, `checked`,
   * `children`) rather than declared on the component's own props interface
   * or on that of a component it extends.
   */
  native?: boolean;
  /** Slots this prop fills. Such a prop takes its Figma binding from the slot. */
  slots?: string[];
  /** Present on every prop that does not fill a slot. */
  figma?: FigmaBinding[];
}

export interface ApiSlot {
  /** kebab-case, equal to `data-figma-slot` in the Figma matrix. */
  name: string;
  /** Class of the element that forms the slot. */
  element?: string;
  description?: string;
  figma: FigmaBinding[];
}

export interface ApiState {
  /** kebab-case state name, e.g. `focus-visible`. */
  name: string;
  /** The pseudo-class that triggers it, e.g. `:focus-visible`. */
  selector: string;
  figma: FigmaBinding[];
}

/**
 * The complete public API of a component. Optional while the manifest is being
 * completed; where present, tests check it against the React props type and
 * the Figma matrix of the component.
 */
export interface ComponentApi {
  /** Every prop except `className`, which every component has. */
  props: ApiProp[];
  slots: ApiSlot[];
  states: ApiState[];
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
   * Not exhaustive: `api.props` holds the complete list where it exists, the
   * component's .docs.md otherwise.
   */
  primaryProps: PropDefinition[];
  /** The complete API, with Figma bindings. Not every component has it yet. */
  api?: ComponentApi;
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
