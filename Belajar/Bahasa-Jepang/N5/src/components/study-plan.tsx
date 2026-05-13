'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Map, Flame, Clock, BookOpen, Target, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, Circle, Sparkles, AlertTriangle, TrendingUp, Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────
interface WeekDay {
  id: string;
  label: string;
  short: string;
  activities: { name: string; type: 'reading' | 'writing' | 'listening' | 'grammar' }[];
}

interface StudyStage {
  id: number;
  emoji: string;
  nameId: string;
  nameJa: string;
  description: string;
  requirements: string[];
  checkKey: (progress: ProgressData) => boolean;
}

interface WeakArea {
  title: string;
  detail: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
  icon: string;
}

interface DailyGoal {
  id: string;
  text: string;
  storageKey: string;
  checkFn: (progress: ProgressData) => boolean;
}

interface ProgressData {
  streak: number;
  sessions: string[];
  wordsLearned: string[];
  quizCompleted: string[];
  quizGrades: string[];
  kanaQuiz: string[];
  kaiwaSessions: string[];
  choukaiCompleted: string[];
  timerMinutes: number;
  timerDaily: Record<string, number>;
  achievements: string[];
}

// ── Helpers ────────────────────────────────────────────────
function getProgressData(): ProgressData {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    return {
      streak: 0,
      sessions: JSON.parse(localStorage.getItem('gemu-study-sessions') || '[]'),
      wordsLearned: JSON.parse(localStorage.getItem('gemu-flashcard-learned') || '[]'),
      quizCompleted: JSON.parse(localStorage.getItem('gemu-quiz-completed') || '[]'),
      quizGrades: JSON.parse(localStorage.getItem('gemu-quiz-grade-s') || '[]'),
      kanaQuiz: JSON.parse(localStorage.getItem('gemu-kana-quiz') || '[]'),
      kaiwaSessions: JSON.parse(localStorage.getItem('gemu-kaiwa-sessions') || '[]'),
      choukaiCompleted: JSON.parse(localStorage.getItem('gemu-choukai-completed') || '[]'),
      timerMinutes: parseInt(localStorage.getItem('gemu-timer-total-minutes') || '0'),
      timerDaily: JSON.parse(localStorage.getItem('gemu-timer-daily') || '{}'),
      achievements: JSON.parse(localStorage.getItem('gemu-achievements-unlocked') || '[]'),
    };
  } catch {
    return emptyProgress();
  }
}

function emptyProgress(): ProgressData {
  return {
    streak: 0, sessions: [], wordsLearned: [], quizCompleted: [], quizGrades: [],
    kanaQuiz: [], kaiwaSessions: [], choukaiCompleted: [], timerMinutes: 0,
    timerDaily: {}, achievements: [],
  };
}

