import type { Meta, StoryObj } from '@storybook/react';
import { EmailInput } from '@dsn/components-react';
import DocsPage from './EmailInput.docs.mdx';
import {
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof EmailInput> = {
  title: 'Components/EmailInput',
  component: EmailInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-text-input',
          args.width && `dsn-text-input--width-${args.width}`,
        ]
          .filter(Boolean)
          .join(' ');
        const attrs = [
          args.disabled && 'disabled',
          args.readOnly && 'readonly',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
          args.placeholder && `placeholder="${args.placeholder}"`,
        ]
          .filter(Boolean)
          .join(' ');
        return `<input type="email" inputmode="email" class="${cls}" autocomplete="email"${attrs ? ' ' + attrs : ''} />`;
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    width: {
      control: 'select',
      options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
  },
  args: {
    disabled: false,
    readOnly: false,
    invalid: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof EmailInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithValue: Story = {
  name: 'With value',
  args: { defaultValue: 'jan@voorbeeld.nl' },
};

export const WithPlaceholder: Story = {
  name: 'With placeholder',
  args: { placeholder: 'naam@voorbeeld.nl' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'jan@voorbeeld.nl' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: 'jan@voorbeeld.nl' },
};

export const Invalid: Story = {
  args: { invalid: true, value: 'geen-geldig-email' },
};

export const Widths: Story = {
  name: 'Width variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((w) => (
        <div key={w}>
          <p
            style={{
              margin: '0 0 0.25rem',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}
          >
            {w}
          </p>
          <EmailInput width={w} />
        </div>
      ))}
    </div>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px',
      }}
    >
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Default
        </label>
        <EmailInput />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          With value
        </label>
        <EmailInput defaultValue="jan@voorbeeld.nl" />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Disabled
        </label>
        <EmailInput disabled value="jan@voorbeeld.nl" />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Read-only
        </label>
        <EmailInput readOnly value="jan@voorbeeld.nl" />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          Invalid
        </label>
        <EmailInput invalid value="geen-geldig-email" />
      </div>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: { defaultValue: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { defaultValue: VEEL_TEKST },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  args: { defaultValue: TEKST_AR },
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  args: { defaultValue: VEEL_TEKST_AR },
};

// =============================================================================
// HIGH CONTRAST
// =============================================================================
