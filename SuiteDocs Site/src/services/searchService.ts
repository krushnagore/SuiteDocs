import { docService } from './docService';
import { SearchIndexItem } from '../types/doc';

class SearchService {
  private index: SearchIndexItem[] = [];
  private initialized = false;

  public init(): void {
    if (this.initialized) return;

    const modules = docService.getAllModules();
    const items: SearchIndexItem[] = [];

    // 1. Index Modules
    modules.forEach(mod => {
      items.push({
        id: mod.id,
        title: mod.modulePath,
        kind: 'module',
        url: mod.slug,
        modulePath: mod.modulePath,
        description: mod.summary || `NetSuite ${mod.modulePath} module`,
        governance: mod.supportedScripts
      });

      // 2. Index Members
      mod.members.forEach(mem => {
        items.push({
          id: mem.id,
          title: mem.name,
          kind: mem.kind.toLowerCase() as SearchIndexItem['kind'],
          url: `${mod.slug}#${mem.memberName.toLowerCase()}`,
          modulePath: mod.modulePath,
          description: mem.description || `${mem.kind} in ${mod.modulePath}`,
          governance: mem.governance
        });
      });
    });

    // 3. Index Errors & Tools
    items.push({
      id: 'tool-gov',
      title: 'Governance Units Calculator',
      kind: 'tool',
      url: 'governance',
      description: 'Interactive calculator for estimating script usage limits.'
    });

    items.push({
      id: 'err-usage',
      title: 'SSS_USAGE_LIMIT_EXCEEDED',
      kind: 'error',
      url: 'governance',
      description: 'Fatal error when execution exceeds allotted governance units.'
    });

    this.index = items;
    this.initialized = true;
  }

  public search(rawQuery: string, limit = 15): SearchIndexItem[] {
    this.init();
    const q = rawQuery.trim().toLowerCase();
    if (!q) {
      return this.index.filter(i => ['N/record', 'N/search', 'N/query', 'N/https', 'N/runtime'].includes(i.title)).slice(0, limit);
    }

    const scored: Array<{ item: SearchIndexItem; score: number }> = [];

    for (const item of this.index) {
      let score = 0;
      const t = item.title.toLowerCase();
      const m = (item.modulePath || '').toLowerCase();
      const d = item.description.toLowerCase();

      if (t === q) score += 100;
      else if (t.startsWith(q)) score += 70;
      else if (t.includes(q)) score += 50;

      if (m === q) score += 80;
      else if (m.startsWith(q)) score += 60;
      else if (m.includes(q)) score += 35;

      if (d.includes(q)) score += 15;

      // Subsequence check for typos (e.g. "rec lod" -> record.load)
      const qClean = q.replace(/[._/]/g, ' ');
      const tClean = t.replace(/[._/]/g, ' ');
      const qTokens = qClean.split(/\s+/).filter(Boolean);
      const tTokens = tClean.split(/\s+/).filter(Boolean);

      let matched = 0;
      for (const tok of qTokens) {
        if (tTokens.some(tt => tt.includes(tok) || (tok.length >= 3 && tt.startsWith(tok.slice(0, 3))))) {
          matched++;
        }
      }
      if (matched === qTokens.length && qTokens.length > 1) {
        score += 40;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.item);
  }
}

export const searchService = new SearchService();
