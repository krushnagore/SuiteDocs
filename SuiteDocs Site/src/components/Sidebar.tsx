import React, { useState } from 'react';
import { DocModule } from '../types/doc';
import { Search, ChevronDown, ChevronRight, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface SidebarProps {
  modules: DocModule[];
  selectedModuleSlug?: string;
  onSelectModule: (slug: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  modules,
  selectedModuleSlug,
  onSelectModule,
  isOpen,
  onClose,
}) => {
  const [filter, setFilter] = useState('');
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  // Group modules by category
  const categories = Array.from(new Set(modules.map(m => m.category))).sort();

  const toggleCat = (cat: string) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredModules = modules.filter(
    m =>
      m.modulePath.toLowerCase().includes(filter.toLowerCase()) ||
      m.summary.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto transition-transform duration-200 lg:static lg:block lg:w-64 lg:p-0 lg:border-0 lg:bg-transparent ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sticky top-20 space-y-4">
          {/* Search filter input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter 55 modules..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>SuiteScript 2.1 Modules</span>
            <span className="font-mono text-emerald-400">{filteredModules.length}</span>
          </div>

          {/* Categorized List */}
          <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {categories.map(cat => {
              const catModules = filteredModules.filter(m => m.category === cat);
              if (catModules.length === 0) return null;
              const isCollapsed = collapsedCats[cat];

              return (
                <div key={cat} className="space-y-1">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between px-2 py-1 text-left text-[11px] font-semibold text-slate-400 hover:text-slate-200"
                  >
                    <span>{cat}</span>
                    {isCollapsed ? (
                      <ChevronRight className="h-3 w-3 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-slate-500" />
                    )}
                  </button>

                  {!isCollapsed && (
                    <ul className="space-y-0.5 pl-1">
                      {catModules.map(mod => {
                        const isSelected = selectedModuleSlug === mod.slug;
                        return (
                          <li key={mod.id}>
                            <button
                              onClick={() => {
                                onSelectModule(mod.slug);
                                onClose();
                              }}
                              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-mono transition ${
                                isSelected
                                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30'
                                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                              }`}
                            >
                              <span className="truncate">{mod.modulePath}</span>
                              <span className="text-[10px] text-slate-500 font-sans shrink-0 ml-1">
                                {mod.members.length}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
