import React from 'react';
import { Search, Zap, Layers, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onSelectView: (view: 'home' | 'governance' | 'module', slug?: string) => void;
  currentView: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onSelectView,
  currentView,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo / Brand */}
          <button
            onClick={() => onSelectView('home')}
            className="flex items-center gap-2.5 text-left transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md shadow-emerald-500/20">
              <span className="font-mono text-base font-extrabold text-slate-950">SD</span>
            </div>
            <div>
              <span className="font-mono text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                SuiteDocs
                <span className="rounded bg-emerald-950 border border-emerald-800/80 px-1.5 py-0.2 font-sans text-[10px] font-semibold text-emerald-300">
                  2.1
                </span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                by Krushna Gore
              </span>
            </div>
          </button>
        </div>

        {/* Center Search Shortcut */}
        <div className="hidden sm:block flex-1 max-w-md mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition shadow-inner"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              Search N/record, record.load, governance...
            </span>
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectView('home')}
            className={`hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              currentView === 'home' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Modules
          </button>

          <button
            onClick={() => onSelectView('governance')}
            className={`hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              currentView === 'governance' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Governance
          </button>

          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
