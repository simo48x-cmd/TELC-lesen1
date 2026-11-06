import React, { useState } from 'react';
import { ExamVariant, SubViewMode } from '../data/verbatimTypes';
import { Check, Copy, Eye, Flame, Highlighter, Lightbulb, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

interface SahlaToolbarProps {
  variant: ExamVariant;
  onVariantChange: (v: ExamVariant) => void;
  hasMod1: boolean;
  hasMod2: boolean;
  ansBase: string[];
  ansMod1?: string[];
  ansMod2?: string[];
  questionStartNum: number;
  highlightMotCle: boolean;
  onToggleHighlightMotCle: () => void;
  memorizeMode: boolean;
  onToggleMemorizeMode: () => void;
  showUnderSummary: boolean;
  onToggleShowUnderSummary: () => void;
  shuffleMode: boolean;
  onToggleShuffleMode: () => void;
  isChecked: boolean;
  onCheckAnswers: () => void;
  onResetAnswers: () => void;
  fontScale: number;
  onChangeFontScale: (delta: number) => void;
  subView: SubViewMode;
  onSubViewChange: (sv: SubViewMode) => void;
  streakCount: number;
}

export const SahlaToolbar: React.FC<SahlaToolbarProps> = ({
  variant,
  onVariantChange,
  hasMod1,
  hasMod2,
  ansBase,
  ansMod1,
  ansMod2,
  questionStartNum,
  highlightMotCle,
  onToggleHighlightMotCle,
  memorizeMode,
  onToggleMemorizeMode,
  showUnderSummary,
  onToggleShowUnderSummary,
  shuffleMode,
  onToggleShuffleMode,
  isChecked,
  onCheckAnswers,
  onResetAnswers,
  fontScale,
  onChangeFontScale,
  subView,
  onSubViewChange,
  streakCount,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const activeAns =
    variant === 'mod2' && ansMod2?.length
      ? ansMod2
      : (variant === 'mod1' || variant === 'mod2') && ansMod1?.length
      ? ansMod1
      : ansBase;

  const formattedCode = activeAns
    .map((letter, idx) => `${questionStartNum + idx}:${letter}`)
    .join('  ');

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeAns.join(' - '));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  return (
    <div className="space-y-3 mb-5">
      {/* Row 1: 3-Way Study & Super-Memory Sub-View Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-900/95 border border-indigo-500/30 p-2 rounded-2xl shadow-lg">
        <button
          type="button"
          onClick={() => onSubViewChange('verbatim')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            subView === 'verbatim'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-300/40'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span className="text-base">📄</span>
          <span>1. الامتحان الأصلي حرف بحرف</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-black/30 font-mono text-indigo-200">Verbatim</span>
        </button>

        <button
          type="button"
          onClick={() => onSubViewChange('matrix')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            subView === 'matrix'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-yellow-200'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span className="text-base">🧠</span>
          <span>2. فاصو الاختصارات والفهم السريع</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-black/20 font-mono">Mot-Clé Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => onSubViewChange('drill')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            subView === 'drill'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-300/40'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span className="text-base">⚡</span>
          <span>3. تحدي الحفاظة البرقية</span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {streakCount}
          </span>
        </button>
      </div>

      {/* Row 2: Sahla Interactive Toolbar & Variant Switcher */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Variant Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 px-2">🔄 النسخة:</span>
            <button
              type="button"
              onClick={() => onVariantChange('base')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                variant === 'base'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              ✅ الأساسي (Original)
            </button>

            {hasMod1 && (
              <button
                type="button"
                onClick={() => onVariantChange('mod1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  variant === 'mod1'
                    ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40'
                    : 'text-amber-300/90 hover:bg-slate-800 border border-amber-500/30'
                }`}
              >
                ⚠️ المعدل 1 (Mod 1)
              </button>
            )}

            {hasMod2 && (
              <button
                type="button"
                onClick={() => onVariantChange('mod2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  variant === 'mod2'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/40'
                    : 'text-rose-300/90 hover:bg-slate-800 border border-rose-500/30'
                }`}
              >
                ⚠️ المعدل 2 (Mod 2)
              </button>
            )}
          </div>

          {/* Interactive Study Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleHighlightMotCle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                highlightMotCle
                  ? 'bg-yellow-300 text-slate-950 border-yellow-400 shadow-md shadow-yellow-400/20'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>🔑 تلوين الموكلي بالصفر</span>
            </button>

            <button
              type="button"
              onClick={onToggleMemorizeMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                memorizeMode
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>👁️ وضع الحفظ (إظهار الحل)</span>
            </button>

            <button
              type="button"
              onClick={onToggleShowUnderSummary}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                showUnderSummary
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>💡 شرح وفهم تحت كل نص</span>
            </button>

            <button
              type="button"
              onClick={onToggleShuffleMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                shuffleMode
                  ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>🔀 تخربق الترتيب</span>
            </button>
          </div>

          {/* Check / Reset / Font Size Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCheckAnswers}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isChecked
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>✔️ تصحيح</span>
            </button>

            <button
              type="button"
              onClick={onResetAnswers}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 إعادة</span>
            </button>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => onChangeFontScale(-1)}
                disabled={fontScale <= -1}
                className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                title="تصغير الخط"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onChangeFontScale(1)}
                disabled={fontScale >= 2}
                className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Live Codat Bar showing Original vs Modified Codes side-by-side */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/90 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              كود الجواب النشط ({variant === 'base' ? 'الأساسي' : variant === 'mod1' ? 'المعدل 1' : 'المعدل 2'}):
            </span>
            <span
              dir="ltr"
              className={`font-mono font-extrabold px-2.5 py-1 rounded-lg border ${
                variant === 'base'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              {formattedCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          {/* Side-by-side Original vs Mod comparison badges */}
          <div className="flex flex-wrap items-center gap-2" dir="ltr">
            <span className="text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
              <strong className="text-emerald-400">Base:</strong> {ansBase.join('-')}
            </span>
            {ansMod1 && ansMod1.length > 0 && (
              <span className="text-[11px] bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 font-mono">
                <strong className="text-amber-400">Mod 1:</strong> {ansMod1.join('-')}
              </span>
            )}
            {ansMod2 && ansMod2.length > 0 && (
              <span className="text-[11px] bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-300 font-mono">
                <strong className="text-rose-400">Mod 2:</strong> {ansMod2.join('-')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
