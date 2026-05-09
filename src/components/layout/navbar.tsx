"use client";

import { useResume } from "@/lib/resume-store";
import { cn } from "@/lib/utils";
import { FileText, Target, Eye } from "lucide-react";

const TABS = [
  { id: "builder", label: "Builder", icon: FileText },
  { id: "jd", label: "JD Analysis", icon: Target },
  { id: "preview", label: "Preview", icon: Eye },
];

export function Navbar() {
  const { activeTab, setActiveTab } = useResume();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-6 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-black">RF</span>
        </div>
        <span className="text-sm font-bold text-slate-900">ResumeForge</span>
        <span className="text-xs text-slate-400 font-normal ml-1 hidden sm:block">for Product Designers</span>
      </div>

      {/* Tab nav */}
      <nav className="flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right: variant badge */}
      <div className="ml-auto">
        <VariantBadge />
      </div>
    </header>
  );
}

function VariantBadge() {
  const { resume } = useResume();
  const labels = { startup: "🚀 Startup", bigtech: "🏢 Big Tech", international: "🌍 International" };
  return (
    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
      {labels[resume.variant]}
    </span>
  );
}
