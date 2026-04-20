import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Represents a single tab item in the Tablist.
 */
interface Tab {
  /** Unique identifier for the tab. */
  id: string;
  /** Readable label displayed on the tab button. */
  label: string;
}

/**
 * Props for the Tablist component.
 */
interface TablistProps {
  /** Array of tab configurations. */
  tabs: Tab[];
  /** The ID of the currently active tab (for controlled usage). */
  activeTab?: string;
  /** Callback triggered when a tab is clicked. */
  onTabChange?: (id: string) => void;
  /** Additional styling classes for the container. */
  className?: string;
}

/**
 * A horizontal tab navigation component with underline highlight for the active state.
 * Supports both controlled and uncontrolled usage via `activeTab` and internal state.
 */
export default function Tablist({ tabs, activeTab, onTabChange, className }: TablistProps) {
  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0]?.id);

  const handleTabClick = (id: string) => {
    setCurrentTab(id);
    onTabChange?.(id);
  };

  return (
    <div className={cn("flex border-b border-slate-200", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-all relative",
            currentTab === tab.id 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
