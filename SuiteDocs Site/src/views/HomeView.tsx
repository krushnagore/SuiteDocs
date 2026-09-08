import React from 'react';
import { DocModule } from '../types/doc';
import {
  ShieldCheck,
  Layers,
  Code2,
  Download,
  Zap,
  ArrowRight,
  Database,
  ExternalLink,
  BookOpen,
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
  const featured = modules.filter(m =>
    ['record', 'search', 'query', 'https', 'runtime', 'task', 'ui-serverwidget', 'format'].includes(m.slug)
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Oracle NetSuite 2026.1 / SuiteScript 2.1
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            SuiteDocs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Developer Knowledge & Reference
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            The standalone, high-performance API documentation portal for Oracle NetSuite developers.
            Explore all 55 official SuiteScript 2.1 modules, calculate governance units, and access
            verified code samples and the 321-page reference manual.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
            >
              Search Documentation (Ctrl + K)
            </button>

            <a
              href="/downloads/SuiteScript_2.1_Modules_Reference.pdf"
              download="SuiteScript_2.1_Modules_Reference_Krushna_Gore.pdf"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-700 transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Download 321-Page PDF Manual
            </a>

            <button
              onClick={onSelectGovernance}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Governance Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Author & Verification Bar */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center font-mono font-bold text-emerald-300 shrink-0">
            KG
          </div>
          <div>
            <span className="font-semibold text-white block">Curated by Krushna Gore</span>
            <span className="text-slate-400">NetSuite Solution Architect & SuiteCloud Developer</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Official Oracle Help Source
          </span>
          <span className="text-slate-600">|</span>
          <a
            href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4220488571.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white inline-flex items-center gap-1 transition"
          >
            Oracle Help Catalog <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-emerald-400">55</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Modules
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-cyan-400">1,684+</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            API Methods & Props
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-purple-400">155+</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Official Code Samples
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <div className="font-mono text-3xl font-extrabold text-amber-400">321</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            PDF Reference Pages
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map(mod => (
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

      {/* Deliverable Downloads Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <BookOpen className="h-4 w-4" /> Offline Reference Manual Available
          </div>
          <h3 className="text-xl font-bold text-white">
            SuiteScript 2.1 Modules Reference (321 Pages)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Compiled, formatted, and verified with all 55 modules, methods, parameter tables, and
            official code samples by Krushna Gore. Perfect for offline reference.
          </p>
        </div>

        <a
          href="/downloads/SuiteScript_2.1_Modules_Reference.pdf"
          download="SuiteScript_2.1_Modules_Reference_Krushna_Gore.pdf"
          className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <Download className="h-4 w-4" /> Download PDF (7.35 MB)
        </a>
      </div>
    </div>
  );
};
