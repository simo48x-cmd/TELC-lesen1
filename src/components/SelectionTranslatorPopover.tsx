import React, { useEffect, useState } from 'react';
import { Globe, Loader2, Search, Star, Volume2, X, Check } from 'lucide-react';
import {
  cleanGermanToken,
  sanitizeUtf8Text,
  speakGermanText,
  translateDeToAr,
} from '../utils/b2StudyEngine';
import { WordLookupResult } from '../data/verbatimTypes';

interface SelectionTranslatorPopoverProps {
  onSaveWordToBank: (item: WordLookupResult) => void;
}

interface WordByWordItem {
  de: string;
  ar: string;
}

const MY_SAVED_VOCAB_KEY = 'mySavedVocab';

export const SelectionTranslatorPopover: React.FC<SelectionTranslatorPopoverProps> = ({
  onSaveWordToBank,
}) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [wordBreakdown, setWordBreakdown] = useState<WordByWordItem[]>([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleSelectionEnd = (e: Event) => {
      // Ignore clicks/selections inside the translator popover itself
      const target = e.target;
      if (target instanceof Element && target.closest('[data-selection-popover="true"]')) {
        return;
      }

      setTimeout(() => {
        const sel = window.getSelection()?.toString().trim() || '';
        const cleaned = sanitizeUtf8Text(sel).replace(/\s+/g, ' ').trim();
        // Must be at least 2 characters and contain German/Latin letters
        if (cleaned.length >= 2 && /[a-zA-ZäöüÄÖÜß]/.test(cleaned)) {
          setSelectedText((prev) => {
            if (prev !== cleaned) {
              setShowBreakdown(false);
              setWordBreakdown([]);
              setSavedSuccess(false);
            }
            return cleaned;
          });
        }
      }, 20);
    };

    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);
    return () => {
      document.removeEventListener('mouseup', handleSelectionEnd);
      document.removeEventListener('touchend', handleSelectionEnd);
    };
  }, []);

  useEffect(() => {
    if (!selectedText) return;
    let cancelled = false;
    setLoading(true);
    translateDeToAr(selectedText)
      .then((res) => {
        if (!cancelled) {
          setTranslatedText(sanitizeUtf8Text(res));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedText]);

  if (!selectedText) return null;

  const words = selectedText
    .split(/\s+/)
    .map((w) => cleanGermanToken(w))
    .filter((w) => w.length >= 2);

  const canBreakDown = words.length >= 2 && words.length <= 12;

  const handleWordByWord = async () => {
    if (showBreakdown && wordBreakdown.length > 0) {
      setShowBreakdown(false);
      return;
    }
    setShowBreakdown(true);
    setLoadingBreakdown(true);
    try {
      const results = await Promise.all(
        words.map(async (w) => {
          const ar = await translateDeToAr(w);
          return { de: w, ar: sanitizeUtf8Text(ar) };
        })
      );
      setWordBreakdown(results);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleSaveToVocab = () => {
    const arToSave = translatedText || selectedText;
    // Save to localStorage('mySavedVocab') as requested
    try {
      const raw = localStorage.getItem(MY_SAVED_VOCAB_KEY);
      const list: { de: string; ar: string }[] = raw ? JSON.parse(raw) : [];
      if (!list.some((item) => item.de.toLowerCase() === selectedText.toLowerCase())) {
        list.unshift({ de: selectedText, ar: arToSave });
        localStorage.setItem(MY_SAVED_VOCAB_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore storage errors
    }

    // Also sync with main SavedWordsMistakesDrawer
    onSaveWordToBank({
      word: selectedText,
      cleanWord: selectedText,
      meaningAr: arToSave,
      category: words.length > 1 ? 'عبارة / جملة ألمانية محددة' : 'مفردة ألمانية محددة',
      grammarTipAr: 'تمت ترجمتها وحفظها عبر مترجم التظليل الفوري.',
      contextSentence: selectedText,
    });
    setSavedSuccess(true);
  };

  return (
    <div
      data-selection-popover="true"
      dir="rtl"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-2xl bg-slate-900/98 border-2 border-cyan-400/70 rounded-3xl p-4 md:p-5 shadow-2xl shadow-cyan-950/80 backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs md:text-sm font-black text-cyan-300">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>🌐 الترجمة الفورية لما حددته</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => speakGermanText(selectedText, 1.0)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-extrabold border border-slate-700 cursor-pointer"
            title="نطق بالألمانية (1x)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>🔊 نطق بالألمانية (1x)</span>
          </button>
          <button
            type="button"
            onClick={() => speakGermanText(selectedText, 0.8)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold border border-slate-700 cursor-pointer"
            title="نطق بطيء بالألمانية (0.8x)"
          >
            <span>0.8x</span>
          </button>
          <button
            type="button"
            onClick={() => {
              window.getSelection()?.removeAllRanges();
              setSelectedText('');
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected German Text */}
      <div
        dir="ltr"
        className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-bold text-slate-100 max-h-24 overflow-y-auto leading-relaxed"
      >
        {selectedText}
      </div>

      {/* Real Arabic Translation */}
      <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري الترجمة الفورية للعربية...</span>
          </div>
        ) : (
          <p className="text-sm md:text-base font-black text-emerald-200 leading-relaxed">
            {translatedText}
          </p>
        )}
      </div>

      {/* Word-by-Word Breakdown Box (if toggled) */}
      {showBreakdown && (
        <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-3 space-y-2">
          <div className="text-xs font-extrabold text-indigo-300">
            🔍 تفكيك العبارة كلمة بكلمة:
          </div>
          {loadingBreakdown ? (
            <div className="flex items-center gap-2 text-indigo-300 text-xs py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري تفكيك وترجمة كل كلمة...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {wordBreakdown.map((item, idx) => (
                <div
                  key={`${item.de}-${idx}`}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col justify-between gap-1"
                >
                  <div className="flex items-center justify-between gap-1" dir="ltr">
                    <span className="font-mono font-black text-xs text-amber-300">{item.de}</span>
                    <button
                      type="button"
                      onClick={() => speakGermanText(item.de, 0.9)}
                      className="text-slate-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-white">{item.ar}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: Word-by-word + Save to Personal Vocab */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {canBreakDown ? (
          <button
            type="button"
            onClick={handleWordByWord}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-extrabold cursor-pointer transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>🔍 ترجمة كلمة بكلمة (تفكيك الجملة)</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">
            💡 يمكنك تظليل أي كلمة أو جملة بالماوس لترجمتها فوراً
          </span>
        )}

        <button
          type="button"
          onClick={handleSaveToVocab}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            savedSuccess
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
          }`}
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          <span>{savedSuccess ? 'تم الحفظ في قاموسي الشخصي ✓' : '⭐ احفظ في قاموسي الشخصي'}</span>
        </button>
      </div>
    </div>
  );
};
