import React, { useMemo, useState } from 'react';
import { AskAiContextItem, ExamVariant, Sb1Topic, Sb2Topic, SubViewMode } from '../data/verbatimTypes';
import {
  getSb1AnswerKey,
  getSb2AnswerKey,
  parseSb1Options,
  parseSb2WordBox,
  SpeedDrillItem,
} from '../utils/examEngine';
import { explainSprachGapGrammar, translateGermanTextToArabic } from '../utils/b2StudyEngine';
import { SpeedDrillView } from './SpeedDrillView';
import { AudioListenButton } from './AudioListenButton';
import { HighlightedText } from './HighlightedText';
import { Bot, CheckCircle2, ChevronDown, KeyRound, Languages, Sparkles, XCircle } from 'lucide-react';

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
  showTranslation: boolean;
  isChecked: boolean;
  fontScale: number;
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
  onWordClick: (word: string, contextText: string) => void;
  onAskAi: (ctx: AskAiContextItem) => void;
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
  showTranslation,
  isChecked,
  fontScale,
  streak,
  onIncrementStreak,
  onResetStreak,
  onWordClick,
  onAskAi,
}) => {
  const [activeGapNum, setActiveGapNum] = useState<number>(mode === 'sb1' ? 21 : 31);
  const [openDropdownGap, setOpenDropdownGap] = useState<number | null>(null);

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
    () =>
      mode === 'sb1'
        ? parseSb1Options(
            (topic as Sb1Topic).optionsRaw,
            topic.ansBase,
            (topic as Sb1Topic).parsedOptions
          )
        : {},
    [mode, topic]
  );

  const sb2WordBox = useMemo(
    () =>
      mode === 'sb2'
        ? parseSb2WordBox((topic as Sb2Topic).wordBoxRaw, (topic as Sb2Topic).parsedWordBox)
        : {},
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
      const regex = new RegExp(`([^.!?\\n]{0,75})(?:_{1,4}${num}_{1,4}|\\b${num}\\b)([^.!?\\n]{0,75})`);
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

  // Render verbatim text with interactive inline dropdown pills for 21..30 or 31..40 (Exact Sahla B2 Style)
  const renderedVerbatimTextWithGaps = useMemo(() => {
    const pattern =
      mode === 'sb1'
        ? /(_{1,4}(?:2[1-9]|30)_{1,4}|\b(?:2[1-9]|30)\b)/g
        : /(_{1,4}(?:3[1-9]|40)_{1,4}|\b(?:3[1-9]|40)\b)/g;
    const parts = topic.text.split(pattern);

    return parts.map((part, idx) => {
      const numMatch = part.match(/^(?:_{1,4})?(2[1-9]|30|3[1-9]|40)(?:_{1,4})?$/);
      if (numMatch) {
        const gapNum = parseInt(numMatch[1], 10);
        const gapIdx = gapNum - startNum;
        if (gapIdx >= 0 && gapIdx < 10) {
          const correctLetter = activeKey[gapIdx] || 'A';
          const selectedLetter = memorizeMode ? correctLetter : userAnswers[gapNum] || '';
          const activeDisplayLetter = memorizeMode || isChecked ? (selectedLetter || correctLetter) : selectedLetter;
          const displayWord = activeDisplayLetter ? getWordForLetter(gapNum, activeDisplayLetter) : '';
          const isCorrect = selectedLetter === correctLetter;
          const isDropdownOpen = openDropdownGap === gapNum;

          return (
            <span key={idx} className="relative inline-block mx-1 align-middle">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveGapNum(gapNum);
                  setOpenDropdownGap((prev) => (prev === gapNum ? null : gapNum));
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-mono text-xs md:text-sm font-black border transition-all cursor-pointer ${
                  memorizeMode
                    ? 'bg-yellow-300 text-slate-950 border-yellow-400 shadow-xs'
                    : isChecked
                    ? isCorrect
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-rose-600 text-white border-rose-400'
                    : selectedLetter
                    ? highlightMotCle
                      ? 'bg-yellow-300 text-slate-950 border-yellow-400 shadow-xs'
                      : 'bg-indigo-600 text-white border-indigo-400'
                    : activeGapNum === gapNum
                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300'
                    : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
                }`}
              >
                <span>
                  {activeDisplayLetter
                    ? `[ ${gapNum}: (${activeDisplayLetter}) ${displayWord} ✓`
                    : `[ ${gapNum}: (?)`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                <span>]</span>
              </button>

              {/* Inline Interactive Dropdown Popover Right Inside the Sentence */}
              {isDropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 z-30 min-w-[230px] max-w-[310px] bg-slate-900 border-2 border-amber-400 rounded-2xl p-2.5 shadow-2xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 border-b border-slate-800 pb-1">
                    <span>اختر الكلمة للفراغ [{gapNum}]:</span>
                    <button
                      type="button"
                      onClick={() => setOpenDropdownGap(null)}
                      className="text-slate-400 hover:text-white px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {mode === 'sb1' ? (
                    <div className="space-y-1">
                      {SB1_LETTERS.map((l) => {
                        const w = getWordForLetter(gapNum, l);
                        const chosen = selectedLetter === l;
                        const right = correctLetter === l;
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => {
                              onSelectAnswer(gapNum, l);
                              setOpenDropdownGap(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center justify-between cursor-pointer ${
                              chosen
                                ? 'bg-indigo-600 text-white'
                                : memorizeMode && right
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            <span>
                              <strong className="text-amber-300 mr-1.5">{l}:</strong> {w}
                            </span>
                            {(memorizeMode || isChecked) && right && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
                      {SB2_LETTERS.map((l) => {
                        const w = sb2WordBox[l] || l;
                        const chosen = selectedLetter === l;
                        const right = correctLetter === l;
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => {
                              onSelectAnswer(gapNum, l);
                              setOpenDropdownGap(null);
                            }}
                            className={`text-left px-2 py-1 rounded-lg font-mono text-[11px] font-bold truncate cursor-pointer ${
                              chosen
                                ? 'bg-indigo-600 text-white'
                                : memorizeMode && right
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            <strong className="text-amber-300">{l}:</strong> {w}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </span>
          );
        }
      }
      return (
        <HighlightedText
          key={idx}
          text={part}
          keywords={[]}
          highlightEnabled={false}
          onWordClick={onWordClick}
        />
      );
    });
  }, [
    topic.text,
    mode,
    startNum,
    activeKey,
    memorizeMode,
    userAnswers,
    highlightMotCle,
    isChecked,
    activeGapNum,
    openDropdownGap,
    sb1Parsed,
    sb2WordBox,
    onWordClick,
  ]);

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
              احفظ الفراغات الـ 10 ({startNum}–{startNum + 9}) مع الجملة ديالهم والكلمة الألمانية الصحيحة والقاعدة بالدارجة!
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
            const grammarExp = explainSprachGapGrammar(
              num,
              correctLetter,
              correctWord,
              gapContexts[num] || '',
              mode
            );

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
                <div
                  dir="rtl"
                  className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-2.5 text-xs font-bold text-amber-200"
                >
                  💡 {grammarExp.explanationDarija}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-View 1: Original Verbatim Exam View
  return (
    <div className="space-y-6" dir="ltr" onClick={() => setOpenDropdownGap(null)}>
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
              <div className="flex items-center gap-2">
                <AudioListenButton text={topic.text} label="استمع للرسالة" />
                <span className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                  10 × 1.5P = 15P
                </span>
              </div>
            </div>

            <div className="mb-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs font-bold text-indigo-200" dir="rtl">
              🎯 نصيحة: اضغط مباشرة على أي فراغ <span className="font-mono text-amber-300" dir="ltr">[ {startNum}: (?) ▾ ]</span> وسط الجملة لاختيار الكلمة الألمانية وقراءة الجملة كاملة، أو اضغط على أي كلمة لترجمتها!
            </div>

            <div className={`${fontSizeClass} text-slate-100 leading-relaxed whitespace-pre-line font-sans`}>
              {renderedVerbatimTextWithGaps}
            </div>

            {showTranslation && (
              <div
                dir="rtl"
                className="mt-4 bg-cyan-950/45 border border-cyan-500/40 rounded-xl p-3.5 text-xs md:text-sm font-bold text-cyan-200 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-cyan-300 font-black">
                  <Languages className="w-4 h-4" />
                  <span>الترجمة والمعنى العام للنص ({topic.title}):</span>
                </div>
                <p className="leading-relaxed">
                  {translateGermanTextToArabic(topic.text, undefined, topic.title)}
                </p>
              </div>
            )}
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
                      onClick={() => onWordClick(word, topic.text)}
                      title="اضغط لترجمة هذه الأداة/الكلمة"
                      className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-between gap-1 cursor-pointer transition-colors ${
                        usedByGap
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-400/50'
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

        {/* Right 5 Columns: Interactive Gap Selectors (21..30 or 31..40) + Smart B2 Grammar Explainer */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between" dir="rtl">
            <div>
              <h4 className="text-sm font-black text-white">
                🎯 الإجابة التفاعلية + شرح قواعد B2 ({startNum}–{startNum + 9})
              </h4>
              <p className="text-xs text-slate-400">
                كل فراغ مرفق بشرح القاعدة النحوية بالدارجة (حروف الجر، الروابط، Konjunktiv II، ضمائر الوصل)!
              </p>
            </div>
          </div>

          {gapNumbers.map((gapNum, idx) => {
            const correctLetter = activeKey[idx] || 'A';
            const selectedLetter = memorizeMode ? correctLetter : userAnswers[gapNum] || '';
            const isCorrect = selectedLetter === correctLetter;
            const correctWord = getWordForLetter(gapNum, correctLetter);
            const grammarExp = explainSprachGapGrammar(
              gapNum,
              correctLetter,
              correctWord,
              gapContexts[gapNum] || '',
              mode
            );

            const handleOpenGapTutor = () => {
              onAskAi({
                moduleType: mode,
                moduleTitle: topic.title,
                itemLabel: `Lücke ${gapNum}`,
                questionNum: gapNum,
                textDe: gapContexts[gapNum] || topic.text,
                correctLetter,
                correctTextDe: `${correctLetter}: ${correctWord}`,
                tKey: correctWord,
                hKey: grammarExp.ruleCategoryAr,
                arSummary: grammarExp.explanationDarija,
                baseAnswer: topic.ansBase[idx],
                mod1Answer: topic.ansMod1?.[idx],
              });
            };

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

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleOpenGapTutor}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-white text-[11px] font-bold cursor-pointer"
                    >
                      <Bot className="w-3 h-3 text-amber-300" />
                      <span>Ask AI</span>
                    </button>

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

                {/* Smart B2 Grammar Explainer Under Each Blank */}
                {(showUnderSummary || memorizeMode || isChecked) && (
                  <div
                    dir="rtl"
                    className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-black text-amber-300">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                        <span>{grammarExp.ruleCategoryAr}</span>
                      </span>
                      <span dir="ltr" className="text-emerald-400 font-mono">
                        [{gapNum}] {correctLetter}: {correctWord}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-relaxed">
                      {grammarExp.explanationDarija}
                    </p>
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
