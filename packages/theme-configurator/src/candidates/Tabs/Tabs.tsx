import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './tabs.css';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Names the tab list, for example "Onderdelen". */
  label: string;
  /** The selected tab, for a controlled Tabs. */
  selectedId?: string;
  /** The tab selected first, for an uncontrolled Tabs. */
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Switches between panels that share one place, following the WAI-ARIA tabs
 * pattern: one tab in the tab order, arrow keys move and select (automatic
 * activation), Home and End go to the first and last tab. Every panel stays
 * mounted, so its state survives a switch.
 *
 * Candidate component: see README.md.
 */
export function Tabs({
  tabs,
  label,
  selectedId,
  defaultSelectedId,
  onSelect,
  className,
}: TabsProps) {
  const baseId = useId();
  const [ownSelected, setOwnSelected] = useState(
    defaultSelectedId ?? tabs[0]?.id
  );
  const selected = selectedId ?? ownSelected;
  const tabElementsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  function select(id: string, focus = false) {
    setOwnSelected(id);
    onSelect?.(id);
    if (focus) tabElementsRef.current[id]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = tabs.findIndex((tab) => tab.id === selected);
    const last = tabs.length - 1;
    const next: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    select(tabs[next[event.key]].id, true);
  }

  return (
    <div className={classNames('dsn-tabs', className)}>
      <div className="dsn-tabs__list" role="tablist" aria-label={label}>
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabElementsRef.current[tab.id] = element;
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              className="dsn-tabs__tab"
              aria-selected={isSelected}
              aria-controls={panelId(tab.id)}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={panelId(tab.id)}
          className="dsn-tabs__panel"
          aria-labelledby={tabId(tab.id)}
          tabIndex={0}
          hidden={tab.id !== selected}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
