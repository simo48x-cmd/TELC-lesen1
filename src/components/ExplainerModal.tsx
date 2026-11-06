import React from 'react';
import { X, Lightbulb, Key, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface ExplainerModalData {
  title: string;
  answerBadge: string;
  triggerInQuestion: string;
  twinInText: string;
  explanationAr: string;
  trapWarningAr?: string;
}

interface ExplainerModalProps {
  data: ExplainerModalData | null;
  onClose: () => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explainer-modal-title"
    >
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h3 id="explainer-modal-title" className="font-bold text-base text-slate-900 dark:text-slate-100">
              {data.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close explanation modal"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 px-4 py-2.5 rounded-lg">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 arabic-text">
              الجواب الصحيح المعتمد:
            </span>
            <span className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">
              {data.answerBadge}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1 arabic-text">
                <Key className="w-4 h-4 shrink-0" />
                <span>الكلمة المفتاحية في السؤال / العنوان (Trigger in Heading/Question):</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                <mark className="bg-yellow-200 dark:bg-yellow-500/40 text-slate-950 dark:text-yellow-100 px-1.5 py-0.5 rounded">
                  {data.triggerInQuestion}
                </mark>
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1 arabic-text">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>الكلمة المطابقة في النص / الإعلان (Twin in Text/Anzeige):</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                <mark className="bg-yellow-200 dark:bg-yellow-500/40 text-slate-950 dark:text-yellow-100 px-1.5 py-0.5 rounded">
                  {data.twinInText}
                </mark>
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 arabic-text">
                الشرح بالدارجة والعربية (لماذا هذا الجواب؟):
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed arabic-text">
                {data.explanationAr}
              </p>
            </div>

            {data.trapWarningAr && (
              <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/25 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 leading-relaxed arabic-text">
                  {data.trapWarningAr}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            فهمت الموكلي (Schließen)
          </button>
        </div>
      </div>
    </div>
  );
};
