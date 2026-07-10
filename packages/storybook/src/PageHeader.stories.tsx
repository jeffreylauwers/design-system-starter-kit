import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  DotBadge,
  Icon,
  Logo,
  Menu,
  MenuButton,
  MenuLink,
  NumberBadge,
  PageHeader,
  Popover,
  PopoverBody,
  SearchInput,
} from '@dsn-starter-kit/components-react';
import { rtlDecorator } from './story-helpers';

// =============================================================================
// META
// =============================================================================

const logoSlot = (
  <a href="/">
    <Logo aria-hidden={true} />
    <span className="dsn-visually-hidden">
      Starter Kit — terug naar homepage
    </span>
  </a>
);

/**
 * Primaire navigatie met alle niveaus (1–4) uitklapbaar.
 *
 * Structuur:
 * - Homepage
 * - Level 1a (current)
 * - Level 1b
 *   - Level 2a
 *   - Level 2b
 *     - Level 3a
 *     - Level 3b
 *       - Level 4a
 *       - Level 4b
 *     - Level 3c
 *     - Level 3d
 *   - Level 2c
 *   - Level 2d
 * - Level 1c
 * - Level 1d
 */
function PrimaryNavigation() {
  const [exp1b, setExp1b] = React.useState(false);
  const [exp2b, setExp2b] = React.useState(false);
  const [exp3b, setExp3b] = React.useState(false);

  return (
    <Menu orientation="vertical">
      {/* Homepage */}
      <MenuLink href="/level-1a" level={1} current>
        Homepage
      </MenuLink>

      {/* Level 1b */}
      <MenuLink
        href="/level-1b"
        level={1}
        subItems
        expanded={exp1b}
        onExpandToggle={() => setExp1b((v) => !v)}
      >
        Level 1b
      </MenuLink>
      {exp1b && (
        <>
          <MenuLink href="/level-2a" level={2}>
            Level 2a
          </MenuLink>
          <MenuLink
            href="/level-2b"
            level={2}
            subItems
            expanded={exp2b}
            onExpandToggle={() => setExp2b((v) => !v)}
          >
            Level 2b
          </MenuLink>
          {exp2b && (
            <>
              <MenuLink href="/level-3a" level={3}>
                Level 3a
              </MenuLink>
              <MenuLink
                href="/level-3b"
                level={3}
                subItems
                expanded={exp3b}
                onExpandToggle={() => setExp3b((v) => !v)}
              >
                Level 3b
              </MenuLink>
              {exp3b && (
                <>
                  <MenuLink href="/level-4a" level={4}>
                    Level 4a
                  </MenuLink>
                  <MenuLink href="/level-4b" level={4}>
                    Level 4b
                  </MenuLink>
                </>
              )}
              <MenuLink href="/level-3c" level={3}>
                Level 3c
              </MenuLink>
              <MenuLink href="/level-3d" level={3}>
                Level 3d
              </MenuLink>
            </>
          )}
          <MenuLink href="/level-2c" level={2}>
            Level 2c
          </MenuLink>
          <MenuLink href="/level-2d" level={2}>
            Level 2d
          </MenuLink>
        </>
      )}

      {/* Level 1c */}
      <MenuLink href="/level-1c" level={1}>
        Level 1c
      </MenuLink>

      {/* Level 1d */}
      <MenuLink href="/level-1d" level={1}>
        Level 1d
      </MenuLink>
    </Menu>
  );
}

const secondaryNavigation = (
  <Menu orientation="vertical">
    <MenuLink href="/english" level={1}>
      English
    </MenuLink>
    <MenuLink href="/mijn-omgeving" level={1}>
      Mijn omgeving
    </MenuLink>
  </Menu>
);

/** Large viewport: horizontale servicemenu zonder verticale hiërarchie */
const secondaryNavigationLarge = (
  <Menu orientation="horizontal">
    <MenuLink href="/english" level={1}>
      English
    </MenuLink>
    <MenuLink href="/mijn-omgeving" level={1}>
      Mijn omgeving
    </MenuLink>
  </Menu>
);

