import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Icon,
  Menu,
  MenuButton,
  MenuLink,
  NumberBadge,
} from '@dsn/components-react';
import DocsPage from './Menu.docs.mdx';

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (_args: any) => {
        return `<ul class="dsn-menu">\n  <li class="dsn-menu-link">\n    <a class="dsn-menu-link__link" href="/home">\n      <span class="dsn-menu-link__label">Home</span>\n    </a>\n  </li>\n  <li class="dsn-menu-button">\n    <button type="button" class="dsn-menu-button__button">\n      <span class="dsn-menu-button__label">Uitloggen</span>\n    </button>\n  </li>\n</ul>`;
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
  args: {
    orientation: 'vertical',
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args: React.ComponentProps<typeof Menu>) => (
    <Menu {...args}>
      <MenuLink
        href="/home"
        iconStart={<Icon name="home" aria-hidden />}
        current
      >
        Home
      </MenuLink>
      <MenuLink
        href="/rapporten"
        iconStart={<Icon name="file-description" aria-hidden />}
      >
        Rapporten
      </MenuLink>
      <MenuLink
        href="/inbox"
        iconStart={<Icon name="mail" aria-hidden />}
        numberBadge={<NumberBadge variant="negative">3</NumberBadge>}
      >
        Inbox
      </MenuLink>
      <MenuButton iconStart={<Icon name="settings" aria-hidden />}>
        Instellingen
      </MenuButton>
      <MenuButton iconStart={<Icon name="user" aria-hidden />}>
        Uitloggen
      </MenuButton>
    </Menu>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Vertical: Story = {
  name: 'Verticaal',
  render: (args: React.ComponentProps<typeof Menu>) => (
    <Menu {...args} orientation="vertical">
      <MenuLink href="/home" current>
        Home
      </MenuLink>
      <MenuLink href="/over">Over ons</MenuLink>
      <MenuLink href="/contact">Contact</MenuLink>
      <MenuButton>Uitloggen</MenuButton>
    </Menu>
  ),
};

export const Horizontal: Story = {
  name: 'Horizontaal',
  render: (args: React.ComponentProps<typeof Menu>) => (
    <nav aria-label="Paginanavigatie">
      <Menu {...args} orientation="horizontal">
        <MenuLink href="/home" current>
          Home
        </MenuLink>
        <MenuLink href="/over">Over ons</MenuLink>
        <MenuLink href="/diensten">Diensten</MenuLink>
        <MenuLink href="/contact">Contact</MenuLink>
      </Menu>
    </nav>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'Alle varianten',
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          Verticaal (standaard)
        </p>
        <Menu>
          <MenuLink
            href="/home"
            iconStart={<Icon name="home" aria-hidden />}
            current
          >
            Home
          </MenuLink>
          <MenuLink
            href="/rapporten"
            iconStart={<Icon name="file-description" aria-hidden />}
          >
            Rapporten
          </MenuLink>
          <MenuLink
            href="/inbox"
            iconStart={<Icon name="mail" aria-hidden />}
            numberBadge={<NumberBadge variant="negative">3</NumberBadge>}
          >
            Inbox
          </MenuLink>
          <MenuButton iconStart={<Icon name="settings" aria-hidden />}>
            Instellingen
          </MenuButton>
          <MenuButton iconStart={<Icon name="user" aria-hidden />}>
            Uitloggen
          </MenuButton>
        </Menu>
      </div>

      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          Horizontaal
        </p>
        <nav aria-label="Paginanavigatie">
          <Menu orientation="horizontal">
            <MenuLink href="/home" current>
              Home
            </MenuLink>
            <MenuLink href="/over">Over ons</MenuLink>
            <MenuLink href="/diensten">Diensten</MenuLink>
            <MenuLink href="/contact">Contact</MenuLink>
          </Menu>
        </nav>
      </div>
    </div>
  ),
};
