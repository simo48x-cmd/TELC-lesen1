import React, { useMemo, useState } from 'react';
import { Lightbulb, AlertOctagon, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { Teil3Topic } from '../data/lesenTypes';
import { deterministicPermute, resolveVariantAnswer } from '../utils/examEngine';
import { KeywordHighlightText } from './KeywordHighlightText';
import { ExplainerModal, ExplainerModalData } from './ExplainerModal';

interface Teil3SimulatorProps {
  topic: Teil3Topic;
  activeVariant: string;
  userAnswers: Record<number, string>;
  onSelectAnswer: (situationNumber: number, letter: string) => void;
  memorizeMode: boolean;
  highlightMotCle: boolean;
  showArabic: boolean;
  shuffleSeed: number;
  checked: boolean;
  fontSizeClass: string;
}

const AD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const Teil3Simulator: React.FC<Teil3SimulatorProps> = ({
  topic,
  activeVariant,
  userAnswers,
  onSelectAnswer,
  memorizeMode,
  highlightMotCle,
  showArabic,
  shuffleSeed,
  checked,
  fontSizeClass,
}) => {
  const [modalData, setModalData] = useState<ExplainerModalData | null>(null);
  const [flashedAdLetter, setFlashedAdLetter] = useState<string | null>(null);

  const displayedSituations = useMemo(() => {
    if (shuffleSeed === 0) return topic.situations;
    return deterministicPermute(topic.situations, shuffleSeed);
  }, [topic.situations, shuffleSeed]);

  const usedLetters = useMemo(() => {
    if (memorizeMode) {
      return new Set(
        topic.situations
          .map((s) => resolveVariantAnswer(s.correctLetterByVariant, activeVariant))
          .filter((l) => l !== 'X')
      );
    }
    return new Set(Object.values(userAnswers).filter((l) => l && l !== 'X'));
  }, [userAnswers, memorizeMode, topic.situations, activeVariant]);

  const scrollToAnzeige = (letter: string) => {
    if (letter === 'X') return;
    setFlashedAdLetter(letter);
    const el = document.getElementById(`anzeige-card-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setFlashedAdLetter((prev) => (prev === letter ? null : prev));
    }, 2600);
  };

  return (
    <div className="space-y-6">
      {/* 10-Situation Code Strip with Crimson X Trap Highlighting */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 arabic-text">
              خريطة كود Lesen Teil 3 (من 11 إلى 20 — انتبه لمواقع الفخ X بالأحمر!):
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            كيجي مع: {topic.linkedWith}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {topic.situations.map((s) => {
            const ans = resolveVariantAnswer(s.correctLetterByVariant, activeVariant);
            const isX = ans === 'X';
            return (
              <div
                key={s.situationNumber}
                className={`p-2 rounded-lg border text-center ${
                  isX
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  #{s.situationNumber}
                </div>
                <div
                  className={`font-mono font-bold text-sm ${
                    isX
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {ans}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split View: 10 Situations (11-20) + 12 Anzeigen (A-L) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Top: 10 Situations 11-20 (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {displayedSituations.map((s) => {
            const correctLetter = resolveVariantAnswer(s.correctLetterByVariant, activeVariant);
            const selectedLetter = memorizeMode
              ? correctLetter
              : userAnswers[s.situationNumber] || '';
            const isCorrect = selectedLetter === correctLetter;
            const isWrongAfterCheck = checked && selectedLetter !== correctLetter;

            return (
              <div
                key={s.situationNumber}
                onClick={() => {
                  if (isWrongAfterCheck && correctLetter !== 'X') {
                    scrollToAnzeige(correctLetter);
                  }
                }}
                className={`rounded-xl bg-white dark:bg-slate-900 border p-4 space-y-3 transition-colors ${
                  checked || memorizeMode
                    ? isCorrect
                      ? 'border-emerald-300 dark:border-emerald-700/80'
                      : 'border-rose-400 dark:border-rose-600 bg-rose-50/20 dark:bg-rose-950/15 cursor-pointer'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      Situation {s.situationNumber}
                    </span>

                    {(checked || memorizeMode) && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          isCorrect
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>صحيح (+2.5 Pts) — {correctLetter}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>خطأ! الصحيح هو {correctLetter}</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {correctLetter !== 'X' && (checked || memorizeMode) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToAnzeige(correctLetter);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>اذهب للإعلان {correctLetter}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalData({
                          title: `Situation ${s.situationNumber} — ${topic.titleDe}`,
                          answerBadge:
                            correctLetter === 'X'
                              ? 'X (Keine passende Anzeige)'
                              : `Anzeige ${correctLetter}`,
                          triggerInQuestion: s.motCleSituation,
                          twinInText: s.motCleAnzeige,
                          explanationAr: s.explanationAr,
                          trapWarningAr: s.trapWarningAr,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 hover:bg-amber-200/80 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>الموكلي</span>
                    </button>
                  </div>
                </div>

                {/* Situation Text */}
                <p className={`${fontSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed`}>
                  <KeywordHighlightText
                    text={s.situationDe}
                    keywords={[s.motCleSituation]}
                    enabled={highlightMotCle}
                  />
                </p>

                {showArabic && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg arabic-text">
                    {s.situationAr}
                  </p>
                )}

                {s.trapWarningAr && (checked || memorizeMode || highlightMotCle) && (
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 arabic-text">
                    {s.trapWarningAr}
                  </p>
                )}

                {/* Selector Buttons: A-L + Dedicated Red/Amber X Button */}
                <div
                  className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    {AD_LETTERS.map((letter) => {
                      const isSelected = selectedLetter === letter;
                      const isAnswer = correctLetter === letter;
                      let btnClass =
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

                      if (memorizeMode || checked) {
                        if (isAnswer) {
                          btnClass = 'bg-emerald-600 text-white ring-2 ring-emerald-400';
                        } else if (isSelected && !isAnswer) {
                          btnClass = 'bg-rose-600 text-white';
                        }
                      } else if (isSelected) {
                        btnClass = 'bg-slate-900 text-white dark:bg-white dark:text-slate-900';
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => onSelectAnswer(s.situationNumber, letter)}
                          aria-label={`Select Anzeige ${letter} for Situation ${s.situationNumber}`}
                          className={`w-7 h-7 rounded-md font-mono text-xs font-bold transition-colors ${btnClass}`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dedicated X (Keine passende Anzeige) Button */}
                  <button
                    type="button"
                    onClick={() => onSelectAnswer(s.situationNumber, 'X')}
                    aria-label={`Select X (Keine passende Anzeige) for Situation ${s.situationNumber}`}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors whitespace-nowrap shrink-0 ${
                      (memorizeMode || checked) && correctLetter === 'X'
                        ? 'bg-rose-600 border-rose-600 text-white ring-2 ring-rose-400'
                        : selectedLetter === 'X'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    X (لا يوجد إعلان)
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right/Bottom: 12 Anzeigen A-L (5 cols) */}
        <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-4 max-h-[85vh] overflow-y-auto pr-1">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Anzeigen A–L (الإعلانات الـ 12)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text mt-0.5">
              اضغط على أي سؤال خاطئ بعد التصحيح للانتقال التلقائي إلى الإعلان الصحيح وتلوين الموكلي!
            </p>
          </div>

          {topic.anzeigen.map((ad) => {
            const isUsed = usedLetters.has(ad.letter);
            const isFlashed = flashedAdLetter === ad.letter;

            return (
              <div
                key={ad.letter}
                id={`anzeige-card-${ad.letter}`}
                className={`rounded-xl border p-4 space-y-2 transition-all ${
                  isFlashed
                    ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-400'
                    : isUsed
                    ? 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      Anzeige {ad.letter}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {ad.titleDe}
                    </h4>
                  </div>
                  {isUsed && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      تم اختياره ✓
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <KeywordHighlightText
                    text={ad.bodyDe}
                    keywords={[ad.motCle]}
                    enabled={highlightMotCle || isFlashed}
                  />
                </p>

                {showArabic && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text border-t border-slate-100 dark:border-slate-800 pt-1.5">
                    {ad.arabicTranslation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ExplainerModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
};
