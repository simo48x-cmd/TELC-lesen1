import rawDb from '../verbatim_db.json';

export type ExamVariant = 'base' | 'mod1' | 'mod2';
export type SubViewMode = 'verbatim' | 'matrix' | 'drill';
export type MainTabId = 'pruefungen' | 'teil1' | 'teil2' | 'teil3' | 'sb1' | 'sb2' | 'radar';

export interface PruefungPackage {
  id: string;
  title: string;
  arTitle: string;
  modCount: number;
  t1: string;
  t2: string;
  t2_alt?: string;
  t3: string;
  t3_alt?: string;
  sb1: string;
  sb1_alt?: string;
  sb2: string;
  sb2_alt?: string;
  badge: string;
}

export interface CodatTriggerItem {
  hKey: string;
  tKey: string;
  ar: string;
}

export interface Teil1Topic {
  id: string;
  sahlaTitle: string;
  arTitle: string;
  pdfTitle: string;
  ansBase: string[];
  ansMod1?: string[];
  ansMod2?: string[];
  variantsCount?: number;
  headings: Record<string, string>;
  texts: Record<string, string>;
  codatTriggers?: Record<string, CodatTriggerItem>;
}

export interface Teil2QuestionTrigger {
  key: string;
  ar: string;
}

export interface Teil2Question {
  num: number;
  q: string;
  options: Record<string, string>;
  correctBase: string;
  correctMod?: string;
  trigger?: Teil2QuestionTrigger;
}

export interface Teil2Topic {
  id: string;
  title: string;
  arTitle: string;
  ansBase: string[];
  ansMod1?: string[];
  article: string;
  questions: Teil2Question[];
}

export interface Teil3Situation {
  num: number;
  text: string;
  correctBase: string;
  correctMod?: string;
  correctMod2?: string;
  trigger?: {
    key: string;
    ar: string;
  };
}

export interface Teil3Topic {
  id: string;
  title: string;
  arTitle: string;
  ansBase: string[];
  ansMod1?: string[];
  ansMod2?: string[];
  situations: Teil3Situation[];
  ads: Record<string, string>;
}

export interface Sb1Topic {
  id: string;
  title: string;
  text: string;
  optionsRaw: string;
  ansBase: string[];
  ansMod1?: string[];
}

export interface Sb2Topic {
  id: string;
  title: string;
  text: string;
  wordBoxRaw: string;
  ansBase: string[];
  ansMod1?: string[];
}

export interface VerbatimDatabase {
  pruefungen: PruefungPackage[];
  teil1: Teil1Topic[];
  teil2: Teil2Topic[];
  teil3: Teil3Topic[];
  sb1: Sb1Topic[];
  sb2: Sb2Topic[];
}

export const VERBATIM_DB: VerbatimDatabase = rawDb as unknown as VerbatimDatabase;
