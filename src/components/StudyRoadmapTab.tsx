import React from 'react';
import { Compass, CheckCircle2, ShieldAlert, Clock, Award, ArrowRight } from 'lucide-react';
import { STUDY_ROADMAP_DAYS, PRUEFUNGEN_PACKAGES, PruefungPackage } from '../data/lesenData';

interface StudyRoadmapTabProps {
  completedDays: number[];
  onToggleDay: (day: number) => void;
  onStartPruefung: (pkg: PruefungPackage) => void;
}

export const StudyRoadmapTab: React.FC<StudyRoadmapTabProps> = ({
  completedDays,
  onToggleDay,
  onStartPruefung,
}) => {
  return (
    <div className="space-y-6">
      {/* Darija Methodology Hero Card */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <span>خطة المراجعة الذكية في 7 أيام + منهجية الموكلي (Sahla & Alpha Method)</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 arabic-text">
              كيفاش تحل امتحان Lesen & Sprachbausteine في 45 دقيقة وتجيب فوق 85/105 بلا ما تحفظ الحروف بشكل أعمى!
            </p>
          </div>
          <div className="text-right font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
            تقدم الخطة: {completedDays.length} / 7 أيام مكتملة
          </div>
        </div>

        {/* 3 Golden Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200 arabic-text">
              <Award className="w-4 h-4 shrink-0" />
              <span>1. قاعدة الموكلي التوأم (Twin Mot-Clé)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed arabic-text">
              في Teil 1 و Teil 3، اربط دائماً الكلمة المفتاحية في العنوان/الحالة بالكلمة التوأم في النص (مثلاً: <span className="font-mono font-bold">ohne Handy</span> ➔ <span className="font-mono font-bold">kein WLAN</span>). حتى لو خربقوا الحروف، الموكلي ما كيتبدلش!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-900 dark:text-rose-200 arabic-text">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>2. رادار النفي (nicht / kein / ohne)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed arabic-text">
              في Teil 2، احفظ الأسئلة الخمسة (6–10) والجواب الصحيح فقط. نهار الامتحان قلب على الموكلي وتأكد مليار في المئة أن الجملة ما زادوش فيها <span className="font-mono font-bold">nicht</span> أو <span className="font-mono font-bold">kein</span>!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-200 arabic-text">
              <Clock className="w-4 h-4 shrink-0" />
              <span>3. تقسيم الـ 90 دقيقة (105 نقطة)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed arabic-text">
              Teil 1 (25 نقطة: 10 دقائق) · Teil 2 (25 نقطة: 10 دقائق) · Teil 3 (25 نقطة: 15 دقيقة) · Sprachbausteine 1 & 2 (30 نقطة: 15 دقيقة). النجاح هو 63/105!
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Checklist */}
      <div className="space-y-4">
        {STUDY_ROADMAP_DAYS.map((d) => {
          const isDone = completedDays.includes(d.day);
          const linkedPkgs = PRUEFUNGEN_PACKAGES.filter((p) => d.targetPackages.includes(p.id));

          return (
            <div
              key={d.day}
              className={`rounded-xl bg-white dark:bg-slate-900 border p-5 space-y-3 transition-colors ${
                isDone
                  ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleDay(d.day)}
                    aria-label={`Mark Day ${d.day} as completed`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : `D${d.day}`}
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 arabic-text">
                      {d.titleAr}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {d.titleDe}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleDay(d.day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isDone ? 'مكتمل ✓' : 'تعليم اليوم كمكتمل'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 arabic-text">
                  <span className="font-bold text-slate-900 dark:text-slate-100">💡 نصيحة اليوم: </span>
                  <span className="text-slate-700 dark:text-slate-300">{d.methodologyTipAr}</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 arabic-text">
                  <span className="font-bold text-amber-900 dark:text-amber-200">⚠️ تنبيه الفخاخ: </span>
                  <span className="text-slate-800 dark:text-slate-200">{d.keyTrapCheckAr}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 arabic-text">
                  امتحانات هذا اليوم:
                </span>
                {linkedPkgs.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => onStartPruefung(pkg)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                  >
                    <span>
                      {pkg.id}: {pkg.nameDe.split(':')[1]?.split('—')[0]?.trim() || pkg.nameDe}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
