import React, { useState } from 'react';
import { Star, Volume2, X, BookOpen, Sparkles, Check } from 'lucide-react';
import { WordLookupResult, speakGermanText } from '../utils/b2StudyEngine';

interface WordDictionaryPopoverProps {
  lookup: WordLookupResult | null;
  onClose: () => void;
  onSaveWord: (lookup: WordLookupResult) => void;
  isSaved: boolean;
}

export const WordDictionaryPopover: React.FC<WordDictionaryPopoverProps> = ({
  lookup,
  onClose,
  onSaveWord,
  isSaved,
}) => {
  const [justSaved, setJustSaved] = useState(false);

  if (!lookup) return null;

  const handleSave = () => {
    onSaveWord(lookup);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full mb-1.5">
              <BookOpen className="w-3 h-3" />
              <span>قاموس النقر الذكي (TELC B2 Wortschatz)</span>
            </span>
            <h3 dir="ltr" className="text-xl font-black text-white font-mono">
              {lookup.cleanWord}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category + Meaning */}
        <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-300">المعنى بالعربية / الدارجة:</span>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              {lookup.category}
            </span>
          </div>
          <p className="text-base font-black text-emerald-300 leading-relaxed">
            {lookup.meaningAr}
          </p>
        </div>

        {/* B2 Grammar & Exam Tip */}
        <div className="bg-amber-950/35 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
          <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>ملاحظة قواعد وامتحان B2:</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 leading-relaxed">
            {lookup.grammarTipAr}
          </p>
        </div>

        {/* Context Sentence if available */}
        {lookup.contextSentence && (
          <div dir="ltr" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-sans">
            <span className="text-slate-500 font-mono block mb-1">Im Satz (السياق):</span>
            {lookup.contextSentence.slice(0, 180)}
            {lookup.contextSentence.length > 180 ? '…' : ''}
          </div>
        )}

        {/* Action Buttons: Speak 1x, Speak 0.8x, Save to My Vocabulary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => speakGermanText(lookup.cleanWord, 1.0)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-extrabold border border-slate-700 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 نطق الكلمة (1x)</span>
            </button>
            <button
              type="button"
              onClick={() => speakGermanText(lookup.cleanWord, 0.75)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold border border-slate-700 cursor-pointer"
            >
              <span>🐢 0.8x</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
              isSaved || justSaved
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
            }`}
          >
            {isSaved || justSaved ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4 fill-slate-950" />}
            <span>{isSaved || justSaved ? 'تم الحفظ في قاموسي ✓' : '⭐ احفظ في قاموسي'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
