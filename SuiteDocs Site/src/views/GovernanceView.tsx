import React from 'react';
import { GovernanceCalculator } from '../components/GovernanceCalculator';
import { Zap, ShieldCheck, AlertOctagon } from 'lucide-react';

export const GovernanceView: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="border-b border-slate-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <Zap className="h-4 w-4" /> SuiteScript 2.1 Governance Architecture
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          NetSuite Governance & Resource Limits
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          NetSuite enforces governance unit limits to preserve multi-tenant stability. Each script
          type has a strict synchronous allowance. Exceeding your budget terminates script execution
          with a fatal <code className="text-rose-300 font-mono">SSS_USAGE_LIMIT_EXCEEDED</code> exception.
        </p>
      </div>

      {/* Script Type Allowances Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Standard Governance Allowances</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-mono uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Script Type</th>
                <th className="px-5 py-3.5">Allotted Governance</th>
                <th className="px-5 py-3.5">Execution Model</th>
                <th className="px-5 py-3.5">Recommended Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              <tr>
                <td className="px-5 py-3 font-semibold text-white">User Event Script</td>
                <td className="px-5 py-3 font-mono font-bold text-amber-400">1,000 units</td>
                <td className="px-5 py-3">Synchronous (Before Load, Before Submit, After Submit)</td>
                <td className="px-5 py-3">Record validation, defaulting field values, audit triggers</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-white">Client Script</td>
                <td className="px-5 py-3 font-mono font-bold text-amber-400">1,000 units</td>
                <td className="px-5 py-3">Client browser event-driven</td>
                <td className="px-5 py-3">Field change alerts, line validation, UI toggles</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-white">Suitelet</td>
                <td className="px-5 py-3 font-mono font-bold text-amber-400">5,000 units</td>
                <td className="px-5 py-3">Synchronous HTTP Request/Response</td>
                <td className="px-5 py-3">Custom UI forms, reports, webhooks, portals</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-white">RESTlet</td>
                <td className="px-5 py-3 font-mono font-bold text-amber-400">5,000 units</td>
                <td className="px-5 py-3">Synchronous REST API calls</td>
                <td className="px-5 py-3">External system integrations, mobile apps</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-white">Scheduled Script</td>
                <td className="px-5 py-3 font-mono font-bold text-amber-400">10,000 units</td>
                <td className="px-5 py-3">Asynchronous background single-thread</td>
                <td className="px-5 py-3">Legacy periodic batch updates</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-white">Map/Reduce Script</td>
                <td className="px-5 py-3 font-mono font-bold text-emerald-400">10,000 + auto-yield</td>
                <td className="px-5 py-3">Multi-threaded parallel queues</td>
                <td className="px-5 py-3">High-volume transactional batches & data migrations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Calculator */}
      <GovernanceCalculator />
    </div>
  );
};
