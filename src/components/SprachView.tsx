import React, { useMemo, useState } from 'react';
import { ExamVariant, Sb1Topic, Sb2Topic, SubViewMode } from '../data/verbatimTypes';
import {
  getSb1AnswerKey,
  getSb2AnswerKey,
  parseSb1Options,
  parseSb2WordBox,
  SpeedDrillItem,
} from '../utils/examEngine';
import { SpeedDrillView } from './SpeedDrillView';
import { CheckCircle2, KeyRound, Sparkles, XCircle } from 'lucide-react';

interface SprachViewProps {
  mode: 'sb1' | 'sb2';
  topic: Sb1Topic | Sb2Topic;
  variant: ExamVariant;
  subView: SubViewMode;
  userAnswers: Record<number, string>;
  onSelectAnswer: (gapNum: number, letter: string) => void;
  highlightMotCle: boolean;
  memorizeMode: boolean;
  showUnderSummary: boolean;
  isChecked: boolean;
  fontScale: number;
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
}

const SB1_LETTERS: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
const SB2_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

export const SprachView: React.FC<SprachViewProps> = ({
  mode,
  topic,
  variant,
  subView,
  userAnswers,
  onSelectAnswer,
  highlightMotCle,
  memorizeMode,
  showUnderSummary,
  isChecked,
  fontScale,
  streak,
  onIncrementStreak,
  onResetStreak,
}) => {
  const [activeGapNum, setActiveGapNum] = useState<number>(mode === 'sb1' ? 21 : 31);

  const startNum = mode === 'sb1' ? 21 : 31;
  const gapNumbers = useMemo(
    () => Array.from({ length: 10 }, (_, idx) => startNum + idx),
    [startNum]
  );

  const activeKey = useMemo(
    () =>
      mode === 'sb1'
        ? getSb1AnswerKey(topic as Sb1Topic, variant)
        : getSb2AnswerKey(topic as Sb2Topic, variant),
    [mode, topic, variant]
  );

  const sb1Parsed = useMemo(
    () => (mode === 'sb1' ? parseSb1Options((topic as Sb1Topic).optionsRaw, topic.ansBase) : {}),
    [mode, topic]
  );

  const sb2WordBox = useMemo(
    () => (mode === 'sb2' ? parseSb2WordBox((topic as Sb2Topic).wordBoxRaw) : {}),
    [mode, topic]
  );

  const getWordForLetter = (gapNum: number, letter: string): string => {
    if (!letter) return '';
    if (mode === 'sb1') {
      const row = sb1Parsed[gapNum];
      return row?.[letter as 'A' | 'B' | 'C'] || letter;
    }
    return sb2WordBox[letter] || letter;
  };

  // Extract context snippet around each gap number in the verbatim text
  const gapContexts = useMemo(() => {
    const map: Record<number, string> = {};
    for (const num of gapNumbers) {
      const regex = new RegExp(`([^.!?\\n]{0,75})\\b_*${num}_*\\b([^.!?\\n]{0,75})`);
      const m = topic.text.match(regex);
      if (m) {
        map[num] = `${m[1].trim()} [ ___${num}___ ] ${m[2].trim()}`;
      } else {
        map[num] = `Lücke ${num} im Text "${topic.title}"`;
      }
    }
    return map;
  }, [topic, gapNumbers]);

  // Build Speed-Drill items for Sub-View 3
  const drillItems: SpeedDrillItem[] = useMemo(() => {
    return gapNumbers.map((num, idx) => {
      const correctLetter = activeKey[idx] || 'A';
      const correctWord = getWordForLetter(num, correctLetter);
      const correctDisplay = `${correctWord} (${correctLetter})`;

      let choices: string[] = [];
      if (mode === 'sb1') {
        choices = SB1_LETTERS.map((l) => `${getWordForLetter(num, l)} (${l})`);
      } else {
        const otherLetters = SB2_LETTERS.filter((l) => l !== correctLetter).slice(idx, idx + 3);
        const rawPool = [
          correctDisplay,
          ...otherLetters.map((l) => `${getWordForLetter(num, l)} (${l})`),
        ];
        choices = rawPool;
      }

      return {
        id: `${topic.id}-gap-${num}`,
        label: `Lücke ${num}`,
        promptDe: gapContexts[num] || topic.text.slice(0, 200),
        hintAr: `الفراغ رقم ${num} — الكلمة الصحيحة فالألمانية هي: ${correctWord}`,
        motCleDe: `${num} ➔ ${correctWord}`,
        correctText: correctDisplay,
        correctLetter,
        choices,
      };
    });
  }, [gapNumbers, activeKey, mode, topic, gapContexts]);

  // Render verbatim text with interactive inline badges for 21..30 or 31..40
  const renderedVerbatimTextWithGaps = useMemo(() => {
    const pattern = mode === 'sb1' ? /(_{0,3}\b(?:2[1-9]|30)\b_{0,3})/g : /(_{0,3}\b(?:3[1-9]|40)\b_{0,3})/g;
    const parts = topic.text.split(pattern);

    return parts.map((part, idx) => {
      const numMatch = part.match(/\b(2[1-9]|30|3[1-9]|40)\b/);
      if (numMatch) {
        const gapNum = parseInt(numMatch[1], 10);
        const gapIdx = gapNum - startNum;
        if (gapIdx >= 0 && gapIdx < 10) {
          const correctLetter = activeKey[gapIdx] || 'A';
          const selectedLetter = memorizeMode ? correctLetter : userAnswers[gapNum] || '';
          const word = getWordForLetter(gapNum, selectedLetter || correctLetter);
          const isCorrect = selectedLetter === correctLetter;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveGapNum(gapNum)}
              className={`inline-flex items-center gap-1.5 mx-1 px-2.5 py-0.5 rounded-lg font-mono text-xs md:text-sm font-black border transition-all cursor-pointer ${
                memorizeMode || highlightMotCle
                  ? 'bg-yellow-300 text-slate-950 border-yellow-400 shadow-xs'
                  : isChecked
                  ? isCorrect
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-rose-600 text-white border-rose-400'
                  : selectedLetter
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : activeGapNum === gapNum
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300'
                  : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
              }`}
            >
              <span className="opacity-75">[{gapNum}]</span>
              <span>
                {memorizeMode || highlightMotCle
                  ? `${correctLetter}: ${getWordForLetter(gapNum, correctLetter)}`
                  : selectedLetter
                  ? `${selectedLetter}: ${word}`
                  : '___'}
              </span>
            </button>
          );
        }
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  }, [topic.text, mode, startNum, activeKey, memorizeMode, userAnswers, highlightMotCle, isChecked, activeGapNum]);

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
        title={`${mode === 'sb1' ? 'Sprachbausteine Teil 1' : 'Sprachbausteine Teil 2'}: ${topic.title}`}
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
              🧠 فاصو الاختصارات والحفظ السريع — {mode === 'sb1' ? 'Sprachbausteine 1' : 'Sprachbausteine 2'} ({topic.title})
            </h3>
            <p className="text-xs text-slate-300">
              احفظ الفراغات الـ 10 ({startNum}–{startNum + 9}) مع الجملة ديالهم والكلمة الألمانية الصحيحة حرف بحرف!
            </p>
          </div>
          <div dir="ltr" className="font-mono text-xs font-extrabold bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-400/40 text-amber-300">
            Code: {activeKey.map((l, i) => `${startNum + i}:${l}`).join(' · ')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" dir="ltr">
          {gapNumbers.map((num, idx) => {
            const correctLetter = activeKey[idx] || 'A';
            const correctWord = getWordForLetter(num, correctLetter);

            return (
              <div
                key={num}
                className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                    Lücke {num}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-300 text-slate-950 font-mono font-black px-2.5 py-1 rounded-lg text-xs md:text-sm">
                      {correctWord}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs">
                      {correctLetter}
                    </span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                  {gapContexts[num]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-View 1: Original Verbatim Exam View
  return (
    <div className="space-y-6" dir="ltr">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Full Verbatim Cloze Text + Verbatim Raw Options/WordBox */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  {mode === 'sb1'
                    ? 'Sprachbausteine Teil 1 (Lücken 21–30 • 15 Punkte)'
                    : 'Sprachbausteine Teil 2 (Lücken 31–40 • 15 Punkte)'}
                </span>
                <h3 className="text-lg md:text-xl font-black text-white">{topic.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                10 × 1.5P = 15P
              </span>
            </div>

            <div className={`${fontSizeClass} text-slate-100 leading-relaxed whitespace-pre-line font-sans`}>
              {renderedVerbatimTextWithGaps}
            </div>
          </div>

          {/* Verbatim OptionsRaw / WordBoxRaw Box (100% Untouched Verbatim Text) */}
          <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5" dir="rtl">
                <KeyRound className="w-4 h-4 text-yellow-300" />
                <span>
                  {mode === 'sb1'
                    ? 'جدول الاختيارات الأصلي حرف بحرف (Original-Optionen 21–30):'
                    : 'صندوق الكلمات الأصلي حرف بحرف (Original-Wortkasten A–O):'}
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">100% Verbatim</span>
            </div>

            {mode === 'sb2' && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {SB2_LETTERS.map((letter) => {
                  const word = sb2WordBox[letter] || '';
                  const usedByGap = gapNumbers.find((gNum, gIdx) => {
                    const chosen = memorizeMode ? activeKey[gIdx] : userAnswers[gNum];
                    return chosen === letter;
                  });
                  return (
                    <div
                      key={letter}
                      className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-between gap-1 ${
                        usedByGap
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div>
                        <strong className="text-amber-400 mr-1">{letter}</strong>
                        <span className={usedByGap && !memorizeMode ? 'line-through opacity-75' : 'font-bold'}>
                          {word}
                        </span>
                      </div>
                      {usedByGap && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                          {usedByGap}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <pre className="text-xs md:text-sm font-mono text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {mode === 'sb1' ? (topic as Sb1Topic).optionsRaw : (topic as Sb2Topic).wordBoxRaw}
            </pre>
          </div>
        </div>

        {/* Right 5 Columns: Interactive Gap Selectors (21..30 or 31..40) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between" dir="rtl">
            <div>
              <h4 className="text-sm font-black text-white">
                🎯 الإجابة التفاعلية على الفراغات ({startNum}–{startNum + 9})
              </h4>
              <p className="text-xs text-slate-400">
                اختار الجواب لكل فراغ أو فعل &quot;وضع الحفظ&quot; لإظهار جميع الحلول بالكلمات!
              </p>
            </div>
          </div>

          {gapNumbers.map((gapNum, idx) => {
            const correctLetter = activeKey[idx] || 'A';
            const selectedLetter = memorizeMode ? correctLetter : userAnswers[gapNum] || '';
            const isCorrect = selectedLetter === correctLetter;
            const correctWord = getWordForLetter(gapNum, correctLetter);

            return (
              <div
                key={gapNum}
                className={`bg-slate-900/95 border rounded-2xl p-3.5 shadow-lg transition-all ${
                  activeGapNum === gapNum ? 'ring-2 ring-amber-400/60 ' : ''
                }${
                  memorizeMode || (isChecked && isCorrect)
                    ? 'border-emerald-500/60'
                    : isChecked && selectedLetter && !isCorrect
                    ? 'border-rose-500/60'
                    : 'border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                      Lücke {gapNum}
                    </span>
                    {(memorizeMode || isChecked || showUnderSummary) && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-yellow-300 text-slate-950 font-mono font-black text-xs">
                        {correctLetter} = {correctWord}
                      </span>
                    )}
                  </div>

                  {isChecked && selectedLetter && (
                    <span className="text-xs font-mono font-bold flex items-center gap-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {mode === 'sb1' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {SB1_LETTERS.map((letter) => {
                      const optLabel = getWordForLetter(gapNum, letter);
                      const isSelected = selectedLetter === letter;
                      const isRight = correctLetter === letter;

                      let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/50';
                      if (memorizeMode) {
                        btnStyle = isRight
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500';
                      } else if (isChecked) {
                        if (isRight) {
                          btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-300 font-black';
                        } else if (isSelected && !isRight) {
                          btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-600 text-white border-indigo-400 font-black';
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => onSelectAnswer(gapNum, letter)}
                          className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-start gap-1.5 cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-black underline">{letter}:</span>
                          <span className="truncate">{optLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1">
                    {SB2_LETTERS.map((letter) => {
                      const isSelected = selectedLetter === letter;
                      const isRight = correctLetter === letter;

                      let btnStyle = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
                      if (memorizeMode) {
                        btnStyle = isRight
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-300'
                          : 'bg-slate-900 text-slate-500 border-slate-800';
                      } else if (isChecked) {
                        if (isRight) {
                          btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-300';
                        } else if (isSelected && !isRight) {
                          btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-600 text-white border-indigo-400 font-black';
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => onSelectAnswer(gapNum, letter)}
                          title={`${letter}: ${sb2WordBox[letter] || ''}`}
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${btnStyle}`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}

                {showUnderSummary && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono flex items-center justify-between">
                    <span className="truncate">{gapContexts[gapNum]}</span>
                    <span className="shrink-0 ml-2 text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {correctLetter} ({correctWord})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
