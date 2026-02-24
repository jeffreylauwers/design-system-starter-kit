import type { Meta, StoryObj } from '@storybook/react';
import {
  FormFieldset,
  CheckboxGroup,
  CheckboxOption,
  RadioGroup,
  RadioOption,
} from '@dsn/components-react';
import DocsPage from './FormFieldset.docs.mdx';
import {
  TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof FormFieldset> = {
  title: 'Components/FormFieldset',
  component: FormFieldset,
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
        const suffix = args.legendSuffix
          ? `<span class="dsn-form-field-label-suffix">${args.legendSuffix}</span>`
          : '';
        let html = `<fieldset class="${cls}">\n`;
        html += `  <legend class="dsn-form-field-label">${args.legend ?? 'Legenda'}${suffix}</legend>\n`;
        if (args.description)
          html += `  <p class="dsn-form-field-description">${args.description}</p>\n`;
        if (args.error)
          html += `  <p class="dsn-form-field-error-message"><!-- exclamation-circle icon -->${args.error}</p>\n`;
        html += `  <div class="dsn-checkbox-group">\n    <!-- CheckboxOption / RadioOption componenten -->\n  </div>\n`;
        if (args.status) {
          const variantCls =
            args.statusVariant && args.statusVariant !== 'default'
              ? ` dsn-form-field-status--${args.statusVariant}`
              : '';
          html += `  <p class="dsn-form-field-status${variantCls}">${args.status}</p>\n`;
        }
        html += `</fieldset>`;
        return html;
      },
    },
  },
  argTypes: {
    legend: { control: 'text' },
    legendSuffix: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    status: { control: 'text' },
    statusVariant: {
      control: 'select',
      options: ['default', 'positive', 'warning'],
    },
  },
  args: {
    legend: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldset>;

export const Default: Story = {
  render: (args) => (
    <FormFieldset {...args}>
      <CheckboxGroup>
        <CheckboxOption label={TEKST} value="1" />
        <CheckboxOption label={TEKST} value="2" />
        <CheckboxOption label={TEKST} value="3" />
      </CheckboxGroup>
    </FormFieldset>
  ),
};

export const WithDescription: Story = {
  name: 'With description',
  render: (args) => (
    <FormFieldset {...args} legend={TEKST} description={TEKST}>
      <CheckboxGroup>
        <CheckboxOption label={TEKST} value="1" />
        <CheckboxOption label={TEKST} value="2" />
        <CheckboxOption label={TEKST} value="3" />
      </CheckboxGroup>
    </FormFieldset>
  ),
};

export const WithError: Story = {
  name: 'With error (invalid)',
  render: (args) => (
    <FormFieldset {...args} legend={TEKST} error={TEKST}>
      <CheckboxGroup>
        <CheckboxOption label={TEKST} value="1" />
        <CheckboxOption label={TEKST} value="2" />
        <CheckboxOption label={TEKST} value="3" />
      </CheckboxGroup>
    </FormFieldset>
  ),
};

export const WithRadioGroup: Story = {
  name: 'With RadioGroup',
  render: (args) => (
    <FormFieldset {...args} legend={TEKST}>
      <RadioGroup>
        <RadioOption name="opts" label={TEKST} value="1" />
        <RadioOption name="opts" label={TEKST} value="2" />
        <RadioOption name="opts" label={TEKST} value="3" />
      </RadioGroup>
    </FormFieldset>
  ),
};

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Basic</h3>
        <FormFieldset legend={TEKST}>
          <CheckboxGroup>
            <CheckboxOption label={TEKST} value="1" />
            <CheckboxOption label={TEKST} value="2" />
          </CheckboxGroup>
        </FormFieldset>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With description</h3>
        <FormFieldset legend={TEKST} description={TEKST}>
          <CheckboxGroup>
            <CheckboxOption label={TEKST} value="1" />
            <CheckboxOption label={TEKST} value="2" />
          </CheckboxGroup>
        </FormFieldset>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With optional suffix</h3>
        <FormFieldset legend={TEKST} legendSuffix="(niet verplicht)">
          <CheckboxGroup>
            <CheckboxOption label={TEKST} value="1" />
            <CheckboxOption label={TEKST} value="2" />
          </CheckboxGroup>
        </FormFieldset>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With error</h3>
        <FormFieldset legend={TEKST} error={TEKST}>
          <CheckboxGroup>
            <CheckboxOption label={TEKST} value="1" />
            <CheckboxOption label={TEKST} value="2" />
          </CheckboxGroup>
        </FormFieldset>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>With status (positive)</h3>
        <FormFieldset legend={TEKST} status={TEKST} statusVariant="positive">
          <CheckboxGroup>
            <CheckboxOption label={TEKST} value="1" defaultChecked />
            <CheckboxOption label={TEKST} value="2" defaultChecked />
          </CheckboxGroup>
        </FormFieldset>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>RadioGroup</h3>
        <FormFieldset legend={TEKST} legendSuffix="(verplicht)">
          <RadioGroup>
            <RadioOption name="r1" label={TEKST} value="1" />
            <RadioOption name="r1" label={TEKST} value="2" />
            <RadioOption name="r1" label={TEKST} value="3" />
          </RadioGroup>
        </FormFieldset>
      </div>
    </div>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: (args) => (
    <FormFieldset {...args} legend={VEEL_TEKST} description={VEEL_TEKST}>
      <CheckboxGroup>
        <CheckboxOption label={VEEL_TEKST} value="1" />
        <CheckboxOption label={VEEL_TEKST} value="2" />
      </CheckboxGroup>
    </FormFieldset>
  ),
};

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: (args) => (
    <FormFieldset {...args} legend={TEKST_AR} description={TEKST_AR}>
      <CheckboxGroup>
        <CheckboxOption label={TEKST_AR} value="1" />
        <CheckboxOption label={TEKST_AR} value="2" />
        <CheckboxOption label={TEKST_AR} value="3" />
      </CheckboxGroup>
    </FormFieldset>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: (args) => (
    <FormFieldset
      {...args}
      legend={VEEL_TEKST_AR}
      description={VEEL_TEKST_AR}
      error={VEEL_TEKST_AR}
    >
      <CheckboxGroup>
        <CheckboxOption label={VEEL_TEKST_AR} value="1" />
        <CheckboxOption label={VEEL_TEKST_AR} value="2" />
      </CheckboxGroup>
    </FormFieldset>
  ),
};
