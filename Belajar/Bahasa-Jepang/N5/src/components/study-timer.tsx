'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, SkipForward, Timer,
  Clock, Flame, TrendingUp, CalendarDays, Sparkles,
  Plus, Minus, Volume2, VolumeX, CheckCircle2,
  Coffee, BookOpen, Sofa
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────
type TimerMode = 'belajar' | 'istirahat-pendek' | 'istirahat-panjang' | 'custom';

interface TimerConfig {
  id: TimerMode;
  label: string;
  labelJp: string;
  duration: number; // minutes
  icon: React.ElementType;
  color: string;
  gradient: string;
  bgGlow: string;
}

interface TimerStats {
  todayMinutes: number;
  allTimeMinutes: number;
  streak: number;
  sessions: number;
}

// ── Constants ──────────────────────────────────────────────────
const TIMER_MODES: TimerConfig[] = [
  {
    id: 'belajar',
    label: 'Belajar',
    labelJp: '勉強',
    duration: 25,
    icon: BookOpen,
    color: 'text-teal-600 dark:text-teal-400',
    gradient: 'from-teal-500 to-emerald-600',
    bgGlow: 'bg-teal-500/10',
  },
  {
    id: 'istirahat-pendek',
    label: 'Istirahat Pendek',
    labelJp: '休憩',
    duration: 5,
    icon: Coffee,
    color: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-green-600',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    id: 'istirahat-panjang',
    label: 'Istirahat Panjang',
    labelJp: '長休憩',
    duration: 15,
    icon: Sofa,
    color: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500 to-teal-600',
    bgGlow: 'bg-cyan-500/10',
  },
  {
    id: 'custom',
    label: 'Kustom',
    labelJp: 'カスタム',
    duration: 30,
    icon: Timer,
    color: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/10',
  },
];

const MOTIVATIONAL_PHRASES = [
  { jp: '頑張ってください！', id: 'Semangat ya!' },
  { jp: '続けましょう！', id: 'Ayo teruskan!' },
  { jp: '素晴らしい！', id: 'Luar biasa!' },
  { jp: 'あと少し！', id: 'Hampir selesai!' },
  { jp: 'よくできました！', id: 'Kerja bagus!' },
  { jp: '諦めないで！', id: 'Jangan menyerah!' },
  { jp: '一歩ずつ！', id: 'Satu langkah demi satu!' },
  { jp: '努力は報われる！', id: 'Usaha tidak mengkhianati hasil!' },
  { jp: 'できる！', id: 'Kamu bisa!' },
  { jp: '毎日練習！', id: 'Latihan setiap hari!' },
  { jp: '日本語上手ですね！', id: 'Bahasa Jepangmu hebat!' },
  { jp: '応援しています！', id: 'Saya mendukungmu!' },
  { jp: '落ち着いて！', id: 'Tenang saja!' },
  { jp: '集中しましょう！', id: 'Ayo fokus!' },
  { jp: '完璧を目指そう！', id: 'Berdikari menuju kesempurnaan!' },
];

// ── Web Audio API ──────────────────────────────────────────────
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);

      gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.4);

      osc.start(audioCtx.currentTime + i * 0.15);
      osc.stop(audioCtx.currentTime + i * 0.15 + 0.5);
    });
  } catch {
    // Silently fail if audio not supported
  }
}

// ── localStorage helpers ───────────────────────────────────────
function getTimerStats(): TimerStats {
  if (typeof window === 'undefined') return { todayMinutes: 0, allTimeMinutes: 0, streak: 0, sessions: 0 };
  try {
    // All-time minutes
    const totalMin = parseInt(localStorage.getItem('gemu-timer-total-minutes') || '0', 10);

    // Today's minutes
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayMap: Record<string, number> = JSON.parse(localStorage.getItem('gemu-timer-daily') || '{}');
    const todayMinutes = dayMap[todayKey] || 0;

    // Sessions
    const sessions = parseInt(localStorage.getItem('gemu-timer-sessions') || '0', 10);

    // Streak (reuse gemu-study-sessions logic)
    const studySessions = localStorage.getItem('gemu-study-sessions');
    const sessionMap: Record<string, number> = studySessions ? JSON.parse(studySessions) : {};
    let streak = 0;
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

    return { todayMinutes, allTimeMinutes: totalMin, streak, sessions };
  } catch {
    return { todayMinutes: 0, allTimeMinutes: 0, streak: 0, sessions: 0 };
  }
}

