import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TablistProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  className?: string;
}

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
