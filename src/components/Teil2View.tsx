import React, { useMemo } from 'react';
import { ExamVariant, SubViewMode, Teil2Topic } from '../data/verbatimTypes';
import {
  buildTeil2SpeedDrill,
  extractGermanKeywords,
  getTeil2AnswerKey,
} from '../utils/examEngine';
import { HighlightedText } from './HighlightedText';
import { SpeedDrillView } from './SpeedDrillView';
import { CheckCircle2, KeyRound, Sparkles, XCircle } from 'lucide-react';

interface Teil2ViewProps {
  topic: Teil2Topic;
  variant: ExamVariant;
  subView: SubViewMode;
  userAnswers: Record<number, string>;
  onSelectAnswer: (qNum: number, letter: string) => void;
  highlightMotCle: boolean;
  memorizeMode: boolean;
  showUnderSummary: boolean;
  shuffleMode: boolean;
  isChecked: boolean;
  fontScale: number;
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
}

export const Teil2View: React.FC<Teil2ViewProps> = ({
  topic,
  variant,
  subView,
  userAnswers,
  onSelectAnswer,
  highlightMotCle,
  memorizeMode,
  showUnderSummary,
  shuffleMode,
  isChecked,
  fontScale,
  streak,
  onIncrementStreak,
  onResetStreak,
}) => {
  const activeKey = useMemo(() => getTeil2AnswerKey(topic, variant), [topic, variant]);

  const articleKeywords = useMemo(() => {
    const raw = topic.questions.map((q) => q.trigger?.key || '').filter(Boolean);
    return extractGermanKeywords(raw);
  }, [topic]);

  const drillItems = useMemo(() => buildTeil2SpeedDrill(topic, variant), [topic, variant]);

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
        title={`Lesen Teil 2: ${topic.title} (${topic.arTitle})`}
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
              🧠 فاصو الاختصارات والفهم السريع — Lesen Teil 2 ({topic.title})
            </h3>
            <p className="text-xs text-slate-300">
              الأسئلة 6 إلى 10 مرتبة: الفهم بالدارجة ➔ الموكلي بالأصفر ➔ الجواب الألماني الصحيح حرف بحرف!
            </p>
          </div>
          <div dir="ltr" className="font-mono text-xs font-extrabold bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-400/40 text-amber-300">
            Code ({variant.toUpperCase()}): {activeKey.map((l, i) => `${i + 6}:${l}`).join(' · ')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {topic.questions.map((q, idx) => {
            const correctLetter = activeKey[idx] || q.correctBase || 'A';
            const correctOptionDe = q.options[correctLetter] || '';
            const qKeywords = extractGermanKeywords(q.trigger?.key);

            return (
              <div
                key={q.num}
                className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
              >
                {/* Step 1: Darija Summary */}
                <div className="lg:col-span-4 bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-3.5 h-full">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-indigo-300">1️⃣ الفهم بالدارجة / السؤال</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                      Frage {q.num}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-100 mb-2">
                    {q.trigger?.ar || `السؤال ${q.num} من موضوع ${topic.arTitle}`}
                  </p>
                  <p dir="ltr" className="text-xs text-indigo-200/90 font-semibold border-t border-indigo-500/20 pt-1.5">
                    {q.q}
                  </p>
                </div>

                {/* Step 2: Mot-Clé */}
                <div className="lg:col-span-4 bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 h-full flex flex-col justify-center">
                  <div className="text-xs font-black text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-yellow-300" />
                    <span>2️⃣ الموكلي المفتاحي (Mot-Clé)</span>
                  </div>
                  <div dir="ltr">
                    <span className="inline-block bg-yellow-300 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs md:text-sm font-mono">
                      {q.trigger?.key || '—'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Verbatim Correct Option */}
                <div
                  dir="ltr"
                  className="lg:col-span-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 h-full flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-emerald-300" dir="rtl">
                      3️⃣ الجواب الألماني الأصلي حرف بحرف
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs">
                      {correctLetter}
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-bold text-white leading-snug">
                    <HighlightedText text={correctOptionDe} keywords={qKeywords} highlightEnabled={true} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-View 1: Split-screen Verbatim Exam View (7 cols Article left, 5 cols Questions right)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" dir="ltr">
      {/* Left 7 Columns: Full Verbatim German Article */}
      <div className="lg:col-span-7 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl lg:sticky lg:top-4 max-h-[85vh] overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Lesen Teil 2 • Original-Artikel (Ungekürzt)
            </span>
            <h3 className="text-lg md:text-xl font-black text-white">{topic.title}</h3>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-lg" dir="rtl">
            {topic.arTitle}
          </span>
        </div>

        <div className={`${fontSizeClass} text-slate-100 leading-relaxed whitespace-pre-line font-sans`}>
          <HighlightedText
            text={topic.article}
            keywords={articleKeywords}
            highlightEnabled={highlightMotCle}
          />
        </div>
      </div>

      {/* Right 5 Columns: Verbatim Questions 6-10 */}
      <div className="lg:col-span-5 space-y-4">
        {topic.questions.map((q, idx) => {
          const correctLetter = activeKey[idx] || q.correctBase || 'A';
          const selectedLetter = memorizeMode ? correctLetter : userAnswers[q.num] || '';
          const isCorrect = selectedLetter === correctLetter;
          const qKeywords = extractGermanKeywords(q.trigger?.key);
          const optionLetters = shuffleMode ? ['C', 'B', 'A'] : ['A', 'B', 'C'];

          return (
            <div
              key={q.num}
              className={`bg-slate-900/95 border rounded-2xl p-4 md:p-5 shadow-xl transition-all ${
                memorizeMode || (isChecked && isCorrect)
                  ? 'border-emerald-500/60'
                  : isChecked && selectedLetter && !isCorrect
                  ? 'border-rose-500/60'
                  : 'border-slate-700/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs shrink-0">
                    {q.num}
                  </span>
                  <h4 className={`${fontSizeClass} font-extrabold text-white leading-snug`}>
                    <HighlightedText text={q.q} keywords={qKeywords} highlightEnabled={highlightMotCle} />
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {optionLetters.map((letter) => {
                  const optText = q.options[letter] || '';
                  const isSelected = selectedLetter === letter;
                  const isRight = correctLetter === letter;

                  let cardStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-indigo-500/50';
                  if (memorizeMode) {
                    cardStyle = isRight
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500';
                  } else if (isChecked) {
                    if (isRight) {
                      cardStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400';
                    } else if (isSelected && !isRight) {
                      cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-100';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-indigo-950/90 border-indigo-400 text-white ring-1 ring-indigo-400';
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => onSelectAnswer(q.num, letter)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 cursor-pointer ${cardStyle}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-6 h-6 shrink-0 rounded-md font-mono font-black text-xs flex items-center justify-center ${
                            isSelected || (memorizeMode && isRight)
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className={`${fontSizeClass} font-medium leading-snug`}>
                          <HighlightedText
                            text={optText}
                            keywords={qKeywords}
                            highlightEnabled={highlightMotCle}
                          />
                        </span>
                      </div>
                      {isChecked && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {isChecked && isSelected && !isRight && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Under-Question Darija + Mot-Clé Card */}
              {(showUnderSummary || memorizeMode || isChecked) && q.trigger && (
                <div
                  dir="rtl"
                  className="mt-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>الفهم بالدارجة والموكلي (السؤال {q.num}):</span>
                    </span>
                    <span dir="ltr" className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono">
                      {q.num}:{correctLetter}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200">{q.trigger.ar}</p>
                  {q.trigger.key && (
                    <div dir="ltr" className="pt-0.5">
                      <span className="inline-block bg-yellow-300 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded">
                        🔑 {q.trigger.key}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
