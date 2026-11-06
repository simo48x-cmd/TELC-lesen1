import React, { useState, useMemo } from 'react';
import { Search, Zap, AlertTriangle, ArrowRight, GitCompare } from 'lucide-react';
import { searchExamRadar } from '../utils/examEngine';
import { PruefungPackage, Teil1Topic, Teil2Topic, Teil3Topic } from '../data/lesenTypes';

interface ExamRadarTabProps {
  onStartPruefung: (pkg: PruefungPackage) => void;
  onOpenTeil1: (topic: Teil1Topic) => void;
  onOpenTeil2: (topic: Teil2Topic) => void;
  onOpenTeil3: (topic: Teil3Topic) => void;
}

const QUICK_RADAR_CHIPS = [
  'Inseln',
  'Krista',
  'Kinobetreiber',
  'EBICJ',
  'Insekten',
  'IHBEC',
  'Bilder',
  'Limonade N',
  'Parkuhren',
  'Schlafzug',
  'Kartoffeln',
  'Sandfisch',
];

export const ExamRadarTab: React.FC<ExamRadarTabProps> = ({
  onStartPruefung,
  onOpenTeil1,
  onOpenTeil2,
  onOpenTeil3,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchExamRadar(query), [query]);

  return (
    <div className="space-y-6">
      {/* Search Box & Quick Chips */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>رادار ليلة الامتحان السريع (Exam-Day Radar & Code Finder)</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 arabic-text mt-1">
              اكتب أي كلمة ألمانية، عنوان بالعربية، أو كود (مثلاً: Inseln, Krista, Kinobetreiber, EBICJ, IHBEC, Sandfisch) باش يطلع ليك الامتحان الكامل والتعديلات فوراً!
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search exam radar by keyword, title, or answer code"
            placeholder="ابحث بالكود أو الموكلي أو العنوان: Inseln, Krista, Kinobetreiber, EBICJ, IHBEC, الحشرات..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 arabic-text">
            بحث سريع:
          </span>
          {QUICK_RADAR_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setQuery(chip)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                query.toLowerCase() === chip.toLowerCase()
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {chip}
            </button>
          ))}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-3 py-1 rounded-md text-xs font-semibold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
            >
              مسح البحث (Alle zeigen)
            </button>
          )}
        </div>
      </div>

      {/* Negation Trap Warning Box (nicht / kein / ohne) */}
      <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-800 dark:text-slate-200 arabic-text">
          <p className="font-bold text-amber-900 dark:text-amber-200">
            قاعدة النجاة من فخاخ التعديل (Anti-Trap Rule: nicht / kein / ohne):
          </p>
          <p className="leading-relaxed">
            في الامتحانات المعدلة (المعدل 1 و 2)، يغير واضعو الامتحان إما ترتيب الاختيارات (مثلاً Duisburg 1954 في Parkuhren من c إلى b) أو يعوضون الكلمة بمرادفها (مثلاً في Krista السؤال 10: <span className="font-mono font-bold">war Kinobetreiber</span> كترجع <span className="font-mono font-bold">besaß ein Kino</span>) ويضعون في الاختيار الخاطئ نفس الكلمة مع <span className="font-mono font-bold text-rose-600 dark:text-rose-400">nicht / kein</span>! تأكد دائماً من خلو الجملة من النفي قبل اختيارها.
          </p>
        </div>
      </div>

      {/* Linked Prüfungen Packages Matching Radar */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          الامتحانات الكاملة المطابقة ({results.packages.length} Prüfungen)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {pkg.id} · {pkg.badge}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                      {pkg.nameDe}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                      {pkg.nameAr}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartPruefung(pkg)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                  >
                    <span>افتح الامتحان</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500">Lesen Teil 1</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {pkg.teil1Summary}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500">Lesen Teil 2</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {pkg.teil2Summary}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500">Lesen Teil 3</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {pkg.teil3Summary}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 arabic-text pt-1">
                  {pkg.examNotesAr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Original vs Modified Comparison Table for Matching Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Teil 1 Matches */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-emerald-600" />
            <span>Lesen Teil 1 ({results.teil1Matches.length})</span>
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {results.teil1Matches.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    #{t.number} {t.titleDe}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenTeil1(t)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    تدرب ➔
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.variants.map((v) => (
                    <span
                      key={v.key}
                      className="font-mono text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      {v.label}: {v.code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teil 2 Matches */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-sky-600" />
            <span>Lesen Teil 2 ({results.teil2Matches.length})</span>
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {results.teil2Matches.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    #{t.number} {t.titleDe}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenTeil2(t)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    تدرب ➔
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.variants.map((v) => (
                    <span
                      key={v.key}
                      className="font-mono text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      {v.label}: {v.code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teil 3 Matches */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-rose-600" />
            <span>Lesen Teil 3 ({results.teil3Matches.length})</span>
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {results.teil3Matches.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    #{t.number} {t.titleDe}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenTeil3(t)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    تدرب ➔
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.variants.map((v) => (
                    <span
                      key={v.key}
                      className="font-mono text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      {v.label}: {v.code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
