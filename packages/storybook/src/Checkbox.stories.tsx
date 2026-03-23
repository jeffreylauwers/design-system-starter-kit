import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@dsn/components-react';
import DocsPage from './Checkbox.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const inputCls = [
          'dsn-checkbox__input',
          args.invalid && 'dsn-checkbox__input--invalid',
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
        const iconComment = args.indeterminate
          ? '<!-- minus icon -->'
          : '<!-- check icon -->';
        return `<div class="dsn-checkbox">\n  <input type="checkbox" class="${inputCls}"${inputAttrs ? ' ' + inputAttrs : ''} />\n  <span class="dsn-checkbox__control" aria-hidden="true">\n    ${iconComment}\n  </span>\n</div>`;
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Checkbox',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Checked: Story = {
  args: { checked: true, readOnly: true, 'aria-label': 'Checked' },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, 'aria-label': 'Indeterminate' },
};

export const Disabled: Story = {
  args: { disabled: true, 'aria-label': 'Disabled' },
};

export const DisabledChecked: Story = {
  name: 'Disabled checked',
  args: {
    disabled: true,
    checked: true,
    readOnly: true,
    'aria-label': 'Disabled checked',
  },
};

export const Invalid: Story = {
  args: { invalid: true, 'aria-label': 'Invalid' },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

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
            <Checkbox aria-label="Unchecked" />
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
            <Checkbox checked aria-label="Checked" readOnly />
            <span style={{ fontSize: '0.75rem' }}>Checked</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Checkbox indeterminate aria-label="Indeterminate" />
            <span style={{ fontSize: '0.75rem' }}>Indeterminate</span>
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
            <Checkbox disabled aria-label="Disabled unchecked" />
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
            <Checkbox checked disabled aria-label="Disabled checked" readOnly />
            <span style={{ fontSize: '0.75rem' }}>Disabled checked</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Checkbox
              indeterminate
              disabled
              aria-label="Disabled indeterminate"
            />
            <span style={{ fontSize: '0.75rem' }}>Disabled indeterminate</span>
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '1rem' }}>Invalid state</h3>
        <Checkbox invalid aria-label="Invalid" />
      </div>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Checkbox aria-label="Unchecked" />
      <Checkbox checked aria-label="Checked" readOnly />
      <Checkbox disabled aria-label="Disabled" />
    </div>
  ),
};
