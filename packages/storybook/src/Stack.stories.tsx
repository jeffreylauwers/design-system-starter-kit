import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@dsn/components-react';
import DocsPage from './Stack.docs.mdx';

/** Placeholder box voor visuele demonstratie van Stack-spacing */
const Box = ({ label }: { label?: string }) => (
  <div
    style={{
      padding: '0.75rem 1rem',
      background: 'var(--dsn-color-neutral-bg-default)',
      border: '1px solid var(--dsn-color-neutral-border-subtle)',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: 'var(--dsn-color-neutral-color-document)',
    }}
  >
    {label ?? 'Inhoud'}
  </div>
);

const meta: Meta<typeof Stack> = {
  title: 'Layout Components/Stack',
  component: Stack,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const space = args.space ?? 'md';
        const cls = ['dsn-stack', space !== 'md' && `dsn-stack--space-${space}`]
          .filter(Boolean)
          .join(' ');
        return `<div class="${cls}">\n  <div>...</div>\n  <div>...</div>\n  <div>...</div>\n</div>`;
      },
    },
  },
  argTypes: {
    space: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
    },
    children: { control: false },
  },
  args: {
    space: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Box />
      <Box />
      <Box />
    </Stack>
  ),
};

const SPACE_VARIANTS = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
] as const;

const SPACE_LABELS: Record<string, string> = {
  sm: 'sm — 4px',
  md: 'md — 8px',
  lg: 'lg — 12px',
  xl: 'xl — 16px',
  '2xl': '2xl — 20px',
  '3xl': '3xl — 24px',
  '4xl': '4xl — 32px',
  '5xl': '5xl — 64px',
  '6xl': '6xl — 160px',
};

export const AllSpaces: Story = {
  name: 'All spaces',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {SPACE_VARIANTS.map((space) => (
        <div key={space} style={{ minWidth: '160px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: 'var(--dsn-color-neutral-color-subtle)',
              marginBlockEnd: '0.5rem',
            }}
          >
            {SPACE_LABELS[space]}
          </div>
          <Stack space={space}>
            <Box />
            <Box />
            <Box />
          </Stack>
        </div>
      ))}
    </div>
  ),
};
