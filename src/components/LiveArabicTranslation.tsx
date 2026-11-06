import React, { useEffect, useState } from 'react';
import { Globe, Languages, Loader2 } from 'lucide-react';
import { sanitizeUtf8Text, translateDeToAr } from '../utils/b2StudyEngine';

interface LiveArabicTranslationProps {
  textDe: string;
  curatedAr?: string;
  label?: string;
  showGlobalTranslation: boolean;
  compact?: boolean;
  showInlineTrigger?: boolean;
}

export const LiveArabicTranslation: React.FC<LiveArabicTranslationProps> = ({
  textDe,
  curatedAr,
  label,
  showGlobalTranslation,
  compact = false,
  showInlineTrigger = true,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const isVisible = showGlobalTranslation || localOpen;

  useEffect(() => {
    if (!isVisible || !textDe.trim()) return;
    let cancelled = false;
    setLoading(true);
    translateDeToAr(textDe)
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
  }, [isVisible, textDe]);

  if (!isVisible) {
    if (!showInlineTrigger) return null;
    return (
      <div dir="rtl" className="mt-2 flex justify-start">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLocalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>🌐 ترجم هذه الفقرة للعربية</span>
        </button>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`${
        compact ? 'mt-2 p-2.5 text-xs' : 'mt-3 p-3.5 text-xs md:text-sm'
      } bg-cyan-950/45 border border-cyan-500/40 rounded-xl font-bold text-cyan-100 space-y-1.5`}
    >
      <div className="flex items-center justify-between gap-2 text-cyan-300 font-black">
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{label ? `الترجمة العربية الفورية (${label}):` : 'الترجمة العربية الفورية:'}</span>
        </div>
        {!showGlobalTranslation && localOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLocalOpen(false);
            }}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 cursor-pointer"
          >
            إخفاء
          </button>
        )}
      </div>

      {loading && !translatedText ? (
        <div className="flex items-center gap-2 text-cyan-300/80 text-xs py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>جاري الترجمة الفورية للعربية...</span>
        </div>
      ) : (
        <p className="leading-relaxed whitespace-pre-line text-white font-bold">
          {translatedText || sanitizeUtf8Text(curatedAr || '')}
        </p>
      )}

      {curatedAr && translatedText && sanitizeUtf8Text(curatedAr) !== translatedText && (
        <p className="text-[11px] text-amber-200/90 border-t border-cyan-500/20 pt-1.5">
          💡 الخلاصة بالدارجة: {sanitizeUtf8Text(curatedAr)}
        </p>
      )}
    </div>
  );
};
