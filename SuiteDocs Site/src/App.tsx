import React, { useState, useEffect } from 'react';
import { docService } from './services/docService';
import { DocModule } from './types/doc';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ModuleView } from './components/ModuleView';
import { HomeView } from './views/HomeView';
import { GovernanceView } from './views/GovernanceView';
import { CommandPalette } from './components/CommandPalette';
import { SearchIndexItem } from './types/doc';
import { ShieldCheck, Download } from 'lucide-react';

export const App: React.FC = () => {
  const [modules, setModules] = useState<DocModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'governance' | 'module'>('home');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | undefined>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    docService.init().then(() => {
      setModules(docService.getAllModules());
      setLoading(false);
    });
  }, []);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectModule = (slug: string) => {
    setSelectedModuleSlug(slug);
    setCurrentView('module');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectView = (view: 'home' | 'governance' | 'module', slug?: string) => {
    if (view === 'module' && slug) {
      handleSelectModule(slug);
    } else {
      setCurrentView(view);
      if (view !== 'module') setSelectedModuleSlug(undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCommandPaletteSelect = (item: SearchIndexItem) => {
    if (item.kind === 'tool' || item.url === 'governance') {
      handleSelectView('governance');
    } else {
      const slug = item.url.split('#')[0];
      handleSelectModule(slug);
    }
  };

  const selectedModule = selectedModuleSlug ? docService.getModuleBySlug(selectedModuleSlug) : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onSelectView={handleSelectView}
        currentView={currentView}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Loading 55 SuiteScript 2.1 Modules...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-8">
            <Sidebar
              modules={modules}
              selectedModuleSlug={selectedModuleSlug}
              onSelectModule={handleSelectModule}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            <main className="min-w-0 flex-1">
              {currentView === 'home' && (
                <HomeView
                  modules={modules}
                  onSelectModule={handleSelectModule}
                  onSelectGovernance={() => handleSelectView('governance')}
                  onOpenSearch={() => setSearchOpen(true)}
                />
              )}

              {currentView === 'governance' && <GovernanceView />}

              {currentView === 'module' && selectedModule && (
                <ModuleView
                  module={selectedModule}
                  onBack={() => handleSelectView('home')}
                />
              )}
            </main>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              SuiteDocs NetSuite 2026.1 Reference Platform • Authored by{' '}
              <strong className="text-slate-200">Krushna Gore</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/downloads/SuiteScript_2.1_Modules_Reference.pdf"
              download
              className="hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <Download className="h-3 w-3" /> 321-Page PDF Reference Manual
            </a>
          </div>
        </div>
      </footer>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleCommandPaletteSelect}
      />
    </div>
  );
};
