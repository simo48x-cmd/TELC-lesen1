import { AskAiContextItem, SavedWordItem, VERBATIM_DB, WordLookupResult } from '../data/verbatimTypes';

export type { WordLookupResult };

export const DEFAULT_SAVED_WORDS: SavedWordItem[] = [
  {
    word: 'obwohl',
    cleanWord: 'obwohl',
    meaningAr: 'رغم أن (التناقض)',
    category: 'رابط تناقض (Konzessivsatz)',
    grammarTipAr: 'كتربط جملتين فيهم تناقض، والفعل كيمشي لآخر الجملة (Nebensatz).',
    contextSentence: 'Obwohl das Wetter schlecht war, fuhren wir auf die Insel.',
    addedAt: 1700000000000,
  },
  {
    word: 'zur Verfügung stehen',
    cleanWord: 'Verfügung',
    meaningAr: 'تصرف / إتاحة (zur Verfügung stehen / stellen)',
    category: 'Nomen-Verb-Verbindung (B2)',
    grammarTipAr: 'تركيبة ذهبية فـ Sprachbausteine: zur Verfügung stehen (متاح) / zur Verfügung stellen (يوفر).',
    contextSentence: 'Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.',
    addedAt: 1700000001000,
  },
  {
    word: 'kostenlos',
    cleanWord: 'kostenlos',
    meaningAr: 'مجاني / بدون مقابل',
    category: 'صفة (Adjektiv)',
    grammarTipAr: 'موكلي ذهبي فـ Lesen Teil 3: كيطابق gratis أو gebührenfrei أو ohne Kosten!',
    contextSentence: 'Die Teilnahme am Infoabend ist für alle Besucher kostenlos.',
    addedAt: 1700000002000,
  },
];

// ============================================================================
// 1. REAL LIVE GERMAN -> ARABIC TRANSLATION ENGINE (100% Free, Zero API Key)
//    Uses Google Translate GTX free public endpoint + MyMemory fallback +
//    localStorage persistent cache + local B2 dictionary & database fallback
// ============================================================================

const TRANSLATION_CACHE_KEY = 'sahla_translation_cache_v4';
let externalTranslationUnreachable = false;

const translationCache: Record<string, string> = (() => {
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return {};
})();

function persistTranslationCache() {
  try {
    const keys = Object.keys(translationCache);
    if (keys.length > 1500) {
      const trimmed: Record<string, string> = {};
      for (const k of keys.slice(keys.length - 1000)) {
        trimmed[k] = translationCache[k];
      }
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
    }
  } catch {
    // ignore quota errors
  }
}

export function sanitizeUtf8Text(input: string): string {
  if (!input) return '';
  return input.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]|\uFFFD/g, '');
}

export function safeSliceText(input: string, maxChars: number): string {
  const clean = sanitizeUtf8Text(input).trim();
  const chars = Array.from(clean);
  if (chars.length <= maxChars) return clean;
  const sliced = chars.slice(0, maxChars).join('');
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.6) {
    return `${sliced.slice(0, lastSpace)}...`;
  }
  return `${sliced}...`;
}

function buildOfflineArabicTranslation(normalized: string): string {
  const singleClean = cleanGermanToken(normalized).toLowerCase();
  if (B2_DICTIONARY[singleClean]) {
    return B2_DICTIONARY[singleClean].ar;
  }

  // Check de-inflected stem for single word
  if (!normalized.includes(' ')) {
    const stem = singleClean.replace(/(?:en|ern|eln|est|ten|tet|te|st|er|es|em|e|n|s)$/, '');
    if (stem.length >= 3 && B2_DICTIONARY[stem]) {
      return B2_DICTIONARY[stem].ar;
    }
    for (const [k, v] of Object.entries(B2_DICTIONARY)) {
      if (k.length >= 4 && singleClean.includes(k)) {
        return v.ar;
      }
    }
    for (const rule of SUFFIX_RULES) {
      if (singleClean.endsWith(rule.suffix)) {
        return `${rule.meaningHint} (${normalized})`;
      }
    }
    return `مفردة ألمانية في سياق B2 (${normalized})`;
  }

  // Check if this sentence/paragraph matches a curated Teil 1 or Teil 2 text/heading in VERBATIM_DB
  const lowerNorm = normalized.toLowerCase();
  for (const t1 of VERBATIM_DB.teil1) {
    for (const [num, txt] of Object.entries(t1.texts)) {
      if (txt && (txt.toLowerCase().includes(lowerNorm.slice(0, 45)) || lowerNorm.includes(txt.toLowerCase().slice(0, 45)))) {
        const trig = t1.codatTriggers?.[num];
        if (trig?.ar) {
          return `${trig.ar} (المفتاح: ${trig.tKey} ➔ ${trig.hKey})`;
        }
      }
    }
    for (const [letKey, hTxt] of Object.entries(t1.headings)) {
      if (hTxt && hTxt.toLowerCase() === lowerNorm) {
        const idx = t1.ansBase.indexOf(letKey);
        const trig = idx >= 0 ? t1.codatTriggers?.[String(idx + 1)] : undefined;
        if (trig?.ar) {
          return `العنوان (${letKey}): ${trig.ar}`;
        }
      }
    }
  }

  for (const t2 of VERBATIM_DB.teil2) {
    if (t2.article && lowerNorm.length > 40 && t2.article.toLowerCase().includes(lowerNorm.slice(0, 40))) {
      const summaries = t2.questions
        .map((q) => (q.trigger?.ar ? `• س${q.num}: ${q.trigger.ar}` : ''))
        .filter(Boolean)
        .join(' | ');
      if (summaries) return `${t2.arTitle}: ${summaries}`;
    }
    for (const q of t2.questions) {
      const stem = (q.stem || q.q || '').toLowerCase();
      if (stem && lowerNorm.includes(stem.slice(0, 25)) && q.trigger?.ar) {
        return q.trigger.ar;
      }
    }
  }

  // Word-by-word offline synthesis
  const tokens = normalized.split(/\s+/);
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const tk of tokens) {
    const cl = cleanGermanToken(tk).toLowerCase();
    if (cl.length < 2 || seen.has(cl)) continue;
    const entry = B2_DICTIONARY[cl] || B2_DICTIONARY[cl.replace(/(?:en|er|es|em|e|n|s)$/, '')];
    if (entry) {
      seen.add(cl);
      parts.push(`${cleanGermanToken(tk)}: ${entry.ar.split(' / ')[0]}`);
    }
  }
  if (parts.length > 0) {
    return `ترجمة المفردات الأساسية في العبارة: ${parts.slice(0, 8).join(' • ')}`;
  }

  return `عبارة ألمانية من نص الامتحان (${safeSliceText(normalized, 60)})`;
}

