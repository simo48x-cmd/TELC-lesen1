import {
  ExamVariant,
  PruefungPackage,
  Sb1Topic,
  Sb2Topic,
  Teil1Topic,
  Teil2Topic,
  Teil3Topic,
  VERBATIM_DB,
} from '../data/verbatimTypes';

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export interface SpeedDrillItem {
  id: string;
  label: string;
  promptDe: string;
  hintAr: string;
  motCleDe: string;
  correctText: string;
  correctLetter: string;
  choices: string[]; // 4 verbatim German choices WITHOUT A-J / A-C letters
}

export interface RadarRow {
  moduleType: 'pruefung' | 'teil1' | 'teil2' | 'teil3' | 'sb1' | 'sb2';
  moduleBadge: string;
  id: string;
  titleDe: string;
  titleAr: string;
  codeBase: string;
  codeMod1: string;
  codeMod2: string;
  keywordsSample: string;
  linkedInfo?: string;
}

export function getTeil1AnswerKey(topic: Teil1Topic, variant: ExamVariant): string[] {
  if (variant === 'mod2' && topic.ansMod2 && topic.ansMod2.length > 0) {
    return topic.ansMod2;
  }
  if ((variant === 'mod1' || variant === 'mod2') && topic.ansMod1 && topic.ansMod1.length > 0) {
    return topic.ansMod1;
  }
  return topic.ansBase;
}

export function getTeil2AnswerKey(topic: Teil2Topic, variant: ExamVariant): string[] {
  if ((variant === 'mod1' || variant === 'mod2') && topic.ansMod1 && topic.ansMod1.length > 0) {
    return topic.ansMod1;
  }
  return topic.ansBase;
}

export function getTeil3AnswerKey(topic: Teil3Topic, variant: ExamVariant): string[] {
  if (variant === 'mod2' && topic.ansMod2 && topic.ansMod2.length > 0) {
    return topic.ansMod2;
  }
  if ((variant === 'mod1' || variant === 'mod2') && topic.ansMod1 && topic.ansMod1.length > 0) {
    return topic.ansMod1;
  }
  return topic.ansBase;
}

export function getSb1AnswerKey(topic: Sb1Topic, variant: ExamVariant): string[] {
  if ((variant === 'mod1' || variant === 'mod2') && topic.ansMod1 && topic.ansMod1.length > 0) {
    return topic.ansMod1;
  }
  return topic.ansBase;
}

export function getSb2AnswerKey(topic: Sb2Topic, variant: ExamVariant): string[] {
  if ((variant === 'mod1' || variant === 'mod2') && topic.ansMod1 && topic.ansMod1.length > 0) {
    return topic.ansMod1;
  }
  return topic.ansBase;
}

export function formatCodeCompact(ans?: string[], prefixStart?: number): string {
  if (!ans || ans.length === 0) return '—';
  if (prefixStart !== undefined) {
    return ans.map((letter, idx) => `${prefixStart + idx}:${letter}`).join(' · ');
  }
  return ans.join(' - ');
}

/**
 * Parses SB1 `optionsRaw` and `parsedOptions` into per-gap (21..30) A/B/C option labels while keeping
 * full compatibility with both 3-row table format and pipe-separated format.
 */
