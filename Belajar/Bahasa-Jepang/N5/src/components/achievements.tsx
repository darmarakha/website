'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Trophy, Lock, Star, Flame, BookOpen, CheckCircle, MessageCircle, Headphones, Sparkles, TrendingUp, Zap, Award, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────

type Tier = 'bronze' | 'silver' | 'gold';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier?: Tier;
  xpReward: number;
  checkUnlocked: () => boolean;
}

type AchievementCategory = 'streak' | 'belajar' | 'kuis' | 'kana' | 'kaiwa' | 'choukai';

interface UnlockedAchievement {
  id: string;
  unlockedAt: string; // ISO date
}

// ── Category Meta ───────────────────────────────────────────────────────────

const CATEGORY_META: Record<AchievementCategory, { label: string; icon: React.ReactNode; color: string; badgeBg: string; borderColor: string }> = {
  streak: {
    label: '🔥 Streak',
    icon: <Flame size={14} />,
    color: 'text-orange-500',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  belajar: {
    label: '📚 Belajar',
    icon: <BookOpen size={14} />,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  kuis: {
    label: '✅ Kuis',
    icon: <CheckCircle size={14} />,
    color: 'text-red-500',
    badgeBg: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  kana: {
    label: '🎴 Kana',
    icon: <Sparkles size={14} />,
    color: 'text-violet-500',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  kaiwa: {
    label: '💬 Kaiwa',
    icon: <MessageCircle size={14} />,
    color: 'text-teal-500',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
  choukai: {
    label: '🎧 Choukai',
    icon: <Headphones size={14} />,
    color: 'text-cyan-500',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
};

const TIER_META: Record<Tier, { label: string; color: string; glow: string; border: string }> = {
  bronze: { label: 'Perunggu', color: 'text-amber-700', glow: 'shadow-amber-300/30', border: 'border-amber-300' },
  silver: { label: 'Perak', color: 'text-gray-400', glow: 'shadow-gray-300/40', border: 'border-gray-300' },
  gold: { label: 'Emas', color: 'text-yellow-500', glow: 'shadow-yellow-300/50', border: 'border-yellow-400' },
};

// ── Helper: Safe localStorage reads ────────────────────────────────────────

function getStudyStats(): { streak: number; totalSessions: number } {
  if (typeof window === 'undefined') return { streak: 0, totalSessions: 0 };
  try {
    const sessions = localStorage.getItem('gemu-study-sessions');
    const sessionMap: Record<string, number> = sessions ? JSON.parse(sessions) : {};
    const totalSessions = Object.values(sessionMap).reduce((a, b) => a + b, 0);

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (sessionMap[key] && sessionMap[key] > 0) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return { streak, totalSessions };
  } catch {
    return { streak: 0, totalSessions: 0 };
  }
}

function getQuizStats(): { totalXP: number; quizCount: number; hasGradeS: boolean } {
  if (typeof window === 'undefined') return { totalXP: 0, quizCount: 0, hasGradeS: false };
  try {
    const totalXP = Number(localStorage.getItem('gemu-quiz-xp') || '0');
    const quizCount = Number(localStorage.getItem('gemu-quiz-completed') || '0');
    const hasGradeS = localStorage.getItem('gemu-quiz-grade-s') === 'true';
    return { totalXP, quizCount, hasGradeS };
  } catch {
    return { totalXP: 0, quizCount: 0, hasGradeS: false };
  }
}

function getKanaStats(): { perfectQuizzes: number; totalQuizzes: number; isMaster: boolean } {
  if (typeof window === 'undefined') return { perfectQuizzes: 0, totalQuizzes: 0, isMaster: false };
  try {
    const data = localStorage.getItem('gemu-kana-quiz');
    const parsed = data ? JSON.parse(data) : { perfect: 0, total: 0, master: false };
    return {
      perfectQuizzes: parsed.perfect || 0,
      totalQuizzes: parsed.total || 0,
      isMaster: parsed.master || false,
    };
  } catch {
    return { perfectQuizzes: 0, totalQuizzes: 0, isMaster: false };
  }
}

function getKaiwaSessions(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(localStorage.getItem('gemu-kaiwa-sessions') || '0');
  } catch {
    return 0;
  }
}

function getChoukaiStats(): { completed: number; perfectScore: boolean } {
  if (typeof window === 'undefined') return { completed: 0, perfectScore: false };
  try {
    const data = localStorage.getItem('gemu-choukai-completed');
    const parsed = data ? JSON.parse(data) : { count: 0, perfect: false };
    return { completed: parsed.count || 0, perfectScore: parsed.perfect || false };
  } catch {
    return { completed: 0, perfectScore: false };
  }
}

// ── Achievement Definitions ────────────────────────────────────────────────

function buildAchievements(): Achievement[] {
  const studyStats = getStudyStats();
  const quizStats = getQuizStats();
  const kanaStats = getKanaStats();
  const kaiwaCount = getKaiwaSessions();
  const choukaiStats = getChoukaiStats();

  return [
    // ── Streak Category ──
    {
      id: 'streak-3',
      title: 'Hari Berturut 3',
      description: 'Belajar selama 3 hari berturut-turut',
      icon: '🔥',
      category: 'streak',
      tier: 'bronze',
      xpReward: 50,
      checkUnlocked: () => studyStats.streak >= 3,
    },
    {
      id: 'streak-7',
      title: 'Hari Berturut 7',
      description: 'Belajar selama 7 hari berturut-turut',
      icon: '🔥',
      category: 'streak',
      tier: 'silver',
      xpReward: 150,
      checkUnlocked: () => studyStats.streak >= 7,
    },
    {
      id: 'streak-30',
      title: 'Minggu Berturut',
      description: 'Belajar selama 30 hari berturut-turut',
      icon: '🔥',
      category: 'streak',
      tier: 'gold',
      xpReward: 500,
      checkUnlocked: () => studyStats.streak >= 30,
    },

    // ── Belajar Category ──
    {
      id: 'session-1',
      title: 'Sesi Pertama',
      description: 'Menyelesaikan sesi belajar pertama',
      icon: '📚',
      category: 'belajar',
      xpReward: 20,
      checkUnlocked: () => studyStats.totalSessions >= 1,
    },
    {
      id: 'session-10',
      title: '10 Sesi',
      description: 'Menyelesaikan 10 sesi belajar',
      icon: '📚',
      category: 'belajar',
      tier: 'bronze',
      xpReward: 75,
      checkUnlocked: () => studyStats.totalSessions >= 10,
    },
    {
      id: 'session-50',
      title: '50 Sesi',
      description: 'Menyelesaikan 50 sesi belajar',
      icon: '📚',
      category: 'belajar',
      tier: 'silver',
      xpReward: 250,
      checkUnlocked: () => studyStats.totalSessions >= 50,
    },
    {
      id: 'session-100',
      title: '100 Sesi',
      description: 'Menyelesaikan 100 sesi belajar',
      icon: '📚',
      category: 'belajar',
      tier: 'gold',
      xpReward: 750,
      checkUnlocked: () => studyStats.totalSessions >= 100,
    },

    // ── Kuis Category ──
    {
      id: 'quiz-first',
      title: 'Boss Quiz Pertama',
      description: 'Menyelesaikan Boss Quiz pertama',
      icon: '✅',
      category: 'kuis',
      xpReward: 30,
      checkUnlocked: () => quizStats.quizCount >= 1,
    },
    {
      id: 'quiz-grade-s',
      title: 'Nilai S',
      description: 'Mendapatkan nilai S di Boss Quiz',
      icon: '✅',
      category: 'kuis',
      tier: 'gold',
      xpReward: 200,
      checkUnlocked: () => quizStats.hasGradeS,
    },
    {
      id: 'quiz-10',
      title: '10 Kuis Selesai',
      description: 'Menyelesaikan 10 Boss Quiz',
      icon: '✅',
      category: 'kuis',
      tier: 'silver',
      xpReward: 200,
      checkUnlocked: () => quizStats.quizCount >= 10,
    },

    // ── Kana Category ──
    {
      id: 'kana-perfect',
      title: 'Kana Quiz Sempurna',
      description: 'Skor sempurna di Kana Quiz',
      icon: '🎴',
      category: 'kana',
      tier: 'silver',
      xpReward: 150,
      checkUnlocked: () => kanaStats.perfectQuizzes >= 1,
    },
    {
      id: 'kana-master',
      title: 'Kana Master',
      description: 'Menyelesaikan 5 Kana Quiz dengan skor sempurna',
      icon: '🎴',
      category: 'kana',
      tier: 'gold',
      xpReward: 400,
      checkUnlocked: () => kanaStats.perfectQuizzes >= 5,
    },

    // ── Kaiwa Category ──
    {
      id: 'kaiwa-10',
      title: '10 Percakapan',
      description: 'Menyelesaikan 10 percakapan Kaiwa',
      icon: '💬',
      category: 'kaiwa',
      tier: 'bronze',
      xpReward: 100,
      checkUnlocked: () => kaiwaCount >= 10,
    },
    {
      id: 'kaiwa-50',
      title: '50 Percakapan',
      description: 'Menyelesaikan 50 percakapan Kaiwa',
      icon: '💬',
      category: 'kaiwa',
      tier: 'gold',
      xpReward: 500,
      checkUnlocked: () => kaiwaCount >= 50,
    },

    // ── Choukai Category ──
    {
      id: 'choukai-5',
      title: '5 Dialog Selesai',
      description: 'Menyelesaikan 5 dialog Choukai',
      icon: '🎧',
      category: 'choukai',
      tier: 'bronze',
      xpReward: 100,
      checkUnlocked: () => choukaiStats.completed >= 5,
    },
    {
      id: 'choukai-perfect',
      title: 'Skor Sempurna',
      description: 'Skor sempurna di quiz Choukai',
      icon: '🎧',
      category: 'choukai',
      tier: 'gold',
      xpReward: 300,
      checkUnlocked: () => choukaiStats.perfectScore,
    },

    // ── Bonus / Special ──
    {
      id: 'xp-500',
      title: 'Pengumpul XP',
      description: 'Kumpulkan 500 XP dari semua sumber',
      icon: '⚡',
      category: 'belajar',
      tier: 'silver',
      xpReward: 0,
      checkUnlocked: () => getTotalXP() >= 500,
    },
    {
      id: 'xp-2000',
      title: 'XP Hunter',
      description: 'Kumpulkan 2000 XP dari semua sumber',
      icon: '⚡',
      category: 'belajar',
      tier: 'gold',
      xpReward: 0,
      checkUnlocked: () => getTotalXP() >= 2000,
    },
  ];
}

// ── XP & Level System ───────────────────────────────────────────────────────

function getTotalXP(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const quizXP = Number(localStorage.getItem('gemu-quiz-xp') || '0');
    const achievementXP = Number(localStorage.getItem('gemu-achievement-xp') || '0');
    const streakXP = Number(localStorage.getItem('gemu-streak-xp') || '0');
    return quizXP + achievementXP + streakXP;
  } catch {
    return 0;
  }
}

function getLevelInfo(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  // Level thresholds: exponential growth
  // Level 1: 0, Level 2: 100, Level 3: 300, Level 4: 600, Level 5: 1000, Level 6: 1500, ...
  const getThreshold = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(50 * level * (level - 1));
  };

  let level = 1;
  while (getThreshold(level + 1) <= xp) {
    level++;
  }

  const currentLevelXP = getThreshold(level);
  const nextLevelXP = getThreshold(level + 1);
  const progress = nextLevelXP > currentLevelXP
    ? Math.min(100, Math.floor(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))
    : 100;

  return { level, currentLevelXP, nextLevelXP, progress };
}

const LEVEL_TITLES: Record<number, { title: string; titleJP: string }> = {
  1: { title: 'Pemula', titleJP: '初心者' },
  2: { title: 'Pelajar', titleJP: '学生' },
  3: { title: 'Pejuang', titleJP: '戦士' },
  4: { title: 'Samurai', titleJP: '侍' },
  5: { title: 'Sensei', titleJP: '先生' },
  6: { title: 'Master', titleJP: '達人' },
  7: { title: 'Hikari', titleJP: '光' },
  8: { title: 'Kami', titleJP: '神' },
};

// ── Persistence Helpers ────────────────────────────────────────────────────

function getUnlockedAchievements(): UnlockedAchievement[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('gemu-achievements-unlocked');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUnlockedAchievements(unlocked: UnlockedAchievement[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('gemu-achievements-unlocked', JSON.stringify(unlocked));
  } catch { /* ignore */ }
}

function getPreviouslyViewed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem('gemu-achievements-viewed');
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function markAsViewed(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const viewed = getPreviouslyViewed();
    ids.forEach(id => viewed.add(id));
    localStorage.setItem('gemu-achievements-viewed', JSON.stringify([...viewed]));
  } catch { /* ignore */ }
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function Achievements() {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const isClient = typeof window !== 'undefined';

  // Compute achievements list (depends on isClient to only read localStorage on client)
  const achievements = useMemo(() => {
    if (!isClient) return [];
    return buildAchievements();
  }, [isClient]);

  // Compute unlocked state map and detect new unlocks
  const { unlockedMap, newUnlockIds } = useMemo(() => {
    if (!isClient || achievements.length === 0) return { unlockedMap: {} as Record<string, string>, newUnlockIds: new Set<string>() };

    const unlockedList = getUnlockedAchievements();
    const map: Record<string, string> = {};
    unlockedList.forEach(u => { map[u.id] = u.unlockedAt; });

    // Detect newly unlocked (conditions met but not yet persisted)
    const fresh: UnlockedAchievement[] = [];

    achievements.forEach(a => {
      if (!map[a.id] && a.checkUnlocked()) {
        const now = new Date().toISOString();
        fresh.push({ id: a.id, unlockedAt: now });
        map[a.id] = now;
      }
    });

    // Persist new unlocks and award XP (external system sync)
    if (fresh.length > 0) {
      saveUnlockedAchievements([...unlockedList, ...fresh]);
      const totalNewXP = fresh.reduce((sum, f) => {
        const ach = achievements.find(a => a.id === f.id);
        return sum + (ach?.xpReward || 0);
      }, 0);
      if (totalNewXP > 0) {
        try {
          const current = Number(localStorage.getItem('gemu-achievement-xp') || '0');
          localStorage.setItem('gemu-achievement-xp', String(current + totalNewXP));
        } catch { /* ignore */ }
      }
      setTimeout(() => markAsViewed(fresh.map(u => u.id)), 3000);
    }

    const newIds = new Set(fresh.map(f => f.id));
    return { unlockedMap: map, newUnlockIds: newIds };
  }, [isClient, achievements]);

  const isNewlyUnlocked = useCallback(
    (id: string) => newUnlockIds.has(id),
    [newUnlockIds]
  );

  // Calculate stats
  const totalXP = useMemo(() => getTotalXP(), [isClient, unlockedMap]);
  const levelInfo = useMemo(() => getLevelInfo(totalXP), [totalXP]);
  const unlockedCount = useMemo(
    () => achievements.filter(a => !!unlockedMap[a.id]).length,
    [achievements, unlockedMap]
  );
  const totalCount = achievements.length;
  const levelTitle = LEVEL_TITLES[levelInfo.level] || LEVEL_TITLES[8];

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return achievements;
    return achievements.filter(a => a.category === activeCategory);
  }, [achievements, activeCategory]);

  // Find newly unlocked from this session for "recent" section
  const recentUnlocks = useMemo(() => {
    return achievements
      .filter(a => unlockedMap[a.id])
      .sort((a, b) => {
        const dateA = unlockedMap[a.id] || '';
        const dateB = unlockedMap[b.id] || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 3);
  }, [achievements, unlockedMap]);

  const isSessionUnlocked = useCallback(
    (id: string) => newUnlockIds.has(id),
    [newUnlockIds]
  );

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-36 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Trophy className="text-amber-500" size={28} />
          Pencapaian
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kumpulkan badge dan naik level dalam perjalanan belajarmu!
        </p>
      </div>

      {/* ── Level & XP Card ── */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 p-5 text-white relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Crown size={28} className="text-yellow-200" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">Level Kamu</p>
                  <p className="text-3xl font-black leading-none">Lv. {levelInfo.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{levelTitle.title}</p>
                <p className="text-sm text-white/70 font-medium font-jp">
                  {levelTitle.titleJP}
                </p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium flex items-center gap-1">
                  <Zap size={12} /> {totalXP.toLocaleString()} XP Total
                </span>
                <span className="text-white/80 font-medium">
                  {levelInfo.nextLevelXP - levelInfo.currentLevelXP > 0
                    ? `${levelInfo.progress}% ke Lv. ${levelInfo.level + 1}`
                    : 'MAX LEVEL'}
                </span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${levelInfo.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] text-white/60 text-right">
                {levelInfo.currentLevelXP.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x bg-white dark:bg-card p-0">
          <div className="p-3 text-center">
            <p className="text-lg font-black text-teal-600 dark:text-teal-400">{unlockedCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Terbuka</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-black text-amber-500">{totalCount - unlockedCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Terkunci</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-black text-emerald-500">{totalXP.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total XP</p>
          </div>
        </div>
      </Card>

      {/* ── Recently Unlocked ── */}
      {newUnlockIds.size > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} className="animate-pulse" />
            Baru Saja Terbuka!
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {achievements.filter(a => newUnlockIds.has(a.id)).map(a => {
              const catMeta = CATEGORY_META[a.category];
              return (
                <div
                  key={a.id}
                  className={cn(
                    'min-w-[200px] p-3 rounded-xl border-2 border-amber-300 dark:border-amber-600',
                    'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20',
                    'shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30',
                    'animate-in slide-in-from-bottom-2 fade-in duration-500'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{a.title}</p>
                      <span className={cn('text-[10px] font-semibold', catMeta.color)}>{catMeta.label}</span>
                    </div>
                  </div>
                  {a.xpReward > 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">+{a.xpReward} XP</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Unlocks (last 3) ── */}
      {recentUnlocks.length > 0 && newUnlockIds.size === 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
            <TrendingUp size={14} />
            Terakhir Terbuka
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {recentUnlocks.map(a => {
              const catMeta = CATEGORY_META[a.category];
              return (
                <div
                  key={a.id}
                  className={cn(
                    'min-w-[180px] p-3 rounded-xl border',
                    catMeta.borderColor,
                    catMeta.badgeBg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(unlockedMap[a.id])}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Filters ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <Button
          size="sm"
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('all')}
          className={cn(
            'rounded-full text-xs font-semibold shrink-0 transition-all',
            activeCategory === 'all'
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
              : 'hover:bg-muted'
          )}
        >
          <Award size={13} className="mr-1" />
          Semua ({totalCount})
        </Button>
        {(Object.entries(CATEGORY_META) as [AchievementCategory, typeof CATEGORY_META[AchievementCategory]][]).map(([key, meta]) => {
          const count = achievements.filter(a => a.category === key).length;
          return (
            <Button
              key={key}
              size="sm"
              variant={activeCategory === key ? 'default' : 'outline'}
              onClick={() => setActiveCategory(key)}
              className={cn(
                'rounded-full text-xs font-semibold shrink-0 transition-all',
                activeCategory === key
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                  : 'hover:bg-muted'
              )}
            >
              <span className="mr-1">{meta.label.split(' ')[0]}</span>
              {meta.label.split(' ').slice(1).join(' ')} ({count})
            </Button>
          );
        })}
      </div>

      {/* ── Achievement Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, idx) => {
          const isUnlocked = !!unlockedMap[achievement.id];
          const isNew = isSessionUnlocked(achievement.id);
          const catMeta = CATEGORY_META[achievement.category];
          const tierInfo = achievement.tier ? TIER_META[achievement.tier] : null;

          return (
            <Card
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={cn(
                'relative overflow-hidden cursor-pointer transition-all duration-300 group',
                'hover:shadow-md hover:-translate-y-0.5',
                'opacity-100 translate-y-0',
                isUnlocked
                  ? cn(
                      'border border-teal-200 dark:border-teal-800',
                      'bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/30 dark:from-card dark:via-teal-950/20 dark:to-emerald-950/10',
                      isNew && 'ring-2 ring-amber-400 dark:ring-amber-500 shadow-lg shadow-amber-200/40 dark:shadow-amber-900/30'
                    )
                  : 'border border-muted bg-muted/30 opacity-60 grayscale-[60%] hover:opacity-80 hover:grayscale-0'
              )}
              style={{
                transitionDelay: `${idx * 40}ms`,
              }}
            >
              {/* New badge */}
              {isNew && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                    BARU!
                  </Badge>
                </div>
              )}

              {/* Glow effect for unlocked */}
              {isUnlocked && !isNew && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-teal-400/5 to-emerald-400/5 pointer-events-none" />
              )}

              {/* Shine sweep for unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" style={{
                    animation: isNew ? 'shimmer 2s ease-in-out infinite' : 'none',
                  }} />
                </div>
              )}

              <CardContent className="p-4 relative z-10">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all',
                    isUnlocked
                      ? cn(
                          'bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40',
                          'shadow-sm',
                          isNew && 'scale-110'
                        )
                      : 'bg-muted'
                  )}>
                    {isUnlocked ? achievement.icon : '🔒'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className={cn(
                        'text-sm font-bold truncate',
                        isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {achievement.title}
                      </h4>
                      {tierInfo && isUnlocked && (
                        <span className={cn('text-[9px] font-bold uppercase tracking-wider', tierInfo.color)}>
                          {tierInfo.label}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      'text-xs leading-relaxed line-clamp-2 mb-2',
                      isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    )}>
                      {achievement.description}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Category Badge */}
                      <Badge variant="secondary" className={cn(
                        'text-[9px] px-1.5 py-0 rounded-full font-semibold',
                        catMeta.badgeBg,
                        catMeta.color
                      )}>
                        {catMeta.label}
                      </Badge>

                      {/* Status */}
                      {isUnlocked ? (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle size={10} />
                          {formatDate(unlockedMap[achievement.id])}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-semibold">
                          <Lock size={10} />
                          Terkunci
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* XP Reward */}
                {achievement.xpReward > 0 && (
                  <div className={cn(
                    'mt-3 pt-2 border-t flex items-center justify-center gap-1 text-[10px] font-bold',
                    isUnlocked
                      ? 'border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400'
                      : 'border-muted text-muted-foreground/40'
                  )}>
                    <Zap size={10} />
                    +{achievement.xpReward} XP
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Lock size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Tidak ada pencapaian dalam kategori ini.</p>
        </div>
      )}

      {/* ── Tips Card ── */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10 border-amber-200 dark:border-amber-800/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Star size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Tips untuk Membuka Pencapaian</h4>
              <ul className="text-xs text-amber-700 dark:text-amber-400/80 space-y-0.5 list-disc list-inside">
                <li>Belajar setiap hari untuk menjaga streak</li>
                <li>Raih nilai S di Boss Quiz untuk hadiah besar</li>
                <li>Latih percakapan Kaiwa dan Choukai secara rutin</li>
                <li>Selesaikan Kana Quiz dengan skor sempurna</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Achievement Detail Dialog ── */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Detail Pencapaian</DialogTitle>
            <DialogDescription className="sr-only">Detail pencapaian yang dipilih</DialogDescription>
          </DialogHeader>
          {selectedAchievement && (() => {
            const isUnlocked = !!unlockedMap[selectedAchievement.id];
            const catMeta = CATEGORY_META[selectedAchievement.category];
            const tierInfo = selectedAchievement.tier ? TIER_META[selectedAchievement.tier] : null;

            return (
              <div className="text-center space-y-4 pt-2">
                {/* Large Icon */}
                <div className={cn(
                  'w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl transition-all',
                  isUnlocked
                    ? cn(
                        'bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40',
                        'shadow-lg'
                      )
                    : 'bg-muted'
                )}>
                  {isUnlocked ? selectedAchievement.icon : '🔒'}
                </div>

                {/* Title */}
                <div>
                  <h3 className={cn(
                    'text-lg font-black',
                    isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {selectedAchievement.title}
                  </h3>
                  {tierInfo && (
                    <span className={cn('text-xs font-bold uppercase tracking-wider', tierInfo.color)}>
                      Tier {tierInfo.label}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">{selectedAchievement.description}</p>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className={cn(
                    'font-semibold',
                    catMeta.badgeBg,
                    catMeta.color
                  )}>
                    {catMeta.label}
                  </Badge>
                  {selectedAchievement.xpReward > 0 && (
                    <Badge variant="secondary" className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-semibold">
                      <Zap size={10} className="mr-1" /> +{selectedAchievement.xpReward} XP
                    </Badge>
                  )}
                </div>

                {/* Status */}
                {isUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle size={16} />
                      Terbuka!
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Terbuka pada {formatDate(unlockedMap[selectedAchievement.id])}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-semibold">
                    <Lock size={16} />
                    Belum terbuka
                  </div>
                )}

                {/* Close Button */}
                <Button
                  variant="outline"
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full rounded-xl"
                >
                  Tutup
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── CSS Keyframes ── */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(300%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
}
