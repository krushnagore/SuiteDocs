import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Clock, Calendar, HelpCircle, X, Terminal, Shield } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
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
    if (isOpen) {
      fetch('./data/sync_config.json')
        .then(res => res.json())
        .then(data => setSyncConfig(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Documentation Auto-Sync Privilege</h3>
                <span className="rounded bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
                  Privileged
                </span>
              </div>
              <p className="text-xs text-slate-400">Oracle NetSuite Documentation Synchronization Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Active Frequency
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
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>How to adjust schedule frequency:</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              You can adjust the frequency at any time using terminal commands or editing <code className="text-emerald-400">sync_config.json</code>:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                <span className="text-emerald-400"># Change to Daily updates:</span><br/>
                update_frequency.bat daily
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                <span className="text-emerald-400"># Change to Weekly updates (Default):</span><br/>
                update_frequency.bat weekly
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                <span className="text-emerald-400"># Change to Custom interval (e.g. every 3 days):</span><br/>
                update_frequency.bat 3
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                <span className="text-emerald-400"># Trigger immediate manual sync:</span><br/>
                update_frequency.bat --run-now
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-400">
            💡 <strong>Quick Access Hint:</strong> You can open this privileged settings dialog anytime by pressing <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px] text-slate-300">Ctrl + Shift + S</kbd> or typing <span className="text-emerald-400 font-mono">sync</span> in the Command Palette (<kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px] text-slate-300">Ctrl + K</kbd>).
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
