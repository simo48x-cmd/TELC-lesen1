import React, { useEffect, useMemo, useState } from 'react';
import {
  ExamVariant,
  MainTabId,
  PruefungPackage,
  SubViewMode,
  VERBATIM_DB,
} from './data/verbatimTypes';
import {
  calculatePruefungScore,
  getSb1AnswerKey,
  getSb2AnswerKey,
  getTeil1AnswerKey,
  getTeil2AnswerKey,
  getTeil3AnswerKey,
  RadarRow,
} from './utils/examEngine';
import { SahlaToolbar } from './components/SahlaToolbar';
import { Teil1View } from './components/Teil1View';
import { Teil2View } from './components/Teil2View';
import { Teil3View } from './components/Teil3View';
import { SprachView } from './components/SprachView';
import { ExamRadarTab } from './components/ExamRadarTab';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Layers,
  LockOpen,
  Pause,
  Play,
  Puzzle,
  Radar,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

type PruefungStepIndex = 0 | 1 | 2 | 3 | 4;

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTabId>('pruefungen');
  const [activePruefungId, setActivePruefungId] = useState<string | null>(null);
  const [pruefungStep, setPruefungStep] = useState<PruefungStepIndex>(0);

  // Alternate model toggles inside a Prüfung when t2_alt / t3_alt / sb1_alt / sb2_alt exist
  const [useAltT2, setUseAltT2] = useState(false);
  const [useAltT3, setUseAltT3] = useState(false);
  const [useAltSb1, setUseAltSb1] = useState(false);
  const [useAltSb2, setUseAltSb2] = useState(false);

  // Standalone opened topic IDs when browsing Tab 2..6
  const [openedStandaloneId, setOpenedStandaloneId] = useState<string | null>(null);

  // Search & filter inside Tab 1..6 card grids
  const [cardSearch, setCardSearch] = useState('');
  const [onlyCompletedFilter, setOnlyCompletedFilter] = useState(false);

  // Sahla Interactive Toolbar State
  const [variant, setVariant] = useState<ExamVariant>('base');
  const [subView, setSubView] = useState<SubViewMode>('verbatim');
  const [highlightMotCle, setHighlightMotCle] = useState<boolean>(true);
  const [memorizeMode, setMemorizeMode] = useState<boolean>(false);
  const [showUnderSummary, setShowUnderSummary] = useState<boolean>(true);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(0);
  const [lightTheme, setLightTheme] = useState<boolean>(false);

  // User Answers for current exam session
  const [t1Answers, setT1Answers] = useState<Record<number, string>>({});
  const [t2Answers, setT2Answers] = useState<Record<number, string>>({});
  const [t3Answers, setT3Answers] = useState<Record<number, string>>({});
  const [sb1Answers, setSb1Answers] = useState<Record<number, string>>({});
  const [sb2Answers, setSb2Answers] = useState<Record<number, string>>({});

  // Persistent Completed Modules & Streak in localStorage
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('sahla_verbatim_completed_2026');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('sahla_verbatim_streak_2026');
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sahla_verbatim_completed_2026', JSON.stringify(completedIds));
    } catch {
      // ignore storage errors
    }
  }, [completedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('sahla_verbatim_streak_2026', String(streakCount));
    } catch {
      // ignore storage errors
    }
  }, [streakCount]);

  // 90-Minute Exam Countdown Timer (5400 seconds)
  const [secondsLeft, setSecondsLeft] = useState<number>(90 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleCompleted = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetCurrentSessionAnswers = () => {
    setT1Answers({});
    setT2Answers({});
    setT3Answers({});
    setSb1Answers({});
    setSb2Answers({});
    setIsChecked(false);
  };

  const handleOpenPruefung = (pkg: PruefungPackage) => {
    setActivePruefungId(pkg.id);
    setOpenedStandaloneId(null);
    setPruefungStep(0);
    setUseAltT2(false);
    setUseAltT3(false);
    setUseAltSb1(false);
    setUseAltSb2(false);
    setVariant('base');
    setSubView('verbatim');
    resetCurrentSessionAnswers();
    setSecondsLeft(90 * 60);
    setTimerRunning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStandalone = (tab: MainTabId, id: string) => {
    setActiveTab(tab);
    setActivePruefungId(null);
    setOpenedStandaloneId(id);
    setVariant('base');
    setSubView('verbatim');
    resetCurrentSessionAnswers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRadarOpen = (moduleType: RadarRow['moduleType'], id: string) => {
    if (moduleType === 'pruefung') {
      const pkg = VERBATIM_DB.pruefungen.find((p) => p.id === id);
      if (pkg) {
        setActiveTab('pruefungen');
        handleOpenPruefung(pkg);
      }
      return;
    }
    handleOpenStandalone(moduleType, id);
  };

  // Resolve Active Prüfung Package & Linked 5 Modules
  const activePruefung = useMemo(
    () => (activePruefungId ? VERBATIM_DB.pruefungen.find((p) => p.id === activePruefungId) || null : null),
    [activePruefungId]
  );

  const activePruefungModules = useMemo(() => {
    if (!activePruefung) return null;
    const t1 = VERBATIM_DB.teil1.find((x) => x.id === activePruefung.t1) || VERBATIM_DB.teil1[0];
    const t2Id = useAltT2 && activePruefung.t2_alt ? activePruefung.t2_alt : activePruefung.t2;
    const t2 = VERBATIM_DB.teil2.find((x) => x.id === t2Id) || VERBATIM_DB.teil2[0];
    const t3Id = useAltT3 && activePruefung.t3_alt ? activePruefung.t3_alt : activePruefung.t3;
    const t3 = VERBATIM_DB.teil3.find((x) => x.id === t3Id) || VERBATIM_DB.teil3[0];
    const sb1Id = useAltSb1 && activePruefung.sb1_alt ? activePruefung.sb1_alt : activePruefung.sb1;
    const sb1 = VERBATIM_DB.sb1.find((x) => x.id === sb1Id) || VERBATIM_DB.sb1[0];
    const sb2Id = useAltSb2 && activePruefung.sb2_alt ? activePruefung.sb2_alt : activePruefung.sb2;
    const sb2 = VERBATIM_DB.sb2.find((x) => x.id === sb2Id) || VERBATIM_DB.sb2[0];

    return { t1, t2, t3, sb1, sb2 };
  }, [activePruefung, useAltT2, useAltT3, useAltSb1, useAltSb2]);

  // Live 105-Point Score Breakdown inside an active Prüfung
  const pruefungScore = useMemo(() => {
    if (!activePruefungModules) return null;
    const { t1, t2, t3, sb1, sb2 } = activePruefungModules;
    const t1Correct = getTeil1AnswerKey(t1, variant);
    const t2Correct = getTeil2AnswerKey(t2, variant);
    const t3Correct = getTeil3AnswerKey(t3, variant);
    const sb1Correct = getSb1AnswerKey(sb1, variant);
    const sb2Correct = getSb2AnswerKey(sb2, variant);

    return calculatePruefungScore({
      t1User: memorizeMode
        ? { 1: t1Correct[0], 2: t1Correct[1], 3: t1Correct[2], 4: t1Correct[3], 5: t1Correct[4] }
        : t1Answers,
      t1Correct,
      t2User: memorizeMode
        ? { 6: t2Correct[0], 7: t2Correct[1], 8: t2Correct[2], 9: t2Correct[3], 10: t2Correct[4] }
        : t2Answers,
      t2Correct,
      t3User: memorizeMode
        ? Object.fromEntries(t3Correct.map((l, i) => [11 + i, l]))
        : t3Answers,
      t3Correct,
      sb1User: memorizeMode
        ? Object.fromEntries(sb1Correct.map((l, i) => [21 + i, l]))
        : sb1Answers,
      sb1Correct,
      sb2User: memorizeMode
        ? Object.fromEntries(sb2Correct.map((l, i) => [31 + i, l]))
        : sb2Answers,
      sb2Correct,
    });
  }, [activePruefungModules, variant, memorizeMode, t1Answers, t2Answers, t3Answers, sb1Answers, sb2Answers]);

  const MAIN_TABS: { id: MainTabId; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'pruefungen', label: '📖 Prüfungen', count: VERBATIM_DB.pruefungen.length, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'teil1', label: '📄 Teile 1', count: VERBATIM_DB.teil1.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'teil2', label: '📑 Teile 2', count: VERBATIM_DB.teil2.length, icon: <Layers className="w-4 h-4" /> },
    { id: 'teil3', label: '📰 Teile 3', count: VERBATIM_DB.teil3.length, icon: <Award className="w-4 h-4" /> },
    { id: 'sb1', label: '🧩 Sprach 1', count: VERBATIM_DB.sb1.length, icon: <Puzzle className="w-4 h-4" /> },
    { id: 'sb2', label: '🔤 Sprach 2', count: VERBATIM_DB.sb2.length, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'radar', label: '⚡ رادار الكودات', count: 210, icon: <Radar className="w-4 h-4" /> },
  ];

  // Render an active Exam View (either a step inside a Prüfung or a standalone topic)
  const renderExamWorkspace = (
    moduleType: 'teil1' | 'teil2' | 'teil3' | 'sb1' | 'sb2',
    moduleId: string
  ) => {
    if (moduleType === 'teil1') {
      const topic = VERBATIM_DB.teil1.find((x) => x.id === moduleId) || VERBATIM_DB.teil1[0];
      return (
        <>
          <SahlaToolbar
            variant={variant}
            onVariantChange={setVariant}
            hasMod1={Boolean(topic.ansMod1 && topic.ansMod1.length > 0)}
            hasMod2={Boolean(topic.ansMod2 && topic.ansMod2.length > 0)}
            ansBase={topic.ansBase}
            ansMod1={topic.ansMod1}
            ansMod2={topic.ansMod2}
            questionStartNum={1}
            highlightMotCle={highlightMotCle}
            onToggleHighlightMotCle={() => setHighlightMotCle((v) => !v)}
            memorizeMode={memorizeMode}
            onToggleMemorizeMode={() => setMemorizeMode((v) => !v)}
            showUnderSummary={showUnderSummary}
            onToggleShowUnderSummary={() => setShowUnderSummary((v) => !v)}
            shuffleMode={shuffleMode}
            onToggleShuffleMode={() => setShuffleMode((v) => !v)}
            isChecked={isChecked}
            onCheckAnswers={() => setIsChecked(true)}
            onResetAnswers={resetCurrentSessionAnswers}
            fontScale={fontScale}
            onChangeFontScale={(d) => setFontScale((s) => Math.max(-1, Math.min(2, s + d)))}
            subView={subView}
            onSubViewChange={setSubView}
            streakCount={streakCount}
          />
          <Teil1View
            topic={topic}
            variant={variant}
            subView={subView}
            userAnswers={t1Answers}
            onSelectAnswer={(num, l) => setT1Answers((prev) => ({ ...prev, [num]: l }))}
            highlightMotCle={highlightMotCle}
            memorizeMode={memorizeMode}
            showUnderSummary={showUnderSummary}
            shuffleMode={shuffleMode}
            isChecked={isChecked}
            fontScale={fontScale}
            streak={streakCount}
            onIncrementStreak={() => setStreakCount((s) => s + 1)}
            onResetStreak={() => setStreakCount(0)}
          />
        </>
      );
    }

    if (moduleType === 'teil2') {
      const topic = VERBATIM_DB.teil2.find((x) => x.id === moduleId) || VERBATIM_DB.teil2[0];
      return (
        <>
          <SahlaToolbar
            variant={variant}
            onVariantChange={setVariant}
            hasMod1={Boolean(topic.ansMod1 && topic.ansMod1.length > 0)}
            hasMod2={false}
            ansBase={topic.ansBase}
            ansMod1={topic.ansMod1}
            questionStartNum={6}
            highlightMotCle={highlightMotCle}
            onToggleHighlightMotCle={() => setHighlightMotCle((v) => !v)}
            memorizeMode={memorizeMode}
            onToggleMemorizeMode={() => setMemorizeMode((v) => !v)}
            showUnderSummary={showUnderSummary}
            onToggleShowUnderSummary={() => setShowUnderSummary((v) => !v)}
            shuffleMode={shuffleMode}
            onToggleShuffleMode={() => setShuffleMode((v) => !v)}
            isChecked={isChecked}
            onCheckAnswers={() => setIsChecked(true)}
            onResetAnswers={resetCurrentSessionAnswers}
            fontScale={fontScale}
            onChangeFontScale={(d) => setFontScale((s) => Math.max(-1, Math.min(2, s + d)))}
            subView={subView}
            onSubViewChange={setSubView}
            streakCount={streakCount}
          />
          <Teil2View
            topic={topic}
            variant={variant}
            subView={subView}
            userAnswers={t2Answers}
            onSelectAnswer={(num, l) => setT2Answers((prev) => ({ ...prev, [num]: l }))}
            highlightMotCle={highlightMotCle}
            memorizeMode={memorizeMode}
            showUnderSummary={showUnderSummary}
            shuffleMode={shuffleMode}
            isChecked={isChecked}
            fontScale={fontScale}
            streak={streakCount}
            onIncrementStreak={() => setStreakCount((s) => s + 1)}
            onResetStreak={() => setStreakCount(0)}
          />
        </>
      );
    }

    if (moduleType === 'teil3') {
      const topic = VERBATIM_DB.teil3.find((x) => x.id === moduleId) || VERBATIM_DB.teil3[0];
      return (
        <>
          <SahlaToolbar
            variant={variant}
            onVariantChange={setVariant}
            hasMod1={Boolean(topic.ansMod1 && topic.ansMod1.length > 0)}
            hasMod2={Boolean(topic.ansMod2 && topic.ansMod2.length > 0)}
            ansBase={topic.ansBase}
            ansMod1={topic.ansMod1}
            ansMod2={topic.ansMod2}
            questionStartNum={11}
            highlightMotCle={highlightMotCle}
            onToggleHighlightMotCle={() => setHighlightMotCle((v) => !v)}
            memorizeMode={memorizeMode}
            onToggleMemorizeMode={() => setMemorizeMode((v) => !v)}
            showUnderSummary={showUnderSummary}
            onToggleShowUnderSummary={() => setShowUnderSummary((v) => !v)}
            shuffleMode={shuffleMode}
            onToggleShuffleMode={() => setShuffleMode((v) => !v)}
            isChecked={isChecked}
            onCheckAnswers={() => setIsChecked(true)}
            onResetAnswers={resetCurrentSessionAnswers}
            fontScale={fontScale}
            onChangeFontScale={(d) => setFontScale((s) => Math.max(-1, Math.min(2, s + d)))}
            subView={subView}
            onSubViewChange={setSubView}
            streakCount={streakCount}
          />
          <Teil3View
            topic={topic}
            variant={variant}
            subView={subView}
            userAnswers={t3Answers}
            onSelectAnswer={(num, l) => setT3Answers((prev) => ({ ...prev, [num]: l }))}
            highlightMotCle={highlightMotCle}
            memorizeMode={memorizeMode}
            showUnderSummary={showUnderSummary}
            shuffleMode={shuffleMode}
            isChecked={isChecked}
            fontScale={fontScale}
            streak={streakCount}
            onIncrementStreak={() => setStreakCount((s) => s + 1)}
            onResetStreak={() => setStreakCount(0)}
          />
        </>
      );
    }

    if (moduleType === 'sb1') {
      const topic = VERBATIM_DB.sb1.find((x) => x.id === moduleId) || VERBATIM_DB.sb1[0];
      return (
        <>
          <SahlaToolbar
            variant={variant}
            onVariantChange={setVariant}
            hasMod1={Boolean(topic.ansMod1 && topic.ansMod1.length > 0)}
            hasMod2={false}
            ansBase={topic.ansBase}
            ansMod1={topic.ansMod1}
            questionStartNum={21}
            highlightMotCle={highlightMotCle}
            onToggleHighlightMotCle={() => setHighlightMotCle((v) => !v)}
            memorizeMode={memorizeMode}
            onToggleMemorizeMode={() => setMemorizeMode((v) => !v)}
            showUnderSummary={showUnderSummary}
            onToggleShowUnderSummary={() => setShowUnderSummary((v) => !v)}
            shuffleMode={shuffleMode}
            onToggleShuffleMode={() => setShuffleMode((v) => !v)}
            isChecked={isChecked}
            onCheckAnswers={() => setIsChecked(true)}
            onResetAnswers={resetCurrentSessionAnswers}
            fontScale={fontScale}
            onChangeFontScale={(d) => setFontScale((s) => Math.max(-1, Math.min(2, s + d)))}
            subView={subView}
            onSubViewChange={setSubView}
            streakCount={streakCount}
          />
          <SprachView
            mode="sb1"
            topic={topic}
            variant={variant}
            subView={subView}
            userAnswers={sb1Answers}
            onSelectAnswer={(num, l) => setSb1Answers((prev) => ({ ...prev, [num]: l }))}
            highlightMotCle={highlightMotCle}
            memorizeMode={memorizeMode}
            showUnderSummary={showUnderSummary}
            isChecked={isChecked}
            fontScale={fontScale}
            streak={streakCount}
            onIncrementStreak={() => setStreakCount((s) => s + 1)}
            onResetStreak={() => setStreakCount(0)}
          />
        </>
      );
    }

    const topic = VERBATIM_DB.sb2.find((x) => x.id === moduleId) || VERBATIM_DB.sb2[0];
    return (
      <>
        <SahlaToolbar
          variant={variant}
          onVariantChange={setVariant}
          hasMod1={Boolean(topic.ansMod1 && topic.ansMod1.length > 0)}
          hasMod2={false}
          ansBase={topic.ansBase}
          ansMod1={topic.ansMod1}
          questionStartNum={31}
          highlightMotCle={highlightMotCle}
          onToggleHighlightMotCle={() => setHighlightMotCle((v) => !v)}
          memorizeMode={memorizeMode}
          onToggleMemorizeMode={() => setMemorizeMode((v) => !v)}
          showUnderSummary={showUnderSummary}
          onToggleShowUnderSummary={() => setShowUnderSummary((v) => !v)}
          shuffleMode={shuffleMode}
          onToggleShuffleMode={() => setShuffleMode((v) => !v)}
          isChecked={isChecked}
          onCheckAnswers={() => setIsChecked(true)}
          onResetAnswers={resetCurrentSessionAnswers}
          fontScale={fontScale}
          onChangeFontScale={(d) => setFontScale((s) => Math.max(-1, Math.min(2, s + d)))}
          subView={subView}
          onSubViewChange={setSubView}
          streakCount={streakCount}
        />
        <SprachView
          mode="sb2"
          topic={topic}
          variant={variant}
          subView={subView}
          userAnswers={sb2Answers}
          onSelectAnswer={(num, l) => setSb2Answers((prev) => ({ ...prev, [num]: l }))}
          highlightMotCle={highlightMotCle}
          memorizeMode={memorizeMode}
          showUnderSummary={showUnderSummary}
          isChecked={isChecked}
          fontScale={fontScale}
          streak={streakCount}
          onIncrementStreak={() => setStreakCount((s) => s + 1)}
          onResetStreak={() => setStreakCount(0)}
        />
      </>
    );
  };

  return (
    <div
      className={`min-h-screen font-['Cairo',sans-serif] transition-colors ${
        lightTheme ? 'bg-slate-900 text-slate-100' : 'bg-[#070b14] text-slate-100'
      }`}
    >
      {/* Top Luxury Sahla B2 Brand Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090e1a]/90 border-b border-indigo-500/25 shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Logo & Title */}
            <div
              onClick={() => {
                setActivePruefungId(null);
                setOpenedStandaloneId(null);
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/15">
                <span className="font-mono font-black text-lg text-white">B2</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    SAHLA B2 &amp; TELCFREE PRO 2026
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <LockOpen className="w-3 h-3" />
                    210 Verbatim Modules 🔓
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  النسخة الحرفية الكاملة 100% — النصوص الرسمية بدون اختصار + التعديلات + تلوين الموكلي بالصفر
                </p>
              </div>
            </div>

            {/* Right Stats & Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>سلسلة الحفاظة: {streakCount}</span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم حفظ: {Object.values(completedIds).filter(Boolean).length}</span>
              </div>

              <button
                type="button"
                onClick={() => setLightTheme((v) => !v)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                title="تبديل الإضاءة"
              >
                {lightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
              </button>
            </div>
          </div>

          {/* 7 Main Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MAIN_TABS.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(t.id);
                    setActivePruefungId(null);
                    setOpenedStandaloneId(null);
                    setCardSearch('');
                  }}
                  className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                      isActive ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6">
        {/* CASE 1: Inside an opened 90-Minute Connected Prüfung (5-Part Stepper) */}
        {activePruefung && activePruefungModules ? (
          <div className="space-y-5">
            {/* Top Connected Prüfung Banner + 90:00 Timer + 105-Pt Score */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 rounded-3xl p-4 md:p-5 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePruefungId(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold border border-slate-700 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>الرجوع للامتحانات (34)</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg md:text-xl font-black text-white" dir="ltr">
                        {activePruefung.title}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {activePruefung.badge}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-emerald-300">{activePruefung.arTitle}</p>
                  </div>
                </div>

                {/* Live 90:00 Timer & 105-Point Score Display */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Timer */}
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-black text-base text-white" dir="ltr">
                      {formatTimer(secondsLeft)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimerRunning((r) => !r)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      title={timerRunning ? 'إيقاف مؤقت' : 'تشغيل المؤقت'}
                    >
                      {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondsLeft(90 * 60)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      title="إعادة 90 دقيقة"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 105-Point Score Box */}
                  {pruefungScore && (
                    <div
                      className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${
                        pruefungScore.passed
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950 border-indigo-500/40 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] font-bold text-slate-400">النقطة الإجمالية (النجاح 63/105)</div>
                        <div className="text-sm md:text-base font-black font-mono" dir="ltr">
                          {pruefungScore.totalScore} / 105 Pts ({pruefungScore.percentage}%)
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          pruefungScore.passed
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-indigo-600/40 text-indigo-200'
                        }`}
                      >
                        {pruefungScore.passed ? '🎉 ناجح (Bestanden)' : 'B2 • 90 Min'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Step Connected Exam Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80">
                {(
                  [
                    {
                      step: 0 as PruefungStepIndex,
                      title: '1. Lesen Teil 1',
                      pts: `${pruefungScore?.t1Score ?? 0}/25p`,
                      sub: activePruefungModules.t1.sahlaTitle,
                    },
                    {
                      step: 1 as PruefungStepIndex,
                      title: '2. Lesen Teil 2',
                      pts: `${pruefungScore?.t2Score ?? 0}/25p`,
                      sub: activePruefungModules.t2.title,
                    },
                    {
                      step: 2 as PruefungStepIndex,
                      title: '3. Lesen Teil 3',
                      pts: `${pruefungScore?.t3Score ?? 0}/25p`,
                      sub: activePruefungModules.t3.title,
                    },
                    {
                      step: 3 as PruefungStepIndex,
                      title: '4. Sprach 1',
                      pts: `${pruefungScore?.sb1Score ?? 0}/15p`,
                      sub: activePruefungModules.sb1.title,
                    },
                    {
                      step: 4 as PruefungStepIndex,
                      title: '5. Sprach 2',
                      pts: `${pruefungScore?.sb2Score ?? 0}/15p`,
                      sub: activePruefungModules.sb2.title,
                    },
                  ] as const
                ).map((s) => {
                  const isCurrent = pruefungStep === s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        setPruefungStep(s.step);
                        setSubView('verbatim');
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-gradient-to-br from-indigo-600 to-emerald-600 text-white border-white/30 shadow-lg ring-2 ring-emerald-400/50'
                          : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-xs font-black" dir="ltr">
                          {s.title}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/30 text-amber-300" dir="ltr">
                          {s.pts}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold truncate mt-1 opacity-90" dir="ltr">
                        {s.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Alternative Linked Models Switcher (when a Prüfung has 2 exam-day pairings) */}
              {(activePruefung.t2_alt ||
                activePruefung.t3_alt ||
                activePruefung.sb1_alt ||
                activePruefung.sb2_alt) && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <span className="font-extrabold text-amber-300">
                    🔀 النماذج البديلة المرتبطة بهذا الامتحان يوم الامتحان:
                  </span>
                  {activePruefung.t2_alt && (
                    <button
                      type="button"
                      onClick={() => setUseAltT2((v) => !v)}
                      className={`px-3 py-1 rounded-xl font-mono font-bold border cursor-pointer ${
                        useAltT2
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Teil 2 Alt ({activePruefung.t2_alt})
                    </button>
                  )}
                  {activePruefung.t3_alt && (
                    <button
                      type="button"
                      onClick={() => setUseAltT3((v) => !v)}
                      className={`px-3 py-1 rounded-xl font-mono font-bold border cursor-pointer ${
                        useAltT3
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Teil 3 Alt ({activePruefung.t3_alt})
                    </button>
                  )}
                  {activePruefung.sb1_alt && (
                    <button
                      type="button"
                      onClick={() => setUseAltSb1((v) => !v)}
                      className={`px-3 py-1 rounded-xl font-mono font-bold border cursor-pointer ${
                        useAltSb1
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      SB1 Alt ({activePruefung.sb1_alt})
                    </button>
                  )}
                  {activePruefung.sb2_alt && (
                    <button
                      type="button"
                      onClick={() => setUseAltSb2((v) => !v)}
                      className={`px-3 py-1 rounded-xl font-mono font-bold border cursor-pointer ${
                        useAltSb2
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      SB2 Alt ({activePruefung.sb2_alt})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active Step Exam View */}
            {pruefungStep === 0 && renderExamWorkspace('teil1', activePruefungModules.t1.id)}
            {pruefungStep === 1 && renderExamWorkspace('teil2', activePruefungModules.t2.id)}
            {pruefungStep === 2 && renderExamWorkspace('teil3', activePruefungModules.t3.id)}
            {pruefungStep === 3 && renderExamWorkspace('sb1', activePruefungModules.sb1.id)}
            {pruefungStep === 4 && renderExamWorkspace('sb2', activePruefungModules.sb2.id)}
          </div>
        ) : openedStandaloneId && activeTab !== 'pruefungen' && activeTab !== 'radar' ? (
          /* CASE 2: Inside a standalone opened module from Tab 2..6 */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <button
                type="button"
                onClick={() => setOpenedStandaloneId(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-extrabold border border-slate-700 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرجوع إلى القائمة الكاملة</span>
              </button>

              <button
                type="button"
                onClick={() => toggleCompleted(`${activeTab}:${openedStandaloneId}`)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border cursor-pointer ${
                  completedIds[`${activeTab}:${openedStandaloneId}`]
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedIds[`${activeTab}:${openedStandaloneId}`] ? '✅ تم الحفظ والمراجعة' : '☑️ تعليم كمكتمل'}
                </span>
              </button>
            </div>

            {renderExamWorkspace(activeTab, openedStandaloneId)}
          </div>
        ) : activeTab === 'radar' ? (
          /* CASE 3: Tab 7 — Exam-Day Radar */
          <ExamRadarTab onOpenModule={handleRadarOpen} />
        ) : (
          /* CASE 4: Grid Libraries for Tab 1 (Prüfungen 34) & Tabs 2..6 (Teile 1..3, Sprach 1..2) */
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  placeholder="ابحث بالاسم الألماني، العنوان العربي، أو كود الإجابات..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl pr-11 pl-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyCompletedFilter((v) => !v)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    onlyCompletedFilter
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {onlyCompletedFilter ? '✅ عرض المكتملة فقط' : '☑️ فلتر المحفوظة'}
                </button>
              </div>
            </div>

            {/* TAB 1: 34 Complete Prüfungen Cards */}
            {activeTab === 'pruefungen' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {VERBATIM_DB.pruefungen
                  .filter((p) => {
                    if (onlyCompletedFilter && !completedIds[`pruefung:${p.id}`]) return false;
                    if (!cardSearch.trim()) return true;
                    const q = cardSearch.toLowerCase();
                    return (
                      p.title.toLowerCase().includes(q) ||
                      p.arTitle.toLowerCase().includes(q) ||
                      p.id.toLowerCase().includes(q) ||
                      p.badge.toLowerCase().includes(q)
                    );
                  })
                  .map((pkg, idx) => {
                    const t1 = VERBATIM_DB.teil1.find((x) => x.id === pkg.t1);
                    const t2 = VERBATIM_DB.teil2.find((x) => x.id === pkg.t2);
                    const t3 = VERBATIM_DB.teil3.find((x) => x.id === pkg.t3);
                    const sb1 = VERBATIM_DB.sb1.find((x) => x.id === pkg.sb1);
                    const sb2 = VERBATIM_DB.sb2.find((x) => x.id === pkg.sb2);
                    const isDone = Boolean(completedIds[`pruefung:${pkg.id}`]);

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handleOpenPruefung(pkg)}
                        className={`group relative rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-xl hover:-translate-y-1 ${
                          isDone
                            ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/50 hover:border-emerald-400'
                            : 'bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-900 border-indigo-500/30 hover:border-emerald-400/70 hover:shadow-emerald-500/10'
                        }`}
                      >
                        <div>
                          {/* Top Row: Number + Badge + Unlocked Icon */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 font-mono font-black text-xs flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                                  pkg.badge.includes('جديد')
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                }`}
                              >
                                {pkg.badge}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
                                B2 • 90 Min
                              </span>
                              <span
                                className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs"
                                title="مفتوح بالكامل 100%"
                              >
                                🔓
                              </span>
                            </div>
                          </div>

                          {/* German Title + Arabic Subtitle */}
                          <h3
                            dir="ltr"
                            className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors mb-1"
                          >
                            {pkg.title}
                          </h3>
                          <p className="text-sm font-bold text-amber-300 mb-4">{pkg.arTitle}</p>

                          {/* Linked Teil 1 / 2 / 3 / SB1 / SB2 Preview Codes */}
                          <div className="space-y-1.5 bg-slate-950/85 border border-slate-800/90 rounded-2xl p-3 text-xs font-mono" dir="ltr">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 truncate">T1: {t1?.sahlaTitle || pkg.t1}</span>
                              <span className="text-emerald-400 font-extrabold shrink-0">
                                {t1?.ansBase.join('-')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 truncate">T2: {t2?.title || pkg.t2}</span>
                              <span className="text-indigo-300 font-extrabold shrink-0">
                                {t2?.ansBase.join('-')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 truncate">T3: {t3?.title || pkg.t3}</span>
                              <span className="text-amber-300 font-extrabold shrink-0">
                                {t3?.ansBase.slice(0, 5).join('-')}…
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                              <span className="truncate">SB1: {sb1?.title || pkg.sb1}</span>
                              <span className="truncate">SB2: {sb2?.title || pkg.sb2}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={(e) => toggleCompleted(`pruefung:${pkg.id}`, e)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {isDone ? '✅ تم' : '☑️ حفظ'}
                          </button>

                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 group-hover:translate-x-[-4px] transition-transform">
                            <span>بدء الامتحان الكامل (105p)</span>
                            <ArrowRight className="w-4 h-4 rotate-180" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 2: 45 Lesen Teil 1 Topics */}
            {activeTab === 'teil1' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERBATIM_DB.teil1
                  .filter((t) => {
                    if (onlyCompletedFilter && !completedIds[`teil1:${t.id}`]) return false;
                    if (!cardSearch.trim()) return true;
                    const q = cardSearch.toLowerCase();
                    return (
                      t.sahlaTitle.toLowerCase().includes(q) ||
                      t.arTitle.toLowerCase().includes(q) ||
                      t.pdfTitle.toLowerCase().includes(q) ||
                      t.ansBase.join('').toLowerCase().includes(q)
                    );
                  })
                  .map((t, idx) => {
                    const isDone = Boolean(completedIds[`teil1:${t.id}`]);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenStandalone('teil1', t.id)}
                        className="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                              Teil 1 #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {t.ansMod1 && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                  🔄 فيه المعدل
                                </span>
                              )}
                              <span>🔓</span>
                            </div>
                          </div>

                          <h3 dir="ltr" className="text-base font-black text-white mb-0.5">
                            {t.sahlaTitle}
                          </h3>
                          <p dir="ltr" className="text-xs text-slate-400 font-mono mb-1">
                            {t.pdfTitle}
                          </p>
                          <p className="text-sm font-bold text-amber-300 mb-3">{t.arTitle}</p>

                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1 font-mono text-xs" dir="ltr">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Base:</span>
                              <span className="text-emerald-400 font-black">{t.ansBase.join(' - ')}</span>
                            </div>
                            {t.ansMod1 && (
                              <div className="flex items-center justify-between">
                                <span className="text-amber-400/80">Mod 1:</span>
                                <span className="text-amber-300 font-black">{t.ansMod1.join(' - ')}</span>
                              </div>
                            )}
                            {t.ansMod2 && (
                              <div className="flex items-center justify-between">
                                <span className="text-rose-400/80">Mod 2:</span>
                                <span className="text-rose-300 font-black">{t.ansMod2.join(' - ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => toggleCompleted(`teil1:${t.id}`, e)}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isDone ? '✅ تم' : '☑️ حفظ'}
                          </button>
                          <span className="text-xs font-extrabold text-indigo-300">
                            فتح النصوص + الفاصو ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 3: 28 Lesen Teil 2 Topics */}
            {activeTab === 'teil2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERBATIM_DB.teil2
                  .filter((t) => {
                    if (onlyCompletedFilter && !completedIds[`teil2:${t.id}`]) return false;
                    if (!cardSearch.trim()) return true;
                    const q = cardSearch.toLowerCase();
                    return (
                      t.title.toLowerCase().includes(q) ||
                      t.arTitle.toLowerCase().includes(q) ||
                      t.ansBase.join('').toLowerCase().includes(q)
                    );
                  })
                  .map((t, idx) => {
                    const isDone = Boolean(completedIds[`teil2:${t.id}`]);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenStandalone('teil2', t.id)}
                        className="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                              Teil 2 #{idx + 1}
                            </span>
                            {t.ansMod1 && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                🔄 الأساسي + المعدل
                              </span>
                            )}
                          </div>

                          <h3 dir="ltr" className="text-base font-black text-white mb-1">
                            {t.title}
                          </h3>
                          <p className="text-sm font-bold text-amber-300 mb-3">{t.arTitle}</p>

                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1 font-mono text-xs" dir="ltr">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Base (6–10):</span>
                              <span className="text-emerald-400 font-black">{t.ansBase.join(' - ')}</span>
                            </div>
                            {t.ansMod1 && (
                              <div className="flex items-center justify-between">
                                <span className="text-amber-400/80">Mod 1:</span>
                                <span className="text-amber-300 font-black">{t.ansMod1.join(' - ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => toggleCompleted(`teil2:${t.id}`, e)}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isDone ? '✅ تم' : '☑️ حفظ'}
                          </button>
                          <span className="text-xs font-extrabold text-indigo-300">
                            فتح المقال والأسئلة ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 4: 32 Lesen Teil 3 Topics */}
            {activeTab === 'teil3' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERBATIM_DB.teil3
                  .filter((t) => {
                    if (onlyCompletedFilter && !completedIds[`teil3:${t.id}`]) return false;
                    if (!cardSearch.trim()) return true;
                    const q = cardSearch.toLowerCase();
                    return (
                      t.title.toLowerCase().includes(q) ||
                      t.arTitle.toLowerCase().includes(q) ||
                      t.ansBase.join('').toLowerCase().includes(q)
                    );
                  })
                  .map((t, idx) => {
                    const isDone = Boolean(completedIds[`teil3:${t.id}`]);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenStandalone('teil3', t.id)}
                        className="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                              Teil 3 #{idx + 1}
                            </span>
                            {t.ansMod1 && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                🔄 فيه المعدل
                              </span>
                            )}
                          </div>

                          <h3 dir="ltr" className="text-base font-black text-white mb-1">
                            {t.title}
                          </h3>
                          <p className="text-sm font-bold text-amber-300 mb-3">{t.arTitle}</p>

                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1 font-mono text-xs" dir="ltr">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 shrink-0">Base:</span>
                              <span className="text-emerald-400 font-black truncate">{t.ansBase.join('-')}</span>
                            </div>
                            {t.ansMod1 && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-amber-400/80 shrink-0">Mod 1:</span>
                                <span className="text-amber-300 font-black truncate">{t.ansMod1.join('-')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => toggleCompleted(`teil3:${t.id}`, e)}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isDone ? '✅ تم' : '☑️ حفظ'}
                          </button>
                          <span className="text-xs font-extrabold text-indigo-300">
                            فتح الوضعيات والإعلانات ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 5: 35 Sprachbausteine 1 Topics */}
            {activeTab === 'sb1' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERBATIM_DB.sb1
                  .filter((t) => {
                    if (onlyCompletedFilter && !completedIds[`sb1:${t.id}`]) return false;
                    if (!cardSearch.trim()) return true;
                    const q = cardSearch.toLowerCase();
                    return (
                      t.title.toLowerCase().includes(q) ||
                      t.text.toLowerCase().includes(q) ||
                      t.ansBase.join('').toLowerCase().includes(q)
                    );
                  })
                  .map((t, idx) => {
                    const isDone = Boolean(completedIds[`sb1:${t.id}`]);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenStandalone('sb1', t.id)}
                        className="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                              Sprach 1 #{idx + 1}
                            </span>
                            <span className="text-xs font-mono text-slate-400">Lücken 21–30</span>
                          </div>

                          <h3 dir="ltr" className="text-base font-black text-white mb-2">
                            {t.title}
                          </h3>

                          <p dir="ltr" className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {t.text}
                          </p>

                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs flex items-center justify-between" dir="ltr">
                            <span className="text-slate-400">Code:</span>
                            <span className="text-emerald-400 font-black">{t.ansBase.join(' - ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => toggleCompleted(`sb1:${t.id}`, e)}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isDone ? '✅ تم' : '☑️ حفظ'}
                          </button>
                          <span className="text-xs font-extrabold text-indigo-300">
                            فتح النص والاختيارات ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 6: 36 Sprachbausteine 2 Topics */}
            {activeTab === 'sb2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERBATIM_DB.sb2
                  .filter((t) => {
                    if (onlyCompletedFilter && !completedIds[`sb2:${t.id}`]) return false;
                    if (!cardSearch.trim()) return true;
                    const q = cardSearch.toLowerCase();
                    return (
                      t.title.toLowerCase().includes(q) ||
                      t.text.toLowerCase().includes(q) ||
                      t.wordBoxRaw.toLowerCase().includes(q) ||
                      t.ansBase.join('').toLowerCase().includes(q)
                    );
                  })
                  .map((t, idx) => {
                    const isDone = Boolean(completedIds[`sb2:${t.id}`]);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenStandalone('sb2', t.id)}
                        className="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                              Sprach 2 #{idx + 1}
                            </span>
                            <span className="text-xs font-mono text-slate-400">Lücken 31–40 (A–O)</span>
                          </div>

                          <h3 dir="ltr" className="text-base font-black text-white mb-2">
                            {t.title}
                          </h3>

                          <p dir="ltr" className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {t.text}
                          </p>

                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs flex items-center justify-between" dir="ltr">
                            <span className="text-slate-400">Code:</span>
                            <span className="text-emerald-400 font-black">{t.ansBase.join(' - ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => toggleCompleted(`sb2:${t.id}`, e)}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isDone ? '✅ تم' : '☑️ حفظ'}
                          </button>
                          <span className="text-xs font-extrabold text-indigo-300">
                            فتح النص وصندوق الكلمات ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
