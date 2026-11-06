import {
  PRUEFUNGEN_PACKAGES,
  TEIL1_TOPICS,
  TEIL2_TOPICS,
  TEIL3_TOPICS,
  SPRACHBAUSTEINE_TOPICS,
  PruefungPackage,
  Teil1Topic,
  Teil2Topic,
  Teil3Topic,
  SprachbausteinTopic,
} from '../data/lesenData';

export interface PruefungScoreBreakdown {
  teil1Points: number; // max 25 (5 * 5)
  teil2Points: number; // max 25 (5 * 5)
  teil3Points: number; // max 25 (10 * 2.5)
  sb1Points: number;   // max 15 (10 * 1.5)
  sb2Points: number;   // max 15 (10 * 1.5)
  totalPoints: number; // max 105
  maxPoints: number;   // 105
  percentage: number;
  passed: boolean;     // >= 63 (60%)
}

export function calculatePruefungScore(params: {
  teil1CorrectCount: number;
  teil2CorrectCount: number;
  teil3CorrectCount: number;
  sb1CorrectCount: number;
  sb2CorrectCount: number;
}): PruefungScoreBreakdown {
  const teil1Points = Math.min(5, Math.max(0, params.teil1CorrectCount)) * 5;
  const teil2Points = Math.min(5, Math.max(0, params.teil2CorrectCount)) * 5;
  const teil3Points = Math.min(10, Math.max(0, params.teil3CorrectCount)) * 2.5;
  const sb1Points = Math.min(10, Math.max(0, params.sb1CorrectCount)) * 1.5;
  const sb2Points = Math.min(10, Math.max(0, params.sb2CorrectCount)) * 1.5;

  const totalPoints = Number((teil1Points + teil2Points + teil3Points + sb1Points + sb2Points).toFixed(1));
  const maxPoints = 105;
  const percentage = Math.round((totalPoints / maxPoints) * 100);
  const passed = totalPoints >= 63;

  return {
    teil1Points,
    teil2Points,
    teil3Points,
    sb1Points,
    sb2Points,
    totalPoints,
    maxPoints,
    percentage,
    passed,
  };
}

export function resolveVariantAnswer<T extends string>(
  map: Record<string, T>,
  activeVariant: string
): T {
  return map[activeVariant] ?? map.original;
}

export interface RadarSearchResult {
  packages: PruefungPackage[];
  teil1Matches: Teil1Topic[];
  teil2Matches: Teil2Topic[];
  teil3Matches: Teil3Topic[];
  sbMatches: SprachbausteinTopic[];
}

export function searchExamRadar(rawQuery: string): RadarSearchResult {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return {
      packages: PRUEFUNGEN_PACKAGES,
      teil1Matches: TEIL1_TOPICS.slice(0, 8),
      teil2Matches: TEIL2_TOPICS.slice(0, 8),
      teil3Matches: TEIL3_TOPICS.slice(0, 8),
      sbMatches: SPRACHBAUSTEINE_TOPICS,
    };
  }

  const packages = PRUEFUNGEN_PACKAGES.filter((p) => {
    const haystack = [
      p.id,
      p.nameDe,
      p.nameAr,
      p.badge,
      p.teil1Summary,
      p.teil2Summary,
      p.teil3Summary,
      p.sb1Title,
      p.sb2Title,
      p.examNotesAr,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  const teil1Matches = TEIL1_TOPICS.filter((t) => {
    const codes = t.variants.map((v) => v.code).join(' ');
    const itemsText = t.items
      .map((i) => `${i.headingGerman} ${i.headingArabic} ${i.motCleHeading} ${i.motCleText} ${i.germanParagraph}`)
      .join(' ');
    const haystack = `${t.titleDe} ${t.titleAr} ${codes} ${t.memoryStoryAr} ${itemsText}`.toLowerCase();
    return haystack.includes(q);
  });

  const teil2Matches = TEIL2_TOPICS.filter((t) => {
    const codes = t.variants.map((v) => v.code).join(' ');
    const qText = t.questions
      .map((qu) => `${qu.questionDe} ${qu.questionAr} ${qu.motCleDe} ${qu.motCleAr} ${qu.modAlertAr || ''}`)
      .join(' ');
    const haystack = `${t.titleDe} ${t.titleAr} ${t.linkedWith} ${codes} ${qText}`.toLowerCase();
    return haystack.includes(q);
  });

  const teil3Matches = TEIL3_TOPICS.filter((t) => {
    const codes = t.variants.map((v) => v.code).join(' ');
    const sText = t.situations
      .map((s) => `${s.situationDe} ${s.situationAr} ${s.motCleSituation} ${s.motCleAnzeige}`)
      .join(' ');
    const haystack = `${t.titleDe} ${t.titleAr} ${t.linkedWith} ${codes} ${sText}`.toLowerCase();
    return haystack.includes(q);
  });

  const sbMatches = SPRACHBAUSTEINE_TOPICS.filter((s) => {
    const haystack = `${s.titleDe} ${s.titleAr} ${s.codeSummary}`.toLowerCase();
    return haystack.includes(q);
  });

  // Also link packages if a sub-topic matched
  const matchedT1Ids = new Set(teil1Matches.map((t) => t.id));
  const matchedT2Ids = new Set(teil2Matches.map((t) => t.id));
  const matchedT3Ids = new Set(teil3Matches.map((t) => t.id));

  const linkedPackages = PRUEFUNGEN_PACKAGES.filter(
    (p) =>
      packages.some((pk) => pk.id === p.id) ||
      matchedT1Ids.has(p.teil1Id) ||
      matchedT2Ids.has(p.teil2Id) ||
      matchedT3Ids.has(p.teil3Id)
  );

  return {
    packages: linkedPackages,
    teil1Matches,
    teil2Matches,
    teil3Matches,
    sbMatches,
  };
}

export function deterministicPermute<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export interface TextSegment {
  text: string;
  highlighted: boolean;
}

export function splitTextByKeywords(text: string, rawKeywords: string[]): TextSegment[] {
  if (!text) return [];
  const tokens = Array.from(
    new Set(
      rawKeywords
        .flatMap((kw) => kw.split(/[/,;()]+/))
        .map((s) => s.trim())
        .filter((s) => s.length >= 3)
    )
  ).sort((a, b) => b.length - a.length);

  if (tokens.length === 0) {
    return [{ text, highlighted: false }];
  }

  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((p) => p.length > 0)
    .map((part) => {
      const isMatch = tokens.some((tok) => tok.toLowerCase() === part.toLowerCase());
      return { text: part, highlighted: isMatch };
    });
}
