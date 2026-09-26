import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordInput } from '@dsn-starter-kit/components-react';
import DocsPage from './PasswordInput.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-text-input',
          args.inlineSize && `dsn-text-input--inline-size-${args.inlineSize}`,
        ]
          .filter(Boolean)
          .join(' ');
        const autocomplete = args.passwordAutocomplete ?? 'current-password';
        const attrs = [
          args.disabled && 'disabled',
          args.readOnly && 'readonly',
          args.required && 'required',
          args.invalid && 'aria-invalid="true"',
          args.placeholder && `placeholder="${args.placeholder}"`,
        ]
          .filter(Boolean)
          .join(' ');
        return `<input type="password" class="${cls}" autocomplete="${autocomplete}"${attrs ? ' ' + attrs : ''} />`;
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    passwordAutocomplete: {
      control: 'select',
      options: ['current-password', 'new-password', 'off'],
    },
    inlineSize: {
      control: 'select',
      options: [undefined, 'md', 'lg', 'xl', 'full'],
    },
  },
  args: {
    disabled: false,
    readOnly: false,
    invalid: false,
    required: false,
    passwordAutocomplete: 'current-password',
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const NewPassword: Story = {
  name: 'New password (registratie)',
  args: {
    passwordAutocomplete: 'new-password',
  },
};

export const WithPlaceholder: Story = {
  name: 'With placeholder',
  args: { placeholder: 'Wachtwoord' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'geheim123' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { readOnly: true, value: 'geheim123' },
};

export const Invalid: Story = {
  args: { invalid: true, value: 'te kort' },
};

export const InlineSizes: Story = {
  name: 'Inline-size variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['md', 'lg', 'xl', 'full'] as const).map((w) => (
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
          <PasswordInput inlineSize={w} />
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
        <PasswordInput />
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
        <PasswordInput defaultValue="geheim123" />
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
        <PasswordInput disabled value="geheim123" />
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
        <PasswordInput readOnly value="geheim123" />
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
        <PasswordInput invalid value="te kort" />
      </div>
    </div>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  args: { defaultValue: 'geheim123' },
};