function saveTimerMinutes(minutes: number) {
  if (typeof window === 'undefined') return;
  try {
    // All-time
    const prev = parseInt(localStorage.getItem('gemu-timer-total-minutes') || '0', 10);
    localStorage.setItem('gemu-timer-total-minutes', String(prev + minutes));

    // Daily
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayMap: Record<string, number> = JSON.parse(localStorage.getItem('gemu-timer-daily') || '{}');
    dayMap[todayKey] = (dayMap[todayKey] || 0) + minutes;
    localStorage.setItem('gemu-timer-daily', JSON.stringify(dayMap));

    // Sessions (integrate with achievements)
    const prevSessions = parseInt(localStorage.getItem('gemu-timer-sessions') || '0', 10);
    localStorage.setItem('gemu-timer-sessions', String(prevSessions + 1));

    // Also record in gemu-study-sessions for streak tracking
    const studySessions = localStorage.getItem('gemu-study-sessions');
    const sessionMap: Record<string, number> = studySessions ? JSON.parse(studySessions) : {};
    sessionMap[todayKey] = (sessionMap[todayKey] || 0) + 1;
    localStorage.setItem('gemu-study-sessions', JSON.stringify(sessionMap));
  } catch {
    // ignore
  }
}

// ── Format helpers ─────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMinutes(minutes: number): string {
  if (minutes < 1) return '0 menit';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// ── Timer Ring Component ───────────────────────────────────────
