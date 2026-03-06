import type { Meta, StoryObj } from '@storybook/react';
import { Grid, GridItem, Container } from '@dsn/components-react';
import DocsPage from './Grid.docs.mdx';

const meta: Meta<typeof Grid> = {
  title: 'Layout Components/Grid',
  component: Grid,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = ['dsn-grid', args.contained && 'dsn-grid--contained']
          .filter(Boolean)
          .join(' ');
        return `<div class="${cls}">\n  <div class="dsn-col-8 dsn-container">Hoofdinhoud</div>\n  <div class="dsn-col-4 dsn-container">Sidebar</div>\n</div>`;
      },
    },
  },
  argTypes: {
    contained: {
      control: 'boolean',
    },
    children: { control: false },
  },
  args: {
    contained: false,
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  render: (args) => (
    <Grid {...args}>
      <GridItem colSpan={8}>
        <Container>dsn-col-8 — Hoofdinhoud</Container>
      </GridItem>
      <GridItem colSpan={4}>
        <Container>dsn-col-4 — Sidebar</Container>
      </GridItem>
    </Grid>
  ),
};

export const Contained: Story = {
  name: 'Contained (max-width)',
  render: () => (
    <Grid contained>
      <GridItem colSpan={8}>
        <Container>dsn-col-8 — Hoofdinhoud</Container>
      </GridItem>
      <GridItem colSpan={4}>
        <Container>dsn-col-4 — Sidebar</Container>
      </GridItem>
    </Grid>
  ),
};

export const Responsive: Story = {
  name: 'Responsive kolommen',
  render: () => (
    <Grid contained>
      {(['A', 'B', 'C'] as const).map((label) => (
        <GridItem key={label} colSpan={12} colSpanMd={6} colSpanLg={4}>
          <Container>{`col-12 → col-md-6 → col-lg-4 — Item ${label}`}</Container>
        </GridItem>
      ))}
    </Grid>
  ),
};

export const FullBleed: Story = {
  name: 'Full-bleed',
  render: () => (
    <Grid contained>
      <GridItem colSpan={8}>
        <Container>Normale content (col-8)</Container>
      </GridItem>
      <GridItem fullBleed>
        <div
          style={{
            background: 'var(--dsn-color-neutral-bg-subtle)',
            padding: '1.5rem var(--dsn-grid-margin)',
            borderBlock: '1px solid var(--dsn-color-neutral-border-subtle)',
          }}
        >
          <Container>
            Full-bleed sectie — breekt uit tot container-randen
          </Container>
        </div>
      </GridItem>
      <GridItem colSpan={8}>
        <Container>Vervolg content (col-8)</Container>
      </GridItem>
    </Grid>
  ),
};

export const AllColumns: Story = {
  name: 'All columns (1–12)',
  render: () => (
    <Grid>
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((n) => (
        <GridItem key={n} colSpan={n}>
          <Container>{`col-${n}`}</Container>
        </GridItem>
      ))}
    </Grid>
  ),
};

export const InformationDense: Story = {
  name: 'Information-dense gutter',
  render: () => (
    <div className="dsn-density-dense">
      <Grid>
        <GridItem colSpan={4}>
          <Container>col-4</Container>
        </GridItem>
        <GridItem colSpan={4}>
          <Container>col-4</Container>
        </GridItem>
        <GridItem colSpan={4}>
          <Container>col-4</Container>
        </GridItem>
      </Grid>
      <p
        style={{
          marginBlockStart: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--dsn-color-neutral-color-subtle)',
          fontFamily: 'monospace',
        }}
      >
        Gutter: --dsn-space-column-md (8px) via .dsn-density-dense
      </p>
    </div>
  ),
};