function getStreak(sessions: string[]): number {
  if (!sessions.length) return 0;
  const today = new Date().toISOString().split('T')[0];
  const sorted = [...sessions].sort().reverse();
  let streak = 0;
  const checkDate = new Date(today);
  for (const s of sorted) {
    if (s === checkDate.toISOString().split('T')[0]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak || 0;
}

function getOverallProgress(p: ProgressData): number {
  const sessionScore = Math.min(p.sessions.length / 30, 1) * 40;
  const flashcardScore = Math.min(p.wordsLearned.length / 58, 1) * 20;
  const quizScore = Math.min(p.quizCompleted.length / 10, 1) * 20;
  const achieveScore = Math.min(p.achievements.length / 17, 1) * 20;
  return Math.round(sessionScore + flashcardScore + quizScore + achieveScore);
}

function getRecommendedTime(progress: number): number {
  if (progress < 20) return 15;
  if (progress < 50) return 30;
  return 60;
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

// ── Activity Templates ─────────────────────────────────────
const READING_ACTIVITIES: WeekDay['activities'] = [
  { name: 'Kana Quiz', type: 'reading' },
  { name: 'Baca Kosakata', type: 'reading' },
  { name: 'Latihan Kanji', type: 'reading' },
  { name: 'Flashcards Kosakata', type: 'reading' },
  { name: 'Flashcards Kanji', type: 'reading' },
  { name: 'Kosakata Baru', type: 'reading' },
  { name: 'Review Kana', type: 'reading' },
];

const WRITING_ACTIVITIES: WeekDay['activities'] = [
  { name: 'Bangun Kalimat', type: 'writing' },
  { name: 'Latihan Partikel', type: 'writing' },
  { name: 'Menulis Kalimat', type: 'writing' },
  { name: 'Grammar Drill', type: 'writing' },
  { name: 'Kata Kerja Conjugation', type: 'writing' },
  { name: 'Kata Sifat Practice', type: 'writing' },
  { name: 'Kalimat Tanya', type: 'writing' },
];

const LISTENING_ACTIVITIES: WeekDay['activities'] = [
  { name: 'Choukai Lab', type: 'listening' },
  { name: 'Kaiwa Studio', type: 'listening' },
  { name: 'Dengarkan Dialog', type: 'listening' },
  { name: 'Audio Vocabulary', type: 'listening' },
  { name: 'Listening Quiz', type: 'listening' },
  { name: 'Percakapan Santai', type: 'listening' },
  { name: 'Shuffle Audio', type: 'listening' },
];

const GRAMMAR_ACTIVITIES: WeekDay['activities'] = [
  { name: 'Grammar Guide', type: 'grammar' },
  { name: 'Partikel Quiz', type: 'grammar' },
  { name: 'Bangun Kalimat', type: 'grammar' },
  { name: 'Sentence Builder', type: 'grammar' },
  { name: 'Tata Bahasa Review', type: 'grammar' },
  { name: 'Contoh Kalimat', type: 'grammar' },
  { name: 'Grammar Pattern', type: 'grammar' },
];

const POOL_MAP = {
  reading: READING_ACTIVITIES,
  writing: WRITING_ACTIVITIES,
  listening: LISTENING_ACTIVITIES,
  grammar: GRAMMAR_ACTIVITIES,
};

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateWeekPlan(seed?: number): WeekDay[] {
  const dayLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const dayShorts = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const focusTypes: Array<Array<'reading' | 'writing' | 'listening' | 'grammar'>> = [
    ['reading', 'grammar'],
    ['writing', 'listening'],
    ['reading', 'listening'],
    ['grammar', 'writing'],
    ['listening', 'grammar'],
    ['reading', 'writing'],
    ['grammar', 'listening'],
  ];
  const rng = seed ?? Math.random();
  return dayLabels.map((label, i) => {
    const types = focusTypes[i];
    const activities: WeekDay['activities'] = [];
    for (const type of types) {
      activities.push(...pickRandom(POOL_MAP[type], 1));
    }
    // Add a third activity on some days
    if (i % 3 === 1) {
      const extra = pickRandom(POOL_MAP[['reading', 'writing', 'listening', 'grammar'][Math.floor(rng * 4 + i) % 4]], 1);
      activities.push(...extra);
    }
    return { id: `day-${i}`, label, short: dayShorts[i], activities: activities.slice(0, 3) };
  });
}

function getTodayDayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // Monday=0
}

// ── Activity Type Colors ───────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  reading: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
  writing: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  listening: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  grammar: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
};

// ── Study Stages ───────────────────────────────────────────
const STUDY_STAGES: StudyStage[] = [
  {
    id: 1,
    emoji: '🌱',
    nameId: 'Pemula',
    nameJa: '初心者',
    description: 'Pelajari dasar-dasar Kana (Hiragana & Katakana). Ini fondasi paling penting!',
    requirements: ['Pelajari 46 Hiragana dasar', 'Pelajari 46 Katakana dasar', 'Selesaikan Kana Quiz minimal 1x'],
    checkKey: (p) => p.kanaQuiz.length >= 1,
  },
  {
    id: 2,
    emoji: '📖',
    nameId: 'Pembaca',
    nameJa: '読者',
    description: 'Perluas kosakata dan pelajari kanji dasar N5. Mulai membaca kalimat sederhana.',
    requirements: ['Pelajari 20 kosakata baru', 'Kenali 10 kanji dasar', 'Selesaikan Flashcards 3x'],
    checkKey: (p) => p.wordsLearned.length >= 10 && p.kanaQuiz.length >= 1,
  },
  {
    id: 3,
    emoji: '✍️',
    nameId: 'Penulis',
    nameJa: '書き手',
    description: 'Latih grammar dan menyusun kalimat. Pahami partikel dan struktur kalimat Jepang.',
    requirements: ['Pelajari 8 pola grammar', 'Selesaikan Bangun Kalimat 3x', 'Akurasi quiz > 70%'],
    checkKey: (p) => p.wordsLearned.length >= 20 && p.quizCompleted.length >= 3,
  },
  {
    id: 4,
    emoji: '🗣️',
    nameId: 'Pembicara',
    nameJa: '話者',
    description: 'Latih percakapan dan mendengarkan. Gunakan Kaiwa Studio dan Choukai Lab.',
    requirements: ['5 sesi Kaiwa Studio', '3 dialog Choukai selesai', 'Boss Quiz skor minimal B'],
    checkKey: (p) => p.kaiwaSessions.length >= 3 && p.choukaiCompleted.length >= 2 && p.quizCompleted.length >= 5,
  },
  {
    id: 5,
    emoji: '🏆',
    nameId: 'Master',
    nameJa: '達人',
    description: 'Tantangan akhir! Kuasai semua materi N5 dan raih skor S di Boss Quiz.',
    requirements: ['Boss Quiz skor S', '50 kosakata dipelajari', 'Akurasi quiz > 85%'],
    checkKey: (p) => p.quizGrades.length >= 2 && p.wordsLearned.length >= 30 && getOverallProgress(p) >= 80,
  },
];

// ── Daily Goals ────────────────────────────────────────────
const DAILY_GOALS: DailyGoal[] = [
  {
    id: 'timer',
    text: 'Belajar 15 menit',
    storageKey: 'gemu-daily-goal-timer',
    checkFn: (p) => {
      const today = new Date().toISOString().split('T')[0];
      const dailyMinutes = p.timerDaily[today] || 0;
      return dailyMinutes >= 15;
    },
  },
  {
    id: 'quiz',
    text: 'Selesaikan 1 quiz',
    storageKey: 'gemu-daily-goal-quiz',
    checkFn: (p) => {
      const today = new Date().toISOString().split('T')[0];
      return p.quizCompleted.some(q => q.startsWith(today));
    },
  },
  {
    id: 'vocab',
    text: 'Pelajari 5 kata baru',
    storageKey: 'gemu-daily-goal-vocab',
    checkFn: (p) => {
      const today = new Date().toISOString().split('T')[0];
      const todayWords = p.wordsLearned.filter(w => w.startsWith(today));
      return todayWords.length >= 5;
    },
  },
];

// ── Component ──────────────────────────────────────────────
export default function StudyPlan() {
  const isClient = typeof window !== 'undefined';

  const progress = useMemo(() => isClient ? getProgressData() : emptyProgress(), [isClient]);
  const streak = useMemo(() => getStreak(progress.sessions), [progress.sessions]);
  const overallPct = useMemo(() => getOverallProgress(progress), [progress]);
  const recTime = useMemo(() => getRecommendedTime(overallPct), [overallPct]);

  // Week plan - lazy initializer
  const todayIdx = getTodayDayIndex();
  const [weekPlan, setWeekPlan] = useState<WeekDay[]>(() => {
    if (typeof window === 'undefined') return [];
    const wk = getWeekNumber();
    const cached = localStorage.getItem(`gemu-study-plan-${wk}`);
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    const plan = generateWeekPlan(wk);
    localStorage.setItem(`gemu-study-plan-${wk}`, JSON.stringify(plan));
    return plan;
  });

  const handleRegenerate = useCallback(() => {
    const plan = generateWeekPlan();
    setWeekPlan(plan);
    const wk = getWeekNumber();
    localStorage.setItem(`gemu-study-plan-${wk}`, JSON.stringify(plan));
  }, []);

  // Daily goals - derived from localStorage + progress
  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '';

  const [dailyGoals, setDailyGoals] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined' || !todayStr) return {};
    const stored = localStorage.getItem('gemu-daily-goals');
    let parsed: Record<string, { date: string; done: boolean }> = {};
    if (stored) {
      try { parsed = JSON.parse(stored); } catch { /* ignore */ }
    }
    const p = getProgressData();
    const goals: Record<string, boolean> = {};
    for (const g of DAILY_GOALS) {
      const entry = parsed[g.id];
      if (entry && entry.date === todayStr) {
        goals[g.id] = entry.done || g.checkFn(p);
      } else {
        goals[g.id] = g.checkFn(p);
      }
    }
    return goals;
  });

  const toggleGoal = useCallback((id: string) => {
    if (!isClient || !todayStr) return;
    setDailyGoals(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const stored = localStorage.getItem('gemu-daily-goals');
      let parsed: Record<string, { date: string; done: boolean }> = {};
      if (stored) {
        try { parsed = JSON.parse(stored); } catch { /* ignore */ }
      }
      parsed[id] = { date: todayStr, done: next[id] };
      localStorage.setItem('gemu-daily-goals', JSON.stringify(parsed));
      return next;
    });
  }, [isClient, todayStr]);

  const allGoalsDone = useMemo(() => DAILY_GOALS.every(g => dailyGoals[g.id]), [dailyGoals]);

  // Weak areas
  const weakAreas = useMemo((): WeakArea[] => {
    const areas: WeakArea[] = [];
    // Grammar: how many grammar points studied (proxy: quiz completed)
    const grammarProgress = Math.min(progress.quizCompleted.length / 16, 1);
    if (grammarProgress < 0.5) {
      areas.push({
        title: 'Grammar',
        detail: `${16 - progress.quizCompleted.length} dari 16 pola belum dipelajari`,
        recommendation: 'Coba Grammar Guide dan Bangun Kalimat',
        severity: 'high',
        icon: '📝',
      });
    }
    // Vocabulary
    if (progress.wordsLearned.length < 20) {
      areas.push({
        title: 'Kosakata',
        detail: `${progress.wordsLearned.length} dari 58 kata dipelajari`,
        recommendation: 'Gunakan Flashcards SRS untuk menghafal lebih efektif',
        severity: progress.wordsLearned.length < 10 ? 'high' : 'medium',
        icon: '📖',
      });
    }
    // Kanji
    if (progress.wordsLearned.length < 31) {
      areas.push({
        title: 'Kanji',
        detail: `Kurang latihan kanji`,
        recommendation: 'Latih Flashcards Kanji setiap hari',
        severity: 'medium',
        icon: '漢',
      });
    }
    // Listening
    if (progress.choukaiCompleted.length < 3) {
      areas.push({
        title: 'Listening',
        detail: `${progress.choukaiCompleted.length} dialog diselesaikan`,
        recommendation: 'Coba Choukai Lab - dengarkan dialog N5',
        severity: 'medium',
        icon: '🎧',
      });
    }
    // Speaking
    if (progress.kaiwaSessions.length < 3) {
      areas.push({
        title: 'Percakapan',
        detail: `${progress.kaiwaSessions.length} sesi Kaiwa`,
        recommendation: 'Latih percakapan di Kaiwa Studio',
        severity: 'medium',
        icon: '🗣️',
      });
    }
    // Boss Quiz
    if (progress.quizGrades.length < 1 && progress.quizCompleted.length >= 1) {
      areas.push({
        title: 'Boss Quiz',
        detail: 'Belum pernah skor S',
        recommendation: 'Latihan lebih banyak vocabulary dan grammar',
        severity: 'low',
        icon: '🎮',
      });
    }
    return areas.slice(0, 3);
  }, [progress]);

  // Current stage
  const currentStage = useMemo(() => {
    for (let i = STUDY_STAGES.length - 1; i >= 0; i--) {
      if (STUDY_STAGES[i].checkKey(progress)) return STUDY_STAGES[i].id;
    }
    return 1;
  }, [progress]);

  // ── SVG Ring ──────────────────────────────────────────
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (overallPct / 100) * ringCircumference;

  // ── Render ────────────────────────────────────────────
  if (!isClient) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Map className="text-emerald-500" size={22} /> Rencana Belajar
        </h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Map className="text-emerald-500" size={22} /> Rencana Belajar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Rencana belajar personal untuk JLPT N5 kamu</p>
      </div>

      {/* ── 1. Current Level Assessment Card ────────────── */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Progress Ring */}
            <div className="relative shrink-0">
              <svg width="120" height="120" className="transform -rotate-90">
                <circle cx="60" cy="60" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r={ringRadius} fill="none" stroke="white" strokeWidth="10"
                  strokeDasharray={ringCircumference} strokeDashoffset={ringOffset}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{overallPct}%</span>
                <span className="text-[10px] opacity-80">Progress</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold mb-3">Level Kamu Saat Ini</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <Flame size={14} />
                    <span className="text-xs opacity-80">Streak</span>
                  </div>
                  <p className="text-xl font-black">{streak}</p>
                  <p className="text-[10px] opacity-70">hari berturut</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <BookOpen size={14} />
                    <span className="text-xs opacity-80">Sesi</span>
                  </div>
                  <p className="text-xl font-black">{progress.sessions.length}</p>
                  <p className="text-[10px] opacity-70">total sesi</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <Star size={14} />
                    <span className="text-xs opacity-80">Kata</span>
                  </div>
                  <p className="text-xl font-black">{progress.wordsLearned.length}</p>
                  <p className="text-[10px] opacity-70">dipelajari</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Time */}
          <div className="mt-4 flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="opacity-80" />
              <span className="text-sm font-medium">Rekomendasi belajar harian</span>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
              {recTime} menit
            </Badge>
          </div>
        </div>
      </Card>

      {/* ── 2. Weekly Study Plan ────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <CalendarCheck size={18} className="text-teal-500" /> Rencana Mingguan
          </h3>
          <Button variant="outline" size="sm" onClick={handleRegenerate} className="text-xs">
            <RefreshCw size={12} className="mr-1" /> Regenerasi
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
          {weekPlan.map((day, idx) => {
            const isToday = idx === todayIdx;
            return (
              <div key={day.id} className="snap-start shrink-0 w-[160px]">
                <Card className={cn(
                  'transition-all h-full',
                  isToday
                    ? 'border-2 border-teal-400 dark:border-teal-500 shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/20'
                    : 'hover:shadow-md'
                )}>
                  <CardContent className="p-3">
                    {/* Day Header */}
                    <div className={cn(
                      'text-center py-1.5 rounded-lg mb-3 text-sm font-bold',
                      isToday
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                        : 'bg-muted text-foreground'
                    )}>
                      {day.short}
                      {isToday && (
                        <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Hari ini</span>
                      )}
                    </div>

                    {/* Activities */}
                    <div className="space-y-2">
                      {day.activities.map((act, ai) => {
                        const colors = TYPE_COLORS[act.type];
                        return (
                          <div key={ai} className={cn(
                            'flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-xs border',
                            colors.bg, colors.border
                          )}>
                            <div className={cn('w-1.5 h-1.5 rounded-full mt-1 shrink-0', colors.dot)} />
                            <span className={cn('font-medium leading-tight', colors.text)}>{act.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {Object.entries(TYPE_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={cn('w-2.5 h-2.5 rounded-full', val.dot)} />
              <span className="capitalize">{key === 'reading' ? 'Membaca' : key === 'writing' ? 'Menulis' : key === 'listening' ? 'Mendengarkan' : 'Grammar'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Study Path Progress ──────────────────────── */}
      <div>
        <h3 className="font-bold text-base flex items-center gap-2 mb-3">
          <Target size={18} className="text-emerald-500" /> Jalur Belajar
        </h3>

        <div className="space-y-0">
          {STUDY_STAGES.map((stage, idx) => {
            const isActive = stage.id === currentStage;
            const isCompleted = stage.id < currentStage;
            const isLast = idx === STUDY_STAGES.length - 1;

            return (
              <div key={stage.id} className="relative">
                {/* Stage Card */}
                <Card className={cn(
                  'transition-all mb-0',
                  isActive && 'border-2 border-teal-400 dark:border-teal-500 shadow-md',
                  isCompleted && 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20',
                  !isActive && !isCompleted && 'opacity-60',
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0',
                        isActive && 'bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm',
                        isCompleted && 'bg-emerald-500 shadow-sm',
                        !isActive && !isCompleted && 'bg-muted',
                      )}>
                        {stage.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn(
                            'font-bold text-sm',
                            isActive && 'text-teal-700 dark:text-teal-400',
                            isCompleted && 'text-emerald-700 dark:text-emerald-400',
                          )}>
                            Stage {stage.id}: {stage.nameId}
                          </h4>
                          <span className="text-xs text-muted-foreground font-jp">
                            {stage.nameJa}
                          </span>
                          {isCompleted && <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">Selesai</Badge>}
                          {isActive && <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0">Saat ini</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{stage.description}</p>

                        {/* Requirements */}
                        <div className="mt-2 space-y-1">
                          {stage.requirements.map((req, ri) => {
                            // Approximate completion per requirement
                            let reqDone = false;
                            if (stage.id === 1) reqDone = isCompleted || (progress.kanaQuiz.length >= 1 && ri < 2);
                            else if (stage.id === 2) reqDone = isCompleted || (ri === 0 ? progress.wordsLearned.length >= 20 : ri === 1 ? progress.wordsLearned.length >= 10 : progress.quizCompleted.length >= 3);
                            else if (stage.id === 3) reqDone = isCompleted || (ri === 0 ? progress.quizCompleted.length >= 3 : ri === 1 ? progress.quizCompleted.length >= 3 : overallPct >= 70);
                            else if (stage.id === 4) reqDone = isCompleted || (ri === 0 ? progress.kaiwaSessions.length >= 5 : ri === 1 ? progress.choukaiCompleted.length >= 3 : progress.quizCompleted.length >= 1);
                            else if (stage.id === 5) reqDone = isCompleted || (ri === 0 ? progress.quizGrades.length >= 2 : ri === 1 ? progress.wordsLearned.length >= 50 : overallPct >= 85);

                            return (
                              <div key={ri} className="flex items-center gap-1.5 text-xs">
                                {reqDone ? (
                                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle size={12} className="text-muted-foreground/40 shrink-0" />
                                )}
                                <span className={reqDone ? 'text-muted-foreground line-through' : 'text-muted-foreground'}>
                                  {req}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector */}
                {!isLast && (
                  <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 relative">
                      <div className={cn(
                        'absolute inset-0 rounded-full',
                        isCompleted ? 'bg-emerald-400' : 'bg-muted-foreground/15'
                      )} />
                      <div className={cn(
                        'absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2',
                        isCompleted
                          ? 'bg-emerald-400 border-emerald-400'
                          : 'bg-background border-muted-foreground/20'
                      )} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Weak Areas Analysis ──────────────────────── */}
      {weakAreas.length > 0 && (
        <div>
          <h3 className="font-bold text-base flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" /> Area yang Perlu Diperbaiki
          </h3>

          <div className="space-y-3">
            {weakAreas.map((area, idx) => (
              <Card key={idx} className={cn(
                'border-l-4',
                area.severity === 'high' ? 'border-l-rose-500' : area.severity === 'medium' ? 'border-l-amber-500' : 'border-l-teal-500'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{area.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm">{area.title}</h4>
                        <Badge variant="outline" className={cn(
                          'text-[10px]',
                          area.severity === 'high' ? 'text-rose-600 border-rose-300' : area.severity === 'medium' ? 'text-amber-600 border-amber-300' : 'text-teal-600 border-teal-300'
                        )}>
                          {area.severity === 'high' ? 'Prioritas Tinggi' : area.severity === 'medium' ? 'Sedang' : 'Rendah'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{area.detail}</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <TrendingUp size={12} className="text-teal-500" />
                        <span className="text-teal-600 dark:text-teal-400 font-medium">{area.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Daily Goals Checklist ────────────────────── */}
      <div>
        <h3 className="font-bold text-base flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-amber-500" /> Target Hari Ini
        </h3>

        <Card className={cn(
          'transition-all',
          allGoalsDone && 'border-2 border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
        )}>
          <CardContent className="p-4 space-y-3">
            {DAILY_GOALS.map((goal) => {
              const done = dailyGoals[goal.id] ?? false;
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div className={cn(
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all',
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-muted-foreground/30 group-hover:border-teal-400'
                  )}>
                    {done && <CheckCircle2 size={14} />}
                  </div>
                  <span className={cn(
                    'text-sm transition-all',
                    done ? 'text-muted-foreground line-through' : 'font-medium'
                  )}>
                    {goal.text}
                  </span>
                </button>
              );
            })}

            {/* Motivational message */}
            {allGoalsDone && (
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <Sparkles size={16} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Semua target hari ini tercapai! すごいです！ (Luar biasa!)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Need CalendarCheck for weekly plan header
function CalendarCheck({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" />
    </svg>
  );
}