/** Large viewport: alleen Level 1 items horizontaal, geen sub-items toggle */
const primaryNavigationLarge = (
  <Menu orientation="horizontal">
    <MenuLink href="/" level={1}>
      Homepage
    </MenuLink>
    <MenuLink href="/level-1a" level={1} current>
      Level 1a
    </MenuLink>
    <MenuLink href="/level-1b" level={1}>
      Level 1b
    </MenuLink>
    <MenuLink href="/level-1c" level={1}>
      Level 1c
    </MenuLink>
    <MenuLink href="/level-1d" level={1}>
      Level 1d
    </MenuLink>
  </Menu>
);

/** Large viewport compact: zonder Level 1d */
const primaryNavigationLargeCompact = (
  <Menu orientation="horizontal">
    <MenuLink href="/" level={1}>
      Homepage
    </MenuLink>
    <MenuLink href="/level-1a" level={1} current>
      Level 1a
    </MenuLink>
    <MenuLink href="/level-1b" level={1}>
      Level 1b
    </MenuLink>
    <MenuLink href="/level-1c" level={1}>
      Level 1c
    </MenuLink>
    <MenuLink href="/level-1d" level={1}>
      Level 1d
    </MenuLink>
  </Menu>
);

function PrimaryNavigationCompact() {
  const [exp1b, setExp1b] = React.useState(false);
  const [exp2b, setExp2b] = React.useState(false);
  const [exp3b, setExp3b] = React.useState(false);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/" level={1}>
        Homepage
      </MenuLink>
      <MenuLink href="/level-1a" level={1} current>
        Level 1a
      </MenuLink>
      <MenuLink
        href="/level-1b"
        level={1}
        subItems
        expanded={exp1b}
        onExpandToggle={() => setExp1b((v) => !v)}
      >
        Level 1b
      </MenuLink>
      {exp1b && (
        <>
          <MenuLink href="/level-2a" level={2}>
            Level 2a
          </MenuLink>
          <MenuLink
            href="/level-2b"
            level={2}
            subItems
            expanded={exp2b}
            onExpandToggle={() => setExp2b((v) => !v)}
          >
            Level 2b
          </MenuLink>
          {exp2b && (
            <>
              <MenuLink href="/level-3a" level={3}>
                Level 3a
              </MenuLink>
              <MenuLink
                href="/level-3b"
                level={3}
                subItems
                expanded={exp3b}
                onExpandToggle={() => setExp3b((v) => !v)}
              >
                Level 3b
              </MenuLink>
              {exp3b && (
                <>
                  <MenuLink href="/level-4a" level={4}>
                    Level 4a
                  </MenuLink>
                  <MenuLink href="/level-4b" level={4}>
                    Level 4b
                  </MenuLink>
                </>
              )}
              <MenuLink href="/level-3c" level={3}>
                Level 3c
              </MenuLink>
              <MenuLink href="/level-3d" level={3}>
                Level 3d
              </MenuLink>
            </>
          )}
          <MenuLink href="/level-2c" level={2}>
            Level 2c
          </MenuLink>
          <MenuLink href="/level-2d" level={2}>
            Level 2d
          </MenuLink>
        </>
      )}
      <MenuLink href="/level-1c" level={1}>
        Level 1c
      </MenuLink>
      <MenuLink href="/level-1d" level={1}>
        Level 1d
      </MenuLink>
    </Menu>
  );
}

const searchSlot = (
  <>
    <SearchInput placeholder="Zoeken…" aria-label="Zoekopdracht" />
    <Button variant="strong">Zoeken</Button>
  </>
);

// =============================================================================
// ARABISCHE CONTENT (voor RTL stories)
// =============================================================================

const logoSlotAR = (
  <a href="/">
    <Logo aria-hidden={true} />
    <span className="dsn-visually-hidden">
      Starter Kit — العودة إلى الصفحة الرئيسية
    </span>
  </a>
);

const primaryNavigationAR = (
  <Menu orientation="vertical">
    <MenuLink href="/home" level={1} current>
      الرئيسية
    </MenuLink>
    <MenuLink href="/about" level={1}>
      عن الشركة
    </MenuLink>
    <MenuLink href="/services" level={1}>
      الخدمات
    </MenuLink>
    <MenuLink href="/news" level={1}>
      أخبار
    </MenuLink>
  </Menu>
);

