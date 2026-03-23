import type { Meta, StoryObj } from '@storybook/react';
import { FormFieldErrorMessage } from '@dsn/components-react';
import DocsPage from './FormFieldErrorMessage.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormFieldErrorMessage> = {
  title: 'Components/FormFieldErrorMessage',
  component: FormFieldErrorMessage,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const showIcon = args.showIcon !== false;
        const idAttr = args.id ? ` id="${args.id}"` : '';
        const icon = showIcon ? '<!-- exclamation-circle icon -->\n  ' : '';
        return `<p class="dsn-form-field-error-message"${idAttr}>\n  ${icon}${args.children ?? 'Tekst'}\n</p>`;
      },
    },
  },
  argTypes: {
    showIcon: { control: 'boolean' },
    id: { control: 'text' },
  },
  args: {
    children: TEKST,
    showIcon: true,
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldErrorMessage>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithoutIcon: Story = {
  name: 'Without icon',
  args: { showIcon: false, children: TEKST },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FormFieldErrorMessage>{TEKST}</FormFieldErrorMessage>
      <FormFieldErrorMessage showIcon={false}>{TEKST}</FormFieldErrorMessage>
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
