import type { Meta, StoryObj } from '@storybook/react';
import { OptionLabel } from '@dsn/components-react';
import DocsPage from './OptionLabel.docs.mdx';
import {
  TEKST,
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof OptionLabel> = {
  title: 'Components/OptionLabel',
  component: OptionLabel,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-option-label',
          args.disabled && 'dsn-option-label--disabled',
        ]
          .filter(Boolean)
          .join(' ');
        return `<span class="${cls}">${args.children ?? 'Tekst'}</span>`;
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: {
    children: TEKST,
  },
};

export default meta;
type Story = StoryObj<typeof OptionLabel>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true, children: TEKST },
};

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <OptionLabel>{TEKST}</OptionLabel>
      <OptionLabel disabled>{TEKST}</OptionLabel>
    </div>
  ),
};

export const ShortText: Story = {
  name: 'Short text',
  args: { children: WEINIG_TEKST },
};

export const LongText: Story = {
  name: 'Long text',
  args: { children: VEEL_TEKST },
};

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
