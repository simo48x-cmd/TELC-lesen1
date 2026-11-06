import React from 'react';
import {
  Eye,
  Key,
  Languages,
  Shuffle,
  CheckSquare,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  GitCompare,
} from 'lucide-react';
import { VariantCodeInfo } from '../data/lesenTypes';

interface SahlaToolbarProps {
  variants: VariantCodeInfo[];
  activeVariant: string;
  onSelectVariant: (v: string) => void;
  memorizeMode: boolean;
  onToggleMemorize: () => void;
  highlightMotCle: boolean;
  onToggleHighlight: () => void;
  showArabic: boolean;
  onToggleArabic: () => void;
  shuffleSeed: number;
  onToggleShuffle: () => void;
  fontSizeScale: number;
  onChangeFontSize: (delta: number) => void;
  isReviewed: boolean;
  onToggleReviewed: () => void;
  onCheckAnswers: () => void;
  onResetAnswers: () => void;
  checked: boolean;
}

export const SahlaToolbar: React.FC<SahlaToolbarProps> = ({
  variants,
  activeVariant,
  onSelectVariant,
  memorizeMode,
  onToggleMemorize,
  highlightMotCle,
  onToggleHighlight,
  showArabic,
  onToggleArabic,
  shuffleSeed,
  onToggleShuffle,
  onChangeFontSize,
  isReviewed,
  onToggleReviewed,
  onCheckAnswers,
  onResetAnswers,
  checked,
}) => {
  const currentVariantObj = variants.find((v) => v.key === activeVariant) || variants[0];

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs space-y-3">
      {/* Row 1: Variant Switcher + Active Code Display + Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <GitCompare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>النسخة / التعديل:</span>
          </span>
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {variants.map((v) => {
              const active = v.key === activeVariant;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => onSelectVariant(v.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? v.key === 'original'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {v.label} ({v.code})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCheckAnswers}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{checked ? 'تم التصحيح (Ergebnis aktiv)' : 'تصحيح الإجابات (Prüfen)'}</span>
          </button>

          <button
            type="button"
            onClick={onResetAnswers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة (Reset)</span>
          </button>

          <button
            type="button"
            onClick={onToggleReviewed}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              isReviewed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isReviewed ? 'تمت مراجعته' : 'تعليم كمراجع'}</span>
          </button>
        </div>
      </div>

      {/* Modification Warning Note when Modified variant is active */}
      {currentVariantObj.changeNote && (
        <div className="px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs font-medium text-amber-900 dark:text-amber-200 arabic-text">
          {currentVariantObj.changeNote}
        </div>
      )}

      {/* Row 2: Sahla Pro Study Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleMemorize}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              memorizeMode
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>وضع الحفظ السريع (Memorize)</span>
          </button>

          <button
            type="button"
            onClick={onToggleHighlight}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              highlightMotCle
                ? 'bg-amber-400 border-amber-500 text-slate-950'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>تلوين الموكلي بالأصفر (Mot-Clé)</span>
          </button>

          <button
            type="button"
            onClick={onToggleArabic}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              showArabic
                ? 'bg-sky-600 border-sky-600 text-white'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>الترجمة العربية (文A)</span>
          </button>

          <button
            type="button"
            onClick={onToggleShuffle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              shuffleSeed > 0
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{shuffleSeed > 0 ? 'مُخربق (Anti-Rote نشط)' : 'تخربق الترتيب (Shuffle)'}</span>
          </button>
        </div>

        {/* Font size controls */}
        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onChangeFontSize(-1)}
            aria-label="Decrease font size"
            className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
          >
            <ZoomOut className="w-3.5 h-3.5 inline mr-0.5" />
            A-
          </button>
          <button
            type="button"
            onClick={() => onChangeFontSize(1)}
            aria-label="Increase font size"
            className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
          >
            <ZoomIn className="w-3.5 h-3.5 inline mr-0.5" />
            A+
          </button>
        </div>
      </div>
    </div>
  );
};
