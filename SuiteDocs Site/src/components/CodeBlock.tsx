import React, { useState } from 'react';
import { Copy, Check, Code2, ShieldCheck } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  title?: string;
  scriptType?: string;
  provenance?: 'official' | 'platform' | 'community';
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  title,
  scriptType,
  provenance = 'official',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl overflow-hidden text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] font-semibold text-slate-300">
            {title || 'SuiteScript 2.1 Code Sample'}
          </span>
          {scriptType && (
            <span className="rounded bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 text-[10px] font-medium text-blue-300">
              {scriptType}
            </span>
          )}
          {provenance === 'official' && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              <ShieldCheck className="h-3 w-3" /> Official Sample
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-200/95">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
