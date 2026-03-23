import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Container } from '@dsn/components-react';
import DocsPage from './Stack.docs.mdx';

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
        return `<div class="${cls}">\n  <div class="dsn-container">...</div>\n  <div class="dsn-container">...</div>\n  <div class="dsn-container">...</div>\n</div>`;
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

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Container>Inhoud</Container>
      <Container>Inhoud</Container>
      <Container>Inhoud</Container>
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

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

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
            <Container>Inhoud</Container>
            <Container>Inhoud</Container>
            <Container>Inhoud</Container>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
