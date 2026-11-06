import React, { useMemo, useState } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { Teil2Topic } from '../data/lesenTypes';
import { deterministicPermute, resolveVariantAnswer } from '../utils/examEngine';
import { KeywordHighlightText } from './KeywordHighlightText';
import { ExplainerModal, ExplainerModalData } from './ExplainerModal';

interface Teil2SimulatorProps {
  topic: Teil2Topic;
  activeVariant: string;
  userAnswers: Record<number, 'a' | 'b' | 'c'>;
  onSelectAnswer: (questionNumber: number, letter: 'a' | 'b' | 'c') => void;
  memorizeMode: boolean;
  highlightMotCle: boolean;
  showArabic: boolean;
  shuffleSeed: number;
  checked: boolean;
  fontSizeClass: string;
}

export const Teil2Simulator: React.FC<Teil2SimulatorProps> = ({
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
  const [showArticle, setShowArticle] = useState(true);

  const displayedQuestions = useMemo(() => {
    if (shuffleSeed === 0) return topic.questions;
    return deterministicPermute(topic.questions, shuffleSeed);
  }, [topic.questions, shuffleSeed]);

  return (
    <div className="space-y-6">
      {/* Golden Fast-Memorize Banner (Method of Mustapha & Hamza) */}
      <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 arabic-text">
              ملخص الحفظ السريع لـ Lesen Teil 2 (احفظ السؤال + الموكلي الذهبي وتأكد من عدم وجود nicht/kein):
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowArticle((prev) => !prev)}
            className="px-3 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 transition-colors"
          >
            {showArticle ? 'إخفاء نص المقال للتركيز على الأسئلة 6–10' : 'عرض نص المقال الكامل (الألماني + الترجمة)'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {topic.questions.map((q) => {
            const ans = resolveVariantAnswer(q.correctLetterByVariant, activeVariant);
            return (
              <div
                key={q.questionNumber}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-500">
                    Frage {q.questionNumber}
                  </span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase">
                    {ans}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  <mark className="bg-yellow-200/80 dark:bg-yellow-500/30 dark:text-yellow-100 px-1 rounded">
                    {q.motCleDe}
                  </mark>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 arabic-text">
                  {q.motCleAr}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split View: Article Paragraphs + Questions 6-10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {showArticle && (
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 lg:sticky lg:top-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {topic.titleDe}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text mt-0.5">
                {topic.titleAr} — كيجي مع: {topic.linkedWith}
              </p>
            </div>

            <div className="space-y-4">
              {topic.paragraphs.map((p, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className={`${fontSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed`}>
                    <KeywordHighlightText
                      text={p.german}
                      keywords={p.highlightKeywords}
                      enabled={highlightMotCle}
                    />
                  </p>
                  {showArabic && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg arabic-text leading-relaxed">
                      {p.arabic}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions 6-10 */}
        <div className={`${showArticle ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {displayedQuestions.map((q) => {
            const correctLetter = resolveVariantAnswer(q.correctLetterByVariant, activeVariant);
            const options = q.optionsByVariant[activeVariant] || q.optionsByVariant.original;
            const selectedLetter = memorizeMode ? correctLetter : userAnswers[q.questionNumber];
            const isCorrect = selectedLetter === correctLetter;

            return (
              <div
                key={q.questionNumber}
                className={`rounded-xl bg-white dark:bg-slate-900 border p-5 space-y-4 transition-colors ${
                  checked || memorizeMode
                    ? isCorrect
                      ? 'border-emerald-300 dark:border-emerald-700/80'
                      : 'border-rose-300 dark:border-rose-700/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        Aufgabe {q.questionNumber}
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
                              <span>صحيح (+5 Pts) — ({correctLetter.toUpperCase()})</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>خطأ (الجواب الصحيح هو {correctLetter.toUpperCase()})</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <h4 className={`${fontSizeClass} font-bold text-slate-900 dark:text-slate-100 pt-1`}>
                      {q.questionDe}
                    </h4>
                    {showArabic && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                        {q.questionAr}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModalData({
                        title: `Aufgabe ${q.questionNumber} — ${topic.titleDe}`,
                        answerBadge: `Option (${correctLetter.toUpperCase()})`,
                        triggerInQuestion: q.questionDe,
                        twinInText: q.motCleDe,
                        explanationAr: q.explanationAr,
                        trapWarningAr: q.modAlertAr,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 hover:bg-amber-200/80 transition-colors shrink-0"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>اشرح لي لماذا</span>
                  </button>
                </div>

                {/* Explicit Modification Alert if present */}
                {q.modAlertAr && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 arabic-text">
                      {q.modAlertAr}
                    </p>
                  </div>
                )}

                {/* Options a, b, c */}
                <div className="space-y-2">
                  {options.map((opt) => {
                    const isOptSelected = selectedLetter === opt.letter;
                    const isOptCorrect = correctLetter === opt.letter;

                    let cardStyle =
                      'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700';

                    if (memorizeMode || checked) {
                      if (isOptCorrect) {
                        cardStyle =
                          'border-emerald-400 dark:border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30';
                      } else if (isOptSelected && !isOptCorrect) {
                        cardStyle =
                          'border-rose-400 dark:border-rose-600 bg-rose-50/70 dark:bg-rose-950/30';
                      }
                    } else if (isOptSelected) {
                      cardStyle =
                        'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800';
                    }

                    return (
                      <button
                        key={opt.letter}
                        type="button"
                        onClick={() => onSelectAnswer(q.questionNumber, opt.letter)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 ${cardStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 uppercase ${
                            (memorizeMode || checked) && isOptCorrect
                              ? 'bg-emerald-600 text-white'
                              : isOptSelected
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <div className="space-y-1 flex-1">
                          <p className={`${fontSizeClass} font-medium text-slate-900 dark:text-slate-100`}>
                            <KeywordHighlightText
                              text={opt.german}
                              keywords={isOptCorrect ? [q.motCleDe, opt.german] : []}
                              enabled={highlightMotCle && isOptCorrect}
                            />
                          </p>
                          {showArabic && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 arabic-text">
                              {opt.arabic}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ExplainerModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
};
