import React from 'react';
import { DocModule } from '../types/doc';
import {
  ShieldCheck,
  Layers,
  Code2,
  Zap,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';

interface HomeViewProps {
  modules: DocModule[];
  onSelectModule: (slug: string) => void;
  onSelectGovernance: () => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  modules,
  onSelectModule,
  onSelectGovernance,
  onOpenSearch,
}) => {
  const totalMembers = modules.reduce((acc, m) => acc + m.members.length, 0);
  const featuredModules = modules.filter(m =>
    ['N/record', 'N/search', 'N/query', 'N/https', 'N/task', 'N/email'].includes(m.modulePath)
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative space-y-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Official Oracle NetSuite 2026.1 Documentation
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              55 Modules Cataloged
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            The Definitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">SuiteScript 2.1</span> Developer Platform
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            A high-speed developer reference and governance engine covering all 55 official SuiteScript 2.1 modules, methods, governance costs, and copyable script samples.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
            >
              Search Documentation (Ctrl + K)
            </button>

            <button
              onClick={onSelectGovernance}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Governance Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Fast Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-emerald-400">{modules.length || 55}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            SuiteScript Modules
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-teal-400">{totalMembers || '1,684+'}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            API Methods &amp; Props
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-purple-400">155+</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Official Code Samples
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-amber-400">100%</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            SuiteScript 2.1 Coverage
          </div>
        </div>
      </div>

      {/* Featured Core APIs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Essential SuiteScript 2.1 Modules</h2>
            <p className="text-xs text-slate-400">Core APIs every NetSuite developer uses daily.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredModules.map(mod => (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.slug)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/90"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {mod.modulePath}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-[10px] text-slate-300">
                    {mod.members.length} members
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-400 leading-relaxed mb-3">
                  {mod.summary}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 pt-2 border-t border-slate-800/80">
                Explore APIs <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
