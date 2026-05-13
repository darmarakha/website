'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  BookOpen, Languages, Sparkles, Mic, Headphones,
  Trophy, MessageSquare, Volume2, Gamepad2, Star, Clock,
  Target, Zap, BookMarked, ChevronRight, Bell, RefreshCw,
  Flame, CalendarDays, Hash, Play, Sword, AudioLines, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { VOCABULARY, speakJapanese, type Vocabulary } from '@/lib/n5-constants';

interface HomeDashboardProps {
  onNavigate: (section: string) => void;
}

const MODULES = [
  { id: 'kana', title: 'Kana Library', desc: 'Hiragana & Katakana', icon: Languages, color: 'from-teal-500 to-emerald-600', badge: '46 Hiragana\n46 Katakana' },
  { id: 'vocab', title: 'Kosakata', desc: 'Daftar Kata N5', icon: BookMarked, color: 'from-emerald-500 to-green-600', badge: '58 Kosakata' },
  { id: 'kanji', title: 'Kanji Mastery', desc: 'Karakter Kanji', icon: BookOpen, color: 'from-amber-500 to-orange-600', badge: '31 Kanji' },
  { id: 'grammar', title: 'Grammar Guide', desc: 'Panduan Tata Bahasa', icon: BookMarked, color: 'from-rose-500 to-pink-600', badge: '16 Pola' },
  { id: 'flashcards', title: 'Flashcards', desc: 'Active Recall', icon: Volume2, color: 'from-violet-500 to-purple-600', badge: 'Belajar Aktif' },
  { id: 'quiz', title: 'Boss Quiz', desc: 'Ujian AI', icon: Gamepad2, color: 'from-red-500 to-rose-600', badge: 'Tantangan' },
  { id: 'ai-chat', title: 'Gemu AI Chat', desc: 'AI Practice', icon: MessageSquare, color: 'from-cyan-500 to-teal-600', badge: 'Tanya AI' },
  { id: 'kaiwa', title: 'Kaiwa Studio', desc: 'Percakapan AI', icon: Mic, color: 'from-teal-600 to-emerald-700', badge: 'Live Chat' },
  { id: 'choukai', title: 'Choukai Lab', desc: 'Listening Practice', icon: Headphones, color: 'from-sky-500 to-cyan-600', badge: '8 Skenario' },
  { id: 'achievements', title: 'Pencapaian', desc: 'Sistem Gamifikasi', icon: Trophy, color: 'from-amber-500 to-yellow-600', badge: '17 Badge' },
  { id: 'timer', title: 'Study Timer', desc: 'Pomodoro Timer', icon: Clock, color: 'from-teal-500 to-cyan-600', badge: '25 Min' },
  { id: 'daily', title: 'Tantangan Harian', desc: 'Challenge Harian', icon: CalendarDays, color: 'from-orange-500 to-red-500', badge: '5 Jenis' },
  { id: 'kazu', title: 'Latihan Angka', desc: 'Angka 0-10000', icon: Hash, color: 'from-teal-400 to-cyan-500', badge: '3 Mode' },
  { id: 'mock-exam', title: 'Ujian Latihan', desc: 'Mock Exam N5', icon: GraduationCap, color: 'from-emerald-500 to-teal-600', badge: '23 Soal' },
];

