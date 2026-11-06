import React, { useState } from 'react';
import { MistakeItem, SavedWordItem } from '../data/verbatimTypes';
import { speakGermanText } from '../utils/b2StudyEngine';
import {
  AlertTriangle,
  BookMarked,
  ExternalLink,
  RotateCw,
  Star,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';

interface SavedWordsMistakesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedWordItem[];
  onRemoveWord: (cleanWord: string) => void;
  mistakes: MistakeItem[];
  onClearMistakes: () => void;
  onOpenMistakeModule: (moduleType: MistakeItem['moduleType'], moduleId: string) => void;
}

export const SavedWordsMistakesDrawer: React.FC<SavedWordsMistakesDrawerProps> = ({
  isOpen,
  onClose,
  savedWords,
  onRemoveWord,
  mistakes,
  onClearMistakes,
  onOpenMistakeModule,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'words' | 'mistakes'>('words');
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeCard = savedWords[flashcardIndex] || savedWords[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white">
                📚 قاموسي الشخصي وبنك أخطائي (My B2 Vocab &amp; Mistake Bank)
              </h3>
              <p className="text-xs text-slate-400">
                راجع الكلمات التي نقرت عليها وحفظتها أثناء قراءة النصوص + الأسئلة التي أخطأت فيها!
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

        {/* 2 Sub-Tabs */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('words')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'words'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>⭐ قاموسي الشخصي ({savedWords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('mistakes')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'mistakes'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>⚠️ بنك أخطائي ({mistakes.length})</span>
          </button>
        </div>

        {/* TAB 1: Saved Vocabulary + Interactive Flashcard */}
        {activeSubTab === 'words' ? (
          <div className="space-y-5">
            {/* Interactive Flashcard Box */}
            {activeCard && (
              <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-amber-950/40 border border-amber-400/40 rounded-2xl p-5 text-center space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>🎴 بطاقات المراجعة السريعة (Flashcards)</span>
                  <span className="font-mono">
                    {flashcardIndex + 1} / {savedWords.length}
                  </span>
                </div>

                <div
                  onClick={() => setFlipped((f) => !f)}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-6 cursor-pointer transition-all min-h-[130px] flex flex-col items-center justify-center gap-2"
                >
                  <div dir="ltr" className="text-2xl font-black text-white font-mono">
                    {activeCard.cleanWord}
                  </div>
                  {flipped ? (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <div className="text-base font-extrabold text-emerald-300">
                        {activeCard.meaningAr}
                      </div>
                      <div className="text-xs text-slate-400">{activeCard.grammarTipAr}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-300/80 flex items-center gap-1 mt-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>اضغط على البطاقة لإظهار الترجمة والقاعدة</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => speakGermanText(activeCard.cleanWord, 1.0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-extrabold border border-slate-700 cursor-pointer inline-flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>نطق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlipped(false);
                      setFlashcardIndex((i) => (i + 1) % savedWords.length);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    الكلمة التالية ➔
                  </button>
                </div>
              </div>
            )}

            {/* Full Saved Words List */}
            <div className="space-y-2.5">
              {savedWords.map((item) => (
                <div
                  key={item.cleanWord}
                  className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span dir="ltr" className="font-mono font-black text-base text-white">
                        {item.cleanWord}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-emerald-300">{item.meaningAr}</p>
                    {item.contextSentence && (
                      <p dir="ltr" className="text-[11px] text-slate-400 font-sans truncate max-w-xl">
                        “{item.contextSentence}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakGermanText(item.cleanWord, 1.0)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 cursor-pointer"
                      title="نطق الكلمة"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveWord(item.cleanWord)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 cursor-pointer"
                      title="حذف من قاموسي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* TAB 2: Mistake Bank */
          <div className="space-y-4">
            {mistakes.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <p className="text-base font-black text-emerald-300">
                  🎉 لا توجد أخطاء مسجلة حالياً!
                </p>
                <p className="text-xs text-slate-400">
                  عندما تجيب على أي امتحان وتضغط على زر «✔️ تصحيح»، سيتم حفظ الأسئلة التي أخطأت فيها هنا تلقائياً لمراجعتها قبل الامتحان.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    إجمالي الأخطاء المسجلة للمراجعة: {mistakes.length}
                  </span>
                  <button
                    type="button"
                    onClick={onClearMistakes}
                    className="text-xs font-extrabold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح السجل</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {mistakes.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-950/90 border border-rose-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-mono font-black text-xs border border-rose-500/30">
                            سؤال #{m.questionNum}
                          </span>
                          <span className="text-sm font-black text-white" dir="ltr">
                            {m.moduleTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono" dir="ltr">
                          <span className="text-rose-400 font-bold">
                            إجابتك: {m.userAnswer} ✗
                          </span>
                          <span className="text-emerald-400 font-black">
                            الصحيح: {m.correctAnswer} ✓
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-300">{m.explanationAr}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenMistakeModule(m.moduleType, m.moduleId);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold cursor-pointer"
                      >
                        <span>مراجعة الامتحان</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