const primaryNavigationLargeAR = (
  <Menu orientation="horizontal">
    <MenuLink href="/home" level={1} current>
      الرئيسية
    </MenuLink>
    <MenuLink href="/about" level={1}>
      عن الشركة
    </MenuLink>
    <MenuLink href="/services" level={1}>
      الخدمات
    </MenuLink>
    <MenuLink href="/news" level={1}>
      أخبار
    </MenuLink>
  </Menu>
);

const secondaryNavigationAR = (
  <Menu orientation="vertical">
    <MenuLink href="/english" level={1}>
      English
    </MenuLink>
    <MenuLink href="/my-env" level={1}>
      بيئتي
    </MenuLink>
  </Menu>
);

const secondaryNavigationLargeAR = (
  <Menu orientation="horizontal">
    <MenuLink href="/english" level={1}>
      English
    </MenuLink>
    <MenuLink href="/my-env" level={1}>
      بيئتي
    </MenuLink>
  </Menu>
);

const searchSlotAR = (
  <>
    <SearchInput placeholder="بحث…" aria-label="مصطلح البحث" />
    <Button variant="strong">بحث</Button>
  </>
);

// =============================================================================
// INGELOGDE GEBRUIKER — helper-componenten
// =============================================================================

function LoggedInServiceMenuLarge() {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Menu orientation="horizontal">
        <MenuLink href="/english" level={1}>
          English
        </MenuLink>
        <MenuButton
          ref={triggerRef}
          iconEnd={<Icon name="chevron-down" aria-hidden />}
          onClick={() => setIsOpen((v) => !v)}
        >
          J. van Drouwen
        </MenuButton>
      </Menu>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        label="Mijn omgeving"
        placement="bottom"
      >
        <PopoverBody>
          <Menu orientation="vertical">
            <MenuLink href="/overzicht" level={1}>
              Overzicht
            </MenuLink>
            <MenuLink href="/berichten" level={1}>
              Berichten
            </MenuLink>
            <MenuLink href="/gegevens" level={1}>
              Gegevens
            </MenuLink>
            <MenuLink href="/uitloggen" level={1}>
              Uitloggen
            </MenuLink>
          </Menu>
        </PopoverBody>
      </Popover>
    </>
  );
}

function LoggedInServiceMenuSmall() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/english" level={1}>
        English
      </MenuLink>
      <MenuLink
        href="/mijn-omgeving"
        level={1}
        subItems
        expanded={expanded}
        onExpandToggle={() => setExpanded((v) => !v)}
      >
        J. van Drouwen
      </MenuLink>
      {expanded && (
        <>
          <MenuLink href="/overzicht" level={2}>
            Overzicht
          </MenuLink>
          <MenuLink href="/berichten" level={2}>
            Berichten
          </MenuLink>
          <MenuLink href="/gegevens" level={2}>
            Gegevens
          </MenuLink>
          <MenuLink href="/uitloggen" level={2}>
            Uitloggen
          </MenuLink>
        </>
      )}
    </Menu>
  );
}

function NewMessageServiceMenuLarge() {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Menu orientation="horizontal">
        <MenuLink href="/english" level={1}>
          English
        </MenuLink>
        <MenuButton
          ref={triggerRef}
          iconEnd={<Icon name="chevron-down" aria-hidden />}
          dotBadge={<DotBadge variant="negative" pulse />}
          onClick={() => setIsOpen((v) => !v)}
        >
          J. van Drouwen
          <span className="dsn-visually-hidden">, 2 nieuwe berichten</span>
        </MenuButton>
      </Menu>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        label="Mijn omgeving"
        placement="bottom"
      >
        <PopoverBody>
          <Menu orientation="vertical">
            <MenuLink href="/overzicht" level={1}>
              Overzicht
            </MenuLink>
            <MenuLink
              href="/berichten"
              level={1}
              numberBadge={
                <NumberBadge variant="negative" aria-hidden>
                  2
                </NumberBadge>
              }
            >
              Berichten
              <span className="dsn-visually-hidden"> (2 ongelezen)</span>
            </MenuLink>
            <MenuLink href="/gegevens" level={1}>
              Gegevens
            </MenuLink>
            <MenuLink href="/uitloggen" level={1}>
              Uitloggen
            </MenuLink>
          </Menu>
        </PopoverBody>
      </Popover>
    </>
  );
}

