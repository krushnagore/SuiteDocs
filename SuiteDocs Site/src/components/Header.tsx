import React, { useState, useEffect } from 'react';
import { Search, Download, Zap, Layers, Menu, RefreshCw, CheckCircle2, Clock, Calendar, HelpCircle, X } from 'lucide-react';

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
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncConfig, setSyncConfig] = useState<any>({
    frequency: 'weekly',
    interval_days: 7,
    day_of_week: 'Sunday',
    time_of_day: '02:00',
    last_status: 'SUCCESS',
    author: 'Krushna Gore',
    last_sync: '2026-09-09T03:00:00Z',
    next_scheduled_sync: '2026-09-13T02:00:00Z'
  });

  useEffect(() => {
    fetch('./data/sync_config.json')
      .then(res => res.json())
      .then(data => setSyncConfig(data))
      .catch(() => {});
  }, []);

  return (
    <>
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

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Auto-Sync Badge & Modal Trigger */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm"
              title="Click to view and configure automated documentation update schedule"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              <span className="capitalize">Auto-Sync: {syncConfig.frequency || 'Weekly'}</span>
            </button>

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

            {/* Download 321-page PDF Button */}
            <a
              href="./downloads/SuiteScript_2.1_Modules_Reference.pdf"
              download="SuiteScript_2.1_Modules_Reference.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition shadow-sm shadow-emerald-500/10"
              title="Download complete 321-page PDF Reference Manual"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">321-Page</span> PDF
            </a>

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

      {/* Auto-Sync Schedule Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Automated Documentation Updater</h3>
                  <p className="text-xs text-slate-400">Oracle NetSuite Documentation Synchronization Pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Current Update Frequency
                  </div>
                  <div className="font-semibold text-emerald-400 capitalize">
                    {syncConfig.frequency || 'Weekly'} ({syncConfig.interval_days || 7} Days)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    Preferred Run Time
                  </div>
                  <div className="font-medium text-slate-200">
                    {syncConfig.day_of_week || 'Sunday'} at {syncConfig.time_of_day || '02:00'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                    Pipeline Status
                  </div>
                  <div className="font-medium text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {syncConfig.last_status || 'SUCCESS'} (55 Modules)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                    Author / Architect
                  </div>
                  <div className="font-medium text-slate-200">
                    {syncConfig.author || 'Krushna Gore'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-200 mb-1.5 flex items-center gap-2">
                  <span>How to change update frequency:</span>
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  The document updater runs automatically on schedule. You can adjust the frequency at any time using terminal commands or by editing <code className="text-emerald-400">sync_config.json</code>:
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                    <span className="text-emerald-400"># Set to Daily updates:</span><br/>
                    update_frequency.bat daily
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                    <span className="text-emerald-400"># Set to Weekly updates (Default):</span><br/>
                    update_frequency.bat weekly
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                    <span className="text-emerald-400"># Set to Custom interval (e.g., every 3 days):</span><br/>
                    update_frequency.bat 3
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                    <span className="text-emerald-400"># Run sync immediately on-demand:</span><br/>
                    update_frequency.bat --run-now
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSyncModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
