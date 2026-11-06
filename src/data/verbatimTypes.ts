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
  q?: string;
  stem?: string;
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
  arTitle?: string;
  text: string;
  optionsRaw: string;
  parsedOptions?: Record<string, Record<'A' | 'B' | 'C', string>>;
  ansBase: string[];
  ansMod1?: string[];
}

export interface Sb2Topic {
  id: string;
  title: string;
  arTitle?: string;
  text: string;
  wordBoxRaw: string;
  parsedWordBox?: Record<string, string>;
  ansBase: string[];
  ansMod1?: string[];
}

export interface WordLookupResult {
  word: string;
  cleanWord: string;
  meaningAr: string;
  category: string;
  grammarTipAr: string;
  contextSentence?: string;
}

export interface SavedWordItem {
  word: string;
  cleanWord: string;
  meaningAr: string;
  category: string;
  grammarTipAr: string;
  contextSentence?: string;
  addedAt: number;
}

export interface MistakeItem {
  id: string;
  moduleType: 'teil1' | 'teil2' | 'teil3' | 'sb1' | 'sb2';
  moduleId: string;
  moduleTitle: string;
  questionNum: number;
  userAnswer: string;
  correctAnswer: string;
  explanationAr: string;
  timestamp: number;
}

export interface AskAiContextItem {
  moduleType: 'teil1' | 'teil2' | 'teil3' | 'sb1' | 'sb2';
  moduleTitle: string;
  itemLabel: string;
  questionNum: number;
  textDe: string;
  correctLetter: string;
  correctTextDe: string;
  tKey?: string;
  hKey?: string;
  arSummary?: string;
  distractors?: { letter: string; text: string }[];
  baseAnswer?: string;
  mod1Answer?: string;
  mod2Answer?: string;
}

export interface VerbatimDatabase {
  pruefungen: PruefungPackage[];
  teil1: Teil1Topic[];
  teil2: Teil2Topic[];
  teil3: Teil3Topic[];
  sb1: Sb1Topic[];
  sb2: Sb2Topic[];
}

function cleanStringGlitches(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]|\uFFFD/g, '')
    .replace(/🔲+/g, '')
    .replace(/\bInsell\b/g, 'Inseln')
    .replace(/Kellner\s*\(\s*Jugend\s+Forscherr\s*\)/gi, 'Kellner (Jugend forscht)')
    .replace(/\bJugend\s+Forscherr\b/gi, 'Jugend forscht');
}

function deduplicateClozeGaps(text: string): string {
  // 1. Fix Liebe Vanessa specific typo: "Du weißt ___21___ selbst" -> "Du weißt ___23___ selbst"
  let fixed = text.replace(/Du\s+weißt\s+_{1,5}\s*21\s*_{1,5}\s+selbst/g, 'Du weißt ___23___ selbst');

  // 2. For any two-part connector where a gap number appears twice (e.g., ___24___ ... ___24___),
  // replace the second occurrence with "..." so every blank 21..30 / 31..40 has a strictly unique ID.
  const seenGaps = new Set<string>();
  fixed = fixed.replace(/_{1,5}\s*(2[1-9]|30|3[1-9]|40)\s*_{1,5}/g, (match, numStr: string) => {
    if (seenGaps.has(numStr)) {
      return '...';
    }
    seenGaps.add(numStr);
    return `___${numStr}___`;
  });

  return fixed;
}

export function sanitizeVerbatimDatabase(input: VerbatimDatabase): VerbatimDatabase {
  const clone: VerbatimDatabase = JSON.parse(JSON.stringify(input));

  clone.pruefungen = clone.pruefungen.map((p) => ({
    ...p,
    title: cleanStringGlitches(p.title),
    arTitle: cleanStringGlitches(p.arTitle),
    badge: cleanStringGlitches(p.badge),
  }));

  clone.teil1 = clone.teil1.map((t) => {
    const headings: Record<string, string> = {};
    for (const [k, v] of Object.entries(t.headings || {})) {
      headings[k] = cleanStringGlitches(v);
    }
    const texts: Record<string, string> = {};
    for (const [k, v] of Object.entries(t.texts || {})) {
      texts[k] = cleanStringGlitches(v);
    }
    const codatTriggers: Record<string, CodatTriggerItem> = {};
    for (const [k, v] of Object.entries(t.codatTriggers || {})) {
      codatTriggers[k] = {
        hKey: cleanStringGlitches(v.hKey),
        tKey: cleanStringGlitches(v.tKey),
        ar: cleanStringGlitches(v.ar),
      };
    }
    return {
      ...t,
      sahlaTitle: cleanStringGlitches(t.sahlaTitle),
      arTitle: cleanStringGlitches(t.arTitle),
      pdfTitle: cleanStringGlitches(t.pdfTitle),
      headings,
      texts,
      codatTriggers: t.codatTriggers ? codatTriggers : undefined,
    };
  });

  clone.teil2 = clone.teil2.map((t) => ({
    ...t,
    title: cleanStringGlitches(t.title),
    arTitle: cleanStringGlitches(t.arTitle),
    article: cleanStringGlitches(t.article),
    questions: (t.questions || []).map((q) => {
      const options: Record<string, string> = {};
      for (const [k, v] of Object.entries(q.options || {})) {
        options[k] = cleanStringGlitches(v);
      }
      return {
        ...q,
        q: q.q ? cleanStringGlitches(q.q) : undefined,
        stem: q.stem ? cleanStringGlitches(q.stem) : undefined,
        options,
        trigger: q.trigger
          ? {
              key: cleanStringGlitches(q.trigger.key),
              ar: cleanStringGlitches(q.trigger.ar),
            }
          : undefined,
      };
    }),
  }));

  clone.teil3 = clone.teil3.map((t) => {
    const ads: Record<string, string> = {};
    for (const [k, v] of Object.entries(t.ads || {})) {
      ads[k] = cleanStringGlitches(v);
    }
    return {
      ...t,
      title: cleanStringGlitches(t.title),
      arTitle: cleanStringGlitches(t.arTitle),
      ads,
      situations: (t.situations || []).map((s) => ({
        ...s,
        text: cleanStringGlitches(s.text),
        trigger: s.trigger
          ? {
              key: cleanStringGlitches(s.trigger.key),
              ar: cleanStringGlitches(s.trigger.ar),
            }
          : undefined,
      })),
    };
  });

  clone.sb1 = clone.sb1.map((s) => ({
    ...s,
    title: cleanStringGlitches(s.title),
    arTitle: s.arTitle ? cleanStringGlitches(s.arTitle) : undefined,
    text: deduplicateClozeGaps(cleanStringGlitches(s.text)),
    optionsRaw: cleanStringGlitches(s.optionsRaw),
  }));

  clone.sb2 = clone.sb2.map((s) => ({
    ...s,
    title: cleanStringGlitches(s.title),
    arTitle: s.arTitle ? cleanStringGlitches(s.arTitle) : undefined,
    text: deduplicateClozeGaps(cleanStringGlitches(s.text)),
    wordBoxRaw: cleanStringGlitches(s.wordBoxRaw),
  }));

  return clone;
}

export const VERBATIM_DB: VerbatimDatabase = sanitizeVerbatimDatabase(
  rawDb as unknown as VerbatimDatabase
);