export function parseSb1Options(
  raw: string,
  ansBase?: string[],
  parsedOptions?: Record<string, Record<'A' | 'B' | 'C', string>>
): Record<number, Record<'A' | 'B' | 'C', string>> {
  const map: Record<number, Record<'A' | 'B' | 'C', string>> = {};
  for (let i = 21; i <= 30; i++) {
    const fromJson = parsedOptions?.[String(i)];
    map[i] = {
      A: fromJson?.A || 'A',
      B: fromJson?.B || 'B',
      C: fromJson?.C || 'C',
    };
  }
  if (!raw) return map;

  // Handle single-line pipe format e.g. "21 B lassen | 22 B weil | ..."
  if (!raw.includes('\n') && raw.includes('|')) {
    const parts = raw.split('|').map((s) => s.trim());
    for (const part of parts) {
      const m = part.match(/^(2[1-9]|30)\s+([ABC])\s+(.+)$/);
      if (m) {
        const num = parseInt(m[1], 10);
        const letter = m[2] as 'A' | 'B' | 'C';
        const word = m[3].trim();
        if (!parsedOptions?.[String(num)]) {
          map[num] = {
            A: letter === 'A' ? word : 'Option A',
            B: letter === 'B' ? word : 'Option B',
            C: letter === 'C' ? word : 'Option C',
          };
        } else {
          map[num][letter] = word;
        }
      }
    }
    return map;
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let activeNums: number[] = [];

  for (const line of lines) {
    const numMatches = [...line.matchAll(/\b(2[1-9]|30)\s+A\s+/g)];
    if (numMatches.length > 0) {
      activeNums = numMatches.map((m) => parseInt(m[1], 10));
      for (let idx = 0; idx < numMatches.length; idx++) {
        const start = (numMatches[idx].index ?? 0) + numMatches[idx][0].length;
        const end = idx + 1 < numMatches.length ? (numMatches[idx + 1].index ?? line.length) : line.length;
        const num = activeNums[idx];
        const val = line.slice(start, end).trim();
        if (map[num] && val) {
          map[num].A = val;
        }
      }
    } else if (activeNums.length > 0 && /^[BC]\s+/.test(line)) {
      const letter = line[0] as 'B' | 'C';
      const parts = line
        .split(new RegExp(`\\b${letter}\\s+`))
        .slice(1)
        .map((s) => s.trim());
      for (let idx = 0; idx < Math.min(activeNums.length, parts.length); idx++) {
        const num = activeNums[idx];
        if (map[num] && parts[idx]) {
          map[num][letter] = parts[idx];
        }
      }
    }
  }

  // Ensure if ansBase has a known letter, it at least shows the letter if empty
  if (ansBase) {
    ansBase.forEach((ans, idx) => {
      const num = 21 + idx;
      const l = ans as 'A' | 'B' | 'C';
      if (map[num] && !map[num][l]) {
        map[num][l] = l;
      }
    });
  }

  return map;
}

/**
 * Parses SB2 `wordBoxRaw` and `parsedWordBox` into a map of A..O -> German word/phrase.
 */
export function parseSb2WordBox(
  raw: string,
  parsedWordBox?: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = { ...(parsedWordBox || {}) };
  if (Object.keys(result).length >= 12) return result;
  if (!raw) return result;

  if (raw.includes('|')) {
    const segments = raw.split('|').map((s) => s.trim());
    for (const seg of segments) {
      const m = seg.match(/^([A-O])\s+(.+)$/);
      if (m) {
        result[m[1]] = m[2].trim();
      }
    }
    if (Object.keys(result).length > 0) return result;
  }

  const regex = /\b([A-O])\s+([A-ZÄÖÜßa-zäöü/\-….\s]+?)(?=\s*\|\s*|\s+\b[A-O]\s+|\r?\n|$)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    result[m[1]] = m[2].trim();
  }
  return result;
}


const GERMAN_STOPWORDS = new Set([
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einen',
  'einem',
  'einer',
  'und',
  'oder',
  'aber',
  'für',
  'mit',
  'von',
  'auf',
  'aus',
  'bei',
  'nach',
  'über',
  'unter',
  'vor',
  'zwischen',
  'durch',
  'gegen',
  'ohne',
  'um',
  'als',
  'wie',
  'wenn',
  'weil',
  'dass',
  'ob',
  'sich',
  'sind',
  'ist',
  'war',
  'wird',
  'werden',
  'wurde',
  'hat',
  'haben',
  'kann',
  'können',
  'muss',
  'müssen',
  'soll',
  'sollen',
  'wollen',
  'möchten',
  'möchte',
  'sie',
  'ihr',
  'ihre',
  'ihren',
  'ihrem',
  'ihrer',
  'wir',
  'uns',
  'auch',
  'noch',
  'nur',
  'schon',
  'sehr',
  'mehr',
  'viele',
  'alle',
  'alles',
  'immer',
  'wieder',
  'nicht',
  'kein',
  'keine',
  'keinen',
  'zum',
  'zur',
  'vom',
  'beim',
  'im',
  'in',
  'an',
  'zu',
  'so',
  'es',
  'er',
]);

/**
 * Extracts clean German keywords/phrases from a trigger string (e.g. "hKey", "tKey", "trigger.key")
 * so they can be highlighted in bright yellow inside the verbatim German text.
 */
