import React, { useState } from 'react';
import { SpeedDrillItem, extractGermanKeywords } from '../utils/examEngine';
import { sanitizeUtf8Text } from '../utils/b2StudyEngine';
import { HighlightedText } from './HighlightedText';
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, HelpCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';

interface SpeedDrillViewProps {
  title: string;
  items: SpeedDrillItem[];
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
}

export const SpeedDrillView: React.FC<SpeedDrillViewProps> = ({
  title,
  items,
  streak,
  onIncrementStreak,
  onResetStreak,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [scoreMap, setScoreMap] = useState<Record<string, boolean>>({});

  const currentItem = items[currentIndex] || items[0];
  if (!currentItem) {
    return null;
  }

  const isAnswered = selectedChoice !== null;
  const isCorrect = selectedChoice === currentItem.correctText;
  const keywords = extractGermanKeywords(currentItem.motCleDe);

  // Ensure pre-click hint never leaks the exact German answer word or letter
  const safePreClickHint = (() => {
    const rawHint = sanitizeUtf8Text(currentItem.hintAr || '');
    if (!rawHint) return 'اقرأ النص الألماني بتركيز وحدد الجواب الصحيح بناءً على المعنى.';
    // Strip any accidental German answer word from pre-click hint
    if (currentItem.correctText && rawHint.toLowerCase().includes(currentItem.correctText.toLowerCase())) {
      return `اقرأ سياق (${currentItem.label}) بتمعن واختر الجواب الألماني المناسب دون الاعتماد على الحروف.`;
    }
    return rawHint;
  })();

  const handleSelectChoice = (choice: string) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    const right = choice === currentItem.correctText;
    setScoreMap((prev) => ({ ...prev, [currentItem.id]: right }));
    if (right) {
      onIncrementStreak();
    } else {
      onResetStreak();
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setSelectedChoice(null);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleResetDrill = () => {
    setSelectedChoice(null);
    setCurrentIndex(0);
    setScoreMap({});
  };

  const solvedCount = Object.keys(scoreMap).length;
  const correctCount = Object.values(scoreMap).filter(Boolean).length;

  return (
    <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ تحدي الحفاظة البرقية بدون حروف (Anti-Rote Active Recall)</span>
          </div>
          <h3 className="text-lg font-extrabold text-white">{sanitizeUtf8Text(title)}</h3>
          <p className="text-xs text-slate-400">
            اختار العنوان أو الجواب الألماني الصحيح بلا ما تعتمد على الحروف (A–J) باش ترسخ الكلمات المفتاحية فدماغك!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 px-3.5 py-2 rounded-xl">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className="text-[10px] text-amber-200/80 font-bold">سلسلة الإجابات الصحيحة</div>
              <div className="text-base font-black text-amber-300 font-mono">{streak} 🔥</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 font-bold">النتيجة</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {correctCount} / {items.length}
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDrill}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="إعادة التحدي"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((it, idx) => {
          const status = scoreMap[it.id];
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setSelectedChoice(null);
                setCurrentIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer font-mono ${
                idx === currentIndex
                  ? 'ring-2 ring-white bg-indigo-600 text-white'
                  : status === true
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : status === false
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </div>

      {/* Darija Hint Box (Spoiler-Free before answering!) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-3.5">
        <div className="space-y-1">
          <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>تلميح السياق بالدارجة ({currentItem.label}):</span>
          </div>
          {isAnswered || showHint ? (
            <p className="text-sm font-bold text-amber-200">{safePreClickHint}</p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              التلميح مخفي باش تختبر راسك 100% بالألمانية قبل اختيار الجواب (اضغط «إظهار تلميح السياق» إذا احتجته)
            </p>
          )}
        </div>
        {!isAnswered && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          >
            {showHint ? 'إخفاء التلميح' : 'إظهار تلميح السياق'}
          </button>
        )}
      </div>

      {/* Verbatim German Prompt */}
      <div
        dir="ltr"
        className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-100 leading-relaxed font-sans text-base shadow-inner"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-bold">
            {currentItem.label}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Question {currentIndex + 1} of {items.length}
          </span>
        </div>
        <p className="whitespace-pre-line">
          <HighlightedText text={currentItem.promptDe} keywords={keywords} highlightEnabled={isAnswered} />
        </p>
      </div>

      {/* 4 Shuffled Verbatim German Choices WITHOUT Letters */}
      <div className="space-y-2.5" dir="ltr">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Wählen Sie die richtige deutsche Antwort (ohne Buchstaben A–J):
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {currentItem.choices.map((choice, idx) => {
            const isThisCorrect = choice === currentItem.correctText;
            const isThisSelected = choice === selectedChoice;

            let btnStyle =
              'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-indigo-400/60';
            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50';
              } else if (isThisSelected) {
                btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
              } else {
                btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-65';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 font-semibold transition-all flex items-start justify-between gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className="text-sm md:text-base leading-snug">
                  <HighlightedText text={choice} keywords={keywords} highlightEnabled={isAnswered && isThisCorrect} />
                </span>
                {isAnswered && isThisCorrect && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    {currentItem.correctLetter}
                  </span>
                )}
                {isAnswered && isThisSelected && !isThisCorrect && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white font-mono font-bold text-xs">
                    <XCircle className="w-4 h-4" />
                    Falsch
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Feedback & Mot-Clé Explanation (Revealed ONLY after clicking a choice!) */}
      {isAnswered && (
        <div
          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
            isCorrect
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-100'
          }`}
        >
          <div className="space-y-1.5">
            <div className="font-extrabold text-sm flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>برافو عليك! جواب صحيح 100% ({currentItem.correctLetter} = {sanitizeUtf8Text(currentItem.correctText)})</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>الجواب الصحيح هو ({currentItem.correctLetter}): {sanitizeUtf8Text(currentItem.correctText)}</span>
                </>
              )}
            </div>
            {currentItem.motCleDe && (
              <div className="text-xs flex flex-wrap items-center gap-2">
                <span className="text-slate-300 font-bold">🔑 الموكلي الذهبي (Mot-Clé):</span>
                <span
                  dir="ltr"
                  className="bg-yellow-300 text-slate-950 font-extrabold px-2 py-0.5 rounded font-mono"
                >
                  {sanitizeUtf8Text(currentItem.motCleDe)}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg cursor-pointer"
          >
            <span>السؤال التالي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>السابق</span>
        </button>
        <span>
          تمت الإجابة على {solvedCount} من أصل {items.length}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
        >
          <span>التالي</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
