import React, { useMemo, useState } from 'react';
import {
  AskAiContextItem,
  ExamVariant,
  Sb1Topic,
  Sb2Topic,
  SubViewMode,
} from '../data/verbatimTypes';
import {
  getSb1AnswerKey,
  getSb2AnswerKey,
  parseSb1OptionsMap,
  parseSb2WordBox,
  SpeedDrillItem,
} from '../utils/examEngine';
import {
  explainSprachbausteinChoice,
  safeSliceText,
  sanitizeUtf8Text,
} from '../utils/b2StudyEngine';
import { SpeedDrillView } from './SpeedDrillView';
import { HighlightedText } from './HighlightedText';
import { AudioListenButton } from './AudioListenButton';
import { LiveArabicTranslation } from './LiveArabicTranslation';
import { Bot, CheckCircle2, ChevronDown, KeyRound, Sparkles, X, XCircle } from 'lucide-react';

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
  shuffleMode?: boolean;
  isChecked: boolean;
  fontScale: number;
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
  onWordClick: (word: string, contextText: string) => void;
  onAskAi: (ctx: AskAiContextItem) => void;
}

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
  const [activePopoverGap, setActivePopoverGap] = useState<number | null>(null);

  const isSb1 = mode === 'sb1';
  const gapNumbers = useMemo(
    () => (isSb1 ? [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] : [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]),
    [isSb1]
  );

  const activeKey = useMemo(() => {
    if (isSb1) return getSb1AnswerKey(topic as Sb1Topic, variant);
    return getSb2AnswerKey(topic as Sb2Topic, variant);
  }, [isSb1, topic, variant]);

  const sb1OptionsMap = useMemo(() => {
    if (!isSb1) return {};
    return parseSb1OptionsMap(topic as Sb1Topic);
  }, [isSb1, topic]);

  const sb2WordBoxMap = useMemo(() => {
    if (isSb1) return {};
    return parseSb2WordBox(topic as Sb2Topic);
  }, [isSb1, topic]);

  const sb2Letters = useMemo(() => {
    const keys = Object.keys(sb2WordBoxMap).sort();
    return keys.length > 0
      ? keys
      : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
  }, [sb2WordBoxMap]);

  // Used word-box letters in SB2
  const usedSb2LetterMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (isSb1) return map;
    gapNumbers.forEach((num, idx) => {
      const chosen = memorizeMode ? activeKey[idx] : userAnswers[num];
      if (chosen) map[chosen] = num;
    });
    return map;
  }, [isSb1, gapNumbers, memorizeMode, activeKey, userAnswers]);

  // Extract complete, unbroken German sentence surrounding each gap (21..30 or 31..40)
  const gapContexts = useMemo(() => {
    const map: Record<number, string> = {};
    const cleanText = sanitizeUtf8Text(topic.text);
    // Split into full sentences by sentence punctuation or paragraph break
    const rawSentences = cleanText
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    gapNumbers.forEach((num) => {
      const gapPattern = new RegExp(`_{1,4}\\s*${num}\\s*_{1,4}`);
      const matchingSentence = rawSentences.find((s) => gapPattern.test(s));
      if (matchingSentence) {
        const formatted = matchingSentence
          .replace(gapPattern, ` [ الفراغ ${num} ] `)
          .replace(/_{1,4}\s*(\d+)\s*_{1,4}/g, ' [ الفراغ $1 ] ')
          .replace(/\s+/g, ' ')
          .trim();
        map[num] = formatted;
      } else {
        map[num] = `[ الفراغ ${num} ]`;
      }
    });
    return map;
  }, [topic.text, gapNumbers]);

  // Speed-Drill items for Sprachbausteine (NO answer spoilers in hintAr!)
  const drillItems: SpeedDrillItem[] = useMemo(() => {
    return gapNumbers.map((num, idx) => {
      const correctLetter = activeKey[idx] || 'A';
      const correctWord = isSb1
        ? sb1OptionsMap[num]?.[correctLetter] || correctLetter
        : sb2WordBoxMap[correctLetter] || correctLetter;

      let choices: string[] = [];
      if (isSb1) {
        const opts = sb1OptionsMap[num] || { A: 'A', B: 'B', C: 'C' };
        choices = Object.values(opts);
      } else {
        const allWords = Object.values(sb2WordBoxMap);
        const distractors = allWords.filter((w) => w !== correctWord).slice(idx % 5, (idx % 5) + 3);
        choices = [correctWord, ...distractors];
      }

      return {
        id: `${topic.id}-gap-${num}`,
        num,
        label: `Lücke ${num}`,
        promptDe: gapContexts[num] || `Lücke ___${num}___`,
        hintAr: `الفراغ رقم ${num} — اقرأ جملة السياق بتمعن واختر الأداة أو الكلمة الألمانية الصحيحة`,
        motCleDe: correctWord,
        correctLetter,
        correctText: correctWord,
        choices,
      };
    });
  }, [gapNumbers, activeKey, isSb1, sb1OptionsMap, sb2WordBoxMap, topic.id, gapContexts]);

  // Render Verbatim German Text with Interactive Clickable Inline Gap Dropdown Pills
  // Match ONLY underscore-wrapped gaps (e.g. ___21___ .. ___40___) so bare numbers in text never collide!
  const renderTextWithInteractiveGaps = () => {
    const cleanFullText = sanitizeUtf8Text(topic.text);
    const gapRegex = /(_{1,4}\s*(?:2[1-9]|30|3[1-9]|40)\s*_{1,4})/g;
    const parts = cleanFullText.split(gapRegex);

    return parts.map((part, idx) => {
      if (/^_{1,4}\s*(?:2[1-9]|30|3[1-9]|40)\s*_{1,4}$/.test(part)) {
        const num = parseInt(part.replace(/[^0-9]/g, ''), 10);
        const gapIdx = gapNumbers.indexOf(num);
        if (gapIdx === -1) return <React.Fragment key={idx}>{part}</React.Fragment>;

        const correctLetter = activeKey[gapIdx] || 'A';
        const selectedLetter = memorizeMode ? correctLetter : userAnswers[num] || '';
        const isRight = selectedLetter === correctLetter;

        const chosenWord = selectedLetter
          ? isSb1
            ? sb1OptionsMap[num]?.[selectedLetter] || selectedLetter
            : sb2WordBoxMap[selectedLetter] || selectedLetter
          : '';

        const correctWord = isSb1
          ? sb1OptionsMap[num]?.[correctLetter] || correctLetter
          : sb2WordBoxMap[correctLetter] || correctLetter;

        let pillClass =
          'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-400/60 hover:border-amber-300';
        if (memorizeMode || (highlightMotCle && isChecked)) {
          pillClass =
            'bg-yellow-300 text-slate-950 border-amber-500 font-black shadow-sm ring-2 ring-yellow-300/50';
        } else if (isChecked) {
          if (selectedLetter && isRight) {
            pillClass = 'bg-emerald-500 text-slate-950 border-emerald-300 font-black';
          } else if (selectedLetter && !isRight) {
            pillClass = 'bg-rose-600 text-white border-rose-300 font-black';
          } else {
            pillClass = 'bg-amber-500 text-slate-950 border-amber-300 font-black';
          }
        } else if (selectedLetter) {
          pillClass = 'bg-indigo-600 text-white border-indigo-300 font-black shadow-sm';
        }

        return (
          <span key={idx} className="relative inline-block mx-1 my-0.5 align-middle">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePopoverGap((prev) => (prev === num ? null : num));
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border font-mono text-xs md:text-sm transition-all cursor-pointer ${pillClass}`}
              title="اضغط لاختيار الكلمة المناسبة مباشرة داخل الجملة"
            >
              <span className="font-black">
                [ {num}:{' '}
                {memorizeMode
                  ? `(${correctLetter}) ${correctWord} ✓`
                  : isChecked
                  ? selectedLetter
                    ? isRight
                      ? `(${selectedLetter}) ${chosenWord} ✓`
                      : `(${selectedLetter}) ✗ ➔ (${correctLetter}) ${correctWord}`
                    : `(${correctLetter}) ${correctWord}`
                  : selectedLetter
                  ? `(${selectedLetter}) ${chosenWord}`
                  : '(?) ▾'}{' '}
                ]
              </span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>
          </span>
        );
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
  };

  const fontSizeClass =
    fontScale <= -1
      ? 'text-sm'
      : fontScale === 0
      ? 'text-base'
      : fontScale === 1
      ? 'text-lg'
      : 'text-xl';

  const arSubtitle = topic.arTitle || (isSb1 ? 'رسالة وفراغات B2' : 'مقال وصندوق الكلمات B2');

  if (subView === 'drill') {
    return (
      <SpeedDrillView
        title={`${isSb1 ? 'Sprachbausteine Teil 1' : 'Sprachbausteine Teil 2'}: ${topic.title} (${arSubtitle})`}
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
              🧠 فاصو الاختصارات والفهم السريع — {isSb1 ? 'Sprachbausteine 1' : 'Sprachbausteine 2'} ({topic.title})
            </h3>
            <p className="text-xs text-slate-300">
              جميع الفراغات ({gapNumbers[0]}–{gapNumbers[9]}) مرتبة مع الجملة الكاملة والكلمة الصحيحة وشرح القاعدة بالدارجة!
            </p>
          </div>
          <div dir="ltr" className="font-mono text-xs font-extrabold bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-400/40 text-amber-300">
            Code ({variant.toUpperCase()}): {gapNumbers.map((n, i) => `${n}:${activeKey[i]}`).join(' · ')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {gapNumbers.map((num, idx) => {
            const correctLetter = activeKey[idx] || 'A';
            const correctWord = isSb1
              ? sb1OptionsMap[num]?.[correctLetter] || correctLetter
              : sb2WordBoxMap[correctLetter] || correctLetter;
            const rule = explainSprachbausteinChoice(correctWord, num, gapContexts[num] || '');

            return (
              <div
                key={num}
                className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2" dir="ltr">
                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                    Lücke {num}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="px-3 py-1 rounded-lg bg-yellow-300 text-slate-950 font-mono font-black text-xs md:text-sm">
                      {correctLetter} = {correctWord}
                    </span>
                  </div>
                </div>

                <p dir="ltr" className="text-xs md:text-sm text-slate-200 font-sans bg-slate-950/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {gapContexts[num]}
                </p>

                <div dir="rtl" className="bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-2.5 text-xs space-y-0.5">
                  <div className="font-black text-amber-300">💡 {rule.categoryAr}:</div>
                  <div className="font-semibold text-slate-200">{rule.ruleAr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-View 1: Split-Screen Verbatim Exam View with Inline Dropdowns
  return (
    <div className="space-y-4">
      {/* Inline Popover Modal when user clicks a [ 21: (?) ▾ ] pill directly inside the text */}
      {activePopoverGap !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setActivePopoverGap(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-extrabold text-amber-300">
                  [{activePopoverGap}] اختر الكلمة المناسبة للفراغ:
                </span>
                <p dir="ltr" className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  {safeSliceText(gapContexts[activePopoverGap] || '', 110)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePopoverGap(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSb1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" dir="ltr">
                {(['A', 'B', 'C'] as const).map((letter) => {
                  const word = sb1OptionsMap[activePopoverGap]?.[letter] || letter;
                  const currentSelected = userAnswers[activePopoverGap];
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        onSelectAnswer(activePopoverGap, letter);
                        setActivePopoverGap(null);
                      }}
                      className={`p-3 rounded-xl border font-mono text-sm font-bold flex items-center justify-between cursor-pointer ${
                        currentSelected === letter
                          ? 'bg-indigo-600 text-white border-indigo-300 ring-2 ring-indigo-400'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                    >
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-black text-xs">
                        {letter}
                      </span>
                      <span>{word}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto" dir="ltr">
                {sb2Letters.map((letter) => {
                  const word = sb2WordBoxMap[letter] || letter;
                  const currentSelected = userAnswers[activePopoverGap];
                  const usedByOther = usedSb2LetterMap[letter] && usedSb2LetterMap[letter] !== activePopoverGap;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        onSelectAnswer(activePopoverGap, letter);
                        setActivePopoverGap(null);
                      }}
                      className={`p-2.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        currentSelected === letter
                          ? 'bg-indigo-600 text-white border-indigo-300 ring-2 ring-indigo-400'
                          : usedByOther
                          ? 'bg-slate-950/40 text-slate-500 border-slate-800'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                    >
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-black">
                        {letter}
                      </span>
                      <span className="truncate">{word}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" dir="ltr">
        {/* Left 7 Columns: Verbatim Cloze Text + Word Box (if SB2) */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  {isSb1
                    ? 'Sprachbausteine Teil 1 • Lückentext 21–30 (15 Punkte)'
                    : 'Sprachbausteine Teil 2 • Lückentext 31–40 (15 Punkte)'}
                </span>
                <h3 className="text-lg md:text-xl font-black text-white">{topic.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AudioListenButton text={topic.text} label="استمع للنص" />
                <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-lg" dir="rtl">
                  {arSubtitle}
                </span>
              </div>
            </div>

            <div className="mb-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3.5 py-2 text-xs text-indigo-200 flex items-center justify-between" dir="rtl">
              <span>💡 اضغط مباشرة على أي فراغ <strong dir="ltr">[ 21: (?) ▾ ]</strong> وسط الجملة لاختيار الكلمة المناسبة أو اضغط على أي كلمة لترجمتها!</span>
            </div>

            <div className={`${fontSizeClass} text-slate-100 leading-loose whitespace-pre-line font-sans bg-slate-950/80 p-4 md:p-5 rounded-xl border border-slate-800`}>
              {renderTextWithInteractiveGaps()}
            </div>

            <LiveArabicTranslation
              textDe={topic.text}
              label={`${topic.title} (${arSubtitle})`}
              showGlobalTranslation={showTranslation}
            />
          </div>

          {/* SB2 15-Word Box (A-O) */}
          {!isSb1 && (
            <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 md:p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h4 className="text-sm font-black text-amber-300">
                  📦 صندوق الكلمات الـ 15 الأصلي (Wortkasten A–O)
                </h4>
                <span className="text-xs text-slate-400" dir="rtl">
                  اضغط على أي كلمة لمعرفة قاعدتها أو اخترها للفراغ
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sb2Letters.map((letter) => {
                  const word = sb2WordBoxMap[letter] || '';
                  const usedByGap = usedSb2LetterMap[letter];
                  return (
                    <div
                      key={letter}
                      onClick={() => onWordClick(word, `${letter}: ${word}`)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono transition-all cursor-pointer ${
                        usedByGap !== undefined
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-6 h-6 shrink-0 rounded-md font-black flex items-center justify-center ${
                            usedByGap !== undefined
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-amber-300'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="font-bold truncate">{word}</span>
                      </div>
                      {usedByGap !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                          #{usedByGap}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Interactive Blank Selectors + Smart B2 Grammar Explainer */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-white">
                Lücken {gapNumbers[0]}–{gapNumbers[9]} (10 × 1.5P = 15 Punkte)
              </h4>
              <p className="text-xs text-slate-400" dir="rtl">
                الإجابة التفاعلية + شرح قواعد B2 بالدارجة بعد التصحيح أو تفعيل وضع الحفظ!
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
              {variant.toUpperCase()}
            </span>
          </div>

          {gapNumbers.map((num, idx) => {
            const correctLetter = activeKey[idx] || 'A';
            const selectedLetter = memorizeMode ? correctLetter : userAnswers[num] || '';
            const isCorrect = selectedLetter === correctLetter;
            const correctWord = isSb1
              ? sb1OptionsMap[num]?.[correctLetter] || correctLetter
              : sb2WordBoxMap[correctLetter] || correctLetter;
            const rule = explainSprachbausteinChoice(correctWord, num, gapContexts[num] || '');

            const handleOpenTutor = () => {
              onAskAi({
                moduleType: mode,
                moduleTitle: `${topic.title} (${arSubtitle})`,
                itemLabel: `Lücke ${num}`,
                questionNum: num,
                textDe: gapContexts[num] || topic.text,
                correctLetter,
                correctTextDe: correctWord,
                tKey: correctWord,
                hKey: rule.categoryAr,
                arSummary: rule.ruleAr,
                baseAnswer: topic.ansBase[idx],
                mod1Answer: topic.ansMod1?.[idx],
              });
            };

            return (
              <div
                key={num}
                className={`bg-slate-900/95 border rounded-2xl p-3.5 shadow-lg transition-all space-y-2.5 ${
                  memorizeMode || (isChecked && isCorrect)
                    ? 'border-emerald-500/60'
                    : isChecked && selectedLetter && !isCorrect
                    ? 'border-rose-500/60'
                    : 'border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                      {num}
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenTutor}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-extrabold cursor-pointer"
                    >
                      <Bot className="w-3 h-3 text-amber-300" />
                      <span dir="rtl">Ask AI</span>
                    </button>
                  </div>

                  {/* Answer Key Badge ONLY shown when memorizeMode or isChecked is true (NEVER spoiled in default mode!) */}
                  {(memorizeMode || isChecked) && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-black text-xs">
                      {correctLetter} = {correctWord}
                    </span>
                  )}

                  {isChecked && (
                    <span className="text-xs font-mono font-bold flex items-center gap-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {isSb1 ? (
                  /* SB1: 3 Options (A, B, C) with verbatim German words */
                  <div className="grid grid-cols-3 gap-2">
                    {(['A', 'B', 'C'] as const).map((letter) => {
                      const optWord = sb1OptionsMap[num]?.[letter] || letter;
                      const isSelected = selectedLetter === letter;
                      const isRight = correctLetter === letter;

                      let btnStyle =
                        'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-indigo-500/50';
                      if (memorizeMode) {
                        btnStyle = isRight
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-400'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500';
                      } else if (isChecked) {
                        if (isRight) {
                          btnStyle =
                            'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-400';
                        } else if (isSelected && !isRight) {
                          btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'bg-indigo-600 text-white border-indigo-400 font-black ring-2 ring-indigo-400/50';
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => onSelectAnswer(num, letter)}
                          className={`p-2 rounded-xl border text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${btnStyle}`}
                        >
                          <span className="opacity-75">{letter}:</span>
                          <span className="truncate font-bold">{optWord}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* SB2: 15 Letters (A-O) selector buttons with hover tooltip of the German word */
                  <div className="flex flex-wrap items-center gap-1">
                    {sb2Letters.map((letter) => {
                      const isSelected = selectedLetter === letter;
                      const isRight = correctLetter === letter;
                      const word = sb2WordBoxMap[letter] || letter;

                      let btnStyle = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
                      if (memorizeMode) {
                        btnStyle = isRight
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-400'
                          : 'bg-slate-900 text-slate-500 border-slate-800';
                      } else if (isChecked) {
                        if (isRight) {
                          btnStyle =
                            'bg-emerald-500 text-slate-950 border-emerald-300 font-black ring-2 ring-emerald-400';
                        } else if (isSelected && !isRight) {
                          btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'bg-indigo-600 text-white border-indigo-400 font-black ring-2 ring-indigo-400/50';
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          title={`${letter}: ${word}`}
                          onClick={() => onSelectAnswer(num, letter)}
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${btnStyle}`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Smart B2 Grammar Explainer Under Each Blank — ONLY shown when memorizeMode or isChecked so answers aren't spoiled! */}
                {(memorizeMode || isChecked) && (
                  <div
                    dir="rtl"
                    className="bg-indigo-950/55 border border-indigo-500/35 rounded-xl p-2.5 text-xs space-y-0.5"
                  >
                    <div className="flex items-center gap-1 text-amber-300 font-black">
                      <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
                      <span>💡 علاش اختارينا «{correctWord}» ({rule.categoryAr})؟</span>
                    </div>
                    <p className="text-slate-200 font-semibold leading-relaxed">{rule.ruleAr}</p>
                  </div>
                )}

                {/* When showUnderSummary is active in default mode, show a non-spoiling context tip */}
                {!memorizeMode && !isChecked && showUnderSummary && (
                  <div
                    dir="rtl"
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-[11px] text-slate-300 flex items-center justify-between gap-2"
                  >
                    <span>
                      💡 اقرأ الجملة المحيطة بالفراغ رقم <strong>[{num}]</strong> واختر الكلمة المناسبة ثم اضغط «✔️ تصحيح» أو «👁️ وضع الحفظ» لإظهار شرح القاعدة.
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
