import type { Meta, StoryObj } from '@storybook/react';
import { RadioOption } from '@dsn/components-react';
import DocsPage from './RadioOption.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof RadioOption> = {
  title: 'Components/RadioOption',
  component: RadioOption,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const inputCls = [
          'dsn-radio__input',
          args.invalid && 'dsn-radio__input--invalid',
        ]
          .filter(Boolean)
          .join(' ');
        const nameAttr = args.name ? ` name="${args.name}"` : '';
        const inputAttrs = [
          args.checked && 'checked',
          args.disabled && 'disabled',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
        ]
          .filter(Boolean)
          .join(' ');
        const labelCls = [
          'dsn-option-label',
          args.disabled && 'dsn-option-label--disabled',
        ]
          .filter(Boolean)
          .join(' ');
        return `<label class="dsn-radio-option">\n  <div class="dsn-radio">\n    <input type="radio" class="${inputCls}"${nameAttr}${inputAttrs ? ' ' + inputAttrs : ''} />\n    <span class="dsn-radio__control" aria-hidden="true">\n      <span class="dsn-radio__inner-circle"></span>\n    </span>\n  </div>\n  <span class="${labelCls}">${args.label ?? 'Tekst'}</span>\n</label>`;
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    label: TEKST,
    name: 'demo',
  },
};

export default meta;
type Story = StoryObj<typeof RadioOption>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Checked: Story = {
  args: { checked: true, readOnly: true, label: TEKST },
};

export const Disabled: Story = {
  args: { disabled: true, label: TEKST },
};

export const DisabledChecked: Story = {
  name: 'Disabled checked',
  args: { disabled: true, checked: true, readOnly: true, label: TEKST },
};

export const Invalid: Story = {
  args: { invalid: true, label: TEKST },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Default states</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <RadioOption label={TEKST} name="demo-1" value="unchecked" />
          <RadioOption
            checked
            label={TEKST}
            name="demo-1"
            value="checked"
            readOnly
          />
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Disabled states</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <RadioOption
            disabled
            label={TEKST}
            name="demo-2"
            value="disabled-unchecked"
          />
          <RadioOption
            checked
            disabled
            label={TEKST}
            name="demo-2"
            value="disabled-checked"
            readOnly
          />
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem' }}>Invalid state</h3>
        <RadioOption invalid label={TEKST} name="demo-3" value="invalid" />
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { label: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { label: VEEL_TEKST },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RadioOption label={TEKST_AR} name="rtl-1" value="a" />
      <RadioOption checked label={TEKST_AR} name="rtl-1" value="b" readOnly />
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { label: VEEL_TEKST_AR },
};
