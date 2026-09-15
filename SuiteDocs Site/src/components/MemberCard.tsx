import React from 'react';
import { ApiMember } from '../types/doc';
import { Zap, AlertTriangle, Hash, ExternalLink, Code2 } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface MemberCardProps {
  member: ApiMember;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const getKindColor = (kind: string) => {
    switch (kind.toLowerCase()) {
      case 'method':
        return 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300';
      case 'property':
        return 'bg-blue-950/70 border-blue-800/80 text-blue-300';
      case 'enum':
        return 'bg-amber-950/70 border-amber-800/80 text-amber-300';
      case 'class':
      case 'object':
        return 'bg-purple-950/70 border-purple-800/80 text-purple-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div
      id={member.memberName.toLowerCase()}
      className="scroll-mt-24 rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 transition hover:border-slate-700 hover:bg-slate-900/70"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`#${member.memberName.toLowerCase()}`}
            className="text-slate-500 hover:text-slate-300 transition"
            title="Anchor link"
          >
            <Hash className="h-3.5 w-3.5" />
          </a>
          <h3 className="font-mono text-sm font-bold text-white tracking-wide">
            {member.name}
          </h3>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getKindColor(member.kind)}`}>
            {member.kind}
          </span>
          {member.deprecated && (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-800/70 bg-rose-950/60 px-2 py-0.5 text-[10px] font-medium text-rose-300">
              <AlertTriangle className="h-3 w-3" /> Deprecated
            </span>
          )}
        </div>

        {member.governance !== '-' && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-800/60 bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            <Zap className="h-3 w-3 text-amber-400" />
            {member.governance}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2.5">
        {member.description && (
          <p className="text-xs leading-relaxed text-slate-300">
            {member.description}
          </p>
        )}

        {member.signature && (
          <div className="rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-300/90 border border-slate-800">
            <span className="text-slate-500 font-sans">// Signature:</span>
            <div className="mt-0.5 overflow-x-auto">{member.signature}</div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-400 pt-1">
          {member.returnType && (
            <div>
              <span className="text-slate-500 font-medium">Returns: </span>
              <code className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-emerald-300">
                {member.returnType}
              </code>
            </div>
          )}
          <div>
            <span className="text-slate-500 font-medium">Supported: </span>
            <span className="text-slate-300">{member.availability}</span>
          </div>
          {member.oracleUrl && (
            <a
              href={member.oracleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 ml-auto"
            >
              Oracle Topic <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>

        {member.codeSnippet && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-emerald-400">
                <Code2 className="h-3.5 w-3.5" />
                Official Code Reference
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Oracle NetSuite Docs</span>
            </div>
            <CodeBlock
              code={member.codeSnippet}
              language="javascript"
              title={member.name}
              provenance="official"
            />
          </div>
        )}
      </div>
    </div>
  );
};