function NewMessageServiceMenuSmall() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Menu orientation="vertical">
      <MenuLink href="/english" level={1}>
        English
      </MenuLink>
      <MenuLink
        href="/mijn-omgeving"
        level={1}
        subItems
        expanded={expanded}
        onExpandToggle={() => setExpanded((v) => !v)}
      >
        J. van Drouwen
      </MenuLink>
      {expanded && (
        <>
          <MenuLink href="/overzicht" level={2}>
            Overzicht
          </MenuLink>
          <MenuLink
            href="/berichten"
            level={2}
            numberBadge={
              <NumberBadge variant="negative" aria-hidden>
                2
              </NumberBadge>
            }
          >
            Berichten
            <span className="dsn-visually-hidden"> (2 ongelezen)</span>
          </MenuLink>
          <MenuLink href="/gegevens" level={2}>
            Gegevens
          </MenuLink>
          <MenuLink href="/uitloggen" level={2}>
            Uitloggen
          </MenuLink>
        </>
      )}
    </Menu>
  );
}

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (_args: any) => {
        const logo = `<div class="dsn-page-header__logo">
        <a href="/">
          <svg class="dsn-logo" aria-hidden="true"><!-- logo --></svg>
          <span class="dsn-visually-hidden">Starter Kit — terug naar homepage</span>
        </a>
      </div>`;
        const searchBox = `<div class="dsn-search-input-wrapper">
          <svg class="dsn-icon dsn-search-input__icon" aria-hidden="true"><!-- search --></svg>
          <input type="search" class="dsn-text-input dsn-search-input" placeholder="Zoeken…" aria-label="Zoekopdracht" />
        </div>
        <button type="button" class="dsn-button dsn-button--strong dsn-button--size-default">
          <span class="dsn-button__label">Zoeken</span>
        </button>`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const menuItems = (items: any[], indent: string) =>
          items
            .map((item) => {
              const expand = item.subItems
                ? `
${indent}  <span class="dsn-menu-link__divider" aria-hidden="true"></span>
${indent}  <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-menu-link__expand-button" aria-expanded="false">
${indent}    <svg class="dsn-icon" aria-hidden="true"><!-- chevron-down --></svg>
${indent}    <span class="dsn-button__label">Uitklappen<span class="dsn-visually-hidden"> voor ${item.label}</span></span>
${indent}  </button>`
                : '';
              return `${indent}<li class="dsn-menu-link">
${indent}  <a class="dsn-menu-link__link" href="${item.href}"${item.current ? ' aria-current="page"' : ''}>
${indent}    <span class="dsn-menu-link__label">${item.label}</span>
${indent}  </a>${expand}
${indent}</li>`;
            })
            .join('\n');
        const primaryItems = [
          { href: '/', label: 'Homepage' },
          { href: '/level-1a', label: 'Level 1a', current: true },
          { href: '/level-1b', label: 'Level 1b' },
          { href: '/level-1c', label: 'Level 1c' },
          { href: '/level-1d', label: 'Level 1d' },
        ];
        const drawerItems = [
          { href: '/level-1a', label: 'Homepage', current: true },
          { href: '/level-1b', label: 'Level 1b', subItems: true },
          { href: '/level-1c', label: 'Level 1c' },
          { href: '/level-1d', label: 'Level 1d' },
        ];
        const secondaryItems = [
          { href: '/english', label: 'English' },
          { href: '/mijn-omgeving', label: 'Mijn omgeving' },
        ];
        return `<header class="dsn-page-header">
  <!-- Kleine schermen: menu-knop, logo en zoekknop -->
  <div class="dsn-page-header__small-layout">
    <div class="dsn-page-header__inner">
      <div class="dsn-page-header__start">
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default">
          <svg class="dsn-icon" aria-hidden="true"><!-- menu --></svg>
          <span class="dsn-button__label">Menu</span>
        </button>
      </div>
      ${logo}
      <div class="dsn-page-header__end">
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default" aria-expanded="false" aria-controls="search-panel">
          <svg class="dsn-icon" aria-hidden="true"><!-- search --></svg>
          <span class="dsn-button__label">Zoeken</span>
        </button>
      </div>
    </div>
    <div id="search-panel" class="dsn-page-header__search-panel" hidden>
      <div class="dsn-page-header__search-inner">
        ${searchBox}
      </div>
    </div>
  </div>
  <!-- Grote schermen: masthead met logo, service-navigatie en zoekveld + navbar -->
  <div class="dsn-page-header__large-layout">
    <div class="dsn-page-header__masthead">
      <div class="dsn-page-header__masthead-inner">
        ${logo}
        <div class="dsn-page-header__secondary-nav">
          <nav aria-label="Service-navigatie">
            <ul class="dsn-menu dsn-menu--horizontal">
${menuItems(secondaryItems, '              ')}
            </ul>
          </nav>
          <div class="dsn-page-header__searchbox">
            ${searchBox}
          </div>
        </div>
      </div>
    </div>
    <div class="dsn-page-header__navbar">
      <div class="dsn-page-header__navbar-inner">
        <nav aria-label="Hoofd-navigatie">
          <ul class="dsn-menu dsn-menu--horizontal">
${menuItems(primaryItems, '            ')}
          </ul>
        </nav>
      </div>
    </div>
  </div>
</header>
<!-- Drawer met het menu voor kleine schermen -->
<dialog class="dsn-drawer dsn-drawer--side-left" aria-labelledby="drawer-title">
  <div class="dsn-drawer__header">
    <h2 id="drawer-title" class="dsn-drawer-heading">Menu</h2>
    <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
      <svg class="dsn-icon" aria-hidden="true"><!-- x --></svg>
      <span class="dsn-button__label">Sluiten</span>
    </button>
  </div>
  <div class="dsn-drawer__body">
    <div class="dsn-stack dsn-stack--space-5xl">
      <nav aria-label="Hoofd-navigatie">
        <ul class="dsn-menu">
${menuItems(drawerItems, '          ')}
        </ul>
      </nav>
      <nav aria-label="Service-navigatie">
        <ul class="dsn-menu">
${menuItems(secondaryItems, '          ')}
        </ul>
      </nav>
    </div>
  </div>
</dialog>`;
      },
    },
  },
  argTypes: {
    // ── Gedrag ──────────────────────────────────────────────────────────────
    sticky: {
      control: 'select',
      options: ['none', 'sticky', 'auto-hide'],
      table: { category: 'Gedrag' },
    },
    layout: {
      control: { type: 'radio' },
      options: ['default', 'compact'],
      table: { category: 'Gedrag' },
    },
    colorScheme: {
      control: { type: 'radio' },
      options: ['default', 'inverse'],
      table: { category: 'Gedrag' },
    },
    initialSearchOpen: {
      control: 'boolean',
      table: { category: 'Gedrag' },
    },
    // ── Slots — ReactNode, niet bewerkbaar via controls ──────────────────────
    logoSlot: {
      control: false,
      table: { category: 'Slots' },
    },
    searchSlot: {
      control: false,
      table: { category: 'Slots' },
    },
    primaryNavigation: {
      control: false,
      table: { category: 'Slots' },
    },
    primaryNavigationLarge: {
      control: false,
      table: { category: 'Slots' },
    },
    secondaryNavigation: {
      control: false,
      table: { category: 'Slots' },
    },
    secondaryNavigationLarge: {
      control: false,
      table: { category: 'Slots' },
    },
    // ── Events ───────────────────────────────────────────────────────────────
    onMenuOpen: {
      control: false,
      table: { category: 'Events' },
    },
    onMenuClose: {
      control: false,
      table: { category: 'Events' },
    },
    onSearchOpen: {
      control: false,
      table: { category: 'Events' },
    },
    onSearchClose: {
      control: false,
      table: { category: 'Events' },
    },
  },
  args: {
    sticky: 'none',
    logoSlot,
    primaryNavigation: <PrimaryNavigation />,
    primaryNavigationLarge,
    secondaryNavigation,
    secondaryNavigationLarge,
    searchSlot,
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

// Helper: wat paginacontent zodat scroll-gedrag testbaar is
function PageContent() {
  return (
    <main style={{ padding: '2rem', maxWidth: '60rem', margin: '0 auto' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <p key={i} style={{ marginBlockEnd: '1rem', lineHeight: '1.6' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
      ))}
    </main>
  );
}

// =============================================================================
// COMPACT
// =============================================================================

export const Compact: Story = {
  name: 'Compact',
  args: {
    layout: 'compact',
    primaryNavigation: <PrimaryNavigationCompact />,
    primaryNavigationLarge: primaryNavigationLargeCompact,
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'Op viewports ≥ 64em toont de compact variant één enkele rij: logo (inline-start), primaire navigatie (links uitgelijnd via CSS-grid `auto 1fr auto` met `column-gap`), en servicemenu + zoek-iconknop (inline-end). Gebruikt `primaryNavigationLarge` voor de compacte balk en `primaryNavigation` (verticaal) voor de Drawer op small viewport.',
      },
    },
  },
};