function TimerRing({
  percent,
  size = 240,
  strokeWidth = 10,
  isRunning,
  isComplete,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  isRunning: boolean;
  isComplete: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-teal-100 dark:text-teal-900/40"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-1000 ease-out',
            isComplete
              ? 'text-emerald-500'
              : 'text-teal-500 dark:text-teal-400',
            isRunning && !isComplete && 'animate-[pulse-ring_2s_ease-in-out_infinite]'
          )}
          style={{
            stroke: 'currentColor',
          }}
        />
        {/* Glow effect when complete */}
        {isComplete && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth + 4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-emerald-300/50"
            style={{
              stroke: 'currentColor',
              filter: 'blur(4px)',
            }}
          />
        )}
      </svg>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function StudyTimer() {
  // Timer state
  const [activeMode, setActiveMode] = useState<TimerMode>('belajar');
  const [customDuration, setCustomDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [flashComplete, setFlashComplete] = useState(false);
  const [elapsedThisSession, setElapsedThisSession] = useState(0); // track seconds studied
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Phrase rotation
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Stats
  const [stats, setStats] = useState<TimerStats>({
    todayMinutes: 0,
    allTimeMinutes: 0,
    streak: 0,
    sessions: 0,
  });
  const [mounted, setMounted] = useState(false);

  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const statsLoadedRef = useRef(false);

  // Get current mode config
  const modeConfig = useMemo(() => {
    if (activeMode === 'custom') {
      return {
        ...TIMER_MODES[3],
        duration: customDuration,
      };
    }
    return TIMER_MODES.find(m => m.id === activeMode) || TIMER_MODES[0];
  }, [activeMode, customDuration]);

  // Load stats on mount - use callback pattern to avoid direct setState in effect
  useEffect(() => {
    const stats = getTimerStats();
    requestAnimationFrame(() => {
      setMounted(true);
      setStats(stats);
    });
    statsLoadedRef.current = true;
  }, []);

  // Timer interval
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false);
            setIsComplete(true);
            setFlashComplete(true);
            setTimeout(() => setFlashComplete(false), 3000);

            if (soundEnabled) playNotificationSound();

            // Save study time if this was a study session
            if (activeMode === 'belajar' || activeMode === 'custom') {
              const studiedSeconds = totalTime;
              const studiedMinutes = Math.round(studiedSeconds / 60);
              saveTimerMinutes(studiedMinutes);
              setStats(getTimerStats());
            }

            // Auto-transition: Belajar -> Istirahat Pendek
            if (activeMode === 'belajar') {
              setTimeout(() => {
                setActiveMode('istirahat-pendek');
                setIsComplete(false);
              }, 2000);
            }

            return 0;
          }
          setElapsedThisSession(s => s + 1);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, activeMode, totalTime, soundEnabled]);

  // Phrase rotation every 30 seconds
  useEffect(() => {
    if (!isRunning || activeMode !== 'belajar' && activeMode !== 'custom') return;
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % MOTIVATIONAL_PHRASES.length);
      // Reset phrase seed so effectivePhraseIndex follows phraseIndex during running
    }, 30000);
    return () => clearInterval(phraseInterval);
  }, [isRunning, activeMode]);

  // Change phrase on mode switch - use ref-based seed
  const phraseSeedRef = useRef(0);
  phraseSeedRef.current = useMemo(() => {
    // Generate a new seed on each mode change
    return phraseSeedRef.current + 1;
  }, [activeMode]);
  const initialPhraseIndex = useMemo(() => Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length), [phraseSeedRef]);
  const effectivePhraseIndex = isRunning ? phraseIndex : initialPhraseIndex;

  // ── Handlers ──────────────────────────────────────────────────
  const handleModeChange = useCallback((mode: TimerMode) => {
    const wasRunning = isRunning;
    const wasStudying = (activeMode === 'belajar' || activeMode === 'custom') && elapsedThisSession > 0;

    // Save partial study time if switching away from study
    if (wasStudying && isRunning) {
      const partialMinutes = Math.max(1, Math.round(elapsedThisSession / 60));
      saveTimerMinutes(partialMinutes);
      setStats(getTimerStats());
    }

    setIsRunning(false);
    setIsComplete(false);
    setElapsedThisSession(0);
    startTimeRef.current = null;
    setActiveMode(mode);

    const dur = mode === 'custom' ? customDuration : (TIMER_MODES.find(m => m.id === mode)?.duration || 25);
    setTimeLeft(dur * 60);
    setTotalTime(dur * 60);
  }, [isRunning, activeMode, customDuration, elapsedThisSession]);

  const handlePlayPause = useCallback(() => {
    if (isComplete) {
      // Reset and start
      setIsComplete(false);
      const dur = activeMode === 'custom' ? customDuration : modeConfig.duration;
      setTimeLeft(dur * 60);
      setTotalTime(dur * 60);
      setElapsedThisSession(0);
      startTimeRef.current = null;
      setIsRunning(true);
      return;
    }
    setIsRunning(prev => !prev);
    if (!isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning, isComplete, activeMode, customDuration, modeConfig.duration]);

  const handleReset = useCallback(() => {
    const wasStudying = (activeMode === 'belajar' || activeMode === 'custom') && elapsedThisSession > 0;

    if (wasStudying && isRunning) {
      const partialMinutes = Math.max(1, Math.round(elapsedThisSession / 60));
      saveTimerMinutes(partialMinutes);
      setStats(getTimerStats());
    }

    setIsRunning(false);
    setIsComplete(false);
    setElapsedThisSession(0);
    startTimeRef.current = null;
    const dur = activeMode === 'custom' ? customDuration : modeConfig.duration;
    setTimeLeft(dur * 60);
    setTotalTime(dur * 60);
  }, [activeMode, customDuration, modeConfig.duration, elapsedThisSession, isRunning]);

  const handleSkip = useCallback(() => {
    // Save partial if studying
    if ((activeMode === 'belajar' || activeMode === 'custom') && elapsedThisSession > 0) {
      const partialMinutes = Math.max(1, Math.round(elapsedThisSession / 60));
      saveTimerMinutes(partialMinutes);
      setStats(getTimerStats());
    }

    // Determine next mode
    let nextMode: TimerMode;
    if (activeMode === 'belajar') {
      nextMode = 'istirahat-pendek';
    } else if (activeMode === 'istirahat-pendek') {
      nextMode = 'belajar';
    } else if (activeMode === 'istirahat-panjang') {
      nextMode = 'belajar';
    } else {
      nextMode = 'istirahat-pendek';
    }

    setIsRunning(false);
    setIsComplete(false);
    setElapsedThisSession(0);
    startTimeRef.current = null;
    setActiveMode(nextMode);

    const dur = nextMode === 'custom' ? customDuration : (TIMER_MODES.find(m => m.id === nextMode)?.duration || 25);
    setTimeLeft(dur * 60);
    setTotalTime(dur * 60);
  }, [activeMode, customDuration, elapsedThisSession]);

  const handleCustomDurationChange = useCallback((val: number) => {
    const clamped = Math.max(1, Math.min(120, val));
    setCustomDuration(clamped);
    if (activeMode === 'custom' && !isRunning) {
      setTimeLeft(clamped * 60);
      setTotalTime(clamped * 60);
    }
  }, [activeMode, isRunning]);

  // ── Computed ──────────────────────────────────────────────────
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const currentPhrase = MOTIVATIONAL_PHRASES[effectivePhraseIndex];
  const isStudyMode = activeMode === 'belajar' || activeMode === 'custom';

  return (
    <div className="space-y-5">
      {/* ═══════ Header ═══════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Timer size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Study Timer</h1>
            <p className="text-xs text-muted-foreground">Pomodoro Technique &mdash; 勉強タイマー</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mounted && stats.sessions > 0 && (
            <Badge className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold">
              <CheckCircle2 size={12} className="mr-1" /> {stats.sessions} sesi
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSoundEnabled(prev => !prev)}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 size={18} className="text-teal-600" /> : <VolumeX size={18} className="text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* ═══════ Mode Selector ═══════ */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TIMER_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0',
                isActive
                  ? 'bg-gradient-to-r text-white shadow-md ' + mode.gradient
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={16} />
              <span>{mode.label}</span>
              {mode.id !== 'custom' && (
                <span className="text-xs opacity-80">{mode.duration}m</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════ Timer Card ═══════ */}
      <Card className={cn(
        'border-0 overflow-hidden relative transition-all duration-500',
        flashComplete && 'ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-background shadow-emerald-200/50 dark:shadow-emerald-900/50 shadow-xl'
      )}>
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          isComplete
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50/80 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-green-950/40'
            : 'bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 dark:from-teal-950/30 dark:via-background dark:to-emerald-950/20'
        )} />

        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col items-center gap-5">
            {/* Mode label */}
            <div className="flex items-center gap-2">
              <Badge className={cn(
                'text-xs font-bold px-3 py-1 border-0',
                isComplete
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
              )}>
                {modeConfig.labelJp} &middot; {modeConfig.label}
              </Badge>
              {isRunning && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Berjalan
                </span>
              )}
            </div>

            {/* Timer Ring */}
            <div className="relative">
              <TimerRing
                percent={progressPercent}
                size={220}
                strokeWidth={10}
                isRunning={isRunning}
                isComplete={isComplete}
              />
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isComplete ? (
                  <>
                    <CheckCircle2 size={36} className="text-emerald-500 mb-1" />
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      Selesai!
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      完了！お疲れ様！
                    </span>
                  </>
                ) : (
                  <>
                    <span className={cn(
                      'text-5xl md:text-6xl font-black tracking-tight tabular-nums',
                      isRunning ? 'text-teal-700 dark:text-teal-300' : 'text-gray-800 dark:text-gray-200'
                    )}>
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-2 font-medium">
                      {modeConfig.label}
                      {activeMode !== 'custom' && (
                        <span className="ml-1 opacity-70">
                          ({modeConfig.duration} menit)
                        </span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Motivational Phrase */}
            {isRunning && isStudyMode && !isComplete && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-lg font-bold text-teal-700 dark:text-teal-300 font-jp">
                  {currentPhrase.jp}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{currentPhrase.id}</p>
              </div>
            )}

            {/* Session indicator */}
            {isStudyMode && stats.sessions > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles size={12} className="text-amber-500" />
                <span>Sesi #{stats.sessions} selesai</span>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200"
                onClick={handleReset}
                disabled={isComplete}
                aria-label="Reset"
              >
                <RotateCcw size={18} />
              </Button>

              <Button
                size="lg"
                className={cn(
                  'h-16 w-16 rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
                  isComplete
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                    : isRunning
                      ? 'bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700'
                      : 'bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
                )}
                onClick={handlePlayPause}
              >
                {isComplete ? (
                  <RotateCcw size={24} />
                ) : isRunning ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} className="ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200"
                onClick={handleSkip}
                disabled={isComplete}
                aria-label="Skip"
              >
                <SkipForward size={18} />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-100/30 dark:bg-teal-900/20 rounded-full" />
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full" />
      </Card>

      {/* ═══════ Custom Duration ═══════ */}
      {activeMode === 'custom' && (
        <Card className="border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Timer size={16} className="text-amber-600" />
              <h3 className="font-bold text-sm">Durasi Kustom</h3>
            </div>

            {/* Number input with +/- buttons */}
            <div className="flex items-center gap-4 justify-center mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                onClick={() => handleCustomDurationChange(customDuration - 5)}
                disabled={customDuration <= 1 || isRunning}
              >
                <Minus size={16} />
              </Button>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-700 dark:text-amber-300 tabular-nums w-16 text-center">
                  {customDuration}
                </span>
                <span className="text-sm text-muted-foreground font-medium">menit</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                onClick={() => handleCustomDurationChange(customDuration + 5)}
                disabled={customDuration >= 120 || isRunning}
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* Slider */}
            <Slider
              value={[customDuration]}
              min={1}
              max={120}
              step={1}
              onValueChange={(vals) => handleCustomDurationChange(vals[0])}
              disabled={isRunning}
              className="max-w-sm mx-auto [&_[data-slot=slider-range]]:bg-amber-500 [&_[data-slot=slider-thumb]]:border-amber-500"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 max-w-sm mx-auto">
              <span>1 mnt</span>
              <span>30 mnt</span>
              <span>60 mnt</span>
              <span>90 mnt</span>
              <span>120 mnt</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════ Statistics Cards ═══════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-teal-600" />
          <h2 className="text-base font-bold">Statistik Belajar</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Today */}
          <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30" />
            <CardContent className="p-4 relative z-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CalendarDays size={18} className="text-white" />
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {mounted ? formatMinutes(stats.todayMinutes) : '-'}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Hari ini</p>
            </CardContent>
          </Card>

          {/* All Time */}
          <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30" />
            <CardContent className="p-4 relative z-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Clock size={18} className="text-white" />
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {mounted ? formatMinutes(stats.allTimeMinutes) : '-'}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Total waktu</p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" />
            <CardContent className="p-4 relative z-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Flame size={18} className="text-white" />
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {mounted ? `${stats.streak} hari` : '-'}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Streak</p>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30" />
            <CardContent className="p-4 relative z-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {mounted ? stats.sessions : '-'}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Sesi selesai</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══════ Tips Card ═══════ */}
      <Card className="border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 dark:from-teal-950/20 dark:via-background dark:to-emerald-950/20" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-teal-600" />
            <h3 className="font-bold text-sm">Tips Pomodoro</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-teal-500 font-bold text-base">1.</span>
              <p className="text-muted-foreground">Belajar selama <strong className="text-foreground">25 menit</strong> dengan penuh konsentrasi</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold text-base">2.</span>
              <p className="text-muted-foreground">Istirahat <strong className="text-foreground">5 menit</strong> setelah setiap sesi belajar</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold text-base">3.</span>
              <p className="text-muted-foreground">Setelah <strong className="text-foreground">4 sesi</strong>, istirahat panjang <strong className="text-foreground">15 menit</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-bold text-base">4.</span>
              <p className="text-muted-foreground">Gunakan <strong className="text-foreground">mode kustom</strong> untuk durasi yang lebih fleksibel</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
