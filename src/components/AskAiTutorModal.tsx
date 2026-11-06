import React, { useState } from 'react';
import { AskAiContextItem } from '../data/verbatimTypes';
import { AiPromptType, generateLocalAiTutorResponse } from '../utils/b2StudyEngine';
import { Bot, Sparkles, X, KeyRound, ShieldAlert, GitCompare, BookOpen } from 'lucide-react';
import { AudioListenButton } from './AudioListenButton';

interface AskAiTutorModalProps {
  context: AskAiContextItem | null;
  onClose: () => void;
}

const SMART_PROMPTS: { id: AiPromptType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'why_correct',
    label: '1️⃣ لماذا هذا العنوان/الجواب هو الأصح؟ (تحليل الموكلي)',
    icon: <KeyRound className="w-4 h-4 text-amber-300" />,
  },
  {
    id: 'compare_traps',
    label: '2️⃣ قارن بين هذا العنوان وعناوين الفخاخ الأخرى',
    icon: <ShieldAlert className="w-4 h-4 text-rose-300" />,
  },
  {
    id: 'mod_and_negation',
    label: '3️⃣ اشرح لي فخ التعديل (الأساسي vs المعدل) وقاعدة النفي nicht/kein',
    icon: <GitCompare className="w-4 h-4 text-indigo-300" />,
  },
  {
    id: 'extract_b2_vocab',
    label: '4️⃣ استخرج لي أهم كلمات وقواعد B2 من هذه الفقرة',
    icon: <BookOpen className="w-4 h-4 text-emerald-300" />,
  },
];

export const AskAiTutorModal: React.FC<AskAiTutorModalProps> = ({ context, onClose }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<AiPromptType>('why_correct');

  if (!context) return null;

  const response = generateLocalAiTutorResponse(context, selectedPrompt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black text-white">
                  🤖 المعلم الذكي المحلي (Ask AI Tutor — 100% مجاني)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {context.itemLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تحليل فوري للموكلي، الفخاخ، التعديلات، وأدوات النفي في موضوع: <strong className="text-amber-300">{context.moduleTitle}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 One-Click Smart Prompts */}
        <div className="space-y-2">
          <div className="text-xs font-extrabold text-indigo-300">
            ✨ اختر السؤال الذي تريد من المعلم الذكي شرحه بالتفصيل:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SMART_PROMPTS.map((p) => {
              const active = selectedPrompt === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrompt(p.id)}
                  className={`text-right p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center gap-2.5 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white border-indigo-300 shadow-lg ring-1 ring-indigo-300/50'
                      : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{p.icon}</span>
                  <span className="leading-snug">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generated Structured Tutor Response */}
        <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <h4 className="text-sm md:text-base font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{response.titleAr}</span>
            </h4>
            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-mono font-black text-xs">
              {response.badgeText}
            </span>
          </div>

          <div className="space-y-3">
            {response.sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-indigo-300">{sec.heading}</span>
                  {sec.highlightPill && (
                    <span
                      dir="ltr"
                      className="px-2.5 py-0.5 rounded-lg bg-yellow-300 text-slate-950 font-mono font-black text-xs"
                    >
                      {sec.highlightPill}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-100 whitespace-pre-line leading-relaxed">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {/* Listen to Correct Answer & Original Paragraph */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              🔊 استمع للجواب الألماني الصحيح بالصوت:
            </span>
            <AudioListenButton text={context.correctTextDe} label="نطق الجواب الصحيح" />
          </div>
        </div>
      </div>
    </div>
  );
};
