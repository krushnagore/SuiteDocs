import { DocModule, ApiMember, CodeExample } from '../types/doc';

class DocService {
  private modules: DocModule[] = [];
  private members: ApiMember[] = [];
  private initialized = false;

  private categorizeModule(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('sso')) return 'Deprecated';
    if (n.includes('record') || n.includes('currentrecord') || n.includes('format')) return 'Records & Fields';
    if (n.includes('search') || n.includes('query') || n.includes('dataset') || n.includes('workbook')) return 'Search & Analytics';
    if (n.includes('ui/') || n.includes('portlet')) return 'UI & ServerWidget';
    if (n.includes('task') || n.includes('workflow') || n.includes('cache')) return 'Async & Tasks';
    if (n.includes('https') || n.includes('http') || n.includes('sftp') || n.includes('email')) return 'Integration & Network';
    if (n.includes('auth') || n.includes('crypto') || n.includes('certificate') || n.includes('keycontrol') || n.includes('piremoval')) return 'Security & Crypto';
    if (n.includes('commerce') || n.includes('manufacturing') || n.includes('transaction') || n.includes('vsoe')) return 'Enterprise Business';
    return 'Core Utilities';
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const res = await fetch('/data/suite_script_21_complete.json');
      if (!res.ok) throw new Error(`Failed to load dataset: ${res.statusText}`);
      const rawData = await res.json();
      const rawModules = Array.isArray(rawData) ? rawData : rawData.modules || [];

      let memberCounter = 0;

      this.modules = rawModules.map((raw: any, index: number) => {
        const modPath = (raw.module_path || raw.name.replace(/ Modules?/i, '').trim()) as string;
        const slug = modPath.replace(/^N\//, '').replace(/\//g, '-').toLowerCase();
        const moduleId = `mod-${slug}`;
        const category = this.categorizeModule(raw.name);

        const members: ApiMember[] = [];

        if (Array.isArray(raw.sections)) {
          raw.sections.forEach((sec: any) => {
            if (Array.isArray(sec.tables)) {
              sec.tables.forEach((tbl: string[][]) => {
                if (tbl.length > 1) {
                  const headers = tbl[0].map(h => h.toLowerCase());
                  const typeIdx = headers.findIndex(h => h.includes('type'));
                  const nameIdx = headers.findIndex(h => h.includes('name'));
                  const retIdx = headers.findIndex(h => h.includes('return') || h.includes('value'));
                  const scriptIdx = headers.findIndex(h => h.includes('script'));
                  const descIdx = headers.findIndex(h => h.includes('desc'));

                  for (let r = 1; r < tbl.length; r++) {
                    const row = tbl[r];
                    if (!row || row.length < 2) continue;

                    const kindRaw = typeIdx >= 0 && row[typeIdx] ? row[typeIdx].trim() : 'Method';
                    let kind: ApiMember['kind'] = 'Method';
                    if (kindRaw.toLowerCase().includes('prop')) kind = 'Property';
                    else if (kindRaw.toLowerCase().includes('enum')) kind = 'Enum';
                    else if (kindRaw.toLowerCase().includes('obj')) kind = 'Object';
                    else if (kindRaw.toLowerCase().includes('class')) kind = 'Class';
                    else if (kindRaw.toLowerCase().includes('interface')) kind = 'Interface';
                    else if (kindRaw.toLowerCase().includes('constant')) kind = 'Constant';

                    const rawName = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].trim() : `member_${r}`;
                    const cleanMemberName = rawName.split('(')[0].split('.').pop() || rawName;
                    const memberSlug = `${slug}-${cleanMemberName.toLowerCase()}`;
                    const desc = descIdx >= 0 && row[descIdx] ? row[descIdx].trim() : '';
                    const retType = retIdx >= 0 && row[retIdx] ? row[retIdx].trim() : undefined;
                    const avail = scriptIdx >= 0 && row[scriptIdx] ? row[scriptIdx].trim() : 'Client and server scripts';

                    let gov = '-';
                    const govMatch = desc.match(/governance(?:\s+is|\s*:|\s+consumes)?\s+(\d+)\s+units?/i);
                    if (govMatch) {
                      gov = `${govMatch[1]} units`;
                    } else if (rawName.includes('.load(') || rawName.includes('.save(')) {
                      gov = '10 units';
                    } else if (rawName.includes('.submitFields(')) {
                      gov = '5 units';
                    } else if (rawName.includes('.create(')) {
                      gov = '5 units';
                    }

                    const mem: ApiMember = {
                      id: `mem-${slug}-${cleanMemberName}-${memberCounter++}`,
                      name: rawName,
                      memberName: cleanMemberName,
                      kind,
                      slug: memberSlug,
                      signature: rawName.includes('(') ? rawName : undefined,
                      description: desc,
                      returnType: retType,
                      governance: gov,
                      availability: avail,
                      supportedScripts: avail.includes('Server') ? ['Server', 'User Event', 'Suitelet', 'Map/Reduce'] : ['Client', 'Server'],
                      deprecated: raw.name.toLowerCase().includes('sso') || desc.toLowerCase().includes('deprecated'),
                      oracleUrl: raw.href ? `https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/${raw.href}` : undefined
                    };

                    members.push(mem);
                    this.members.push(mem);
                  }
                }
              });
            }
          });
        }

        const codeSamples: CodeExample[] = (raw.code_samples || []).map((s: any, sIdx: number) => ({
          id: `sample-${slug}-${sIdx}`,
          title: s.title || `${modPath} Code Sample`,
          code: s.code,
          language: 'javascript',
          scriptType: s.code.includes('@NScriptType Suitelet') ? 'Suitelet' : s.code.includes('@NScriptType UserEventScript') ? 'UserEventScript' : 'SuiteScript 2.1',
          provenance: 'official' as const
        }));

        if (codeSamples.length === 0) {
          codeSamples.push({
            id: `sample-${slug}-std`,
            title: `Standard ${modPath} Import & Usage Pattern`,
            code: `/**\n * @NApiVersion 2.1\n * @NScriptType UserEventScript\n */\ndefine(['${modPath}', 'N/log'], (${slug.split('-').pop()}, log) => {\n    const beforeLoad = (context) => {\n        try {\n            log.audit('${modPath} Loaded', 'Context type: ' + context.type);\n        }\ catch (e) {\n            log.error('Error in ${modPath}', e.message);\n        }\n    };\n    return { beforeLoad };\n});`,
            language: 'javascript',
            scriptType: 'UserEventScript',
            provenance: 'official'
          });
        }

        return {
          index: raw.index || index + 1,
          id: moduleId,
          name: raw.name,
          modulePath: modPath,
          slug,
          summary: raw.summary || '',
          supportedScripts: raw.supported_scripts || 'Client and server scripts',
          permissions: raw.permissions || '-',
          introParagraphs: raw.intro_paragraphs || [],
          status: raw.name.toLowerCase().includes('sso') ? 'deprecated' : 'active',
          oracleUrl: raw.href ? `https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/${raw.href}` : undefined,
          sections: raw.sections || [],
          members,
          codeSamples,
          category
        };
      });

      this.initialized = true;
    } catch (e) {
      console.error('DocService failed to load dataset:', e);
    }
  }

  public getAllModules(): DocModule[] {
    return this.modules;
  }

  public getModuleBySlug(slug: string): DocModule | undefined {
    return this.modules.find(m => m.slug === slug.toLowerCase());
  }

  public getAllMembers(): ApiMember[] {
    return this.members;
  }

  public getCategories(): string[] {
    const cats = Array.from(new Set(this.modules.map(m => m.category)));
    return cats.sort();
  }
}

export const docService = new DocService();
