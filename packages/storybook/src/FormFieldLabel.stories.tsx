import type { Meta, StoryObj } from '@storybook/react';
import { FormFieldLabel } from '@dsn/components-react';
import DocsPage from './FormFieldLabel.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormFieldLabel> = {
  title: 'Components/FormFieldLabel',
  component: FormFieldLabel,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const forAttr = args.htmlFor ? ` for="${args.htmlFor}"` : '';
        const suffix = args.suffix
          ? `<span class="dsn-form-field-label-suffix">${args.suffix}</span>`
          : '';
        return `<label class="dsn-form-field-label"${forAttr}>${args.children ?? 'Label'}${suffix}</label>`;
      },
    },
  },
  argTypes: {
    suffix: { control: 'text' },
    htmlFor: { control: 'text' },
  },
  args: {
    children: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldLabel>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithOptionalSuffix: Story = {
  name: 'With optional suffix',
  args: { children: TEKST, suffix: '(niet verplicht)' },
};

export const WithRequiredSuffix: Story = {
  name: 'With required suffix',
  args: { children: TEKST, suffix: '(verplicht)' },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FormFieldLabel htmlFor="a">{TEKST}</FormFieldLabel>
      <FormFieldLabel htmlFor="b" suffix="(niet verplicht)">
        {TEKST}
      </FormFieldLabel>
      <FormFieldLabel htmlFor="c" suffix="(verplicht)">
        {TEKST}
      </FormFieldLabel>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { children: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { children: VEEL_TEKST },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { children: TEKST_AR },
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { children: VEEL_TEKST_AR },
};
