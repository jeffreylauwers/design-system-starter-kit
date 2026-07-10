import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Icon,
  Menu,
  MenuButton,
  MenuLink,
  NumberBadge,
} from '@dsn-starter-kit/components-react';
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
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-menu',
          args.orientation === 'horizontal' && 'dsn-menu--horizontal',
        ]
          .filter(Boolean)
          .join(' ');
        return `<ul class="${cls}">
  <li class="dsn-menu-link">
    <a class="dsn-menu-link__link" href="/home" aria-current="page">
      <svg class="dsn-icon" aria-hidden="true"><!-- home --></svg>
      <span class="dsn-menu-link__label">Home</span>
    </a>
  </li>
  <li class="dsn-menu-link">
    <a class="dsn-menu-link__link" href="/rapporten">
      <svg class="dsn-icon" aria-hidden="true"><!-- file-description --></svg>
      <span class="dsn-menu-link__label">Rapporten</span>
    </a>
  </li>
  <li class="dsn-menu-link">
    <a class="dsn-menu-link__link" href="/inbox">
      <svg class="dsn-icon" aria-hidden="true"><!-- mail --></svg>
      <span class="dsn-menu-link__label">Inbox</span>
      <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true">3</span>
    </a>
  </li>
  <li class="dsn-menu-button">
    <button type="button" class="dsn-menu-button__button">
      <svg class="dsn-icon" aria-hidden="true"><!-- settings --></svg>
      <span class="dsn-menu-button__label">Instellingen</span>
    </button>
  </li>
  <li class="dsn-menu-button">
    <button type="button" class="dsn-menu-button__button">
      <svg class="dsn-icon" aria-hidden="true"><!-- user --></svg>
      <span class="dsn-menu-button__label">Uitloggen</span>
    </button>
  </li>
</ul>`;
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
  name: 'Vertical',
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
  name: 'Horizontal',
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
  name: 'All variants',
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