export function extractGermanKeywords(rawTrigger?: string | string[]): string[] {
  if (!rawTrigger) return [];
  const list = Array.isArray(rawTrigger) ? rawTrigger : [rawTrigger];
  const keywords = new Set<string>();

  for (const item of list) {
    if (!item) continue;
    // Remove parenthetical notes and split on +, /, ,, =, →, ;, |
    const cleaned = item.replace(/\([^)]*\)/g, ' ');
    const chunks = cleaned
      .split(/[+/=→;|,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length >= 3);

    for (const chunk of chunks) {
      keywords.add(chunk);
      // Also add individual meaningful words >= 4 chars so inflected or separated forms highlight reliably
      const words = chunk
        .split(/\s+/)
        .map((w) => w.replace(/^[.,!?;:"'«»„“”]+|[.,!?;:"'«»„“”]+$/g, ''))
        .filter((w) => w.length >= 4 && !GERMAN_STOPWORDS.has(w.toLowerCase()));
      for (const w of words) {
        keywords.add(w);
      }
    }
  }

  return Array.from(keywords).sort((a, b) => b.length - a.length);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits a verbatim German text into segments, marking matches of `keywords` as `highlighted: true`.
 * Preserves 100% of the original characters in `text` without altering a single letter!
 */
export function splitTextWithHighlights(text: string, keywords: string[]): HighlightSegment[] {
  if (!text) return [];
  const validKeywords = keywords.map((k) => k.trim()).filter((k) => k.length >= 3);
  if (validKeywords.length === 0) {
    return [{ text, highlighted: false }];
  }

  // Sort longest first to match phrases before single words
  const sorted = Array.from(new Set(validKeywords)).sort((a, b) => b.length - a.length);
  const pattern = sorted.map(escapeRegExp).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  const parts = text.split(regex);
  const result: HighlightSegment[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    // In String.prototype.split with a single capturing group, odd indices are matches
    result.push({
      text: part,
      highlighted: i % 2 === 1,
    });
  }
  return result;
}

/**
 * Automatically derives a smart Mot-Clé trigger for Teil 3 situations (11..20)
 * by finding key German nouns/terms in the situation and matching Anzeige (A..L or X).
 */
export function getTeil3SituationHelper(
  topic: Teil3Topic,
  sitIndex: number,
  variant: ExamVariant
): {
  correctLetter: string;
  adText: string;
  sKey: string;
  adKey: string;
  arHint: string;
} {
  const sit = topic.situations[sitIndex];
  const ansKey = getTeil3AnswerKey(topic, variant);
  const correctLetter = ansKey[sitIndex] || sit?.correctBase || 'X';
  const adText = correctLetter !== 'X' ? topic.ads[correctLetter] || '' : '';

  if (!sit) {
    return {
      correctLetter,
      adText,
      sKey: '',
      adKey: '',
      arHint: '',
    };
  }

  if (sit.trigger) {
    return {
      correctLetter,
      adText,
      sKey: sit.trigger.key,
      adKey: sit.trigger.key,
      arHint: sit.trigger.ar,
    };
  }

  // Extract capitalized German nouns / key words from situation
  const sitWords = sit.text
    .replace(/[.,!?;:()"'«»„“”]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !GERMAN_STOPWORDS.has(w.toLowerCase()));

  const sitNouns = sitWords.filter((w, idx) => idx > 0 && /^[A-ZÄÖÜ]/.test(w));
  const chosenSitKeys = (sitNouns.length >= 2 ? sitNouns.slice(0, 3) : sitWords.slice(0, 3)).join(' + ');

  if (correctLetter === 'X') {
    return {
      correctLetter: 'X',
      adText: 'X — لا يوجد أي إعلان مناسب لهذه الوضعية (Kein passender Text)',
      sKey: chosenSitKeys,
      adKey: 'X (لا يوجد إعلان)',
      arHint: `رد بالك! فهاد الوضعية (${chosenSitKeys}) ما كاين حتى إعلان كيوفر هاد الشرط بالضبط، إذن الجواب الصحيح هو X.`,
    };
  }

  // Find shared stem words or prominent words in the matching Anzeige
  const adWords = adText
    .replace(/[.,!?;:()"'«»„“”]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !GERMAN_STOPWORDS.has(w.toLowerCase()));

  const shared = adWords.filter((aw) =>
    sitWords.some((sw) => {
      const aLow = aw.toLowerCase();
      const sLow = sw.toLowerCase();
      return aLow === sLow || (aLow.length >= 5 && sLow.length >= 5 && aLow.slice(0, 5) === sLow.slice(0, 5));
    })
  );

  const uniqueShared = Array.from(new Set(shared)).slice(0, 3);
  const firstLineAd = adText.split(/\r?\n/)[0]?.trim() || '';
  const adKey = uniqueShared.length > 0 ? uniqueShared.join(' + ') : firstLineAd.slice(0, 45);

  return {
    correctLetter,
    adText,
    sKey: chosenSitKeys,
    adKey,
    arHint: `الربط المباشر: منين تقشع فالسؤال (${chosenSitKeys}) غادي تلقى فالإعلان (${correctLetter}) الكلمة المفتاحية (${adKey}).`,
  };
}

export interface PruefungScoreBreakdown {
  t1Score: number; // max 25 (5 * 5)
  t2Score: number; // max 25 (5 * 5)
  t3Score: number; // max 25 (10 * 2.5)
  sb1Score: number; // max 15 (10 * 1.5)
  sb2Score: number; // max 15 (10 * 1.5)
  totalScore: number; // max 105
  maxScore: 105;
  passed: boolean; // >= 63 (60%)
  percentage: number;
}

export function calculatePruefungScore(params: {
  t1User: Record<number, string>;
  t1Correct: string[];
  t2User: Record<number, string>;
  t2Correct: string[];
  t3User: Record<number, string>;
  t3Correct: string[];
  sb1User: Record<number, string>;
  sb1Correct: string[];
  sb2User: Record<number, string>;
  sb2Correct: string[];
}): PruefungScoreBreakdown {
  let t1Score = 0;
  for (let i = 0; i < 5; i++) {
    if (params.t1User[i + 1] && params.t1User[i + 1] === params.t1Correct[i]) {
      t1Score += 5;
    }
  }

  let t2Score = 0;
  for (let i = 0; i < 5; i++) {
    if (params.t2User[i + 6] && params.t2User[i + 6] === params.t2Correct[i]) {
      t2Score += 5;
    }
  }

  let t3Score = 0;
  for (let i = 0; i < 10; i++) {
    if (params.t3User[i + 11] && params.t3User[i + 11] === params.t3Correct[i]) {
      t3Score += 2.5;
    }
  }

  let sb1Score = 0;
  for (let i = 0; i < 10; i++) {
    if (params.sb1User[i + 21] && params.sb1User[i + 21] === params.sb1Correct[i]) {
      sb1Score += 1.5;
    }
  }

  let sb2Score = 0;
  for (let i = 0; i < 10; i++) {
    if (params.sb2User[i + 31] && params.sb2User[i + 31] === params.sb2Correct[i]) {
      sb2Score += 1.5;
    }
  }

  const totalScore = Number((t1Score + t2Score + t3Score + sb1Score + sb2Score).toFixed(1));
  const percentage = Math.round((totalScore / 105) * 100);
  return {
    t1Score,
    t2Score,
    t3Score,
    sb1Score,
    sb2Score,
    totalScore,
    maxScore: 105,
    passed: totalScore >= 63,
    percentage,
  };
}

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates Speed-Drill Active Recall items (Sub-View 3) where choices are
 * verbatim German headings/options WITHOUT their letters (A-J / A-C) so the user
 * memorizes the German text + Mot-Clé rather than just letters.
 */
export function buildTeil1SpeedDrill(topic: Teil1Topic, variant: ExamVariant): SpeedDrillItem[] {
  const ansKey = getTeil1AnswerKey(topic, variant);
  const allHeadingLetters = Object.keys(topic.headings);

  return [1, 2, 3, 4, 5].map((num, idx) => {
    const correctLetter = ansKey[idx] || 'A';
    const correctText = topic.headings[correctLetter] || '';
    const trig = topic.codatTriggers?.[String(num)];

    const distractorLetters = allHeadingLetters.filter((l) => l !== correctLetter);
    const pickedDistractors = deterministicShuffle(distractorLetters, num * 37 + topic.id.length)
      .slice(0, 3)
      .map((l) => topic.headings[l]);

    const choices = deterministicShuffle([correctText, ...pickedDistractors], num * 73 + idx);

    return {
      id: `${topic.id}-t1-${num}`,
      label: `Text ${num}`,
      promptDe: topic.texts[String(num)] || '',
      hintAr: trig?.ar || `النص رقم ${num} من موضوع ${topic.arTitle || topic.sahlaTitle}`,
      motCleDe: trig ? `${trig.tKey} ➔ ${trig.hKey}` : '',
      correctText,
      correctLetter,
      choices,
    };
  });
}

export function buildTeil2SpeedDrill(topic: Teil2Topic, variant: ExamVariant): SpeedDrillItem[] {
  const ansKey = getTeil2AnswerKey(topic, variant);

  return topic.questions.map((q, idx) => {
    const correctLetter = ansKey[idx] || q.correctBase || 'A';
    const correctText = q.options[correctLetter] || '';
    const otherTexts = Object.entries(q.options)
      .filter(([l]) => l !== correctLetter)
      .map(([, val]) => val);

    const choices = deterministicShuffle([correctText, ...otherTexts], q.num * 53 + idx);

    return {
      id: `${topic.id}-t2-${q.num}`,
      label: `Frage ${q.num}`,
      promptDe: q.stem || q.q || '',
      hintAr: q.trigger?.ar || `السؤال ${q.num} من موضوع ${topic.arTitle || topic.title}`,
      motCleDe: q.trigger?.key || '',
      correctText,
      correctLetter,
      choices,
    };
  });
}

export function buildTeil3SpeedDrill(topic: Teil3Topic, variant: ExamVariant): SpeedDrillItem[] {
  const adEntries = Object.entries(topic.ads);

  return topic.situations.map((sit, idx) => {
    const helper = getTeil3SituationHelper(topic, idx, variant);
    const correctLetter = helper.correctLetter;
    const correctText =
      correctLetter === 'X'
        ? 'Kein passender Text (X — لا يوجد أي إعلان مناسب لهذه الوضعية)'
        : (topic.ads[correctLetter] || '').split(/\r?\n/).slice(0, 2).join(' — ');

    const distractorAds = adEntries
      .filter(([l]) => l !== correctLetter)
      .map(([, txt]) => txt.split(/\r?\n/).slice(0, 2).join(' — '));

    const pickedDistractors = deterministicShuffle(distractorAds, sit.num * 41 + idx).slice(0, 2);
    if (correctLetter !== 'X') {
      pickedDistractors.push('Kein passender Text (X — لا يوجد أي إعلان مناسب لهذه الوضعية)');
    } else if (distractorAds[2]) {
      pickedDistractors.push(distractorAds[2]);
    }

    const choices = deterministicShuffle([correctText, ...pickedDistractors.slice(0, 3)], sit.num * 89 + idx);

    return {
      id: `${topic.id}-t3-${sit.num}`,
      label: `Situation ${sit.num}`,
      promptDe: sit.text,
      hintAr: helper.arHint,
      motCleDe: `${helper.sKey} ➔ ${helper.adKey}`,
      correctText,
      correctLetter,
      choices,
    };
  });
}

/**
 *Builds the full 210-module Radar index and filters by query string.
 */
export function searchRadarModules(query: string): RadarRow[] {
  const rows: RadarRow[] = [];

  for (const p of VERBATIM_DB.pruefungen) {
    const t1 = VERBATIM_DB.teil1.find((x) => x.id === p.t1);
    const t2 = VERBATIM_DB.teil2.find((x) => x.id === p.t2);
    const t3 = VERBATIM_DB.teil3.find((x) => x.id === p.t3);
    const sb1 = VERBATIM_DB.sb1.find((x) => x.id === p.sb1);
    const sb2 = VERBATIM_DB.sb2.find((x) => x.id === p.sb2);

    rows.push({
      moduleType: 'pruefung',
      moduleBadge: '📖 Prüfung 90m',
      id: p.id,
      titleDe: p.title,
      titleAr: p.arTitle,
      codeBase: [
        `T1: ${t1 ? t1.ansBase.join('') : '—'}`,
        `T2: ${t2 ? t2.ansBase.join('') : '—'}`,
        `T3: ${t3 ? t3.ansBase.join('') : '—'}`,
      ].join(' | '),
      codeMod1: [
        t1?.ansMod1 ? `T1: ${t1.ansMod1.join('')}` : '',
        t2?.ansMod1 ? `T2: ${t2.ansMod1.join('')}` : '',
        t3?.ansMod1 ? `T3: ${t3.ansMod1.join('')}` : '',
      ]
        .filter(Boolean)
        .join(' | ') || '—',
      codeMod2: [
        t1?.ansMod2 ? `T1: ${t1.ansMod2.join('')}` : '',
        t3?.ansMod2 ? `T3: ${t3.ansMod2.join('')}` : '',
      ]
        .filter(Boolean)
        .join(' | ') || '—',
      keywordsSample: `${p.badge} • SB1: ${sb1?.title || p.sb1} • SB2: ${sb2?.title || p.sb2}`,
      linkedInfo: `T1: ${t1?.sahlaTitle || p.t1} | T2: ${t2?.title || p.t2} | T3: ${t3?.title || p.t3}`,
    });
  }

  for (const t1 of VERBATIM_DB.teil1) {
    const trigKeys = Object.values(t1.codatTriggers || {})
      .map((c) => `${c.tKey} / ${c.hKey}`)
      .slice(0, 3)
      .join(' • ');
    rows.push({
      moduleType: 'teil1',
      moduleBadge: '📄 Lesen Teil 1',
      id: t1.id,
      titleDe: `${t1.sahlaTitle} (${t1.pdfTitle})`,
      titleAr: t1.arTitle,
      codeBase: t1.ansBase.join(' - '),
      codeMod1: t1.ansMod1 ? t1.ansMod1.join(' - ') : '—',
      codeMod2: t1.ansMod2 ? t1.ansMod2.join(' - ') : '—',
      keywordsSample: trigKeys,
    });
  }

  for (const t2 of VERBATIM_DB.teil2) {
    const trigKeys = t2.questions
      .map((q) => q.trigger?.key || '')
      .filter(Boolean)
      .slice(0, 3)
      .join(' • ');
    rows.push({
      moduleType: 'teil2',
      moduleBadge: '📑 Lesen Teil 2',
      id: t2.id,
      titleDe: t2.title,
      titleAr: t2.arTitle,
      codeBase: t2.ansBase.join(' - '),
      codeMod1: t2.ansMod1 ? t2.ansMod1.join(' - ') : '—',
      codeMod2: '—',
      keywordsSample: trigKeys,
    });
  }

  for (const t3 of VERBATIM_DB.teil3) {
    rows.push({
      moduleType: 'teil3',
      moduleBadge: '📰 Lesen Teil 3',
      id: t3.id,
      titleDe: t3.title,
      titleAr: t3.arTitle,
      codeBase: t3.ansBase.join(' - '),
      codeMod1: t3.ansMod1 ? t3.ansMod1.join(' - ') : '—',
      codeMod2: t3.ansMod2 ? t3.ansMod2.join(' - ') : '—',
      keywordsSample: t3.situations
        .slice(0, 2)
        .map((s) => s.text.slice(0, 45))
        .join(' • '),
    });
  }

  for (const s1 of VERBATIM_DB.sb1) {
    rows.push({
      moduleType: 'sb1',
      moduleBadge: '🧩 Sprach 1',
      id: s1.id,
      titleDe: s1.title,
      titleAr: 'Sprachbausteine Teil 1 (21–30)',
      codeBase: s1.ansBase.join(' - '),
      codeMod1: s1.ansMod1 ? s1.ansMod1.join(' - ') : '—',
      codeMod2: '—',
      keywordsSample: s1.text.slice(0, 70),
    });
  }

  for (const s2 of VERBATIM_DB.sb2) {
    rows.push({
      moduleType: 'sb2',
      moduleBadge: '🔤 Sprach 2',
      id: s2.id,
      titleDe: s2.title,
      titleAr: 'Sprachbausteine Teil 2 (31–40)',
      codeBase: s2.ansBase.join(' - '),
      codeMod1: s2.ansMod1 ? s2.ansMod1.join(' - ') : '—',
      codeMod2: '—',
      keywordsSample: s2.wordBoxRaw.replace(/\r?\n/g, ' ').slice(0, 75),
    });
  }

  const q = query.trim().toLowerCase();
  if (!q) return rows;

  const qCompact = q.replace(/[\s\-·|]+/g, '');
  return rows.filter((r) => {
    const hay = `${r.id} ${r.titleDe} ${r.titleAr} ${r.codeBase} ${r.codeMod1} ${r.codeMod2} ${r.keywordsSample} ${r.linkedInfo || ''}`.toLowerCase();
    const hayCompact = hay.replace(/[\s\-·|]+/g, '');
    return hay.includes(q) || hayCompact.includes(qCompact);
  });
}

export function findPruefungById(id: string): PruefungPackage | undefined {
  return VERBATIM_DB.pruefungen.find((p) => p.id === id);
}
