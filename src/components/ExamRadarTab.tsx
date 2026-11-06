import React, { useMemo, useState } from 'react';
import { RadarRow, searchRadarModules } from '../utils/examEngine';
import { ExternalLink, Filter, Radar, Search, Sparkles } from 'lucide-react';

interface ExamRadarTabProps {
  onOpenModule: (moduleType: RadarRow['moduleType'], id: string) => void;
}

export const ExamRadarTab: React.FC<ExamRadarTabProps> = ({ onOpenModule }) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | RadarRow['moduleType']>('all');

  const rows = useMemo(() => {
    const matched = searchRadarModules(query);
    if (typeFilter === 'all') return matched;
    return matched.filter((r) => r.moduleType === typeFilter);
  }, [query, typeFilter]);

  const quickChips = [
    'Inseln',
    'EBICJ',
    'Bilder',
    'Limonade',
    'Insekten',
    'Sandfisch',
    'Schlafzug',
    'Kartoffeln',
    'Programmierer',
    'Martini',
    'Handschrift',
  ];

  return (
    <div className="space-y-5">
      {/* Header & Instant Search */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold mb-1.5">
              <Radar className="w-3.5 h-3.5" />
              <span>⚡ رادار ليلة الامتحان والكودات (210 نموذج رسمي كامل)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              ابحث بأي كلمة ألمانية، عنوان بالعربية، أو كود (مثل: EBICJ، Inseln، الحشرات، Martini)
            </h2>
            <p className="text-xs md:text-sm text-slate-300">
              يقارن لك الكود الأساسي (Original) مع المعدل 1 والمعدل 2 ويفتح لك أي امتحان بضغطة واحدة!
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400 font-bold">النتائج المطابقة</div>
            <div className="text-lg font-black text-emerald-400 font-mono">{rows.length} / 210</div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-indigo-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب اسم الموضوع بالألمانية أو العربية أو الكود (مثال: Inseln, EBICJ, Bilder, Programmierer, Kaffee...)"
            className="w-full bg-slate-950/95 border-2 border-indigo-500/40 focus:border-amber-400 rounded-2xl pr-12 pl-24 py-3.5 text-sm md:text-base text-white placeholder:text-slate-500 outline-none shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* Quick Search Chips & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 ml-1">بحث سريع:</span>
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setQuery(chip)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-mono font-bold border border-slate-700 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {(
              [
                { id: 'all', label: 'الكل (210)' },
                { id: 'pruefung', label: 'Prüfungen (34)' },
                { id: 'teil1', label: 'Teil 1 (45)' },
                { id: 'teil2', label: 'Teil 2 (28)' },
                { id: 'teil3', label: 'Teil 3 (32)' },
                { id: 'sb1', label: 'Sprach 1 (35)' },
                { id: 'sb2', label: 'Sprach 2 (36)' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-xs font-extrabold text-slate-400">
                <th className="p-3.5">القسم</th>
                <th className="p-3.5">الموضوع (الألماني والعربي)</th>
                <th className="p-3.5" dir="ltr">
                  ✅ الكود الأساسي (Original)
                </th>
                <th className="p-3.5" dir="ltr">
                  ⚠️ الكود المعدل 1 / 2
                </th>
                <th className="p-3.5">الكلمات المفتاحية / الارتباط</th>
                <th className="p-3.5 text-center">فتح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {rows.map((row) => (
                <tr
                  key={`${row.moduleType}-${row.id}`}
                  className="hover:bg-indigo-950/30 transition-colors"
                >
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-indigo-300">
                      {row.moduleBadge}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-extrabold text-white" dir="ltr">
                      {row.titleDe}
                    </div>
                    <div className="text-xs font-bold text-amber-300">{row.titleAr}</div>
                    {row.linkedInfo && (
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5" dir="ltr">
                        {row.linkedInfo}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 font-mono text-xs" dir="ltr">
                    <span className="inline-block bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-extrabold">
                      {row.codeBase}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-xs space-y-1" dir="ltr">
                    {row.codeMod1 !== '—' ? (
                      <div className="inline-block bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-extrabold">
                        M1: {row.codeMod1}
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                    {row.codeMod2 !== '—' && (
                      <div className="block bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg font-extrabold">
                        M2: {row.codeMod2}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 text-xs text-slate-300 max-w-xs" dir="ltr">
                    <div className="line-clamp-2 font-sans text-xs font-semibold text-yellow-200/95">
                      <Sparkles className="w-3 h-3 inline mr-1 text-yellow-400" />
                      {row.keywordsSample.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]|\uFFFD|🔲/g, '')}
                    </div>
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenModule(row.moduleType, row.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md cursor-pointer"
                    >
                      <span>فتح الامتحان</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
