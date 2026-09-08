import React, { useState } from 'react';
import { DocModule } from '../types/doc';
import { MemberCard } from './MemberCard';
import { CodeBlock } from './CodeBlock';
import {
  ShieldCheck,
  ExternalLink,
  Layers,
  Code2,
  Copy,
  Check,
  ArrowLeft,
  Share2,
} from 'lucide-react';

interface ModuleViewProps {
  module: DocModule;
  onBack: () => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({ module, onBack }) => {
  const [copiedImport, setCopiedImport] = useState(false);
  const [importStyle, setImportStyle] = useState<'define' | 'require'>('define');

  const importDefine = `/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['${module.modulePath}'], (${module.slug.split('-').pop()}) => {
    // Write your ${module.modulePath} logic here
});`;

  const importRequire = `const ${module.slug.split('-').pop()} = require('${module.modulePath}');`;

  const activeSnippet = importStyle === 'define' ? importDefine : importRequire;

  const handleCopyImport = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopiedImport(true);
      setTimeout(() => setCopiedImport(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Breadcrumb & Oracle Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Modules
        </button>

        {module.oracleUrl && (
          <a
            href={module.oracleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            Official Oracle Help Topic <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Module Title Header */}
      <div className="border-b border-slate-800 pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-800/60 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> SuiteScript 2.1
          </span>
          <span className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {module.supportedScripts}
          </span>
          <span className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-xs font-mono text-slate-400">
            Category: {module.category}
          </span>
        </div>

        <h1 className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {module.modulePath}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed max-w-4xl">
          {module.summary}
        </p>

        {/* Import Code Box */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Import Syntax
              </span>
              <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px]">
                <button
                  onClick={() => setImportStyle('define')}
                  className={`rounded px-2 py-0.5 font-mono ${
                    importStyle === 'define' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  define (AMD)
                </button>
                <button
                  onClick={() => setImportStyle('require')}
                  className={`rounded px-2 py-0.5 font-mono ${
                    importStyle === 'require' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  require (CJS)
                </button>
              </div>
            </div>

            <button
              onClick={handleCopyImport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              {copiedImport ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-slate-400" />
                  <span>Copy Import</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto">
            <pre>
              <code>{activeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Intro Usage Paragraphs */}
      {module.introParagraphs && module.introParagraphs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Guidelines & Details</h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            {module.introParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      {/* Members & API Explorer */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              API Members & Methods ({module.members.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Callable methods, classes, properties, and enums in {module.modulePath}.
            </p>
          </div>
        </div>

        {module.members.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
            No member table directly extracted. Refer to official Oracle help topic above.
          </div>
        ) : (
          <div className="space-y-3">
            {module.members.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* Code Samples */}
      {module.codeSamples && module.codeSamples.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-purple-400" />
              Verified Code Samples ({module.codeSamples.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production script samples cross-verified with Oracle documentation.
            </p>
          </div>

          <div className="space-y-6">
            {module.codeSamples.map(sample => (
              <div key={sample.id} className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white">{sample.title}</h3>
                <CodeBlock
                  code={sample.code}
                  scriptType={sample.scriptType}
                  provenance={sample.provenance}
                  title={sample.title}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
