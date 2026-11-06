import React, { useMemo, useState } from 'react';
import { Lightbulb, Sparkles, CheckCircle2, XCircle, Table } from 'lucide-react';
import { Teil1Topic } from '../data/lesenTypes';
import { deterministicPermute, resolveVariantAnswer } from '../utils/examEngine';
import { KeywordHighlightText } from './KeywordHighlightText';
import { ExplainerModal, ExplainerModalData } from './ExplainerModal';

interface Teil1SimulatorProps {
  topic: Teil1Topic;
  activeVariant: string;
  userAnswers: Record<number, string>;
  onSelectAnswer: (textNumber: number, letter: string) => void;
  memorizeMode: boolean;
  highlightMotCle: boolean;
  showArabic: boolean;
  shuffleSeed: number;
  checked: boolean;
  fontSizeClass: string;
}

const ALL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const Teil1Simulator: React.FC<Teil1SimulatorProps> = ({
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
  const [showKeywordMatrix, setShowKeywordMatrix] = useState(true);

  const displayedItems = useMemo(() => {
    if (shuffleSeed === 0) return topic.items;
    return deterministicPermute(topic.items, shuffleSeed);
  }, [topic.items, shuffleSeed]);

  // Build dynamic headings bank for activeVariant so each item's variant letter shows its correct heading
  const activeHeadingsBank = useMemo(() => {
    const letterToHeading = new Map<string, { german: string; arabic: string; motCle?: string }>();
    // First populate from topic.items for activeVariant
    topic.items.forEach((item) => {
      const targetLetter = resolveVariantAnswer(item.correctLetterByVariant, activeVariant);
      letterToHeading.set(targetLetter, {
        german: item.headingGerman,
        arabic: item.headingArabic,
        motCle: item.motCleHeading,
      });
    });
    // Fill remaining letters from topic.headings distractors
    const distractors = topic.headings.filter((h) => ! h.motCle);
    let dIdx = 0;
    return ALL_LETTERS.map((letter) => {
      const match = letterToHeading.get(letter);
      if (match) {
        return { letter, ...match };
      }
      const dist = distractors[dIdx % Math.max(1, distractors.length)] || topic.headings[0];
      dIdx++;
      return {
        letter,
        german: dist.german,
        arabic: dist.arabic,
      };
    });
  }, [topic, activeVariant]);

  const usedLetters = useMemo(() => {
    if (memorizeMode) {
      return new Set(
        topic.items.map((it) => resolveVariantAnswer(it.correctLetterByVariant, activeVariant))
      );
    }
    return new Set(Object.values(userAnswers).filter(Boolean));
  }, [userAnswers, memorizeMode, topic.items, activeVariant]);

  return (
    <div className="space-y-6">
      {/* Memory Story & Golden Keyword Matrix Header */}
      <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 arabic-text">
              قصة الكود السحرية (Memory Story):
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowKeywordMatrix((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showKeywordMatrix ? 'إخفاء جدول الموكلي الـ 5' : 'عرض جدول الموكلي الـ 5'}</span>
          </button>
        </div>

        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed arabic-text">
          {topic.memoryStoryAr}
        </p>

        {showKeywordMatrix && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="py-2 px-3 font-semibold">Text</th>
                  <th className="py-2 px-3 font-semibold">Code</th>
                  <th className="py-2 px-3 font-semibold">Mot-Clé في العنوان (Überschrift)</th>
                  <th className="py-2 px-3 font-semibold">Mot-Clé في النص (Twin)</th>
                  <th className="py-2 px-3 font-semibold text-right arabic-text">الخلاصة بالعربية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {topic.items.map((it) => {
                  const ans = resolveVariantAnswer(it.correctLetterByVariant, activeVariant);
                  return (
                    <tr key={it.textNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        Text {it.textNumber}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {ans}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                        <mark className="bg-yellow-200/80 dark:bg-yellow-500/30 dark:text-yellow-100 px-1 rounded">
                          {it.motCleHeading}
                        </mark>
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                        {it.motCleText}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400 arabic-text">
                        {it.headingArabic}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Split View: Headings Bank A-J + 5 Texts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Headings A-J Bank (5 cols on desktop) */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 lg:sticky lg:top-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Überschriften A–J (بنك العناوين)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              5 صحيحة · 5 فخاخ
            </span>
          </div>

          <div className="space-y-2">
            {activeHeadingsBank.map((h) => {
              const isUsed = usedLetters.has(h.letter);
              return (
                <div
                  key={h.letter}
                  className={`p-2.5 rounded-lg border text-sm transition-colors ${
                    isUsed
                      ? 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shrink-0">
                      {h.letter}
                    </span>
                    <div className="space-y-1 flex-1">
                      <p className="font-medium leading-snug">
                        <KeywordHighlightText
                          text={h.german}
                          keywords={h.motCle ? [h.motCle] : []}
                          enabled={highlightMotCle}
                        />
                      </p>
                      {showArabic && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text no-underline">
                          {h.arabic}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Texts (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {displayedItems.map((item, displayIdx) => {
            const correctLetter = resolveVariantAnswer(
              item.correctLetterByVariant,
              activeVariant
            );
            const selectedLetter = memorizeMode
              ? correctLetter
              : userAnswers[item.textNumber] || '';
            const isCorrect = selectedLetter === correctLetter;

            return (
              <div
                key={item.textNumber}
                className={`rounded-xl bg-white dark:bg-slate-900 border p-5 space-y-3.5 transition-colors ${
                  checked || memorizeMode
                    ? isCorrect
                      ? 'border-emerald-300 dark:border-emerald-700/80'
                      : 'border-rose-300 dark:border-rose-700/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      Text {item.textNumber}
                    </span>
                    {shuffleSeed > 0 && (
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        (الترتيب العشوائي #{displayIdx + 1})
                      </span>
                    )}
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
                            <span>صحيح (+5 Pts) — {correctLetter}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>خطأ (الصحيح هو {correctLetter})</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModalData({
                        title: `Text ${item.textNumber} — ${topic.titleDe}`,
                        answerBadge: `Überschrift ${correctLetter}: ${item.headingGerman}`,
                        triggerInQuestion: item.motCleHeading,
                        twinInText: item.motCleText,
                        explanationAr: item.explanationAr,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 hover:bg-amber-200/80 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>اشرح لي لماذا (Mot-Clé)</span>
                  </button>
                </div>

                {/* Pre-filled or Checked Heading Preview */}
                {(memorizeMode || checked) && (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      {correctLetter} — {item.headingGerman}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 arabic-text mt-0.5">
                      {item.headingArabic}
                    </p>
                  </div>
                )}

                {/* German Paragraph */}
                <p className={`${fontSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed`}>
                  <KeywordHighlightText
                    text={item.germanParagraph}
                    keywords={[item.motCleText, item.motCleHeading]}
                    enabled={highlightMotCle}
                  />
                </p>

                {/* Arabic Translation */}
                {showArabic && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed arabic-text">
                      {item.arabicTranslation}
                    </p>
                  </div>
                )}

                {/* Interactive A-J Selector Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">
                    اختر العنوان (A–J):
                  </span>
                  {ALL_LETTERS.map((letter) => {
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
                        onClick={() => onSelectAnswer(item.textNumber, letter)}
                        aria-label={`Assign heading ${letter} to Text ${item.textNumber}`}
                        className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors ${btnClass}`}
                      >
                        {letter}
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
