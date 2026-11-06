import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Moon,
  Sun,
  Award,
  Search,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  PRUEFUNGEN_PACKAGES,
  TEIL1_TOPICS,
  TEIL2_TOPICS,
  TEIL3_TOPICS,
  SPRACHBAUSTEINE_TOPICS,
  PruefungPackage,
} from './data/lesenData';
import { calculatePruefungScore, resolveVariantAnswer } from './utils/examEngine';
import { SahlaToolbar } from './components/SahlaToolbar';
import { Teil1Simulator } from './components/Teil1Simulator';
import { Teil2Simulator } from './components/Teil2Simulator';
import { Teil3Simulator } from './components/Teil3Simulator';
import { SprachbausteineSimulator } from './components/SprachbausteineSimulator';
import { ExamRadarTab } from './components/ExamRadarTab';
import { StudyRoadmapTab } from './components/StudyRoadmapTab';

type MainTab = 'pruefungen' | 'einzeln' | 'radar' | 'roadmap';
type ExamStep = 1 | 2 | 3 | 4 | 5;
type EinzelPartFilter = 'teil1' | 'teil2' | 'teil3' | 'sb';

const FONT_SIZE_CLASSES = ['text-xs', 'text-sm', 'text-base', 'text-lg'];

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('telc_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('telc_dark_mode', String(darkMode));
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<MainTab>('pruefungen');

  // Active Prüfung Package in Tab 1 (null = show grid of 26 packages; or default to P1 if ?autostart=1)
  const [activePackageId, setActivePackageId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      return 'P1';
    }
    return null;
  });
  const [examStep, setExamStep] = useState<ExamStep>(1);
  const [packageFilterQuery, setPackageFilterQuery] = useState('');

  // Tab 2: Alle Teile einzeln state
  const [einzelPart, setEinzelPart] = useState<EinzelPartFilter>('teil1');
  const [einzelTopicId, setEinzelTopicId] = useState<string | null>(null);
  const [einzelSearch, setEinzelSearch] = useState('');

  // Sahla Pro Toolbar States
  const [activeVariant, setActiveVariant] = useState<string>('original');
  const [memorizeMode, setMemorizeMode] = useState<boolean>(false);
  const [highlightMotCle, setHighlightMotCle] = useState<boolean>(true);
  const [showArabic, setShowArabic] = useState<boolean>(true);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(1); // 'text-sm'
  const [checked, setChecked] = useState<boolean>(false);

  // User Answers State
  const [teil1Answers, setTeil1Answers] = useState<Record<number, string>>({});
  const [teil2Answers, setTeil2Answers] = useState<Record<number, 'a' | 'b' | 'c'>>({});
  const [teil3Answers, setTeil3Answers] = useState<Record<number, string>>({});
  const [sb1Answers, setSb1Answers] = useState<Record<number, string>>({});
  const [sb2Answers, setSb2Answers] = useState<Record<number, string>>({});

  // 90-Minute Countdown Timer (5400 seconds)
  const [secondsLeft, setSecondsLeft] = useState<number>(90 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Reviewed items & Roadmap days in localStorage
  const [reviewedIds, setReviewedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('telc_reviewed_ids');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('telc_roadmap_days');
      return raw ? JSON.parse(raw) : [1];
    } catch {
      return [1];
    }
  });

  const toggleReviewed = (id: string) => {
    setReviewedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('telc_reviewed_ids', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleRoadmapDay = (day: number) => {
    setCompletedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      try {
        localStorage.setItem('telc_roadmap_days', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetAllAnswers = () => {
    setTeil1Answers({});
    setTeil2Answers({});
    setTeil3Answers({});
    setSb1Answers({});
    setSb2Answers({});
    setChecked(false);
    setMemorizeMode(false);
  };

  const startPruefungPackage = (pkg: PruefungPackage) => {
    setActivePackageId(pkg.id);
    setExamStep(1);
    setActiveVariant('original');
    resetAllAnswers();
    setSecondsLeft(90 * 60);
    setTimerRunning(true);
    setActiveTab('pruefungen');
  };

  const activePackage = useMemo(
    () => PRUEFUNGEN_PACKAGES.find((p) => p.id === activePackageId) || null,
    [activePackageId]
  );

  // Resolve active topics for the current Prüfung or Single-Part practice
  const currentTeil1 = useMemo(() => {
    const targetId =
      activeTab === 'pruefungen' && activePackage
        ? activePackage.teil1Id
        : einzelPart === 'teil1' && einzelTopicId
        ? einzelTopicId
        : TEIL1_TOPICS[0].id;
    return TEIL1_TOPICS.find((t) => t.id === targetId) || TEIL1_TOPICS[0];
  }, [activeTab, activePackage, einzelPart, einzelTopicId]);

  const currentTeil2 = useMemo(() => {
    const targetId =
      activeTab === 'pruefungen' && activePackage
        ? activePackage.teil2Id
        : einzelPart === 'teil2' && einzelTopicId
        ? einzelTopicId
        : TEIL2_TOPICS[0].id;
    return TEIL2_TOPICS.find((t) => t.id === targetId) || TEIL2_TOPICS[0];
  }, [activeTab, activePackage, einzelPart, einzelTopicId]);

  const currentTeil3 = useMemo(() => {
    const targetId =
      activeTab === 'pruefungen' && activePackage
        ? activePackage.teil3Id
        : einzelPart === 'teil3' && einzelTopicId
        ? einzelTopicId
        : TEIL3_TOPICS[0].id;
    return TEIL3_TOPICS.find((t) => t.id === targetId) || TEIL3_TOPICS[0];
  }, [activeTab, activePackage, einzelPart, einzelTopicId]);

  const currentSB1 = useMemo(() => {
    const targetId =
      activeTab === 'pruefungen' && activePackage
        ? activePackage.sb1Id
        : einzelPart === 'sb' && einzelTopicId
        ? einzelTopicId
        : 'sb1-ferdinand';
    return (
      SPRACHBAUSTEINE_TOPICS.find((s) => s.id === targetId) ||
      SPRACHBAUSTEINE_TOPICS[0]
    );
  }, [activeTab, activePackage, einzelPart, einzelTopicId]);

  const currentSB2 = useMemo(() => {
    const targetId =
      activeTab === 'pruefungen' && activePackage
        ? activePackage.sb2Id
        : 'sb2-fahrrad';
    return (
      SPRACHBAUSTEINE_TOPICS.find((s) => s.id === targetId) ||
      SPRACHBAUSTEINE_TOPICS[4]
    );
  }, [activeTab, activePackage]);

  // Live Score Calculation out of 105 Points
  const scoreSummary = useMemo(() => {
    const t1Correct = currentTeil1.items.filter((it) => {
      const ans = resolveVariantAnswer(it.correctLetterByVariant, activeVariant);
      const given = memorizeMode ? ans : teil1Answers[it.textNumber];
      return given === ans;
    }).length;

    const t2Correct = currentTeil2.questions.filter((q) => {
      const ans = resolveVariantAnswer(q.correctLetterByVariant, activeVariant);
      const given = memorizeMode ? ans : teil2Answers[q.questionNumber];
      return given === ans;
    }).length;

    const t3Correct = currentTeil3.situations.filter((s) => {
      const ans = resolveVariantAnswer(s.correctLetterByVariant, activeVariant);
      const given = memorizeMode ? ans : teil3Answers[s.situationNumber];
      return given === ans;
    }).length;

    const sb1Correct = currentSB1.gaps.filter((g) => {
      const given = memorizeMode ? g.correctAnswer : sb1Answers[g.gapNumber];
      return given === g.correctAnswer;
    }).length;

    const sb2Correct = currentSB2.gaps.filter((g) => {
      const given = memorizeMode ? g.correctAnswer : sb2Answers[g.gapNumber];
      return given === g.correctAnswer;
    }).length;

    return calculatePruefungScore({
      teil1CorrectCount: t1Correct,
      teil2CorrectCount: t2Correct,
      teil3CorrectCount: t3Correct,
      sb1CorrectCount: sb1Correct,
      sb2CorrectCount: sb2Correct,
    });
  }, [
    currentTeil1,
    currentTeil2,
    currentTeil3,
    currentSB1,
    currentSB2,
    activeVariant,
    memorizeMode,
    teil1Answers,
    teil2Answers,
    teil3Answers,
    sb1Answers,
    sb2Answers,
  ]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const fontSizeClass = FONT_SIZE_CLASSES[fontSizeIndex] || 'text-sm';

  const filteredPackages = useMemo(() => {
    const q = packageFilterQuery.trim().toLowerCase();
    if (!q) return PRUEFUNGEN_PACKAGES;
    return PRUEFUNGEN_PACKAGES.filter((p) =>
      `${p.id} ${p.nameDe} ${p.nameAr} ${p.teil1Summary} ${p.teil2Summary} ${p.teil3Summary} ${p.badge}`
        .toLowerCase()
        .includes(q)
    );
  }, [packageFilterQuery]);

  // Active variants list for SahlaToolbar
  const activeStepVariants = useMemo(() => {
    if (activeTab === 'pruefungen') {
      if (examStep === 1) return currentTeil1.variants;
      if (examStep === 2) return currentTeil2.variants;
      if (examStep === 3) return currentTeil3.variants;
      return [{ key: 'original' as const, label: 'الأساسي', code: 'SB 21–40' }];
    }
    if (einzelPart === 'teil1') return currentTeil1.variants;
    if (einzelPart === 'teil2') return currentTeil2.variants;
    if (einzelPart === 'teil3') return currentTeil3.variants;
    return [{ key: 'original' as const, label: 'الأساسي', code: currentSB1.part }];
  }, [activeTab, examStep, einzelPart, currentTeil1, currentTeil2, currentTeil3, currentSB1]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('pruefungen');
            setActivePackageId(null);
            setEinzelTopicId(null);
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          TELC B2 Master Pro 2026
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pruefungen');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'pruefungen'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Prüfungen (26)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('einzeln');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'einzeln'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Alle Teile (97)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'radar'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Exam-Radar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'roadmap'
                ? 'text-slate-900 dark:text-white font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            7-Tage Plan
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-500 dark:text-slate-950 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: 26 COMPLETE LEAKED PRÜFUNGEN (90 MIN) */}
        {activeTab === 'pruefungen' && !activePackage && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  TELC DEUTSCH B2 · SAHLA & ALPHA EDITION 2026 · 100% LOKAL & KOSTENLOS
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white arabic-text">
                  امتحانات TELC B2 الكاملة والتعديلات الجديدة — Lesen & Sprachbausteine
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed arabic-text">
                  اختر أي امتحان من الـ 26 باقة مسربة (Inseln, Bilder, Limonade N, Grundschule, Insekten, Sport, Österreich, Schlafzug, Kartoffeln, Sandfisch...) لتمرير الامتحان الكامل في 90 دقيقة (105 نقطة) مع تلوين الموكلي بالأصفر، الترجمة الفورية، وسويتش الأساسي / المعدل!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => startPruefungPackage(PRUEFUNGEN_PACKAGES[0])}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ابدأ أشهر امتحان (P1: Inseln + Krista)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radar')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>رادار البحث السريع</span>
                </button>
              </div>
            </div>

            {/* Search & Stats Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={packageFilterQuery}
                  onChange={(e) => setPackageFilterQuery(e.target.value)}
                  aria-label="Filter the 26 exam packages"
                  placeholder="ابحث في الـ 26 امتحاناً (Inseln, Insekten, Krista, Kartoffeln, Sandfisch...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>26 امتحاناً كاملاً</span>
                <span aria-hidden="true">·</span>
                <span>42 موضوع Teil 1</span>
                <span aria-hidden="true">·</span>
                <span>27 موضوع Teil 2</span>
                <span aria-hidden="true">·</span>
                <span>28 موضوع Teil 3</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  تمت مراجعة: {reviewedIds.length}
                </span>
              </div>
            </div>

            {/* 26 Prüfungen Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map((pkg) => {
                const isDone = reviewedIds.includes(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    className={`rounded-xl bg-white dark:bg-slate-900 border p-5 flex flex-col justify-between gap-4 transition-colors ${
                      isDone
                        ? 'border-emerald-400 dark:border-emerald-700'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {pkg.id} · {pkg.badge}
                        </span>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تمت مراجعته</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {pkg.nameDe}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text mt-0.5">
                          {pkg.nameAr}
                        </p>
                      </div>

                      {/* 5 Connected Parts Breakdown */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Teil 1 (25p):</span>
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-right">
                            {pkg.teil1Summary}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Teil 2 (25p):</span>
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-right">
                            {pkg.teil2Summary}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Teil 3 (25p):</span>
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 text-right">
                            {pkg.teil3Summary}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">SB 1 & 2 (30p):</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[180px]">
                            {pkg.sb1Title} + {pkg.sb2Title}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg arabic-text leading-relaxed">
                        {pkg.examNotesAr}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => startPruefungPackage(pkg)}
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <span>بدء الامتحان الكامل (90 دقيقة · 105 نقطة)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1 ACTIVE EXAM: 5-STEP CONNECTED EXAM SIMULATOR */}
        {activeTab === 'pruefungen' && activePackage && (
          <div className="space-y-5">
            {/* Exam Header Bar with 90:00 Timer & 105-Pt Live Score */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePackageId(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>كل الامتحانات (26)</span>
                  </button>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {activePackage.nameDe}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                      {activePackage.nameAr} — {activePackage.examNotesAr}
                    </p>
                  </div>
                </div>

                {/* Live 90-Min Timer & 105-Point Scoreboard */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold tabular-nums">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{formatTimer(secondsLeft)}</span>
                    <button
                      type="button"
                      onClick={() => setTimerRunning((r) => !r)}
                      aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondsLeft(90 * 60)}
                      aria-label="Reset 90 minute timer"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold tabular-nums border ${
                      scoreSummary.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>
                      النقطة: {scoreSummary.totalPoints} / 105 ({scoreSummary.percentage}%)
                    </span>
                    <span className="text-[11px]">
                      {scoreSummary.passed ? 'ناجح (Bestanden ≥ 63)' : 'العتبة: 63'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Step Connected Flow Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  {
                    step: 1 as ExamStep,
                    label: '1. Lesen Teil 1',
                    sub: `${scoreSummary.teil1Points}/25 Pts`,
                  },
                  {
                    step: 2 as ExamStep,
                    label: '2. Lesen Teil 2',
                    sub: `${scoreSummary.teil2Points}/25 Pts`,
                  },
                  {
                    step: 3 as ExamStep,
                    label: '3. Lesen Teil 3',
                    sub: `${scoreSummary.teil3Points}/25 Pts`,
                  },
                  {
                    step: 4 as ExamStep,
                    label: '4. Sprachbausteine 1',
                    sub: `${scoreSummary.sb1Points}/15 Pts`,
                  },
                  {
                    step: 5 as ExamStep,
                    label: '5. Sprachbausteine 2',
                    sub: `${scoreSummary.sb2Points}/15 Pts`,
                  },
                ].map((st) => {
                  const isCurrent = examStep === st.step;
                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => {
                        setExamStep(st.step);
                        setActiveVariant('original');
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        isCurrent
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold whitespace-nowrap truncate">{st.label}</div>
                      <div
                        className={`text-[11px] font-mono tabular-nums ${
                          isCurrent ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {st.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sahla Pro Interactive Toolbar */}
            <SahlaToolbar
              variants={activeStepVariants}
              activeVariant={activeVariant}
              onSelectVariant={setActiveVariant}
              memorizeMode={memorizeMode}
              onToggleMemorize={() => setMemorizeMode((m) => !m)}
              highlightMotCle={highlightMotCle}
              onToggleHighlight={() => setHighlightMotCle((h) => !h)}
              showArabic={showArabic}
              onToggleArabic={() => setShowArabic((a) => !a)}
              shuffleSeed={shuffleSeed}
              onToggleShuffle={() =>
                setShuffleSeed((prev) => (prev === 0 ? Date.now() % 10000 : 0))
              }
              fontSizeScale={fontSizeIndex}
              onChangeFontSize={(delta) =>
                setFontSizeIndex((prev) =>
                  Math.min(FONT_SIZE_CLASSES.length - 1, Math.max(0, prev + delta))
                )
              }
              isReviewed={reviewedIds.includes(activePackage.id)}
              onToggleReviewed={() => toggleReviewed(activePackage.id)}
              onCheckAnswers={() => setChecked(true)}
              onResetAnswers={resetAllAnswers}
              checked={checked}
            />

            {/* Step Content */}
            {examStep === 1 && (
              <Teil1Simulator
                topic={currentTeil1}
                activeVariant={activeVariant}
                userAnswers={teil1Answers}
                onSelectAnswer={(num, letter) =>
                  setTeil1Answers((prev) => ({ ...prev, [num]: letter }))
                }
                memorizeMode={memorizeMode}
                highlightMotCle={highlightMotCle}
                showArabic={showArabic}
                shuffleSeed={shuffleSeed}
                checked={checked}
                fontSizeClass={fontSizeClass}
              />
            )}

            {examStep === 2 && (
              <Teil2Simulator
                topic={currentTeil2}
                activeVariant={activeVariant}
                userAnswers={teil2Answers}
                onSelectAnswer={(num, letter) =>
                  setTeil2Answers((prev) => ({ ...prev, [num]: letter }))
                }
                memorizeMode={memorizeMode}
                highlightMotCle={highlightMotCle}
                showArabic={showArabic}
                shuffleSeed={shuffleSeed}
                checked={checked}
                fontSizeClass={fontSizeClass}
              />
            )}

            {examStep === 3 && (
              <Teil3Simulator
                topic={currentTeil3}
                activeVariant={activeVariant}
                userAnswers={teil3Answers}
                onSelectAnswer={(num, letter) =>
                  setTeil3Answers((prev) => ({ ...prev, [num]: letter }))
                }
                memorizeMode={memorizeMode}
                highlightMotCle={highlightMotCle}
                showArabic={showArabic}
                shuffleSeed={shuffleSeed}
                checked={checked}
                fontSizeClass={fontSizeClass}
              />
            )}

            {examStep === 4 && (
              <SprachbausteineSimulator
                topic={currentSB1}
                userAnswers={sb1Answers}
                onSelectAnswer={(gap, opt) =>
                  setSb1Answers((prev) => ({ ...prev, [gap]: opt }))
                }
                memorizeMode={memorizeMode}
                highlightMotCle={highlightMotCle}
                showArabic={showArabic}
                checked={checked}
                fontSizeClass={fontSizeClass}
              />
            )}

            {examStep === 5 && (
              <SprachbausteineSimulator
                topic={currentSB2}
                userAnswers={sb2Answers}
                onSelectAnswer={(gap, opt) =>
                  setSb2Answers((prev) => ({ ...prev, [gap]: opt }))
                }
                memorizeMode={memorizeMode}
                highlightMotCle={highlightMotCle}
                showArabic={showArabic}
                checked={checked}
                fontSizeClass={fontSizeClass}
              />
            )}

            {/* Step Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={examStep === 1}
                onClick={() => setExamStep((s) => Math.max(1, s - 1) as ExamStep)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>الجزء السابق</span>
              </button>

              <div className="text-xs font-mono text-slate-500">
                Schritt {examStep} von 5 · مجموع النقط الحالي: {scoreSummary.totalPoints}/105
              </div>

              {examStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setExamStep((s) => Math.min(5, s + 1) as ExamStep)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                >
                  <span>الجزء الموالي (Weiter)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setChecked(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white"
                >
                  <span>إنهاء وتصحيح الامتحان الكامل (105 نقطة)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALLE TEILE EINZELN (42 TEIL 1, 27 TEIL 2, 28 TEIL 3, SB 1 & 2) */}
        {activeTab === 'einzeln' && (
          <div className="space-y-6">
            {/* Part Switcher & Search */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEinzelPart('teil1');
                    setEinzelTopicId(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    einzelPart === 'teil1'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Lesen Teil 1 (42 Themen)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEinzelPart('teil2');
                    setEinzelTopicId(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    einzelPart === 'teil2'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Lesen Teil 2 (27 Themen)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEinzelPart('teil3');
                    setEinzelTopicId(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    einzelPart === 'teil3'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Lesen Teil 3 (28 Themen)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEinzelPart('sb');
                    setEinzelTopicId(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    einzelPart === 'sb'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Sprachbausteine 1 & 2 ({SPRACHBAUSTEINE_TOPICS.length})
                </button>
              </div>

              {!einzelTopicId && (
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={einzelSearch}
                    onChange={(e) => setEinzelSearch(e.target.value)}
                    aria-label="Search individual topic"
                    placeholder="فلتر بالعنوان أو الكود..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              )}

              {einzelTopicId && (
                <button
                  type="button"
                  onClick={() => setEinzelTopicId(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>العودة للائحة المواضيع</span>
                </button>
              )}
            </div>

            {/* Directory Grid when no topic is open */}
            {!einzelTopicId && einzelPart === 'teil1' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEIL1_TOPICS.filter((t) =>
                  `${t.titleDe} ${t.titleAr} ${t.variants.map((v) => v.code).join(' ')}`
                    .toLowerCase()
                    .includes(einzelSearch.toLowerCase())
                ).map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-500">
                          Teil 1 · #{t.number}
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {t.frequencyBadge}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {t.titleDe}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                        {t.titleAr}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {t.variants.map((v) => (
                          <span
                            key={v.key}
                            className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                          >
                            {v.label}: {v.code}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 arabic-text line-clamp-2">
                        {t.memoryStoryAr}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEinzelTopicId(t.id);
                        setActiveVariant('original');
                        resetAllAnswers();
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                    >
                      فتح التمرين + الموكلي (Texts 1–5)
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!einzelTopicId && einzelPart === 'teil2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEIL2_TOPICS.filter((t) =>
                  `${t.titleDe} ${t.titleAr} ${t.linkedWith} ${t.variants.map((v) => v.code).join(' ')}`
                    .toLowerCase()
                    .includes(einzelSearch.toLowerCase())
                ).map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-500">
                          Teil 2 · #{t.number}
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {t.frequencyBadge}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {t.titleDe}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                        {t.titleAr} (كيجي مع: {t.linkedWith})
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {t.variants.map((v) => (
                          <span
                            key={v.key}
                            className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                          >
                            {v.label}: {v.code}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEinzelTopicId(t.id);
                        setActiveVariant('original');
                        resetAllAnswers();
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                    >
                      فتح الأسئلة 6–10 + الموكلي
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!einzelTopicId && einzelPart === 'teil3' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEIL3_TOPICS.filter((t) =>
                  `${t.titleDe} ${t.titleAr} ${t.linkedWith} ${t.variants.map((v) => v.code).join(' ')}`
                    .toLowerCase()
                    .includes(einzelSearch.toLowerCase())
                ).map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-500">
                          Teil 3 · #{t.number}
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {t.frequencyBadge}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {t.titleDe}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                        {t.titleAr} (مع: {t.linkedWith})
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {t.variants.map((v) => (
                          <span
                            key={v.key}
                            className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                          >
                            {v.label}: {v.code}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEinzelTopicId(t.id);
                        setActiveVariant('original');
                        resetAllAnswers();
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                    >
                      فتح الحالات 11–20 + الإعلانات A–L + X
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!einzelTopicId && einzelPart === 'sb' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPRACHBAUSTEINE_TOPICS.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {s.part} (15 Punkte)
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {s.titleDe}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 arabic-text">
                        {s.titleAr}
                      </p>
                      <p className="font-mono text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                        {s.codeSummary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEinzelTopicId(s.id);
                        resetAllAnswers();
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    >
                      فتح تمرين القواعد (Sprachbausteine)
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Single Topic Practice View when a topic is selected */}
            {einzelTopicId && (
              <div className="space-y-5">
                <SahlaToolbar
                  variants={activeStepVariants}
                  activeVariant={activeVariant}
                  onSelectVariant={setActiveVariant}
                  memorizeMode={memorizeMode}
                  onToggleMemorize={() => setMemorizeMode((m) => !m)}
                  highlightMotCle={highlightMotCle}
                  onToggleHighlight={() => setHighlightMotCle((h) => !h)}
                  showArabic={showArabic}
                  onToggleArabic={() => setShowArabic((a) => !a)}
                  shuffleSeed={shuffleSeed}
                  onToggleShuffle={() =>
                    setShuffleSeed((prev) => (prev === 0 ? Date.now() % 10000 : 0))
                  }
                  fontSizeScale={fontSizeIndex}
                  onChangeFontSize={(delta) =>
                    setFontSizeIndex((prev) =>
                      Math.min(FONT_SIZE_CLASSES.length - 1, Math.max(0, prev + delta))
                    )
                  }
                  isReviewed={reviewedIds.includes(einzelTopicId)}
                  onToggleReviewed={() => toggleReviewed(einzelTopicId)}
                  onCheckAnswers={() => setChecked(true)}
                  onResetAnswers={resetAllAnswers}
                  checked={checked}
                />

                {einzelPart === 'teil1' && (
                  <Teil1Simulator
                    topic={currentTeil1}
                    activeVariant={activeVariant}
                    userAnswers={teil1Answers}
                    onSelectAnswer={(num, letter) =>
                      setTeil1Answers((prev) => ({ ...prev, [num]: letter }))
                    }
                    memorizeMode={memorizeMode}
                    highlightMotCle={highlightMotCle}
                    showArabic={showArabic}
                    shuffleSeed={shuffleSeed}
                    checked={checked}
                    fontSizeClass={fontSizeClass}
                  />
                )}

                {einzelPart === 'teil2' && (
                  <Teil2Simulator
                    topic={currentTeil2}
                    activeVariant={activeVariant}
                    userAnswers={teil2Answers}
                    onSelectAnswer={(num, letter) =>
                      setTeil2Answers((prev) => ({ ...prev, [num]: letter }))
                    }
                    memorizeMode={memorizeMode}
                    highlightMotCle={highlightMotCle}
                    showArabic={showArabic}
                    shuffleSeed={shuffleSeed}
                    checked={checked}
                    fontSizeClass={fontSizeClass}
                  />
                )}

                {einzelPart === 'teil3' && (
                  <Teil3Simulator
                    topic={currentTeil3}
                    activeVariant={activeVariant}
                    userAnswers={teil3Answers}
                    onSelectAnswer={(num, letter) =>
                      setTeil3Answers((prev) => ({ ...prev, [num]: letter }))
                    }
                    memorizeMode={memorizeMode}
                    highlightMotCle={highlightMotCle}
                    showArabic={showArabic}
                    shuffleSeed={shuffleSeed}
                    checked={checked}
                    fontSizeClass={fontSizeClass}
                  />
                )}

                {einzelPart === 'sb' && (
                  <SprachbausteineSimulator
                    topic={currentSB1}
                    userAnswers={sb1Answers}
                    onSelectAnswer={(gap, opt) =>
                      setSb1Answers((prev) => ({ ...prev, [gap]: opt }))
                    }
                    memorizeMode={memorizeMode}
                    highlightMotCle={highlightMotCle}
                    showArabic={showArabic}
                    checked={checked}
                    fontSizeClass={fontSizeClass}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXAM-DAY RADAR & CODE FINDER */}
        {activeTab === 'radar' && (
          <ExamRadarTab
            onStartPruefung={(pkg) => startPruefungPackage(pkg)}
            onOpenTeil1={(t) => {
              setActiveTab('einzeln');
              setEinzelPart('teil1');
              setEinzelTopicId(t.id);
              setActiveVariant('original');
              resetAllAnswers();
            }}
            onOpenTeil2={(t) => {
              setActiveTab('einzeln');
              setEinzelPart('teil2');
              setEinzelTopicId(t.id);
              setActiveVariant('original');
              resetAllAnswers();
            }}
            onOpenTeil3={(t) => {
              setActiveTab('einzeln');
              setEinzelPart('teil3');
              setEinzelTopicId(t.id);
              setActiveVariant('original');
              resetAllAnswers();
            }}
          />
        )}

        {/* TAB 4: 7-DAY STUDY ROADMAP & DARIJA STRATEGY */}
        {activeTab === 'roadmap' && (
          <StudyRoadmapTab
            completedDays={completedDays}
            onToggleDay={toggleRoadmapDay}
            onStartPruefung={(pkg) => startPruefungPackage(pkg)}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <span>TELC Deutsch B2 Lesen & Sprachbausteine Master Pro 2026 — Sahla & Alpha Edition</span>
        <span>26 Prüfungen · 42 Teil 1 · 27 Teil 2 · 28 Teil 3 · 100% Client-Side</span>
      </footer>
    </div>
  );
}
