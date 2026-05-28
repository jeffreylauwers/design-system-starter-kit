import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading, PreHeading } from '@dsn-starter-kit/components-react';
import DocsPage from './PreHeading.docs.mdx';
import {
  VEEL_TEKST,
  WEINIG_TEKST,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const meta: Meta<typeof PreHeading> = {
  title: 'Components/PreHeading',
  component: PreHeading,
  parameters: {
    docs: {
      page: DocsPage,
    },
  },
  args: {
    children: 'Stap 2',
  },
};

export default meta;
type Story = StoryObj<typeof PreHeading>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <Heading level={2}>
      <PreHeading {...args} />
      Uw gegevens
    </Heading>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const InsideHeading1: Story = {
  name: 'Inside Heading 1',
  render: () => (
    <Heading level={1}>
      <PreHeading>Meerstappenformulier</PreHeading>
      Uw aanvraag
    </Heading>
  ),
};

export const WithCategory: Story = {
  name: 'With Category',
  render: () => (
    <Heading level={2}>
      <PreHeading>Diensten</PreHeading>
      We helpen u groeien
    </Heading>
  ),
};

export const WithVisuallyHiddenColon: Story = {
  name: 'With Visually Hidden Colon',
  render: () => (
    <Heading level={2}>
      <PreHeading>
        Stap 2<span className="dsn-visually-hidden">:</span>
      </PreHeading>
      Uw gegevens
    </Heading>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllHeadingLevels: Story = {
  name: 'All Heading Levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Heading level={1}>
        <PreHeading>
          Stap 1<span className="dsn-visually-hidden">:</span>
        </PreHeading>
        Heading 1
      </Heading>
      <Heading level={2}>
        <PreHeading>
          Stap 2<span className="dsn-visually-hidden">:</span>
        </PreHeading>
        Heading 2
      </Heading>
      <Heading level={3}>
        <PreHeading>
          Stap 3<span className="dsn-visually-hidden">:</span>
        </PreHeading>
        Heading 3
      </Heading>
      <Heading level={4}>
        <PreHeading>
          Stap 4<span className="dsn-visually-hidden">:</span>
        </PreHeading>
        Heading 4
      </Heading>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short Text',
  render: () => (
    <Heading level={2}>
      <PreHeading>{WEINIG_TEKST}</PreHeading>
      Heading tekst
    </Heading>
  ),
};

export const LongText: Story = {
  name: 'Long Text',
  render: () => (
    <Heading level={2}>
      <PreHeading>{VEEL_TEKST}</PreHeading>
      Heading tekst
    </Heading>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Heading level={1}>
        <PreHeading>{VEEL_TEKST_AR}</PreHeading>
        {VEEL_TEKST_AR}
      </Heading>
      <Heading level={2}>
        <PreHeading>{VEEL_TEKST_AR}</PreHeading>
        {VEEL_TEKST_AR}
      </Heading>
    </div>
  ),
};