export const CompactInverse: Story = {
  name: 'Compact: Inverse',
  args: {
    layout: 'compact',
    colorScheme: 'inverse',
    primaryNavigation: <PrimaryNavigationCompact />,
    primaryNavigationLarge: primaryNavigationLargeCompact,
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'Combinatie van `layout="compact"` en `colorScheme="inverse"`: de compacte balk (logo, primaire navigatie, servicemenu) heeft een `accent-1-inverse` achtergrond. Het zoekpaneel gebruikt `accent-1-inverse.bg-document` voor visuele scheiding.',
      },
    },
  },
};

export const CompactLoggedIn: Story = {
  name: 'Compact: Logged In',
  args: {
    layout: 'compact',
    primaryNavigation: <PrimaryNavigationCompact />,
    primaryNavigationLarge: primaryNavigationLargeCompact,
    secondaryNavigation: <LoggedInServiceMenuSmall />,
    secondaryNavigationLarge: <LoggedInServiceMenuLarge />,
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'Ingelogde gebruiker met de compact layout op large viewport. De gebruikersnaam met Popover staat in de compacte balk inline-end. Op small viewport valt de layout terug op de Drawer met uitklapbare accountnavigatie.',
      },
    },
  },
};

export const CompactNewMessage: Story = {
  name: 'Compact: New message',
  args: {
    layout: 'compact',
    primaryNavigation: <PrimaryNavigationCompact />,
    primaryNavigationLarge: primaryNavigationLargeCompact,
    menuButtonBadge: <DotBadge variant="negative" pulse />,
    menuButtonBadgeLabel: '2 nieuwe berichten',
    secondaryNavigation: <NewMessageServiceMenuSmall />,
    secondaryNavigationLarge: <NewMessageServiceMenuLarge />,
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'Ingelogde gebruiker met ongelezen berichten, compact layout. Op large viewport toont de MenuButton een pulserende DotBadge; in de Popover heeft "Berichten" een NumberBadge. Op small viewport toont de Menu-knop een DotBadge en draagt de MenuLink "Berichten" een NumberBadge in de Drawer.',
      },
    },
  },
};

