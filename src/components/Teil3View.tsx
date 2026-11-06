import React, { useMemo, useState } from 'react';
import { AskAiContextItem, ExamVariant, SubViewMode, Teil3Topic } from '../data/verbatimTypes';
import {
  buildTeil3SpeedDrill,
  extractGermanKeywords,
  getTeil3AnswerKey,
  getTeil3SituationHelper,
} from '../utils/examEngine';
import { sanitizeUtf8Text } from '../utils/b2StudyEngine';
import { HighlightedText } from './HighlightedText';
import { SpeedDrillView } from './SpeedDrillView';
import { AudioListenButton } from './AudioListenButton';
import { LiveArabicTranslation } from './LiveArabicTranslation';
import { ArrowUpRight, Bot, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';

interface Teil3ViewProps {
  topic: Teil3Topic;
  variant: ExamVariant;
  subView: SubViewMode;
  userAnswers: Record<number, string>;
  onSelectAnswer: (sitNum: number, letter: string) => void;
  highlightMotCle: boolean;
  memorizeMode: boolean;
  showUnderSummary: boolean;
  showTranslation: boolean;
  shuffleMode: boolean;
  isChecked: boolean;
  fontScale: number;
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
  onWordClick: (word: string, contextText: string) => void;
  onAskAi: (ctx: AskAiContextItem) => void;
}

const AD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const Teil3View: React.FC<Teil3ViewProps> = ({
  topic,
  variant,
  subView,
  userAnswers,
  onSelectAnswer,
  highlightMotCle,
  memorizeMode,
  showUnderSummary,
  showTranslation,
  shuffleMode,
  isChecked,
  fontScale,
  streak,
  onIncrementStreak,
  onResetStreak,
  onWordClick,
  onAskAi,
}) => {
  const [flashedAd, setFlashedAd] = useState<string | null>(null);

  const activeKey = useMemo(() => getTeil3AnswerKey(topic, variant), [topic, variant]);

  const helpers = useMemo(
    () => topic.situations.map((_, idx) => getTeil3SituationHelper(topic, idx, variant)),
    [topic, variant]
  );

  const allAdKeywords = useMemo(() => {
    const raw = helpers.flatMap((h) => [h.sKey, h.adKey]).filter(Boolean);
    return extractGermanKeywords(raw);
  }, [helpers]);

  // Map ad letter -> situation num (11..20)
  const usedAdMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    topic.situations.forEach((sit, idx) => {
      const chosen = memorizeMode ? activeKey[idx] : userAnswers[sit.num];
      if (chosen && chosen !== 'X') {
        if (!map[chosen]) map[chosen] = [];
        map[chosen].push(sit.num);
      }
    });
    return map;
  }, [topic.situations, memorizeMode, activeKey, userAnswers]);

  const displayedAdLetters = useMemo(() => {
    const keys = AD_LETTERS.filter((l) => topic.ads[l] !== undefined);
    return shuffleMode ? [...keys].reverse() : keys;
  }, [topic.ads, shuffleMode]);

  const drillItems = useMemo(() => buildTeil3SpeedDrill(topic, variant), [topic, variant]);

  const scrollToAd = (letter: string) => {
    if (!letter || letter === 'X') return;
    const el = document.getElementById(`teil3-ad-${topic.id}-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashedAd(letter);
      setTimeout(() => setFlashedAd(null), 2000);
    }
  };

  const fontSizeClass =
    fontScale <= -1
      ? 'text-sm'
      : fontScale === 0
      ? 'text-base'
      : fontScale === 1
      ? 'text-lg'
      : 'text-xl';

  if (subView === 'drill') {
    return (
      <SpeedDrillView
        title={`Lesen Teil 3: ${topic.title} (${topic.arTitle})`}
        items={drillItems}
        streak={streak}
        onIncrementStreak={onIncrementStreak}
        onResetStreak={onResetStreak}
      />
    );
  }

  if (subView === 'matrix') {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-indigo-500/15 border border-amber-400/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-black text-amber-300">
              🧠 فاصو الاختصارات والفهم السريع — Lesen Teil 3 ({topic.title})
            </h3>
            <p className="text-xs text-slate-300">
              الوضعيات 11 إلى 20 مرتبطة مباشرة بالإعلان المناسب (A–L) أو X (لا يوجد إعلان) مع الموكلي بالأصفر!
            </p>
          </div>
          <div dir="ltr" className="font-mono text-xs font-extrabold bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-400/40 text-amber-300">
            Code ({variant.toUpperCase()}): {activeKey.map((l, i) => `${i + 11}:${l}`).join(' · ')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {topic.situations.map((sit, idx) => {
            const helper = helpers[idx];
            const kw = extractGermanKeywords([helper.sKey, helper.adKey]);

            return (
              <div
                key={sit.num}
                className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
              >
                {/* Step 1: Situation + Darija */}
                <div className="lg:col-span-4 bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-3.5 h-full">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-indigo-300">1️⃣ الوضعية والفهم السريع</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                      Situation {sit.num}
                    </span>
                  </div>
                  <p dir="ltr" className="text-sm font-bold text-white mb-2 leading-snug">
                    <HighlightedText
                      text={sit.text}
                      keywords={kw}
                      highlightEnabled={true}
                      onWordClick={onWordClick}
                    />
                  </p>
                  <p className="text-xs text-amber-200/90 font-semibold border-t border-indigo-500/20 pt-1.5">
                    {sanitizeUtf8Text(helper.arHint)}
                  </p>
                </div>

                {/* Step 2: Mot-Clé Link */}
                <div className="lg:col-span-3 bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 h-full flex flex-col justify-center">
                  <div className="text-xs font-black text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-yellow-300" />
                    <span>2️⃣ الموكلي المفتاحي</span>
                  </div>
                  <div dir="ltr" className="space-y-1.5">
                    <div className="inline-block bg-yellow-300 text-slate-950 font-black px-2 py-0.5 rounded text-xs font-mono">
                      {sanitizeUtf8Text(helper.sKey || '—')}
                    </div>
                    <div className="text-xs font-mono text-emerald-300 font-bold">
                      ➔ {sanitizeUtf8Text(helper.adKey)}
                    </div>
                  </div>
                </div>

                {/* Step 3: Matching Anzeige Verbatim */}
                <div
                  dir="ltr"
                  className={`lg:col-span-5 rounded-xl p-3.5 h-full border ${
                    helper.correctLetter === 'X'
                      ? 'bg-rose-950/40 border-rose-500/40'
                      : 'bg-emerald-950/40 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-emerald-300" dir="rtl">
                      3️⃣ الإعلان الأصلي المطابق ({helper.correctLetter})
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-lg font-mono font-black text-xs ${
                        helper.correctLetter === 'X'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {sit.num} ➔ {helper.correctLetter}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-slate-100 whitespace-pre-line line-clamp-4">
                    <HighlightedText
                      text={helper.adText}
                      keywords={kw}
                      highlightEnabled={true}
                      onWordClick={onWordClick}
                    />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-View 1: Split-screen Verbatim Exam View (Situations 11-20 left, Anzeigen A-L right)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" dir="ltr">
      {/* Left 6 Columns: 10 Verbatim Situations (11-20) */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white">Situationen 11–20 (25 Punkte)</h3>
            <p className="text-xs text-slate-400" dir="rtl">
              اختار الإعلان المناسب (A–L) أو اضغط على زر X الأحمر إيلا ما كاين حتى إعلان مناسب!
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
            10 × 2.5P
          </span>
        </div>

        {topic.situations.map((sit, idx) => {
          const correctLetter = activeKey[idx] || sit.correctBase || 'X';
          const selectedLetter = memorizeMode ? correctLetter : userAnswers[sit.num] || '';
          const isCorrect = selectedLetter === correctLetter;
          const helper = helpers[idx];
          const sitKeywords = extractGermanKeywords([helper.sKey, helper.adKey]);

          const handleOpenTutor = () => {
            onAskAi({
              moduleType: 'teil3',
              moduleTitle: `${topic.title} (${topic.arTitle})`,
              itemLabel: `Situation ${sit.num}`,
              questionNum: sit.num,
              textDe: sit.text,
              correctLetter,
              correctTextDe: helper.adText,
              tKey: helper.sKey,
              hKey: helper.adKey,
              arSummary: helper.arHint,
              baseAnswer: topic.ansBase[idx],
              mod1Answer: topic.ansMod1?.[idx],
              mod2Answer: topic.ansMod2?.[idx],
            });
          };

          return (
            <div
              key={sit.num}
              className={`bg-slate-900/95 border rounded-2xl p-4 shadow-xl transition-all ${
                memorizeMode || (isChecked && isCorrect)
                  ? 'border-emerald-500/60'
                  : isChecked && selectedLetter && !isCorrect
                  ? 'border-rose-500/60'
                  : 'border-slate-700/80'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs shrink-0">
                    {sit.num}
                  </span>
                  <p className={`${fontSizeClass} font-semibold text-slate-100 leading-snug whitespace-pre-line`}>
                    <HighlightedText
                      text={sit.text}
                      keywords={sitKeywords}
                      highlightEnabled={highlightMotCle}
                      onWordClick={onWordClick}
                    />
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <AudioListenButton text={sit.text} compact />
                  <button
                    type="button"
                    onClick={handleOpenTutor}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-extrabold border border-indigo-400/40 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                    <span dir="rtl">Ask AI</span>
                  </button>
                  {(memorizeMode || isChecked || selectedLetter) && (
                    <button
                      type="button"
                      onClick={() => scrollToAd(memorizeMode || isChecked ? correctLetter : selectedLetter)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-black text-xs cursor-pointer ${
                        (memorizeMode || isChecked ? correctLetter : selectedLetter) === 'X'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                      title="اضغط للانتقال إلى الإعلان المطابق"
                    >
                      <span>{memorizeMode || isChecked ? correctLetter : selectedLetter}</span>
                      {(memorizeMode || isChecked ? correctLetter : selectedLetter) !== 'X' && (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Live Real Arabic Translation of Situation */}
              <LiveArabicTranslation
                textDe={sit.text}
                curatedAr={memorizeMode || isChecked ? helper.arHint : undefined}
                label={`Situation ${sit.num}`}
                showGlobalTranslation={showTranslation}
                compact
              />

              {/* A-L Buttons + Dedicated Red X Button */}
              <div className="flex flex-wrap items-center gap-1 pt-2.5 mt-2 border-t border-slate-800/80">
                {AD_LETTERS.map((letter) => {
                  const isSelected = selectedLetter === letter;
                  const isRight = correctLetter === letter;

                  let btnStyle = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
                  if (memorizeMode) {
                    btnStyle = isRight
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-400'
                      : 'bg-slate-900 text-slate-500 border-slate-800';
                  } else if (isChecked) {
                    if (isRight) {
                      btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-400';
                    } else if (isSelected && !isRight) {
                      btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-indigo-600 text-white border-indigo-400 font-black ring-2 ring-indigo-400/50';
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => onSelectAnswer(sit.num, letter)}
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${btnStyle}`}
                    >
                      {letter}
                    </button>
                  );
                })}

                {/* Dedicated Red X (لا يوجد إعلان) Button */}
                <button
                  type="button"
                  onClick={() => onSelectAnswer(sit.num, 'X')}
                  className={`px-2.5 h-7 rounded-lg font-mono text-xs font-black border transition-all flex items-center gap-1 cursor-pointer ${
                    memorizeMode
                      ? correctLetter === 'X'
                        ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-400'
                        : 'bg-slate-900 text-rose-400/50 border-slate-800'
                      : isChecked
                      ? correctLetter === 'X'
                        ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-400'
                        : selectedLetter === 'X'
                        ? 'bg-rose-800 text-white border-rose-500'
                        : 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                      : selectedLetter === 'X'
                      ? 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400'
                      : 'bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border-rose-500/40'
                  }`}
                >
                  <span>X</span>
                  <span className="text-[10px] font-sans" dir="rtl">
                    (لا يوجد إعلان)
                  </span>
                </button>
              </div>

              {/* Under-Situation Darija + Mot-Clé Helper */}
              {(showUnderSummary || memorizeMode || isChecked) && (
                <div
                  dir="rtl"
                  className="mt-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>مفتاح الحل (الوضعية {sit.num}):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToAd(correctLetter)}
                      dir="ltr"
                      className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black cursor-pointer"
                    >
                      {sit.num} ➔ {correctLetter}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-200">{sanitizeUtf8Text(helper.arHint)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right 6 Columns: 12 Verbatim Info-Texte / Anzeigen (A-L) */}
      <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-4 max-h-[88vh] overflow-y-auto pr-1">
        <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white">Info-Texte / Anzeigen (A–L)</h3>
            <p className="text-xs text-slate-400" dir="rtl">
              النصوص الـ 12 الأصلية حرف بحرف بدون اختصار — اضغط على أي كلمة أو ظلل أي جملة لترجمتها فوراً!
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
            12 Anzeigen
          </span>
        </div>

        {displayedAdLetters.map((letter) => {
          const adText = topic.ads[letter] || '';
          const matchedSits = usedAdMap[letter] || [];
          const isFlashed = flashedAd === letter;

          return (
            <div
              key={letter}
              id={`teil3-ad-${topic.id}-${letter}`}
              className={`bg-slate-900/95 border rounded-2xl p-4 md:p-5 shadow-xl transition-all ${
                isFlashed
                  ? 'ring-4 ring-amber-400 border-amber-400 bg-amber-950/40'
                  : matchedSits.length > 0
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                      matchedSits.length > 0
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">Anzeige {letter}</span>
                  <AudioListenButton text={adText} compact />
                </div>

                {matchedSits.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {matchedSits.map((sNum) => (
                      <span
                        key={sNum}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sit. {sNum}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`${fontSizeClass} text-slate-100 leading-relaxed whitespace-pre-line font-sans`}>
                <HighlightedText
                  text={adText}
                  keywords={allAdKeywords}
                  highlightEnabled={highlightMotCle}
                  onWordClick={onWordClick}
                />
              </div>

              {/* Live Real Arabic Translation of Advertisement */}
              <LiveArabicTranslation
                textDe={adText}
                label={`Anzeige ${letter}`}
                showGlobalTranslation={showTranslation}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
