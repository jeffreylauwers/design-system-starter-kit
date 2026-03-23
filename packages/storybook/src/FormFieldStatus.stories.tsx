import type { Meta, StoryObj } from '@storybook/react';
import { FormFieldStatus } from '@dsn/components-react';
import DocsPage from './FormFieldStatus.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormFieldStatus> = {
  title: 'Components/FormFieldStatus',
  component: FormFieldStatus,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const variant = args.variant ?? 'default';
        const cls = [
          'dsn-form-field-status',
          variant !== 'default' && `dsn-form-field-status--${variant}`,
        ]
          .filter(Boolean)
          .join(' ');
        const showIcon = args.showIcon !== false && variant !== 'default';
        const iconName =
          variant === 'positive'
            ? 'check'
            : variant === 'warning'
              ? 'alert-triangle'
              : null;
        const idAttr = args.id ? ` id="${args.id}"` : '';
        const icon =
          showIcon && iconName ? `<!-- ${iconName} icon -->\n  ` : '';
        return `<p class="${cls}"${idAttr}>\n  ${icon}${args.children ?? 'Tekst'}\n</p>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'positive', 'warning'],
    },
    showIcon: { control: 'boolean' },
    id: { control: 'text' },
  },
  args: {
    children: TEKST,
    variant: 'default',
    showIcon: true,
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldStatus>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Positive: Story = {
  args: { variant: 'positive', children: TEKST },
};

export const Warning: Story = {
  args: { variant: 'warning', children: TEKST },
};

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
      <FormFieldStatus variant="default">{TEKST}</FormFieldStatus>
      <FormFieldStatus variant="positive">{TEKST}</FormFieldStatus>
      <FormFieldStatus variant="warning">{TEKST}</FormFieldStatus>
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
