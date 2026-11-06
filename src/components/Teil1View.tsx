import React, { useMemo } from 'react';
import { AskAiContextItem, ExamVariant, SubViewMode, Teil1Topic } from '../data/verbatimTypes';
import {
  buildTeil1SpeedDrill,
  extractGermanKeywords,
  getTeil1AnswerKey,
} from '../utils/examEngine';
import { sanitizeUtf8Text } from '../utils/b2StudyEngine';
import { HighlightedText } from './HighlightedText';
import { SpeedDrillView } from './SpeedDrillView';
import { AudioListenButton } from './AudioListenButton';
import { LiveArabicTranslation } from './LiveArabicTranslation';
import { ArrowLeft, Bot, CheckCircle2, KeyRound, Sparkles, XCircle } from 'lucide-react';

interface Teil1ViewProps {
  topic: Teil1Topic;
  variant: ExamVariant;
  subView: SubViewMode;
  userAnswers: Record<number, string>;
  onSelectAnswer: (textNum: number, letter: string) => void;
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

const HEADING_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const Teil1View: React.FC<Teil1ViewProps> = ({
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
  const activeKey = useMemo(() => getTeil1AnswerKey(topic, variant), [topic, variant]);

  // All heading keywords across texts 1..5
  const allHeadingKeywords = useMemo(() => {
    const raw: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const trig = topic.codatTriggers?.[String(i)];
      if (trig?.hKey) raw.push(trig.hKey);
      if (trig?.tKey) raw.push(trig.tKey);
    }
    return extractGermanKeywords(raw);
  }, [topic]);

  const displayedHeadingLetters = useMemo(() => {
    if (!shuffleMode) return HEADING_LETTERS;
    return [...HEADING_LETTERS].reverse();
  }, [shuffleMode]);

  // Map heading letter -> which Text (1..5) uses it
  const usedByUserMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 1; i <= 5; i++) {
      const chosen = memorizeMode ? activeKey[i - 1] : userAnswers[i];
      if (chosen) {
        map[chosen] = i;
      }
    }
    return map;
  }, [userAnswers, memorizeMode, activeKey]);

  const drillItems = useMemo(() => buildTeil1SpeedDrill(topic, variant), [topic, variant]);

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
        title={`Lesen Teil 1: ${topic.sahlaTitle} (${topic.arTitle})`}
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
            <h3 className="text-base md:text-lg font-black text-amber-300 flex items-center gap-2">
              <span>🧠 فاصو الاختصارات والفهم السريع (One-Page Visual Memory Matrix)</span>
            </h3>
            <p className="text-xs text-slate-300">
              احفظ كل نص فـ 3 خطوات مترابطة: الفهم بالدارجة ➔ الموكلي وسط النص بالأصفر ➔ العنوان الألماني الأصلي حرف بحرف!
            </p>
          </div>
          <div dir="ltr" className="font-mono text-xs font-extrabold bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-400/40 text-amber-300">
            Code ({variant.toUpperCase()}): {activeKey.map((l, i) => `${i + 1}:${l}`).join(' · ')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((num) => {
            const correctLetter = activeKey[num - 1] || 'A';
            const headingDe = topic.headings[correctLetter] || '';
            const trig = topic.codatTriggers?.[String(num)];
            const hKeywords = extractGermanKeywords([trig?.hKey || '', trig?.tKey || '']);

            return (
              <div
                key={num}
                className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
              >
                {/* Step 1: Darija Summary */}
                <div className="lg:col-span-4 bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-3.5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-indigo-300">1️⃣ الفهم بالدارجة / العربية</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                      Text {num}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-100 leading-relaxed">
                    {sanitizeUtf8Text(trig?.ar || `النص ${num} من موضوع ${topic.arTitle}`)}
                  </p>
                </div>

                {/* Step 2: Mot-Clé in Text */}
                <div className="lg:col-span-4 bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 h-full flex flex-col justify-between">
                  <div className="text-xs font-black text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-yellow-300" />
                    <span>2️⃣ الموكلي وسط النص (Mot-Clé im Text)</span>
                  </div>
                  <div dir="ltr" className="space-y-1.5">
                    <div className="inline-block bg-yellow-300 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs md:text-sm font-mono shadow-xs">
                      {sanitizeUtf8Text(trig?.tKey || '—')}
                    </div>
                    {trig?.hKey && (
                      <div className="text-xs text-amber-200 font-mono flex items-center gap-1.5">
                        <span>➔ يطابق في العنوان:</span>
                        <span className="bg-amber-400/20 border border-amber-400/40 text-yellow-200 px-2 py-0.5 rounded font-bold">
                          {sanitizeUtf8Text(trig.hKey)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Exact Verbatim German Heading */}
                <div
                  dir="ltr"
                  className="lg:col-span-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 h-full flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-emerald-300" dir="rtl">
                      3️⃣ العنوان الألماني الأصلي حرف بحرف
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs">
                      {correctLetter}
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-bold text-white leading-snug">
                    <HighlightedText
                      text={headingDe}
                      keywords={hKeywords}
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

  // Sub-View 1: Original Verbatim Exam View
  return (
    <div className="space-y-6">
      {/* Top Box: 10 Verbatim German Headings (A-J) */}
      <div className="bg-slate-900/95 border border-indigo-500/35 rounded-2xl p-4 md:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
              <span>📋 العناوين العشرة الأصلية حرف بحرف (Überschriften A–J)</span>
            </h3>
            <p className="text-xs text-slate-400">
              اضغط على أي كلمة ألمانية لترجمتها فوراً أو ظلل أي جملة بالماوس لترجمتها — العناوين المستعملة كيتكتب قدامها رقم النص!
            </p>
          </div>
          <span dir="ltr" className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/70 px-3 py-1 rounded-lg border border-indigo-500/30">
            Lesen Teil 1 • 25 Punkte (5 × 5P)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" dir="ltr">
          {displayedHeadingLetters.map((letter) => {
            const headingText = topic.headings[letter] || '';
            const assignedTextNum = usedByUserMap[letter];
            const isCorrectAssignment =
              assignedTextNum !== undefined && activeKey[assignedTextNum - 1] === letter;
            const matchedTextIndex = activeKey.findIndex((k) => k === letter);
            const matchedTrig =
              matchedTextIndex >= 0 ? topic.codatTriggers?.[String(matchedTextIndex + 1)] : undefined;

            return (
              <div
                key={letter}
                className={`flex flex-col justify-between gap-2 p-3 rounded-xl border transition-all ${
                  assignedTextNum !== undefined
                    ? memorizeMode || (isChecked && isCorrectAssignment)
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
                      : isChecked && !isCorrectAssignment
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-100'
                      : 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-7 h-7 shrink-0 rounded-lg font-mono font-black text-sm flex items-center justify-center ${
                        assignedTextNum !== undefined
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-indigo-300 border border-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`${fontSizeClass} font-semibold leading-snug ${
                        assignedTextNum !== undefined && !memorizeMode && !highlightMotCle
                          ? 'line-through decoration-emerald-400/70 opacity-85'
                          : ''
                      }`}
                    >
                      <HighlightedText
                        text={headingText}
                        keywords={allHeadingKeywords}
                        highlightEnabled={highlightMotCle}
                        onWordClick={onWordClick}
                      />
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <AudioListenButton text={headingText} compact />
                    {assignedTextNum !== undefined && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs shadow-xs">
                        Text {assignedTextNum}
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Real Arabic Translation under Heading */}
                <LiveArabicTranslation
                  textDe={headingText}
                  curatedAr={matchedTrig && (memorizeMode || isChecked) ? `يطابق النص ${matchedTextIndex + 1}: ${matchedTrig.ar}` : undefined}
                  label={`Überschrift ${letter}`}
                  showGlobalTranslation={showTranslation}
                  compact
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Box: 5 Full Verbatim German Texts (1-5) */}
      <div className="space-y-5">
        {[1, 2, 3, 4, 5].map((num) => {
          const verbatimParagraph = topic.texts[String(num)] || '';
          const correctLetter = activeKey[num - 1] || 'A';
          const selectedLetter = memorizeMode ? correctLetter : userAnswers[num] || '';
          const isCorrect = selectedLetter === correctLetter;
          const trig = topic.codatTriggers?.[String(num)];
          const textKeywords = extractGermanKeywords([trig?.tKey || '', trig?.hKey || '']);

          const handleOpenTutor = () => {
            const distractors = HEADING_LETTERS.filter((l) => l !== correctLetter).map((l) => ({
              letter: l,
              text: topic.headings[l] || '',
            }));
            onAskAi({
              moduleType: 'teil1',
              moduleTitle: `${topic.sahlaTitle} (${topic.arTitle})`,
              itemLabel: `Text ${num}`,
              questionNum: num,
              textDe: verbatimParagraph,
              correctLetter,
              correctTextDe: topic.headings[correctLetter] || '',
              tKey: trig?.tKey,
              hKey: trig?.hKey,
              arSummary: trig?.ar,
              distractors,
              baseAnswer: topic.ansBase[num - 1],
              mod1Answer: topic.ansMod1?.[num - 1],
              mod2Answer: topic.ansMod2?.[num - 1],
            });
          };

          return (
            <div
              key={num}
              className={`bg-slate-900/95 rounded-2xl border p-4 md:p-6 shadow-xl transition-all ${
                memorizeMode || (isChecked && isCorrect)
                  ? 'border-emerald-500/60'
                  : isChecked && selectedLetter && !isCorrect
                  ? 'border-rose-500/60'
                  : 'border-slate-700/80'
              }`}
            >
              {/* Paragraph Header + Audio + Ask AI + Quick-Select A-J Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-mono font-black text-sm shadow-sm">
                    Text {num}
                  </span>

                  <AudioListenButton text={verbatimParagraph} label="استمع للنص" />

                  <button
                    type="button"
                    onClick={handleOpenTutor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 border border-indigo-400/40 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                    <span>🤖 Ask AI — اشرح لي بالتفصيل</span>
                  </button>

                  {selectedLetter && (
                    <span
                      dir="ltr"
                      className={`px-3 py-1 rounded-xl font-mono font-black text-xs flex items-center gap-1.5 ${
                        memorizeMode || !isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {isChecked && (isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />)}
                      <span>Gewählt: {selectedLetter}</span>
                      {isChecked && !isCorrect && <span>(Richtig: {correctLetter})</span>}
                    </span>
                  )}
                </div>

                {/* A-J Quick Select Buttons */}
                <div className="flex flex-wrap items-center gap-1" dir="ltr">
                  {HEADING_LETTERS.map((letter) => {
                    const isSelected = selectedLetter === letter;
                    const isRightAnswer = correctLetter === letter;

                    let btnClass = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
                    if (memorizeMode) {
                      btnClass = isRightAnswer
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black ring-2 ring-emerald-300'
                        : 'bg-slate-900 text-slate-500 border-slate-800';
                    } else if (isChecked) {
                      if (isRightAnswer) {
                        btnClass = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black ring-2 ring-emerald-300';
                      } else if (isSelected && !isRightAnswer) {
                        btnClass = 'bg-rose-600 text-white border-rose-400 font-black';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-indigo-600 text-white border-indigo-400 font-black ring-2 ring-indigo-400/50';
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => onSelectAnswer(num, letter)}
                        className={`w-8 h-8 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${btnClass}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected or Correct Verbatim Heading Banner right above the paragraph */}
              {(selectedLetter || memorizeMode || isChecked) && (
                <div
                  dir="ltr"
                  className="mb-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between gap-2"
                >
                  <div className="text-xs md:text-sm font-bold text-emerald-200">
                    <span className="inline-block px-2 py-0.5 mr-2 rounded bg-emerald-500 text-slate-950 font-mono font-black">
                      {memorizeMode || isChecked ? correctLetter : selectedLetter}
                    </span>
                    <HighlightedText
                      text={topic.headings[memorizeMode || isChecked ? correctLetter : selectedLetter] || ''}
                      keywords={textKeywords}
                      highlightEnabled={highlightMotCle}
                      onWordClick={onWordClick}
                    />
                  </div>
                </div>
              )}

              {/* Verbatim German Paragraph (Clickable Words + Mouse Selection) */}
              <div
                dir="ltr"
                className={`${fontSizeClass} text-slate-100 leading-relaxed whitespace-pre-line font-sans bg-slate-950/70 p-4 rounded-xl border border-slate-800/80`}
              >
                <HighlightedText
                  text={verbatimParagraph}
                  keywords={textKeywords}
                  highlightEnabled={highlightMotCle}
                  onWordClick={onWordClick}
                />
              </div>

              {/* Live Real Arabic Translation under Paragraph */}
              <LiveArabicTranslation
                textDe={verbatimParagraph}
                curatedAr={trig?.ar}
                label={`Text ${num}`}
                showGlobalTranslation={showTranslation}
              />

              {/* Under-Text Darija Summary + Golden Mot-Clé Match Card */}
              {(showUnderSummary || memorizeMode || isChecked) && trig && (
                <div className="mt-3.5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-amber-950/50 border border-indigo-500/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>💡 خلاصة النص بالدارجة والموكلي الذهبي (Text {num} ➔ {correctLetter}):</span>
                    </span>
                    <span dir="ltr" className="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                      Lösung: {correctLetter}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-200">{sanitizeUtf8Text(trig.ar)}</p>
                  <div dir="ltr" className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
                    <span className="bg-yellow-300 text-slate-950 font-black px-2 py-0.5 rounded">
                      Text-Key: {sanitizeUtf8Text(trig.tKey)}
                    </span>
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-400 rotate-180" />
                    <span className="bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded">
                      Heading ({correctLetter}): {sanitizeUtf8Text(trig.hKey)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
