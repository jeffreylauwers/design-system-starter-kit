import type { Meta, StoryObj } from '@storybook/react';
import {
  Body,
  type BodyProps,
  Heading,
  Paragraph,
} from '@dsn/components-react';
import DocsPage from './Body.docs.mdx';

const meta: Meta<typeof Body> = {
  title: 'Foundations/Body',
  component: Body,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      htmlTemplate: () =>
        `<body class="dsn-body">\n  <!-- paginainhoud -->\n</body>`,
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
