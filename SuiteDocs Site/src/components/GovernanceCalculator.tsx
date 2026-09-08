import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Operation {
  id: string;
  name: string;
  module: string;
  cost: number;
  qty: number;
}

const SCRIPT_LIMITS: Record<string, number> = {
  'User Event': 1000,
  'Client Script': 1000,
  'Suitelet': 5000,
  'RESTlet': 5000,
  'Scheduled Script': 10000,
  'Map/Reduce (GetInput)': 10000,
  'Map/Reduce (Map)': 1000,
  'Map/Reduce (Reduce)': 1000,
  'Workflow Action': 1000,
  'Mass Update': 1000,
  'Portlet': 1000,
};

const DEFAULT_OPERATIONS: Operation[] = [
  { id: 'rec_load', name: 'record.load(options)', module: 'N/record', cost: 10, qty: 1 },
  { id: 'rec_save', name: 'record.save(options)', module: 'N/record', cost: 20, qty: 1 },
  { id: 'rec_submit', name: 'record.submitFields(options)', module: 'N/record', cost: 5, qty: 0 },
  { id: 'rec_create', name: 'record.create(options)', module: 'N/record', cost: 5, qty: 0 },
  { id: 'search_run', name: 'search.run() / getRange()', module: 'N/search', cost: 10, qty: 1 },
  { id: 'query_run', name: 'query.runSuiteQL(options)', module: 'N/query', cost: 10, qty: 0 },
  { id: 'https_req', name: 'https.get / https.post', module: 'N/https', cost: 10, qty: 0 },
  { id: 'task_create', name: 'task.create (trigger M/R)', module: 'N/task', cost: 20, qty: 0 },
  { id: 'file_load', name: 'file.load(options)', module: 'N/file', cost: 10, qty: 0 },
  { id: 'email_send', name: 'email.send(options)', module: 'N/email', cost: 10, qty: 0 },
];

export const GovernanceCalculator: React.FC = () => {
  const [scriptType, setScriptType] = useState<string>('User Event');
  const [operations, setOperations] = useState<Operation[]>(DEFAULT_OPERATIONS);

  const totalCost = operations.reduce((sum, op) => sum + op.cost * op.qty, 0);
  const maxLimit = SCRIPT_LIMITS[scriptType] || 1000;
  const remaining = maxLimit - totalCost;
  const usagePercentage = Math.min(Math.round((totalCost / maxLimit) * 100), 100);

  const handleQtyChange = (id: string, newQty: number) => {
    setOperations(prev =>
      prev.map(op => (op.id === id ? { ...op, qty: Math.max(0, newQty) } : op))
    );
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            Interactive Governance Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate operational loops to monitor computing usage and prevent SSS_USAGE_LIMIT_EXCEEDED.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Script Type:</span>
          <select
            value={scriptType}
            onChange={e => setScriptType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white outline-none focus:border-emerald-500"
          >
            {Object.keys(SCRIPT_LIMITS).map(st => (
              <option key={st} value={st}>
                {st} ({SCRIPT_LIMITS[st]} units)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Consumption: {totalCost} / {maxLimit} Units
          </span>
          <span
            className={`font-mono font-bold ${
              remaining < 0 ? 'text-rose-400' : remaining < 200 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {remaining >= 0 ? `${remaining} Units Left` : `${Math.abs(remaining)} Units OVER LIMIT`}
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              remaining < 0 ? 'bg-rose-500' : usagePercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        {remaining < 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              <strong>OVER BUDGET:</strong> Execution will throw SSS_USAGE_LIMIT_EXCEEDED! Consider refactoring to a <strong>Map/Reduce Script</strong> or using <strong>record.submitFields()</strong>.
            </span>
          </div>
        )}
      </div>

      {/* Operations list */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {operations.map(op => (
          <div
            key={op.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-xs"
          >
            <div>
              <span className="font-mono font-semibold text-white block">{op.name}</span>
              <span className="text-[11px] text-slate-400">{op.module} • {op.cost} units each</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300 w-12 text-right">
                {op.cost * op.qty} u
              </span>
              <input
                type="number"
                min="0"
                value={op.qty}
                onChange={e => handleQtyChange(op.id, parseInt(e.target.value) || 0)}
                className="w-16 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
