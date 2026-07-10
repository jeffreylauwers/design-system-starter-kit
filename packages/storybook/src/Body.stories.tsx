import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Body,
  type BodyProps,
  Heading,
  Paragraph,
} from '@dsn-starter-kit/components-react';
import DocsPage from './Body.docs.mdx';

const meta: Meta<typeof Body> = {
  title: 'Foundations/Body',
  component: Body,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // In echte HTML pas je dsn-body direct toe op het <body> element;
      // de React-wrapper rendert een <div class="dsn-body">.
      htmlTemplate: () =>
        `<body class="dsn-body">\n  <h1 class="dsn-heading dsn-heading--heading-1">Paginatitel</h1>\n  <p class="dsn-paragraph">Dit is een voorbeeldparagraaf.</p>\n</body>`,
    },
  },
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Body>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args: BodyProps) => (
    <Body {...args}>
      <Heading level={1}>Paginatitel</Heading>
      <Paragraph>
        Dit is een voorbeeldparagraaf. De typografie, kleur en achtergrond zijn
        ingesteld door het Body component en worden via CSS cascade overgenomen
        door alle child-elementen die zelf geen specifieke waarden definiëren.
      </Paragraph>
    </Body>
  ),
};
