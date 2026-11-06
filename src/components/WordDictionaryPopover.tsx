import React, { useEffect, useState } from 'react';
import { WordLookupResult } from '../data/verbatimTypes';
import {
  playGermanAudio,
  sanitizeUtf8Text,
  stopGermanAudio,
  translateDeToAr,
} from '../utils/b2StudyEngine';
import { BookOpen, Check, Loader2, Square, Star, Volume2, X } from 'lucide-react';

interface WordDictionaryPopoverProps {
  lookup: WordLookupResult | null;
  isSaved: boolean;
  onToggleSave: (item: WordLookupResult) => void;
  onClose: () => void;
}

export const WordDictionaryPopover: React.FC<WordDictionaryPopoverProps> = ({
  lookup,
  isSaved,
  onToggleSave,
  onClose,
}) => {
  const [liveWordAr, setLiveWordAr] = useState<string>('');
  const [liveSentenceAr, setLiveSentenceAr] = useState<string>('');
  const [loadingWord, setLoadingWord] = useState<boolean>(false);
  const [loadingSentence, setLoadingSentence] = useState<boolean>(false);

  useEffect(() => {
    if (!lookup) return;
    let cancelled = false;
    setLoadingWord(true);
    setLoadingSentence(true);

    translateDeToAr(lookup.cleanWord)
      .then((res) => {
        if (!cancelled) {
          setLiveWordAr(sanitizeUtf8Text(res));
          setLoadingWord(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingWord(false);
      });

    if (lookup.contextSentence) {
      translateDeToAr(lookup.contextSentence)
        .then((res) => {
          if (!cancelled) {
            setLiveSentenceAr(sanitizeUtf8Text(res));
            setLoadingSentence(false);
          }
        })
        .catch(() => {
          if (!cancelled) setLoadingSentence(false);
        });
    } else {
      setLoadingSentence(false);
    }

    return () => {
      cancelled = true;
    };
  }, [lookup]);

  if (!lookup) return null;

  const hasCuratedDictMeaning =
    lookup.meaningAr &&
    lookup.meaningAr !== 'جاري الترجمة الفورية...' &&
    lookup.meaningAr !== lookup.cleanWord;

  const finalWordMeaningAr = hasCuratedDictMeaning
    ? liveWordAr && !lookup.meaningAr.includes(liveWordAr)
      ? `${lookup.meaningAr} (${liveWordAr})`
      : lookup.meaningAr
    : liveWordAr || lookup.meaningAr;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Word + Audio + Save */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full mb-1">
              <BookOpen className="w-3 h-3" />
              <span>قاموس النقر الذكي (B2 Smart-Click Dictionary)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2" dir="ltr">
              <h3 className="text-xl font-black text-white font-mono">
                {sanitizeUtf8Text(lookup.cleanWord)}
              </h3>
              <button
                type="button"
                onClick={() => void playGermanAudio(lookup.cleanWord, 0.9)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                title="نطق الكلمة بالألمانية"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>نطق 🔊</span>
              </button>
              <button
                type="button"
                onClick={() => stopGermanAudio()}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-500/40 text-xs font-bold cursor-pointer"
                title="إيقاف الصوت"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>⏹️ إيقاف الصوت</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Arabic Meaning + Category */}
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-300">المعنى بالعربية / الدارجة:</span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
              {sanitizeUtf8Text(lookup.category)}
            </span>
          </div>
          {loadingWord && !hasCuratedDictMeaning ? (
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري جلب الترجمة الفورية...</span>
            </div>
          ) : (
            <p className="text-base font-black text-white leading-relaxed">
              {sanitizeUtf8Text(finalWordMeaningAr)}
            </p>
          )}
        </div>

        {/* Grammar / Exam Tip */}
        <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-3.5 space-y-1">
          <div className="text-xs font-extrabold text-amber-300">
            💡 قاعدة وملحوظة امتحان TELC B2:
          </div>
          <p className="text-xs md:text-sm font-semibold text-slate-200 leading-relaxed">
            {sanitizeUtf8Text(lookup.grammarTipAr)}
          </p>
        </div>

        {/* Context Sentence + Real Live Arabic Sentence Translation */}
        {lookup.contextSentence && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-amber-300 font-bold">
                في الجملة (Im Satz):
              </span>
              <button
                type="button"
                onClick={() => void playGermanAudio(lookup.contextSentence || '', 0.9)}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>نطق الجملة 🔊</span>
              </button>
            </div>
            <p dir="ltr" className="text-xs text-slate-200 font-sans leading-relaxed">
              “{sanitizeUtf8Text(lookup.contextSentence)}”
            </p>
            <div className="border-t border-slate-800 pt-2">
              <div className="text-[11px] font-bold text-cyan-300 mb-0.5">
                🌐 ترجمة الجملة كاملة للعربية:
              </div>
              {loadingSentence ? (
                <div className="flex items-center gap-1.5 text-cyan-300 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري ترجمة الجملة...</span>
                </div>
              ) : (
                <p className="text-xs md:text-sm font-bold text-emerald-200 leading-relaxed">
                  {liveSentenceAr}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Save to My Personal Vocabulary Button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              onToggleSave({
                ...lookup,
                meaningAr: sanitizeUtf8Text(finalWordMeaningAr),
              })
            }
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>محفوظة في «قاموسي الشخصي» (اضغط للإزالة)</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>⭐ احفظ الكلمة في «قاموسي الشخصي» للمراجعة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