// ── N5 Progress Ring ──────────────────────────────────────────
function ProgressRing({ percent, size = 80, strokeWidth = 6 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// ── Seeded random from date ────────────────────────────────────
function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDailyWord(): Vocabulary {
  const seed = getDailySeed();
  const index = Math.floor(seededRandom(seed) * VOCABULARY.length);
  return VOCABULARY[index];
}

// ── localStorage helpers ───────────────────────────────────────
function getStoredProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('gemu-progress');
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function getStoredReminder(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('gemu-reminder') === 'true';
}

function getStudyStats(): { streak: number; totalSessions: number; wordsLearned: number } {
  if (typeof window === 'undefined') return { streak: 0, totalSessions: 0, wordsLearned: 0 };
  try {
    const sessions = localStorage.getItem('gemu-study-sessions');
    const sessionMap: Record<string, number> = sessions ? JSON.parse(sessions) : {};
    const totalSessions = Object.values(sessionMap).reduce((a, b) => a + b, 0);

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (sessionMap[key] && sessionMap[key] > 0) {
        streak++;
      } else {
        // Allow today to not yet have a session (don't break streak if studying later today)
        if (i === 0) continue;
        break;
      }
    }

    // Words learned from flashcard progress
    const flashcardData = localStorage.getItem('gemu-flashcard-learned');
    const wordsLearned = flashcardData ? JSON.parse(flashcardData).length || 0 : 0;

    return { streak, totalSessions, wordsLearned };
  } catch {
    return { streak: 0, totalSessions: 0, wordsLearned: 0 };
  }
}

function recordStudySession() {
  if (typeof window === 'undefined') return;
  try {
    const sessions = localStorage.getItem('gemu-study-sessions');
    const sessionMap: Record<string, number> = sessions ? JSON.parse(sessions) : {};
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    sessionMap[key] = (sessionMap[key] || 0) + 1;
    localStorage.setItem('gemu-study-sessions', JSON.stringify(sessionMap));
  } catch { /* ignore */ }
}

function getGreeting(): string {
  if (typeof window === 'undefined') return '';
  const hour = new Date().getHours();
  if (hour < 12) return 'Ohayou gozaimasu';
  if (hour < 17) return 'Konnichiwa';
  return 'Konbanwa';
}

// ── Quick Actions Data ─────────────────────────────────────────
const QUICK_LEARN = [
  {
    id: 'kana',
    title: 'Hiragana Dasar',
    desc: 'Pelajari 46 huruf dasar',
    icon: Languages,
    gradient: 'from-teal-500 to-emerald-500',
    bgGlow: 'bg-teal-500/10',
  },
  {
    id: 'vocab',
    title: 'Kosakata Harian',
    desc: '58 kata penting N5',
    icon: BookMarked,
    gradient: 'from-emerald-500 to-green-500',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    id: 'kanji',
    title: 'Kanji Pertamaku',
    desc: '31 kanji dasar N5',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/10',
  },
];

// ── Category colors ────────────────────────────────────────────
function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'Orang': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'Kata Kerja': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Pekerjaan': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Tempat': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'Kata Sifat': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'Angka': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    'Waktu': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  };
  return map[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

// ── Main Component ─────────────────────────────────────────────
export default function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [studyReminder, setStudyReminder] = useState(false);
  const [greeting, setGreeting] = useState('Konnichiwa');
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ streak: 0, totalSessions: 0, wordsLearned: 0 });
  const [mounted, setMounted] = useState(false);

  // Hydration-safe init: read localStorage only on client
  useEffect(() => {
    setMounted(true);
    setProgress(getStoredProgress());
    setStudyReminder(getStoredReminder());
    setGreeting(getGreeting());
    setStats(getStudyStats());
  }, []);

  // Compute daily word reactively (no effect needed)
  const dailyWord = useMemo((): Vocabulary => {
    if (refreshKey === 0) return getDailyWord();
    return VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
  }, [refreshKey]);

  const handleReminderChange = (checked: boolean) => {
    setStudyReminder(checked);
    localStorage.setItem('gemu-reminder', String(checked));
  };

  const handleRefreshWord = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleQuickNav = useCallback((section: string) => {
    recordStudySession();
    setStats(getStudyStats());
    onNavigate(section);
  }, [onNavigate]);

  const totalProgress = Object.values(progress).reduce((a, b) => a + b, 0);
  const overallPercent = Math.min(100, Math.round(totalProgress / MODULES.length));

  const getRecommendation = () => {
    const lowest = MODULES.reduce((min, m) => (progress[m.id] || 0) < (progress[min.id] || 0) ? m : min, MODULES[0]);
    if (overallPercent < 10) return { text: 'Mulai dari Kana Library untuk belajar dasar huruf Jepang!', module: 'kana' };
    if (overallPercent < 30) return { text: 'Lanjutkan dengan Kosakata N5 untuk memperluas perbendaharaan kata!', module: 'vocab' };
    return { text: `Tantang dirimu dengan ${lowest.title}! Progress: ${progress[lowest.id] || 0}%`, module: lowest.id };
  };

  const rec = getRecommendation();

  return (
    <div className="space-y-6">
      {/* ═══════ Welcome Banner with N5 Progress Ring ═══════ */}
      <Card className="border-0 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 text-white overflow-hidden relative animate-gradient-shift">
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <p className="text-teal-100 text-sm font-medium">{mounted ? greeting : '...'}!</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Selamat Belajar!
              </h1>
              <p className="text-teal-100 text-sm max-w-lg leading-relaxed">
                Gemu Nihongo adalah platform belajar bahasa Jepang JLPT N5. Mulai perjalananmu menuju kemahiran bahasa Jepang!
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 badge-glow-teal">
                  <Sparkles size={12} className="mr-1" /> JLPT N5
                </Badge>
                {mounted && stats.streak > 0 && (
                  <Badge className="bg-amber-500/90 text-white border-amber-400/50 hover:bg-amber-500 badge-glow-amber">
                    <Flame size={12} className="mr-1" /> {stats.streak} hari berturut
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Ring */}
            <div className="relative shrink-0 hidden sm:block">
              <ProgressRing percent={overallPercent} size={96} strokeWidth={7} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black leading-none">{overallPercent}%</span>
                <span className="text-[10px] text-teal-100 mt-0.5">N5</span>
              </div>
            </div>

            {/* Mobile progress */}
            <div className="sm:hidden shrink-0">
              <div className="text-3xl font-black">{overallPercent}%</div>
              <Progress value={overallPercent} className="w-20 h-1.5 bg-white/20 mt-1" />
              <p className="text-teal-100 text-[10px] mt-0.5 text-center">Progress N5</p>
            </div>
          </div>
        </CardContent>
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full animate-float" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute right-1/4 -top-6 w-20 h-20 bg-white/5 rounded-full" style={{ animationDelay: '2s' }} />
        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-[0.03] pointer-events-none" />
      </Card>

      {/* ═══════ Daily Word (言葉 / Kotoba) ═══════ */}
      <Card className="border-0 overflow-hidden relative animate-shimmer-border">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-cyan-950/40" />
        <CardContent className="p-5 md:p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center animate-float-slow">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Kata Hari Ini</h2>
                <p className="text-[11px] text-muted-foreground">言葉 / Kotoba</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                {mounted ? `${VOCABULARY.indexOf(dailyWord) + 1} / ${VOCABULARY.length}` : ''}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleRefreshWord}
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>

          {mounted ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-end gap-3">
                <span className="text-4xl md:text-5xl font-black text-teal-700 dark:text-teal-300 tracking-tight font-jp">
                  {dailyWord.word}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-teal-200 text-teal-600 hover:bg-teal-500 hover:text-white hover:border-teal-500 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-500 dark:hover:text-white dark:hover:border-teal-500 shrink-0 mb-1 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md hover:shadow-teal-500/25"
                  onClick={() => speakJapanese(dailyWord.word)}
                >
                  <Play size={14} className="ml-0.5" />
                </Button>
              </div>
              <p className="text-base text-teal-600 dark:text-teal-400 font-medium font-jp">
                {dailyWord.reading}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {dailyWord.meaning}
              </p>
              {dailyWord.explanation && (
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  {dailyWord.explanation}
                </p>
              )}
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3 shrink-0">
              <Badge className={cn('text-xs font-medium px-3 py-1', getCategoryColor(dailyWord.category))}>
                {dailyWord.category}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {refreshKey === 0 ? 'Kata harian' : 'Kata acak'}
              </span>
            </div>
          </div>
          ) : (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Sparkles size={16} className="animate-pulse" />
              <span>Memuat kata hari ini...</span>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════ Study Stats ═══════ */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" />
          <CardContent className="p-4 relative z-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Flame size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{mounted ? stats.streak : '-'}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Hari berturut</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30" />
          <CardContent className="p-4 relative z-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <CalendarDays size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{mounted ? stats.totalSessions : '-'}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Total sesi belajar</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30" />
          <CardContent className="p-4 relative z-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Hash size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{mounted ? stats.wordsLearned : '-'}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Kata dipelajari</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Recommendation + Reminder Row ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <Target size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-teal-900 dark:text-teal-100">Rekomendasi Belajar</h3>
                <p className="text-sm text-teal-800 dark:text-teal-200 mt-1">{rec.text}</p>
                <Button size="sm" className="mt-2 bg-teal-600 hover:bg-teal-700 text-white text-xs h-7"
                  onClick={() => handleQuickNav(rec.module)}>
                  Mulai Sekarang <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-amber-500" />
              <h3 className="font-bold text-sm">Pengingat Belajar</h3>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder" className="text-xs text-muted-foreground">
                {studyReminder ? 'Pengingat aktif' : 'Aktifkan pengingat harian'}
              </Label>
              <Switch id="reminder" checked={studyReminder} onCheckedChange={handleReminderChange} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>Belajar 15 menit/hari</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Quick Actions ═══════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-teal-600" />
          <h2 className="text-lg font-bold">Aksi Cepat</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {QUICK_LEARN.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 overflow-hidden relative"
                onClick={() => handleQuickNav(item.id)}
              >
                <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300', item.bgGlow)} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0', item.gradient)}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/50 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick quiz + Kaiwa buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-xl"
            onClick={() => handleQuickNav('quiz')}
          >
            <Sword size={18} className="mr-2" />
            Uji Kemampuan
          </Button>
          <Button
            className="h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-xl"
            onClick={() => handleQuickNav('kaiwa')}
          >
            <AudioLines size={18} className="mr-2" />
            Latihan Ngobrol
          </Button>
        </div>
      </div>

      {/* ═══════ Module Grid ═══════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-teal-600" />
            <h2 className="text-lg font-bold">Semua Modul</h2>
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
            {MODULES.length} modul tersedia
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const pct = progress[mod.id] || 0;
            return (
              <Card key={mod.id} className="group cursor-pointer card-hover border-0 overflow-hidden relative"
                onClick={() => handleQuickNav(mod.id)}>
                <CardContent className="p-4">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200', mod.color)}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-sm">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                  <div className="mt-2.5">
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  {pct > 0 && (
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
                      {pct}% selesai
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ═══════ Feature Showcase ═══════ */}
      <Card className="border-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 text-white overflow-hidden relative">
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Star size={20} className="text-amber-300" />
            <h3 className="font-bold text-lg">Fitur Unggulan</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
              <Sparkles size={18} className="mb-2 text-amber-300" />
              <p className="font-bold">19 Fitur</p>
              <p className="text-teal-100 text-xs mt-1 leading-relaxed">19 modul belajar lengkap</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
              <CalendarDays size={18} className="mb-2 text-amber-300" />
              <p className="font-bold">Tantangan Harian</p>
              <p className="text-teal-100 text-xs mt-1 leading-relaxed">Challenge baru setiap hari</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
              <Trophy size={18} className="mb-2 text-amber-300" />
              <p className="font-bold">Sistem Pencapaian</p>
              <p className="text-teal-100 text-xs mt-1 leading-relaxed">17 badge dan level XP</p>
            </div>
          </div>
        </CardContent>
        {/* Decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute right-1/3 -bottom-4 w-16 h-16 bg-white/5 rounded-full" />
      </Card>
    </div>
  );
}
