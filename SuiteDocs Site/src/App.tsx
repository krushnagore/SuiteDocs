import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import React, { useState, useEffect } from 'react';
import { docService } from './services/docService';
import { DocModule } from './types/doc';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ModuleView } from './components/ModuleView';
import { HomeView } from './views/HomeView';
import { GovernanceView } from './views/GovernanceView';
import { CommandPalette } from './components/CommandPalette';
import { SyncModal } from './components/SyncModal';
import { SearchIndexItem } from './types/doc';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [modules, setModules] = useState<DocModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'governance' | 'module'>('home');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | undefined>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  useEffect(() => {
    docService.init().then(() => {
      setModules(docService.getAllModules());
      setLoading(false);
    });
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K for search, Ctrl+Shift+S for sync privilege)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setSyncModalOpen(prev => !prev);
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
    if (item.url === 'admin-sync') {
      setSyncModalOpen(true);
    } else if (item.kind === 'tool' || item.url === 'governance') {
      handleSelectView('governance');
    } else {
      const slug = item.url.split('#')[0];
      handleSelectModule(slug);
    }
  };

  const selectedModule = modules.find(m => m.slug === selectedModuleSlug);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header (Clean UI: no visible auto-sync button, no PDF download button) */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onSelectView={handleSelectView}
        currentView={currentView}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      {/* Main Content Area */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Left Sidebar */}
        <Sidebar
          modules={modules}
          selectedModuleSlug={selectedModuleSlug}
          onSelectModule={handleSelectModule}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center Main View */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <span className="text-xs font-mono">Loading SuiteScript 2.1 documentation database...</span>
              </div>
            </div>
          ) : currentView === 'governance' ? (
            <GovernanceView />
          ) : currentView === 'module' && selectedModule ? (
            <ModuleView module={selectedModule} onBack={() => handleSelectView('home')} />
          ) : (
            <HomeView
              modules={modules}
              onSelectModule={handleSelectModule}
              onSelectGovernance={() => handleSelectView('governance')}
              onOpenSearch={() => setSearchOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              SuiteDocs NetSuite 2026.1 Reference Platform • Authored by{' '}
              <strong className="text-slate-200">Krushna Gore</strong>
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">
            SuiteScript 2.1 Verified Reference Manual
          </div>
        </div>
      </footer>

      {/* Command Palette Modal (Ctrl + K) */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleCommandPaletteSelect}
      />

      {/* Privileged Sync & Schedule Settings Modal (Ctrl + Shift + S or via Search) */}
      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />

      {/* Vercel Analytics Tracker */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
};