export async function translateDeToAr(text: string): Promise<string> {
  const normalized = sanitizeUtf8Text(text)
    .replace(/_{2,4}\s*(\d+)\s*_{2,4}/g, '($1)')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return '';

  if (translationCache[normalized]) {
    return translationCache[normalized];
  }

  const isLocalhostPreview =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (!externalTranslationUnreachable && !isLocalhostPreview) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=ar&dt=t&q=${encodeURIComponent(
        normalized
      )}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = sanitizeUtf8Text(
            data[0]
              .map((part: unknown) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
              .join('')
              .trim()
          );
          if (translated) {
            translationCache[normalized] = translated;
            persistTranslationCache();
            return translated;
          }
        }
      }
    } catch {
      // Fallback to MyMemory below
    }

    try {
      const res2 = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(normalized)}&langpair=de|ar`
      );
      if (res2.ok) {
        const data2 = await res2.json();
        const translated2 = sanitizeUtf8Text(data2?.responseData?.translatedText || '').trim();
        if (translated2 && !translated2.includes('MYMEMORY WARNING')) {
          translationCache[normalized] = translated2;
          persistTranslationCache();
          return translated2;
        }
      }
    } catch {
      externalTranslationUnreachable = true;
    }
  }

  const offlineTranslated = buildOfflineArabicTranslation(normalized);
  translationCache[normalized] = offlineTranslated;
  return offlineTranslated;
}

// ============================================================================
// 2. CURATED HIGH-FREQUENCY TELC B2 GERMAN-ARABIC DICTIONARY & GRAMMAR ENGINE
// ============================================================================

interface DictEntry {
  ar: string;
  cat: string;
  tipAr: string;
}

export const B2_DICTIONARY: Record<string, DictEntry> = {
  // Connectors & Konjunktionen (Sprachbausteine 1 & 2 Core)
  obwohl: {
    ar: 'رغم أن (التناقض)',
    cat: 'رابط تناقض (Konzessivsatz)',
    tipAr: 'كتربط جملتين فيهم تناقض، والفعل كيمشي لآخر الجملة (Nebensatz).',
  },
  trotzdem: {
    ar: 'رغم ذلك / ومع ذلك',
    cat: 'ظرف ربط (Konjunktionaladverb)',
    tipAr: 'كتعبر على التناقض ولكن كيجي موراها الفعل مباشرة فالمرتبة الثانية (Position 2).',
  },
  dennoch: {
    ar: 'ومع ذلك / بالرغم من ذلك',
    cat: 'ظرف ربط (B2 Konnektor)',
    tipAr: 'مرادف قوي لـ trotzdem فمستوى B2، كيجي موراه الفعل مباشرة.',
  },
  weil: {
    ar: 'لأن (السبب)',
    cat: 'رابط سببي (Kausalsatz)',
    tipAr: 'كتعطي السبب (Warum?) والفعل المصرف كيرجع لآخر الجملة.',
  },
  da: {
    ar: 'بما أن / لأن (السبب)',
    cat: 'رابط سببي (Kausalsatz)',
    tipAr: 'بحال weil تماماً، غير هي كتجي غالباً فبداية الجملة والفعل فالأخير.',
  },
  denn: {
    ar: 'لأن (حرف عطف)',
    cat: 'حرف عطف (Position 0)',
    tipAr: 'كيعطي السبب بحال weil ولكن ما كيبدلش ترتيب الجملة (Subjekt + Verb).',
  },
  deshalb: {
    ar: 'لذلك / لهذا السبب',
    cat: 'النتيجة (Konsekutiv)',
    tipAr: 'كتعبر على النتيجة وكيجي موراها الفعل مباشرة (Verb Position 2).',
  },
  deswegen: {
    ar: 'لهذا السبب / لذلك',
    cat: 'النتيجة (Konsekutiv)',
    tipAr: 'مرادف لـ deshalb و darum، كيجي موراه الفعل مباشرة.',
  },
  daher: {
    ar: 'لذلك / ومن ثم',
    cat: 'النتيجة (B2 Konsekutiv)',
    tipAr: 'شائعة بزاف فـ Sprachbausteine للتعبير على النتيجة المنطقية.',
  },
  sodass: {
    ar: 'بحيث أن / لدرجة أن',
    cat: 'النتيجة (Nebensatz)',
    tipAr: 'كتعبر على النتيجة فجملة ثانوية (الفعل كيمشي لآخر الجملة).',
  },
  damit: {
    ar: 'لكي / من أجل أن (الهدف)',
    cat: 'رابط الغاية (Finalsatz)',
    tipAr: 'كتعبر على الهدف (Wozu?) والفعل كيمشي لآخر الجملة.',
  },
  um: {
    ar: 'من أجل (um ... zu + Infinitiv) / حول / في تمام',
    cat: 'حرف جر / غاية',
    tipAr: 'إيلا كانت مع zu فآخر الجملة كتعني «لكي»، ومع الوقت كتعني «في تمام الساعة»، ومع التغيير كتعني «بنسبة».',
  },
  anstatt: {
    ar: 'بدلاً من (anstatt ... zu / + Genitiv)',
    cat: 'رابط البديل (Alternativ)',
    tipAr: 'كتجي إما مع Genitiv أو مع zu + Infinitiv فآخر الجملة.',
  },
  statt: {
    ar: 'بدلاً من',
    cat: 'حرف جر / رابط بديل',
    tipAr: 'مرادف لـ anstatt، كتستعمل بزاف فـ Sprachbausteine 2.',
  },
  ohne: {
    ar: 'بدون (ohne + Akkusativ / ohne ... zu)',
    cat: 'حرف جر (Akkusativ)',
    tipAr: 'كيمشي معاها دائماً Akkusativ أو فآخر الجملة zu + Infinitiv.',
  },
  während: {
    ar: 'أثناء / بينما (الزمان أو المقارنة)',
    cat: 'رابط زمني / حرف جر (+ Genitiv)',
    tipAr: 'كحرف جر كياخد Genitiv، وكرابط زمني كيرجع الفعل لآخر الجملة.',
  },
  bevor: {
    ar: 'قبل أن',
    cat: 'رابط زمني (Temporalsatz)',
    tipAr: 'كتعبر على حدث قبل حدث آخر، والفعل كيمشي لآخر الجملة.',
  },
  nachdem: {
    ar: 'بعد أن',
    cat: 'رابط زمني (Temporalsatz)',
    tipAr: 'كتحتاج تتابع زمني (Plusquamperfekt ➔ Präteritum أو Perfekt ➔ Präsens).',
  },
  seitdem: {
    ar: 'منذ أن',
    cat: 'رابط زمني (Temporalsatz)',
    tipAr: 'حدث بدا فالمضى ومازال مستمر فالحاضر.',
  },
  sobald: {
    ar: 'بمجرد أن / حالما',
    cat: 'رابط زمني (Temporalsatz)',
    tipAr: 'شائعة بزاف فـ الرسائل الرسمية (Sprachbausteine 1).',
  },
  solange: {
    ar: 'طالما أن',
    cat: 'رابط زمني (Temporalsatz)',
    tipAr: 'كتعبر على تزامن شرطي فـ Nebensatz.',
  },
  falls: {
    ar: 'في حال / إذا (الشرط)',
    cat: 'رابط شرطي (Konditionalsatz)',
    tipAr: 'مرادف لـ wenn الشرطية، كيتستعمل بزاف فـ الإيميلات الرسمية.',
  },
  sofern: {
    ar: 'بشرط أن / إذا ما',
    cat: 'رابط شرطي (B2 Konditional)',
    tipAr: 'كلمة مهمة بزاف فـ Sprachbausteine Teil 2 بمعنى falls / wenn.',
  },
  sogar: {
    ar: 'حتى / بل وحتى (للتأكيد)',
    cat: 'أداة تركيز (Gradpartikel)',
    tipAr: 'كتفيد المبالغة أو التأكيد على معلومة غير متوقعة.',
  },
  jedoch: {
    ar: 'غير أن / لكن / إلا أن',
    cat: 'رابط تناقض (Adversativ)',
    tipAr: 'مرادف راقي لـ aber فمستوى B2.',
  },
  allerdings: {
    ar: 'إلا أن / بيد أن / طبعاً',
    cat: 'ظرف استدراك (B2)',
    tipAr: 'كيستعمل لتقييد فكرة سابقة (بحال aber / jedoch).',
  },
  außerdem: {
    ar: 'بالإضافة إلى ذلك / علاوة على ذلك',
    cat: 'ظرف إضافة',
    tipAr: 'كيزيد معلومة جديدة وكيجي موراه الفعل فالمرتبة 2.',
  },
  zudem: {
    ar: 'علاوة على ذلك / فضلاً عن ذلك',
    cat: 'ظرف إضافة (B2)',
    tipAr: 'مرادف لـ außerdem شائع فالمقالات العلمية والصحفية.',
  },
  darüber: {
    ar: 'حول ذلك / فوق ذلك (darüber hinaus = علاوة على ذلك)',
    cat: 'Pronominaladverb',
    tipAr: 'كيجي مع أفعال بحال sich freuen über أو sprechen über أو فالعبارة darüber hinaus.',
  },
  dafür: {
    ar: 'من أجل ذلك / في المقابل',
    cat: 'Pronominaladverb',
    tipAr: 'كيرتبط بأفعال بحال sorgen für أو sich interessieren für أو sich entscheiden für.',
  },
  davon: {
    ar: 'من ذلك / عن ذلك',
    cat: 'Pronominaladverb',
    tipAr: 'كيرتبط بـ abhängen von، träumen von، أو ausgehen von.',
  },
  dazu: {
    ar: 'إلى ذلك / لهذا الغرض / بالإضافة لذلك',
    cat: 'Pronominaladverb',
    tipAr: 'كيرتبط بـ beitragen zu، führen zu، أو gehören zu.',
  },
  dabei: {
    ar: 'أثناء ذلك / في هذه الأثناء / مع العلم أن',
    cat: 'Pronominaladverb',
    tipAr: 'مهم بزاف فـ Sprachbausteine 2 لتوضيح ظرف مرافق.',
  },
  weder: {
    ar: 'لا ... ولا (weder ... noch)',
    cat: 'رابط مزدوج (Doppelkonnektor)',
    tipAr: 'إيلا شفتي weder فالجملة، قلب مباشرة على noch فالفراغ الثاني!',
  },
  noch: {
    ar: 'ما زال / ولا (weder ... noch)',
    cat: 'ظرف / رابط مزدوج',
    tipAr: 'كيجي إما بمعنى «ما زال» أو كمكمل لـ weder ... noch.',
  },
  sowohl: {
    ar: 'كلا ... و (sowohl ... als auch)',
    cat: 'رابط مزدوج (Doppelkonnektor)',
    tipAr: 'إيلا شفتي sowohl، الفراغ التابع ليه كياخد دائماً als auch!',
  },
  entweder: {
    ar: 'إما ... أو (entweder ... oder)',
    cat: 'رابط مزدوج (Doppelkonnektor)',
    tipAr: 'إيلا شفتي entweder فالجملة، الجواب المكمل هو oder.',
  },
  zwar: {
    ar: 'صحيح أن ... ولكن (zwar ... aber)',
    cat: 'رابط مزدوج (Doppelkonnektor)',
    tipAr: 'zwar كتجي فالشطر الأول، وكتتبعها aber أو jedoch فالشطر الثاني.',
  },
  je: {
    ar: 'كلما ... كلما (je + Komparativ ... desto/umso)',
    cat: 'رابط مقارنة (Proportionalsatz)',
    tipAr: 'je كيجي موراها صفة فالمقارنة والفعل فالأخير، والشطر الثاني كيبدا بـ desto أو umso.',
  },
  desto: {
    ar: 'كلما (الشطر الثاني من je ... desto)',
    cat: 'رابط مقارنة',
    tipAr: 'كيجي موراه مباشرة Komparativ عاد الفعل عاد الفاعل.',
  },
  umso: {
    ar: 'كلما / بقدر ما (je ... umso)',
    cat: 'رابط مقارنة',
    tipAr: 'مرادف لـ desto، كيجي موراه دائماً صفة مقارنة (Komparativ).',
  },
  nicht: {
    ar: 'لا / ليس (أداة النفي الأساسي)',
    cat: 'أداة نفي (Negation)',
    tipAr: '⚠️ انتبه! هاد الكلمة كتقلب المعنى فامتحانات TELC B2 وكتبدل الجواب بين الأساسي والمعدل!',
  },
  kein: {
    ar: 'لا يوجد / ليس (نفي الأسماء النكرة)',
    cat: 'أداة نفي (Negation)',
    tipAr: '⚠️ فخ كلاسيكي فـ Lesen: نفي الاسم كيخلي العنوان أو الإعلان المعاكس هو الصحيح!',
  },
  keine: {
    ar: 'لا توجد / ليس',
    cat: 'أداة نفي (Negation)',
    tipAr: '⚠️ رد بالك من النفي فـ الأسئلة والوضعيات (Lesen Teil 1, 2, 3)!',
  },
  kaum: {
    ar: 'بالكاد / قلما (شبه نفي)',
    cat: 'ظرف نفي ضمني',
    tipAr: '⚠️ kaum كتعني تقريباً «لا» (fast nicht / fast kein) وكتجي كفخ فـ Lesen Teil 2!',
  },
  nur: {
    ar: 'فقط / لا غير',
    cat: 'أداة حصر',
    tipAr: '⚠️ كلمة حاسمة فـ الإعلانات (Teil 3): مثلاً nur am Wochenende أو nur für Kinder!',
  },
  erst: {
    ar: 'فقط ابتداءً من / ليس قبل',
    cat: 'أداة زمنية / حصر',
    tipAr: 'مع الوقت كتعني «ابتداءً من» (مثلاً erst ab 18 Uhr).',
  },
  schon: {
    ar: 'بالفعل / مسبقاً',
    cat: 'ظرف زمن',
    tipAr: 'كتعني أن الحدث وقع قبل المتوقع.',
  },
  bereits: {
    ar: 'بالفعل / سلفاً (مرادف schon)',
    cat: 'ظرف زمن (B2)',
    tipAr: 'كلمة رسمية شائعة فمقالات TELC B2 بمعنى schon.',
  },
  immer: {
    ar: 'دائماً (immer mehr = يتزايد باستمرار)',
    cat: 'ظرف تكرار',
    tipAr: 'مع Komparativ (مثلاً immer beliebter) كتعني «أكثر فأكثر».',
  },
  besonders: {
    ar: 'خصوصاً / بشكل خاص',
    cat: 'ظرف تركيز',
    tipAr: 'كتستعمل لتسليط الضوء على الفئة أو الميزة الأساسية فالنص.',
  },
  insbesondere: {
    ar: 'ولا سيما / على وجه الخصوص',
    cat: 'ظرف تركيز (B2)',
    tipAr: 'مرادف أكاديمي لـ besonders.',
  },
  // High-frequency TELC B2 exam nouns & verbs
  inseln: {
    ar: 'جزر (جمع Insel)',
    cat: 'اسم جمع (Die Inseln)',
    tipAr: 'موضوع شهير فـ Lesen Teil 1: الجزر الألمانية والسياحة وحماية الطبيعة.',
  },
  insel: {
    ar: 'جزيرة',
    cat: 'اسم مؤنث (die Insel)',
    tipAr: 'الجمع ديالها هو die Inseln.',
  },
  kinder: {
    ar: 'أطفال',
    cat: 'اسم جمع (die Kinder)',
    tipAr: 'فـ Dativ الجمع كتولي den Kindern (بزيادة n).',
  },
  eltern: {
    ar: 'الوالدين / الآباء',
    cat: 'اسم جمع (die Eltern)',
    tipAr: 'كلمة مفتاحية فمواضيع التربية، المدارس، والعطلات العائلية.',
  },
  schule: {
    ar: 'مدرسة',
    cat: 'اسم مؤنث (die Schule)',
    tipAr: 'Grundschule = المدرسة الابتدائية.',
  },
  studium: {
    ar: 'الدراسة الجامعية',
    cat: 'اسم محايد (das Studium)',
    tipAr: 'مهم بزاف فـ الوضعيات ديال الطلاب (Teil 3).',
  },
  arbeit: {
    ar: 'عمل / شغل',
    cat: 'اسم مؤنث (die Arbeit)',
    tipAr: 'مرادفاتها فـ B2: Beruf, Tätigkeit, Beschäftigung.',
  },
  unternehmen: {
    ar: 'شركة / مقاولة',
    cat: 'اسم محايد (das Unternehmen)',
    tipAr: 'مرادف لـ Firma و Betrieb.',
  },
  gesundheit: {
    ar: 'الصحة',
    cat: 'اسم مؤنث (die Gesundheit)',
    tipAr: 'أي كلمة كتسالي بـ -heit أو -keit هي دائماً مؤنث (die)!',
  },
  umwelt: {
    ar: 'البيئة',
    cat: 'اسم مؤنث (die Umwelt)',
    tipAr: 'Umweltschutz = حماية البيئة، umweltfreundlich = صديق للبيئة.',
  },
  natur: {
    ar: 'الطبيعة',
    cat: 'اسم مؤنث (die Natur)',
    tipAr: 'Naturschutz = حماية الطبيعة.',
  },
  forschung: {
    ar: 'البحث العلمي',
    cat: 'اسم مؤنث (die Forschung)',
    tipAr: 'أي كلمة كتسالي بـ -ung هي دائماً مؤنث (die)! Wissenschaftler = علماء.',
  },
  wissenschaftler: {
    ar: 'علماء / باحثون',
    cat: 'اسم مذكر/جمع',
    tipAr: 'مرادف لـ Forscher و Experten فمواضيع Lesen Teil 1 & 2.',
  },
  insekten: {
    ar: 'حشرات',
    cat: 'اسم جمع (die Insekten)',
    tipAr: 'موضوع شهير فـ TELC B2: أكل الحشرات ومستقبل الغذاء.',
  },
  kaffee: {
    ar: 'قهوة',
    cat: 'اسم مذكر (der Kaffee)',
    tipAr: 'موضوع مكرر فـ Lesen والامتحانات الكاملة.',
  },
  schlafzug: {
    ar: 'قطار ليلي (قطار النوم)',
    cat: 'اسم مذكر (der Schlafzug)',
    tipAr: 'مرادف لـ Nachtzug فموضوع السفر بالقطار.',
  },
  handschrift: {
    ar: 'الخط اليدوي / الكتابة باليد',
    cat: 'اسم مؤنث (die Handschrift)',
    tipAr: 'موضوع مشهور فـ Lesen Teil 2 حول أهمية الكتابة اليدوية فالعصر الرقمي.',
  },
  urlaub: {
    ar: 'عطلة / إجازة',
    cat: 'اسم مذكر (der Urlaub)',
    tipAr: 'كيجي مع حرف الجر im Urlaub أو in den Urlaub fahren.',
  },
  reise: {
    ar: 'رحلة / سفر',
    cat: 'اسم مؤنث (die Reise)',
    tipAr: 'eine Reise machen / buchen = حجز رحلة.',
  },
  kostenlos: {
    ar: 'مجاني / بدون مقابل',
    cat: 'صفة (Adjektiv)',
    tipAr: '🔑 موكلي ذهبي فـ Lesen Teil 3: كيطابق gratis أو gebührenfrei أو ohne Kosten!',
  },
  gratis: {
    ar: 'مجاناً',
    cat: 'صفة / ظرف',
    tipAr: 'كيطابق kostenlos أو umsonst فـ الإعلانات.',
  },
  erfahrung: {
    ar: 'خبرة / تجربة',
    cat: 'اسم مؤنث (die Erfahrung)',
    tipAr: 'Erfahrungen sammeln = اكتساب خبرات.',
  },
  angebot: {
    ar: 'عرض',
    cat: 'اسم محايد (das Angebot)',
    tipAr: 'من الفعل anbieten (يعرض / يقدم).',
  },
  möglichkeit: {
    ar: 'إمكانية / فرصة',
    cat: 'اسم مؤنث (die Möglichkeit)',
    tipAr: 'مرادف لـ Gelegenheit أو Chance.',
  },
  unterstützung: {
    ar: 'دعم / مساعدة',
    cat: 'اسم مؤنث (die Unterstützung)',
    tipAr: 'من الفعل unterstützen (يدعم / يساعد).',
  },
  entscheidung: {
    ar: 'قرار',
    cat: 'اسم مؤنث (die Entscheidung)',
    tipAr: 'eine Entscheidung treffen = اتخاذ قرار (Nomen-Verb-Verbindung).',
  },
  verfügung: {
    ar: 'تصرف / إتاحة (zur Verfügung stehen / stellen)',
    cat: 'Nomen-Verb-Verbindung (B2)',
    tipAr: '🌟 تركيبة ذهبية فـ Sprachbausteine: zur Verfügung stehen (متاح) / zur Verfügung stellen (يوفر).',
  },
  interesse: {
    ar: 'اهتمام (Interesse haben an + Dativ / wecken)',
    cat: 'اسم محايد (das Interesse)',
    tipAr: 'كيمشي مع حرف الجر an + Dativ.',
  },
  frage: {
    ar: 'سؤال (in Frage kommen = يؤخذ بعين الاعتبار)',
    cat: 'اسم مؤنث (die Frage)',
    tipAr: 'bei Fragen stehen wir Ihnen gerne zur Verfügung = نحن رهن إشارتكم لأي استفسار.',
  },
};

// Morphological suffix rules for German B2 words when clicked
const SUFFIX_RULES: { suffix: string; cat: string; tipAr: string; meaningHint: string }[] = [
  {
    suffix: 'ung',
    cat: 'اسم مؤنث دائماً (die -ung)',
    tipAr: 'قاعدة ذهبية: أي اسم ألماني ينتهي بـ -ung أداته دائماً die والجمع ديالو بـ -ungen.',
    meaningHint: 'مصدر/اسم مشتق من الفعل',
  },
  {
    suffix: 'heit',
    cat: 'اسم مؤنث دائماً (die -heit)',
    tipAr: 'أي اسم ينتهي بـ -heit أداته دائماً die (مثل die Gesundheit, die Freiheit).',
    meaningHint: 'اسم حالة أو صفة',
  },
  {
    suffix: 'keit',
    cat: 'اسم مؤنث دائماً (die -keit)',
    tipAr: 'أي اسم ينتهي بـ -keit أداته دائماً die (مثل die Möglichkeit, die Fähigkeit).',
    meaningHint: 'اسم إمكانية أو صفة',
  },
  {
    suffix: 'schaft',
    cat: 'اسم مؤنث دائماً (die -schaft)',
    tipAr: 'أي اسم ينتهي بـ -schaft أداته دائماً die (مثل die Wissenschaft, die Gesellschaft).',
    meaningHint: 'اسم مجال أو جماعة',
  },
  {
    suffix: 'tion',
    cat: 'اسم مؤنث دائماً (die -tion)',
    tipAr: 'الكلمات المنتهية بـ -tion أداتها دائماً die والجمع بـ -tionen (مثل die Information).',
    meaningHint: 'مصطلح رسمي/أكاديمي',
  },
  {
    suffix: 'lich',
    cat: 'صفة أو ظرف (Adjektiv -lich)',
    tipAr: 'النهاية -lich كتحول الاسم إلى صفة (مثل täglich, freundlich, möglich).',
    meaningHint: 'صفة / ظرف وصفي',
  },
  {
    suffix: 'isch',
    cat: 'صفة (Adjektiv -isch)',
    tipAr: 'النهاية -isch كتستعمل للصفات المتعلقة بالمجالات أو البلدان (مثل europäisch, technisch).',
    meaningHint: 'صفة نسبية',
  },
  {
    suffix: 'bar',
    cat: 'صفة إمكانية (Adjektiv -bar = يمكن كذا)',
    tipAr: 'النهاية -bar كتعني «قابل لـ / يمكن فعله» (مثل machbar = يمكن عمله، erreichbar = يمكن الوصول إليه).',
    meaningHint: 'صفة تفيد القابلية والإمكانية',
  },
  {
    suffix: 'los',
    cat: 'صفة نفي (Adjektiv -los = بدون كذا)',
    tipAr: 'النهاية -los كتعني «بدون / خالي من» (مثل kostenlos = مجاني/بدون تكلفة، arbeitslos = بدون عمل).',
    meaningHint: 'صفة تفيد انعدام الشيء (بدون...)',
  },
];

export function cleanGermanToken(raw: string): string {
  return sanitizeUtf8Text(raw)
    .replace(/^[„"”'‚‘»«()[\]{}.,;:!?—–\-0-9]+/, '')
    .replace(/[„"”'‚‘»«()[\]{}.,;:!?—–\-0-9]+$/, '')
    .trim();
}

export function extractSentenceContainingWord(word: string, contextText: string): string {
  const cleanCtx = sanitizeUtf8Text(contextText)
    .replace(/_{2,4}\s*(\d+)\s*_{2,4}/g, '($1)')
    .trim();
  if (!cleanCtx) return word;
  const sentences = cleanCtx.match(/[^.!?\n]+[.!?]?/g) || [cleanCtx];
  const lower = word.toLowerCase();
  const matched = sentences.find((s) => s.toLowerCase().includes(lower));
  return (matched || sentences[0] || cleanCtx).trim();
}

export function lookupGermanWord(rawWord: string, contextText: string): WordLookupResult {
  const cleaned = cleanGermanToken(rawWord) || sanitizeUtf8Text(rawWord).trim();
  const lower = cleaned.toLowerCase();
  const sentence = extractSentenceContainingWord(cleaned, contextText);

  // 1. Direct match in B2 dictionary
  const direct = B2_DICTIONARY[lower];
  if (direct) {
    return {
      word: rawWord,
      cleanWord: cleaned,
      meaningAr: direct.ar,
      category: direct.cat,
      grammarTipAr: direct.tipAr,
      contextSentence: sentence,
    };
  }

  // 2. Check de-inflected stem (removing common plural/case/verb endings: -en, -n, -e, -er, -es, -em, -s, -st, -t)
  const stemsToTry = [
    lower.replace(/(?:en|ern|eln|est|ten|tet|te|st|er|es|em|e|n|s)$/, ''),
    lower.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u'),
  ];
  for (const stem of stemsToTry) {
    if (stem.length >= 3 && B2_DICTIONARY[stem]) {
      const entry = B2_DICTIONARY[stem];
      return {
        word: rawWord,
        cleanWord: cleaned,
        meaningAr: entry.ar,
        category: entry.cat,
        grammarTipAr: entry.tipAr,
        contextSentence: sentence,
      };
    }
  }

  // 3. Compound word decomposition (Komposita — check if any dictionary key is a part of this word)
  for (const [key, entry] of Object.entries(B2_DICTIONARY)) {
    if (key.length >= 4 && lower.includes(key) && lower !== key) {
      return {
        word: rawWord,
        cleanWord: cleaned,
        meaningAr: translationCache[cleaned] || entry.ar,
        category: 'كلمة مركبة (Kompositum B2)',
        grammarTipAr: `فالألمانية الكلمات المركبة كتاخد دائماً أداة (Artikel) الكلمة الأخيرة فيها! (${entry.tipAr})`,
        contextSentence: sentence,
      };
    }
  }

  // 4. Suffix morphological rule
  for (const rule of SUFFIX_RULES) {
    if (lower.endsWith(rule.suffix) && lower.length > rule.suffix.length + 2) {
      return {
        word: rawWord,
        cleanWord: cleaned,
        meaningAr: translationCache[cleaned] || 'جاري الترجمة الفورية...',
        category: rule.cat,
        grammarTipAr: rule.tipAr,
        contextSentence: sentence,
      };
    }
  }

  // 5. Capitalized Noun vs Verb/Adjective (NO fake placeholder!)
  const isCapitalized = /^[A-ZÄÖÜ]/.test(cleaned);
  return {
    word: rawWord,
    cleanWord: cleaned,
    meaningAr: translationCache[cleaned] || 'جاري الترجمة الفورية...',
    category: isCapitalized ? 'اسم ألماني (Nomen)' : 'فعل / صفة / مفردة B2',
    grammarTipAr: isCapitalized
      ? 'الأسماء فالألمانية كتكتب دائماً بحرف كبير (Großschreibung) وسط الجملة.'
      : 'انظر الترجمة الفورية للكلمة وللجملة الكاملة أسفله، ويمكنك حفظها في قاموسك الشخصي.',
    contextSentence: sentence,
  };
}

// ============================================================================
// 3. GERMAN TEXT-TO-SPEECH (Web Speech API - 100% Free Native Audio)
// ============================================================================

export function speakGermanText(text: string, rate = 1.0, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const cleaned = sanitizeUtf8Text(text)
      .replace(/_{2,4}\s*(\d+)\s*_{2,4}/g, ' Lücke $1 ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'de-DE';
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const deVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('de-de')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('de'));
    if (deVoice) {
      utterance.voice = deVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    onEnd?.();
  }
}

export function stopGermanSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ============================================================================
// 4. SPRACHBAUSTEINE 1 & 2 SMART DARIJA GRAMMAR EXPLAINER
// ============================================================================

export interface SprachGrammarRuleExplanation {
  categoryAr: string;
  ruleAr: string;
}

export function explainSprachbausteinChoice(
  wordDe: string,
  gapNum: number,
  contextSentence: string
): SprachGrammarRuleExplanation {
  const lower = wordDe.trim().toLowerCase();
  const dict = B2_DICTIONARY[lower];
  if (dict) {
    return {
      categoryAr: dict.cat,
      ruleAr: `«${wordDe}» (${dict.ar}): ${dict.tipAr}`,
    };
  }

  if (['in', 'an', 'auf', 'für', 'mit', 'zu', 'von', 'aus', 'bei', 'nach', 'über', 'unter', 'vor', 'zwischen'].includes(lower)) {
    return {
      categoryAr: 'حرف جر مرتبط بالفعل أو السياق (Präposition)',
      ruleAr: `حرف الجر «${wordDe}» فالفراغ [${gapNum}] كيمشي مع التركيبة الثابتة فالجملة (Rektion der Verben / Nomen-Präposition).`,
    };
  }

  if (['der', 'die', 'das', 'den', 'dem', 'des', 'welcher', 'welche', 'welches', 'dessen', 'deren'].includes(lower)) {
    return {
      categoryAr: 'ضمير وصل أو أداة تعريف (Relativpronomen / Artikel)',
      ruleAr: `الأداة «${wordDe}» كتحدد الإعراب (Kasus: Nominativ/Akkusativ/Dativ/Genitiv) أو كتربط الجملة الموصولة بالاسم قبل الفاصلة.`,
    };
  }

  if (['sich', 'mich', 'dich', 'uns', 'euch'].includes(lower)) {
    return {
      categoryAr: 'ضمير انعكاسي (Reflexivpronomen)',
      ruleAr: `الفعل فهاد الجملة انعكاسي (Reflexives Verb) وكيحتاج الضمير «${wordDe}» باش يكمل المعنى.`,
    };
  }

  if (['hat', 'haben', 'ist', 'sind', 'wurde', 'wurden', 'werden', 'wird', 'hätte', 'wäre', 'würde', 'könnte', 'sollte'].includes(lower)) {
    return {
      categoryAr: 'فعل مساعد / مبني للمجهول / Konjunktiv II',
      ruleAr: `الفعل المساعد «${wordDe}» ضروري لتكوين الزمن المركب (Perfekt / Passiv) أو صيغة الطلب المهذب (Konjunktiv II).`,
    };
  }

  if (lower.endsWith('en') || lower.endsWith('em') || lower.endsWith('er') || lower.endsWith('es') || lower.endsWith('e')) {
    return {
      categoryAr: 'تصريف الصفة أو الفعل في السياق (Deklination / Konjugation)',
      ruleAr: `الكلمة «${wordDe}» فالفراغ [${gapNum}] جات متطابقة فالإعراب والمعنى مع الكلمات اللي قبلها وبعدها فالجملة: "${safeSliceText(contextSentence, 80)}"`,
    };
  }

  return {
    categoryAr: 'مفردة / رابط سياقي B2',
    ruleAr: `الكلمة «${wordDe}» هي الوحيدة اللي كتكمل المعنى السليم والتركيبة النحوية ديال الفراغ [${gapNum}].`,
  };
}

// ============================================================================
// 5. INSTANT BILINGUAL SENTENCE TRANSLATION HELPER (Synchronous Fallback)
// ============================================================================

export function translateGermanTextToArabic(
  textDe: string,
  curatedAr?: string,
  fallbackContextLabel?: string
): string {
  const cleanDe = sanitizeUtf8Text(textDe)
    .replace(/_{2,4}\s*(\d+)\s*_{2,4}/g, '($1)')
    .replace(/\s+/g, ' ')
    .trim();

  if (translationCache[cleanDe]) {
    return curatedAr ? `${curatedAr} — ${translationCache[cleanDe]}` : translationCache[cleanDe];
  }

  if (curatedAr && curatedAr.trim().length > 0) {
    return sanitizeUtf8Text(curatedAr);
  }

  const tokens = cleanDe.split(/\s+/);
  const translatedPieces: string[] = [];
  const seen = new Set<string>();

  for (const tk of tokens) {
    const clean = cleanGermanToken(tk).toLowerCase();
    if (clean.length < 2 || seen.has(clean)) continue;
    const entry = B2_DICTIONARY[clean];
    if (entry) {
      seen.add(clean);
      translatedPieces.push(`${cleanGermanToken(tk)}: ${entry.ar.split(' / ')[0]}`);
    }
    if (translatedPieces.length >= 6) break;
  }

  if (translatedPieces.length > 0) {
    return `${fallbackContextLabel ? `${fallbackContextLabel} — ` : ''}المفردات المفتاحية: ${translatedPieces.join(' • ')}`;
  }

  return fallbackContextLabel || 'اضغط لترجمة الفقرة كاملة للعربية';
}

// ============================================================================
// 6. LOCAL "ASK AI TUTOR" (100% Free Client-Side Pedagogical Reasoning Engine)
// ============================================================================

export type AiPromptType =
  | 'why_correct'
  | 'compare_traps'
  | 'mod_and_negation'
  | 'extract_b2_vocab';

export interface AiTutorResponse {
  titleAr: string;
  badgeText: string;
  sections: {
    heading: string;
    body: string;
    highlightPill?: string;
  }[];
}

export function generateLocalAiTutorResponse(
  context: AskAiContextItem,
  promptType: AiPromptType
): AiTutorResponse {
  const hasNegation = /\b(nicht|kein|keine|keinen|keinem|keiner|kaum|niemals|nie|ohne|weder)\b/i.test(
    `${context.textDe} ${context.correctTextDe}`
  );

  if (promptType === 'why_correct') {
    return {
      titleAr: `تحليل المعلم الذكي: علاش (${context.correctLetter}) هو الجواب الصحيح 100%؟`,
      badgeText: `${context.itemLabel} ➔ ${context.correctLetter}`,
      sections: [
        {
          heading: '1️⃣ المعنى العام بالدارجة المغربية / العربية:',
          body:
            sanitizeUtf8Text(context.arSummary || '') ||
            `هاد السؤال (${context.itemLabel}) فموضوع «${context.moduleTitle}» كيدور مباشرة حول الفكرة الموجودة فالجواب (${context.correctLetter}).`,
        },
        {
          heading: '2️⃣ التطابق الدلالي (الموكلي وسط النص ➔ الجواب):',
          body: context.tKey
            ? `فالنص الألماني غادي تلقى العبارة المفتاحية: «${sanitizeUtf8Text(context.tKey)}» واللي كتعطي نفس المعنى ديال «${sanitizeUtf8Text(context.hKey || context.correctTextDe)}» فالإجابة (${context.correctLetter}).`
            : `الجواب الصحيح بالألمانية هو: «${sanitizeUtf8Text(context.correctTextDe)}» لأنه كيعبر بدقة على الفكرة المحورية بدون زيادة أو نقصان.`,
          highlightPill: sanitizeUtf8Text(context.tKey || context.correctLetter),
        },
        {
          heading: '3️⃣ النصيحة الذهبية ديال النهار فالامتحان:',
          body: 'ملي تشوف هاد الموكلي فالنص، ما تضيعش الوقت فترجمة كل كلمة صعيبة — ربط مباشرة بين الموكلي بالأصفر والجواب المطابق ليه!',
        },
      ],
    };
  }

  if (promptType === 'compare_traps') {
    const sampleTraps = (context.distractors || []).slice(0, 3);
    const trapLines =
      sampleTraps.length > 0
        ? sampleTraps
            .map(
              (d) =>
                `• الخيار (${d.letter}): «${sanitizeUtf8Text(d.text)}» ❌ — فخ شائع! إما كيعمم بزاف أو كيركز على تفصيل ثانوي ما مذكورش فهاد الفقرة.`
            )
            .join('\n')
        : '• الخيارات الأخرى كتستعمل كلمات متشابهة فالشكل ولكنها كتغير المعنى أو كتخالف الشرط المذكور فالنص.';

    return {
      titleAr: 'مقارنة الجواب الصحيح مع الفخاخ (Distraktoren-Analyse)',
      badgeText: `تجنب الفخاخ فـ ${context.itemLabel}`,
      sections: [
        {
          heading: `✅ علاش اختارينا (${context.correctLetter}) بالضبط:`,
          body: `«${sanitizeUtf8Text(context.correctTextDe)}» — كيتطابق 100% مع شروط الفقرة (${sanitizeUtf8Text(context.arSummary || context.tKey || 'المعنى المباشر')}).`,
        },
        {
          heading: '❌ علاش الخيارات الأخرى غالطة (فخاخ TELC B2):',
          body: trapLines,
        },
      ],
    };
  }

  if (promptType === 'mod_and_negation') {
    const modDiffers =
      (context.mod1Answer && context.mod1Answer !== context.baseAnswer) ||
      (context.mod2Answer && context.mod2Answer !== context.baseAnswer);

    return {
      titleAr: 'رادار التعديلات (الأساسي vs المعدل) + فخاخ النفي (nicht / kein)',
      badgeText: modDiffers ? '⚠️ سؤال قابل للتعديل!' : '🔒 جواب ثابت',
      sections: [
        {
          heading: '🔄 مقارنة النسخة الأساسية والمعدلة (Original vs. Modifiziert):',
          body: modDiffers
            ? `رد بالك مزيان! فـ الكود الأساسي الجواب هو (${context.baseAnswer})، ولكن فـ الكود المعدل 1 كيولي (${context.mod1Answer || context.baseAnswer})${
                context.mod2Answer ? ` وفـ المعدل 2 كيولي (${context.mod2Answer})` : ''
              }. علاش؟ حيت فالنموذج المعدل كيبدلو سطر واحد أو كيزيدو أداة نفي!`
            : `هاد السؤال (${context.itemLabel}) جوابو ثابت (${context.correctLetter}) فالأغلبية الساحقة ديال النماذج، ولكن ديما تأكد من الموكلي وسط النص!`,
          highlightPill: `Base: ${context.baseAnswer || context.correctLetter}${
            context.mod1Answer ? ` | Mod1: ${context.mod1Answer}` : ''
          }`,
        },
        {
          heading: '🚫 فحص أدوات النفي والحصر (nicht / kein / kaum / nur):',
          body: hasNegation
            ? '⚠️ انتبه! هاد الفقرة فيها أداة نفي أو حصر (مثل nicht / kein / kaum / nur). فامتحان TELC B2، كلمة وحدة بحال kaum (بالكاد) أو nicht كتقلب الجواب 180 درجة!'
            : 'هاد الفقرة ما فيهاش نفي خادع مباشر، ولكن ديما رد بالك من كلمات الحصر بحال nur (فقط) و erst (ابتداءً من).',
        },
      ],
    };
  }

  // extract_b2_vocab
  const words = sanitizeUtf8Text(`${context.textDe} ${context.correctTextDe}`).split(/\s+/);
  const extracted: string[] = [];
  const seen = new Set<string>();
  for (const w of words) {
    const clean = cleanGermanToken(w);
    const lower = clean.toLowerCase();
    if (clean.length < 3 || seen.has(lower)) continue;
    if (B2_DICTIONARY[lower]) {
      seen.add(lower);
      extracted.push(`• ${clean} ➔ ${B2_DICTIONARY[lower].ar} (${B2_DICTIONARY[lower].cat})`);
    }
    if (extracted.length >= 6) break;
  }

  return {
    titleAr: 'أهم مصطلحات وقواعد B2 المستخرجة من هذه الفقرة',
    badgeText: 'قاموس الفقرة السريع',
    sections: [
      {
        heading: '📚 الكلمات والروابط المفتاحية فهاد النص:',
        body:
          extracted.length > 0
            ? extracted.join('\n')
            : '• نصيحة: اضغط على أي كلمة ألمانية فالنص مباشرة أو ظلل أي جملة بالماوس باش تخرج ليك الترجمة الفورية والنطق وتقدر تحفظها فقاموسك الشخصي!',
      },
      {
        heading: '🎯 الجواب الصحيح للحفظ:',
        body: `${context.itemLabel} ➔ (${context.correctLetter}) ${sanitizeUtf8Text(context.correctTextDe)}`,
        highlightPill: context.correctLetter,
      },
    ],
  };
}