export const CompactRTL: Story = {
  name: 'Compact: RTL',
  decorators: [rtlDecorator],
  args: {
    layout: 'compact',
    logoSlot: logoSlotAR,
    primaryNavigation: primaryNavigationAR,
    primaryNavigationLarge: primaryNavigationLargeAR,
    secondaryNavigation: secondaryNavigationAR,
    secondaryNavigationLarge: secondaryNavigationLargeAR,
    searchSlot: searchSlotAR,
    menuButtonLabel: 'القائمة',
    searchButtonLabel: 'بحث',
    closeButtonLabel: 'إغلاق',
    searchInputPlaceholder: 'بحث…',
    searchInputAriaLabel: 'مصطلح البحث',
    searchSubmitLabel: 'بحث',
    primaryNavAriaLabel: 'القائمة الرئيسية',
    secondaryNavAriaLabel: 'قائمة الخدمات',
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'RTL compact layout: logo inline-end, primaire navigatie gecentreerd, servicemenu + zoekknop inline-start.',
      },
    },
  },
};

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

export const DefaultInverse: Story = {
  name: 'Default: Inverse',
  args: {
    colorScheme: 'inverse',
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'De inverse kleurvariant (`colorScheme="inverse"`) gebruikt `accent-1-inverse` achtergronden op de navbar en het zoekpaneel voor prominente branding. Het masthead blijft neutraal. Het logo past zijn kleuren automatisch aan via CSS context overrides.',
      },
    },
  },
};

