import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from '@dsn/components-react';
import DocsPage from './Radio.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
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
        const inputAttrs = [
          args.checked && 'checked',
          args.disabled && 'disabled',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
        ]
          .filter(Boolean)
          .join(' ');
        return `<div class="dsn-radio">\n  <input type="radio" class="${inputCls}"${inputAttrs ? ' ' + inputAttrs : ''} />\n  <span class="dsn-radio__control" aria-hidden="true">\n    <span class="dsn-radio__inner-circle"></span>\n  </span>\n</div>`;
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Radio',
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {};

export const Checked: Story = {
  args: { checked: true, readOnly: true, name: 'r1', value: 'checked' },
};

export const Disabled: Story = {
  args: { disabled: true, name: 'r2', value: 'disabled' },
};

export const DisabledChecked: Story = {
  name: 'Disabled checked',
  args: {
    disabled: true,
    checked: true,
    readOnly: true,
    name: 'r3',
    value: 'disabled-checked',
  },
};

export const Invalid: Story = {
  args: { invalid: true, name: 'r4', value: 'invalid' },
};

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBlockEnd: '1rem' }}>Default states</h3>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Radio aria-label="Unchecked" name="demo-1" value="unchecked" />
            <span style={{ fontSize: '0.75rem' }}>Unchecked</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Radio
              checked
              aria-label="Checked"
              name="demo-1"
              value="checked"
              readOnly
            />
            <span style={{ fontSize: '0.75rem' }}>Checked</span>
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '1rem' }}>Disabled states</h3>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Radio
              disabled
              aria-label="Disabled unchecked"
              name="demo-2"
              value="1"
            />
            <span style={{ fontSize: '0.75rem' }}>Disabled</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Radio
              checked
              disabled
              aria-label="Disabled checked"
              name="demo-2"
              value="2"
              readOnly
            />
            <span style={{ fontSize: '0.75rem' }}>Disabled checked</span>
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '1rem' }}>Invalid state</h3>
        <Radio invalid aria-label="Invalid" name="demo-3" value="invalid" />
      </div>
    </div>
  ),
};

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Radio aria-label="Unchecked" name="rtl-1" value="a" />
      <Radio checked aria-label="Checked" name="rtl-1" value="b" readOnly />
      <Radio disabled aria-label="Disabled" name="rtl-1" value="c" />
    </div>
  ),
};
