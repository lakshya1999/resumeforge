"use client";

import { createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  active: string;
  onChange: (val: string) => void;
}

const TabsCtx = createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onChange: (val: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsCtx.Provider value={{ active: value, onChange }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-slate-200 px-1", className)}>
      {children}
    </div>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsCtx)!;
  const isActive = ctx.active === value;

  return (
    <button
      onClick={() => ctx.onChange(value)}
      className={cn(
        "px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
        isActive
          ? "border-indigo-600 text-indigo-600"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsCtx)!;
  if (ctx.active !== value) return null;
  return <div className={cn("flex-1", className)}>{children}</div>;
}