export const DefaultLoggedIn: Story = {
  name: 'Default: Logged In',
  args: {
    secondaryNavigation: <LoggedInServiceMenuSmall />,
    secondaryNavigationLarge: <LoggedInServiceMenuLarge />,
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'Ingelogde gebruiker op large viewport. De "Mijn omgeving" link in het servicemenu is vervangen door een MenuButton met de naam van de gebruiker en een chevron-down icoon. Bij klikken opent een Popover met accountnavigatie: Overzicht, Berichten, Gegevens en Uitloggen.',
      },
    },
  },
};

export const DefaultNewMessage: Story = {
  name: 'Default: New message',
  args: {
    menuButtonBadge: <DotBadge variant="negative" pulse />,
    menuButtonBadgeLabel: '2 nieuwe berichten',
    secondaryNavigation: <NewMessageServiceMenuSmall />,
    secondaryNavigationLarge: <NewMessageServiceMenuLarge />,
  },
  parameters: {
    viewport: { defaultViewport: 'large' },
    docs: {
      description: {
        story:
          'Ingelogde gebruiker met ongelezen berichten, default layout. Op large viewport toont de MenuButton een pulserende DotBadge; in de Popover heeft "Berichten" een NumberBadge. Op small viewport toont de Menu-knop een DotBadge en draagt de MenuLink "Berichten" een NumberBadge in de Drawer.',
      },
    },
  },
};

export const DefaultRTL: Story = {
  name: 'Default: RTL',
  decorators: [rtlDecorator],
  args: {
    logoSlot: logoSlotAR,
    primaryNavigation: primaryNavigationAR,
    primaryNavigationLarge: primaryNavigationLargeAR,
    secondaryNavigation: secondaryNavigationAR,
    secondaryNavigationLarge: secondaryNavigationLargeAR,
    searchSlot: searchSlotAR,
    menuButtonLabel: 'القائمة',
    searchButtonLabel: 'بحث',
    closeButtonLabel: 'إغلاق',
    searchInputPlaceholder: 'بحث…',
    searchInputAriaLabel: 'مصطلح البحث',
    searchSubmitLabel: 'بحث',
    primaryNavAriaLabel: 'القائمة الرئيسية',
    secondaryNavAriaLabel: 'قائمة الخدمات',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Right-to-left layout (Arabisch). Logo staat inline-end, menuknop inline-start. CSS logische eigenschappen spiegelen automatisch.',
      },
    },
  },
};

// =============================================================================
// SCROLL
// =============================================================================

export const ScrollAutoHide: Story = {
  name: 'Scroll: auto-hide',
  args: {
    sticky: 'auto-hide',
  },
  render: (args) => (
    <>
      <PageHeader {...args} />
      <PageContent />
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Sticky header die verbergt bij scroll-down en terugkomt bij scroll-up. Scroll omlaag om de header te verbergen; scroll omhoog om hem terug te brengen.',
      },
    },
  },
};

export const ScrollSticky: Story = {
  name: 'Scroll: sticky',
  args: {
    sticky: 'sticky',
  },
  render: (args) => (
    <>
      <PageHeader {...args} />
      <PageContent />
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'De header blijft bovenaan de viewport vastgeplakt bij het scrollen. `position: sticky; inset-block-start: 0`.',
      },
    },
  },
};
