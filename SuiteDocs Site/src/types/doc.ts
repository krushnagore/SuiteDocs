export interface ApiMember {
  id: string;
  name: string;
  memberName: string;
  kind: 'Method' | 'Property' | 'Enum' | 'Object' | 'Class' | 'Interface' | 'Constant';
  slug: string;
  signature?: string;
  description: string;
  returnType?: string;
  governance: string;
  availability: string;
  supportedScripts: string[];
  deprecated: boolean;
  deprecatedMessage?: string;
  oracleUrl?: string;
}

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  language: string;
  scriptType?: string;
  provenance: 'official' | 'platform' | 'community';
}

export interface DocSection {
  title: string;
  paragraphs: string[];
  tables: string[][][];
}

export interface DocModule {
  index: number;
  id: string;
  name: string;
  modulePath: string;
  slug: string;
  summary: string;
  supportedScripts: string;
  permissions: string;
  introParagraphs: string[];
  status: 'active' | 'deprecated' | 'beta';
  oracleUrl?: string;
  sections?: DocSection[];
  members: ApiMember[];
  codeSamples: CodeExample[];
  category: string;
}

export interface SearchIndexItem {
  id: string;
  title: string;
  kind: 'module' | 'method' | 'property' | 'enum' | 'error' | 'tool';
  url: string;
  modulePath?: string;
  description: string;
  governance?: string;
  score?: number;
}
