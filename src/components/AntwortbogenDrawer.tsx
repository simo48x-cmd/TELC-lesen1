import React from 'react';
import { PruefungScoreBreakdown } from '../utils/examEngine';
import { CheckCircle2, ClipboardList, X, XCircle, Award } from 'lucide-react';

interface AntwortbogenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pruefungTitle: string;
  pruefungArTitle: string;
  variantLabel: string;
  score: PruefungScoreBreakdown;
  t1User: Record<number, string>;
  t1Correct: string[];
  t2User: Record<number, string>;
  t2Correct: string[];
  t3User: Record<number, string>;
  t3Correct: string[];
  sb1User: Record<number, string>;
  sb1Correct: string[];
  sb2User: Record<number, string>;
  sb2Correct: string[];
  memorizeMode: boolean;
  onJumpToStep: (step: 0 | 1 | 2 | 3 | 4) => void;
}

export const AntwortbogenDrawer: React.FC<AntwortbogenDrawerProps> = ({
  isOpen,
  onClose,
  pruefungTitle,
  pruefungArTitle,
  variantLabel,
  score,
  t1User,
  t1Correct,
  t2User,
  t2Correct,
  t3User,
  t3Correct,
  sb1User,
  sb1Correct,
  sb2User,
  sb2Correct,
  memorizeMode,
  onJumpToStep,
}) => {
  if (!isOpen) return null;

  const renderSectionGrid = (
    title: string,
    pointsLabel: string,
    startNum: number,
    count: number,
    userMap: Record<number, string>,
    correctArr: string[],
    stepIndex: 0 | 1 | 2 | 3 | 4
  ) => {
    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white" dir="ltr">
              {title}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30" dir="ltr">
              {pointsLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onJumpToStep(stepIndex);
              onClose();
            }}
            className="text-xs font-extrabold text-amber-300 hover:text-amber-200 underline cursor-pointer"
          >
            الانتقال إلى هذا الجزء ➔
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2" dir="ltr">
          {Array.from({ length: count }, (_, idx) => {
            const qNum = startNum + idx;
            const rightAns = correctArr[idx] || '—';
            const userAns = memorizeMode ? rightAns : userMap[qNum] || '';
            const isCorrect = userAns === rightAns;

            return (
              <div
                key={qNum}
                onClick={() => {
                  onJumpToStep(stepIndex);
                  onClose();
                }}
                className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                  !userAns
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-indigo-500/40'
                    : isCorrect
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 mb-0.5">#{qNum}</div>
                <div className="font-mono font-black text-sm">
                  {userAns || '—'}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5 border-t border-slate-800/80 pt-0.5">
                  ✓ {rightAns}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white">
                📋 ورقة الإجابة الرسمية (TELC B2 Antwortbogen 1–40)
              </h3>
              <p className="text-xs text-slate-400">
                امتحان: <strong className="text-white" dir="ltr">{pruefungTitle}</strong> ({pruefungArTitle}) • النسخة: <strong className="text-amber-300">{variantLabel}</strong>
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

        {/* 105-Point Score Summary Banner */}
        <div
          className={`rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-4 ${
            score.passed
              ? 'bg-emerald-950/60 border-emerald-500/50'
              : 'bg-indigo-950/50 border-indigo-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <Award className={`w-8 h-8 ${score.passed ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-xs font-bold text-slate-300">
                مجموع النقاط في قسم القراءة والقواعد (Lesen + Sprachbausteine):
              </div>
              <div className="text-lg md:text-xl font-black font-mono text-white" dir="ltr">
                {score.totalScore} / 105 Punkte ({score.percentage}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {score.passed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>ناجح! (تجاوزت عتبة 63/105 = 60%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs">
                <XCircle className="w-4 h-4" />
                <span>عتبة النجاح الرسمية: 63 / 105 نقطة (60%)</span>
              </span>
            )}
          </div>
        </div>

        {/* All 40 Questions Breakdown */}
        <div className="space-y-3">
          {renderSectionGrid(
            'Lesen Teil 1 (Globalverstehen 1–5)',
            `${score.t1Score} / 25 Pts (5 × 5P)`,
            1,
            5,
            t1User,
            t1Correct,
            0
          )}
          {renderSectionGrid(
            'Lesen Teil 2 (Detailverstehen 6–10)',
            `${score.t2Score} / 25 Pts (5 × 5P)`,
            6,
            5,
            t2User,
            t2Correct,
            1
          )}
          {renderSectionGrid(
            'Lesen Teil 3 (Selektives Verstehen 11–20)',
            `${score.t3Score} / 25 Pts (10 × 2.5P)`,
            11,
            10,
            t3User,
            t3Correct,
            2
          )}
          {renderSectionGrid(
            'Sprachbausteine Teil 1 (Grammatik 21–30)',
            `${score.sb1Score} / 15 Pts (10 × 1.5P)`,
            21,
            10,
            sb1User,
            sb1Correct,
            3
          )}
          {renderSectionGrid(
            'Sprachbausteine Teil 2 (Wortschatz 31–40)',
            `${score.sb2Score} / 15 Pts (10 × 1.5P)`,
            31,
            10,
            sb2User,
            sb2Correct,
            4
          )}
        </div>
      </div>
    </div>
  );
};
