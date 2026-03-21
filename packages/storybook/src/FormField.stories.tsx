import type { Meta, StoryObj } from '@storybook/react';
import { FormField, TextInput, TextArea } from '@dsn/components-react';
import DocsPage from './FormField.docs.mdx';
import {
  TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = ['dsn-form-field', args.error && 'dsn-form-field--invalid']
          .filter(Boolean)
          .join(' ');
        const forAttr = args.htmlFor ? ` for="${args.htmlFor}"` : '';
        const suffix = args.labelSuffix
          ? `<span class="dsn-form-field-label-suffix">${args.labelSuffix}</span>`
          : '';
        let html = `<div class="${cls}">\n`;
        html += `  <label class="dsn-form-field-label"${forAttr}>${args.label ?? 'Label'}${suffix}</label>\n`;
        if (args.description)
          html += `  <p class="dsn-form-field-description">${args.description}</p>\n`;
        if (args.error)
          html += `  <p class="dsn-form-field-error-message"><!-- exclamation-circle icon -->${args.error}</p>\n`;
        html += `  <input type="text" class="dsn-text-input"${args.htmlFor ? ` id="${args.htmlFor}"` : ''} />\n`;
        if (args.status) {
          const variantCls =
            args.statusVariant && args.statusVariant !== 'default'
              ? ` dsn-form-field-status--${args.statusVariant}`
              : '';
          html += `  <p class="dsn-form-field-status${variantCls}">${args.status}</p>\n`;
        }
        html += `</div>`;
        return html;
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    labelSuffix: { control: 'text' },
    htmlFor: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    status: { control: 'text' },
    statusVariant: {
      control: 'select',
      options: ['default', 'positive', 'warning'],
    },
  },
  args: {
    label: TEKST,
    htmlFor: 'demo-field',
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: TEKST,
    htmlFor: 'input-1',
  },
  render: (args) => (
    <FormField {...args}>
      <TextInput id="input-1" />
    </FormField>
  ),
};

export const WithDescription: Story = {
  name: 'With description',
  render: (args) => (
    <FormField {...args} label={TEKST} htmlFor="input-desc" description={TEKST}>
      <TextInput id="input-desc" />
    </FormField>
  ),
};

export const WithError: Story = {
  name: 'With error',
  render: (args) => (
    <FormField {...args} label={TEKST} htmlFor="input-err" error={TEKST}>
      <TextInput id="input-err" invalid />
    </FormField>
  ),
};

export const WithStatus: Story = {
  name: 'With status',
  render: (args) => (
    <FormField {...args} label={TEKST} htmlFor="input-status" status={TEKST}>
      <TextInput id="input-status" />
    </FormField>
  ),
};

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Basic</h3>
        <FormField label={TEKST} htmlFor="s1">
          <TextInput id="s1" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With description</h3>
        <FormField label={TEKST} htmlFor="s2" description={TEKST}>
          <TextInput id="s2" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With optional suffix</h3>
        <FormField label={TEKST} htmlFor="s3" labelSuffix="(niet verplicht)">
          <TextInput id="s3" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With error</h3>
        <FormField label={TEKST} htmlFor="s4" error={TEKST}>
          <TextInput id="s4" invalid />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With status (positive)</h3>
        <FormField
          label={TEKST}
          htmlFor="s5"
          status={TEKST}
          statusVariant="positive"
        >
          <TextInput id="s5" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With status (warning)</h3>
        <FormField
          label={TEKST}
          htmlFor="s6"
          status={TEKST}
          statusVariant="warning"
        >
          <TextInput id="s6" />
        </FormField>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With TextArea</h3>
        <FormField label={TEKST} htmlFor="s7" description={TEKST}>
          <TextArea id="s7" rows={4} />
        </FormField>
      </div>
    </div>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: (args) => (
    <FormField
      {...args}
      label={VEEL_TEKST}
      htmlFor="lt-1"
      description={VEEL_TEKST}
    >
      <TextInput id="lt-1" defaultValue={VEEL_TEKST} />
    </FormField>
  ),
};

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: (args) => (
    <FormField
      {...args}
      label={TEKST_AR}
      htmlFor="rtl-1"
      description={TEKST_AR}
    >
      <TextInput id="rtl-1" defaultValue={TEKST_AR} />
    </FormField>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: (args) => (
    <FormField
      {...args}
      label={VEEL_TEKST_AR}
      htmlFor="rtl-2"
      description={VEEL_TEKST_AR}
      error={VEEL_TEKST_AR}
    >
      <TextInput id="rtl-2" defaultValue={VEEL_TEKST_AR} invalid />
    </FormField>
  ),
};
