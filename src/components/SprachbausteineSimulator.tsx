import React from 'react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { SprachbausteinTopic } from '../data/lesenTypes';

interface SprachbausteineSimulatorProps {
  topic: SprachbausteinTopic;
  userAnswers: Record<number, string>;
  onSelectAnswer: (gapNumber: number, option: string) => void;
  memorizeMode: boolean;
  highlightMotCle: boolean;
  showArabic: boolean;
  checked: boolean;
  fontSizeClass: string;
}

export const SprachbausteineSimulator: React.FC<SprachbausteineSimulatorProps> = ({
  topic,
  userAnswers,
  onSelectAnswer,
  memorizeMode,
  highlightMotCle,
  showArabic,
  checked,
  fontSizeClass,
}) => {
  return (
    <div className="space-y-5">
      {/* Code Summary Banner */}
      <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 arabic-text">
            {topic.introTextAr}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {topic.gaps.map((g) => (
            <span
              key={g.gapNumber}
              className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-slate-100 font-semibold"
            >
              {g.gapNumber}: <span className="text-emerald-700 dark:text-emerald-400">{g.correctAnswer}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 10 Cloze Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topic.gaps.map((gap) => {
          const selected = memorizeMode ? gap.correctAnswer : userAnswers[gap.gapNumber] || '';
          const isCorrect = selected === gap.correctAnswer;

          return (
            <div
              key={gap.gapNumber}
              className={`rounded-xl bg-white dark:bg-slate-900 border p-4 space-y-3 transition-colors ${
                checked || memorizeMode
                  ? isCorrect
                    ? 'border-emerald-300 dark:border-emerald-700/80'
                    : 'border-rose-300 dark:border-rose-700/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  Lücke {gap.gapNumber}
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
                        <span>صحيح (+1.5 Pts)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>الصحيح: {gap.correctAnswer}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <p className={`${fontSizeClass} font-medium text-slate-900 dark:text-slate-100`}>
                {highlightMotCle ? (
                  <mark className="bg-yellow-200 dark:bg-yellow-500/40 text-slate-950 dark:text-yellow-100 px-1.5 py-0.5 rounded font-bold">
                    {gap.contextDe}
                  </mark>
                ) : (
                  gap.contextDe
                )}
              </p>

              {/* Options */}
              <div className="flex flex-wrap gap-2">
                {gap.options.map((opt) => {
                  const isOptSelected = selected === opt;
                  const isOptCorrect = gap.correctAnswer === opt;
                  let btnStyle =
                    'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200';

                  if (memorizeMode || checked) {
                    if (isOptCorrect) {
                      btnStyle = 'bg-emerald-600 text-white ring-2 ring-emerald-400';
                    } else if (isOptSelected && !isOptCorrect) {
                      btnStyle = 'bg-rose-600 text-white';
                    }
                  } else if (isOptSelected) {
                    btnStyle = 'bg-slate-900 text-white dark:bg-white dark:text-slate-900';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onSelectAnswer(gap.gapNumber, opt)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {(showArabic || checked || memorizeMode) && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg arabic-text">
                  💡 القاعدة: {gap.ruleExplanationAr}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
