'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gamepad2, Trophy, RotateCcw, CheckCircle, XCircle, Loader2, Zap, Clock,
  Swords, Star, Volume2, ChevronRight, Share2, Shield, Skull, Flame, Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { VOCABULARY, KANJI, GRAMMAR } from '@/lib/n5-constants';


// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  type: string;
  question: string;
  jpText?: string; // Japanese text to display prominently
  questionLabel?: string; // label like "Apa arti dari"
  options: string[];
  correct: number;
  explanation: string;
  timeTaken?: number;
  userAnswer?: number | null;
}

type Difficulty = 'mudah' | 'normal' | 'sulit';
type Phase = 'setup' | 'vs' | 'playing' | 'results';

interface DifficultyConfig {
  id: Difficulty;
  label: string;
  icon: string;
  desc: string;
  questionCount: number;
  timePerQuestion: number;
  xpMultiplier: number;
  bossHp: number;
  color: string;
  bgGradient: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DIFFICULTIES: DifficultyConfig[] = [
  { id: 'mudah', label: 'Mudah', icon: '🌱', desc: '5 soal • 60 dtk/soal', questionCount: 5, timePerQuestion: 60, xpMultiplier: 1, bossHp: 5, color: 'text-emerald-600', bgGradient: 'from-emerald-500 to-teal-600' },
  { id: 'normal', label: 'Normal', icon: '⚔️', desc: '7 soal • 45 dtk/soal', questionCount: 7, timePerQuestion: 45, xpMultiplier: 1.5, bossHp: 7, color: 'text-amber-600', bgGradient: 'from-amber-500 to-orange-600' },
  { id: 'sulit', label: 'Sulit', icon: '🔥', desc: '10 soal • 30 dtk/soal', questionCount: 10, timePerQuestion: 30, xpMultiplier: 2, bossHp: 10, color: 'text-red-600', bgGradient: 'from-red-500 to-rose-700' },
];

const QUIZ_TYPES = [
  { id: 'vocabulary', label: 'Kosakata', icon: '📝', desc: 'Tes arti kata', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400' },
  { id: 'kanji', label: 'Kanji', icon: '📖', desc: 'Tes arti kanji', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  { id: 'grammar', label: 'Grammar', icon: '✏️', desc: 'Tata bahasa (AI)', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' },
  { id: 'listening', label: 'Listening', icon: '🎧', desc: 'Mendengarkan (AI)', color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400' },
];

const BOSS_NAMES: Record<Difficulty, { name: string; title: string }> = {
  mudah: { name: 'Slime N5', title: 'Musuh Lemah' },
  normal: { name: 'Tengu N5', title: 'Penjaga Gerbang' },
  sulit: { name: 'Oni N5', title: 'Raja Youkai' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function speakJapanese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.8;
  const voices = window.speechSynthesis.getVoices();
  const jp = voices.find(v => v.lang.startsWith('ja') && v.name.includes('Google'))
    || voices.find(v => v.lang.startsWith('ja'))
    || voices.find(v => v.lang.startsWith('ja'));
  if (jp) u.voice = jp;
  window.speechSynthesis.speak(u);
}

// ─── Question Generators ─────────────────────────────────────────────────────

function generateVocabQuestions(count: number, difficulty: Difficulty): Question[] {
  const pool = difficulty === 'mudah'
    ? VOCABULARY.filter(v => ['Orang', 'Kata Kerja', 'Tempat', 'Barang'].includes(v.category))
    : VOCABULARY;
  const selected = pickRandom(pool, Math.min(count, pool.length));
  const questions: Question[] = [];

  for (const v of selected) {
    const questionVariants = shuffle([
      () => ({
        type: 'vocabulary',
        question: `Apa arti dari kata berikut?`,
        jpText: v.word,
        questionLabel: v.reading,
        options: generateOptions(v.meaning, VOCABULARY.map(x => x.meaning)),
        correct: 0,
        explanation: `"${v.word}" (${v.reading}) artinya "${v.meaning}". ${v.explanation || ''}`,
      }),
      () => {
        const correctWord = v.word;
        const wrongWords = pickRandom(VOCABULARY.filter(x => x.word !== v.word), 3).map(x => x.word);
        const opts = shuffle([...wrongWords, correctWord]);
        return {
          type: 'vocabulary',
          question: `Kata mana yang berarti "${v.meaning}"?`,
          jpText: v.meaning,
          questionLabel: v.reading,
          options: opts,
          correct: opts.indexOf(correctWord),
          explanation: `"${v.word}" (${v.reading}) artinya "${v.meaning}".`,
        };
      },
    ]);

    const variant = questionVariants[0]();
    questions.push(variant);
  }

  return questions;
}

function generateKanjiQuestions(count: number, difficulty: Difficulty): Question[] {
  const pool = difficulty === 'mudah'
    ? KANJI.filter(k => k.strokes && k.strokes <= 5)
    : KANJI;
  const selected = pickRandom(pool, Math.min(count, pool.length));
  const questions: Question[] = [];

  for (const k of selected) {
    const questionVariants = shuffle([
      () => ({
        type: 'kanji',
        question: `Apa arti dari kanji berikut?`,
        jpText: k.character,
        questionLabel: `${k.strokes || '?'} goresan`,
        options: generateOptions(k.meaning, KANJI.map(x => x.meaning)),
        correct: 0,
        explanation: `Kanji "${k.character}" artinya "${k.meaning}". Onyomi: ${k.onyomi}, Kunyomi: ${k.kunyomi}`,
      }),
      () => {
        const onyomiText = k.onyomi.replace(/[()]/g, '').split(',')[0].trim();
        return {
          type: 'kanji',
          question: `Onyomi dari kanji "${k.character}" adalah?`,
          jpText: k.character,
          questionLabel: `Arti: ${k.meaning}`,
          options: generateOptions(onyomiText, KANJI.map(x => x.onyomi.replace(/[()]/g, '').split(',')[0].trim())),
          correct: 0,
          explanation: `Kanji "${k.character}" onyomi-nya "${k.onyomi}", kunyomi "${k.kunyomi}".`,
        };
      },
      () => {
        const correctChar = k.character;
        const wrongChars = pickRandom(KANJI.filter(x => x.character !== k.character), 3).map(x => x.character);
        const opts = shuffle([...wrongChars, correctChar]);
        return {
          type: 'kanji',
          question: `Kanji mana yang berarti "${k.meaning}"?`,
          jpText: k.meaning,
          questionLabel: `Pilih kanji yang tepat`,
          options: opts,
          correct: opts.indexOf(correctChar),
          explanation: `Kanji "${k.character}" artinya "${k.meaning}".`,
        };
      },
    ]);

    const variant = questionVariants[0]();
    questions.push(variant);
  }

  return questions;
}

function generateOptions(correctAnswer: string, pool: string[]): string[] {
  const wrong = shuffle(pool.filter(p => p !== correctAnswer)).slice(0, 3);
  return shuffle([...wrong, correctAnswer]);
}

function generateGrammarFallbackQuestions(count: number): Question[] {
  const selected = pickRandom(GRAMMAR, Math.min(count, GRAMMAR.length));
  return selected.map(g => {
    const wrongOptions = pickRandom(GRAMMAR.filter(x => x.title !== g.title), 3).map(x => x.title);
    const options = shuffle([...wrongOptions, g.title]);
    return {
      type: 'grammar',
      question: `Struktur mana yang digunakan dalam konteks berikut?`,
      jpText: g.structure,
      questionLabel: g.title,
      options,
      correct: options.indexOf(g.title),
      explanation: `${g.structure} — ${g.explanation}`,
    };
  });
}

// ─── Sparkle Component ───────────────────────────────────────────────────────

function SparkleBurst({ active }: { active: boolean }) {
  // When active flips true→false→true, SparkleInner remounts with fresh random particles
  if (!active) return null;
  return <SparkleInner />;
}

function SparkleInner() {
  const particles = React.useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 6,
      delay: Math.random() * 0.3,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-ping"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: '0.6s',
          }}
        >
          <Star className="text-yellow-400 fill-yellow-400" size={p.size} />
        </div>
      ))}
    </div>
  );
}

// ─── Timer Bar Component ─────────────────────────────────────────────────────

function TimerBar({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const pct = (timeLeft / totalTime) * 100;
  const color = pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct > 60 ? 'text-emerald-600' : pct > 30 ? 'text-amber-600' : 'text-red-600';
  const pulseClass = pct <= 15 ? 'animate-pulse' : '';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock size={12} /> Waktu
        </span>
        <span className={cn('font-bold tabular-nums', textColor, pulseClass)}>
          {timeLeft}d
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-linear', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Boss HP Bar ─────────────────────────────────────────────────────────────

function BossHpBar({ currentHp, maxHp }: { currentHp: number; maxHp: number }) {
  const pct = Math.max(0, (currentHp / maxHp) * 100);
  const isCritical = pct <= 20;
  const isLow = pct <= 50;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-rose-600 flex items-center gap-1">
          <Skull size={12} /> Boss HP
        </span>
        <span className={cn('font-bold tabular-nums', isCritical ? 'text-red-600 animate-pulse' : isLow ? 'text-amber-600' : 'text-rose-600')}>
          {currentHp} / {maxHp}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden border border-rose-200 dark:border-rose-800">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out',
            isCritical ? 'bg-gradient-to-r from-red-600 to-red-400' : isLow ? 'bg-gradient-to-r from-amber-600 to-orange-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BossQuiz() {
  // State
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [quizType, setQuizType] = useState('vocabulary');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [bossHp, setBossHp] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const diffConfig = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[1];
  const maxBossHp = diffConfig.bossHp;
  const bossInfo = BOSS_NAMES[difficulty];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef<number>(0);

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Per-question countdown
  useEffect(() => {
    if (phase !== 'playing' || selected !== null || questions.length === 0) return;

    setQuestionTimer(diffConfig.timePerQuestion);
    questionStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => {
        if (prev <= 1) {
          // Time's up - auto wrong
          clearInterval(timerRef.current!);
          setSelected(-1); // -1 = timeout
          setShowExplanation(true);
          const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
          setQuestionTimes(t => [...t, timeTaken]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, current, selected, questions.length, diffConfig.timePerQuestion]);

  // Calculate XP
  const calculateXP = useCallback((scoreVal: number, total: number, diff: DifficultyConfig) => {
    const baseXP = scoreVal * 10;
    const timeBonus = Math.max(0, Math.round((total - totalTime) * 0.5));
    const accuracyPct = scoreVal / total;
    const gradeBonus = accuracyPct >= 1 ? 50 : accuracyPct >= 0.8 ? 30 : accuracyPct >= 0.6 ? 15 : 0;
    return Math.round((baseXP + timeBonus + gradeBonus) * diff.xpMultiplier);
  }, [totalTime]);

  // Start Quiz
  const startQuiz = async () => {
    setLoading(true);

    try {
      let generated: Question[] = [];

      if (quizType === 'vocabulary') {
        generated = generateVocabQuestions(diffConfig.questionCount, difficulty);
      } else if (quizType === 'kanji') {
        generated = generateKanjiQuestions(diffConfig.questionCount, difficulty);
      } else {
        // Grammar/Listening via API
        try {
          const res = await fetch('/api/quiz/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: quizType, count: diffConfig.questionCount }),
          });
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            generated = data.questions.map((q: Record<string, unknown>) => ({
              type: String(q.type),
              question: String(q.question),
              options: q.options as string[],
              correct: Number(q.correct),
              explanation: String(q.explanation),
            }));
          }
        } catch {
          // API failed, use grammar fallback
        }

        if (generated.length === 0) {
          generated = generateGrammarFallbackQuestions(diffConfig.questionCount);
        }
      }

      if (generated.length > 0) {
        setQuestions(generated);
        setBossHp(maxBossHp);
        setScore(0);
        setCurrent(0);
        setSelected(null);
        setShowExplanation(false);
        setTotalTime(0);
        setQuestionTimes([]);
        setXpEarned(0);
        setPhase('vs');
        // Show VS screen for 2 seconds then start
        setTimeout(() => setPhase('playing'), 2000);
      }
    } catch (err) {
      console.error('Quiz start error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle answer
  const handleAnswer = (idx: number) => {
    if (selected !== null || phase !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
    setQuestionTimes(t => [...t, timeTaken]);

    setSelected(idx);
    setShowExplanation(true);

    if (idx === questions[current].correct) {
      setScore(s => s + 1);
      setBossHp(h => Math.max(0, h - 1));
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
      setTotalTime(t => t + timeTaken);
    } else {
      setTotalTime(t => t + diffConfig.timePerQuestion); // penalty: count full time
    }
  };

  // Handle timeout (selected = -1)
  useEffect(() => {
    if (selected === -1) {
      setTotalTime(t => t + diffConfig.timePerQuestion);
    }
  }, [selected, diffConfig.timePerQuestion]);

  // Next question
  const handleNext = () => {
    if (current + 1 >= questions.length) {
      // Calculate final XP
      const finalXP = calculateXP(score, questions.length, diffConfig);
      setXpEarned(finalXP);
      setPhase('results');
      // Save XP to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('gemu-quiz-xp') || '0');
        localStorage.setItem('gemu-quiz-xp', String(stored + finalXP));
      } catch { /* ignore */ }
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  // Speak for listening questions
  const handleSpeak = (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    speakJapanese(text);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  // Reset
  const resetQuiz = () => {
    setPhase('setup');
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setBossHp(0);
    setSelected(null);
    setShowExplanation(false);
    setTotalTime(0);
    setQuestionTimes([]);
    setXpEarned(0);
  };

  // Share results
  const shareResults = () => {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 50 ? 'B' : 'C';
    const avgTime = questionTimes.length > 0 ? (questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length).toFixed(1) : '0';
    const diffLabel = diffConfig.label;
    const typeLabel = QUIZ_TYPES.find(t => t.id === quizType)?.label || quizType;
    const text = `⚔️ Gemu Nihongo Boss Quiz!\n📋 ${typeLabel} | ${diffLabel}\n🏆 Grade: ${grade}\n📊 ${score}/${questions.length} (${pct}%)\n⏱️ Avg: ${avgTime}s/soal\n✨ ${xpEarned} XP\n\n#GemuNihongo #JLPTN5`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
    });
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────

  // Setup Phase
  if (phase === 'setup' && questions.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gamepad2 className="text-red-600" size={22} /> Boss Quiz
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Tantang dirimu dengan kuis bos!</p>
        </div>

        {/* Boss Battle Card */}
        <Card className="border-0 bg-gradient-to-br from-red-600 via-rose-600 to-orange-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-4 text-8xl">👹</div>
            <div className="absolute bottom-0 left-2 text-6xl">⚔️</div>
          </div>
          <CardContent className="p-6 text-center relative z-10">
            <div className="text-5xl mb-3 animate-bounce">⚔️</div>
            <h3 className="text-2xl font-black tracking-tight">Boss Battle!</h3>
            <p className="text-rose-100 text-sm mt-2 max-w-xs mx-auto">
              Jawab pertanyaan untuk mengalahkan Boss dan dapatkan XP!
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-rose-200">
              <span className="flex items-center gap-1"><Shield size={12} /> Boss HP</span>
              <span className="flex items-center gap-1"><Target size={12} /> Per Question Timer</span>
              <span className="flex items-center gap-1"><Star size={12} /> XP Rewards</span>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Selection */}
        <div>
          <p className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Flame size={14} className="text-orange-500" /> Tingkat Kesulitan
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={cn(
                  'rounded-xl border-2 p-3 text-center transition-all duration-200',
                  difficulty === d.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-md scale-[1.02]'
                    : 'border-transparent bg-card hover:border-muted hover:shadow-sm'
                )}
              >
                <div className="text-2xl mb-1">{d.icon}</div>
                <p className={cn('font-bold text-sm', difficulty === d.id ? 'text-orange-700 dark:text-orange-400' : '')}>{d.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</p>
                {difficulty === d.id && (
                  <Badge className="mt-1.5 text-[9px] px-1.5 py-0 bg-orange-500 text-white border-0">
                    ×{d.xpMultiplier} XP
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Type Selection */}
        <div>
          <p className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Gamepad2 size={14} className="text-red-500" /> Pilih Tipe Kuis
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUIZ_TYPES.map(t => (
              <Card
                key={t.id}
                className={cn(
                  'cursor-pointer hover:shadow-md transition-all border-2 overflow-hidden',
                  quizType === t.id ? 'border-teal-500 shadow-md' : 'border-transparent'
                )}
                onClick={() => setQuizType(t.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <p className="font-bold text-sm">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  {quizType === t.id && (
                    <Badge className="mt-1.5 text-[9px] px-1.5 py-0 bg-teal-500 text-white border-0">
                      Dipilih
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Boss Preview */}
        <Card className="border border-dashed border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn(
              'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-lg',
              diffConfig.bgGradient
            )}>
              {difficulty === 'mudah' ? '🟢' : difficulty === 'normal' ? '🟠' : '🔴'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{bossInfo.name}</p>
              <p className="text-xs text-muted-foreground">{bossInfo.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] px-1.5">{diffConfig.questionCount} soal</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5">{diffConfig.timePerQuestion}s/soal</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 text-orange-600">HP {maxBossHp}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          className={cn('w-full text-white py-6 text-lg font-black shadow-lg border-0 bg-gradient-to-r', diffConfig.bgGradient)}
          onClick={startQuiz}
          disabled={loading}
        >
          {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Swords size={20} className="mr-2" />}
          {loading ? 'Mempersiapkan...' : 'Mulai Boss Battle!'}
        </Button>
      </div>
    );
  }

  // VS Transition Phase
  if (phase === 'vs') {
    const quizLabel = QUIZ_TYPES.find(t => t.id === quizType)?.label || '';
    const isListening = quizType === 'listening';
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            {/* Player side */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-4xl shadow-xl mx-auto">
                  🧑‍🎓
                </div>
                <p className="text-xs font-bold mt-2 text-teal-600">Kamu</p>
              </div>

              {/* VS */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl animate-pulse">
                  <span className="text-xl font-black text-white">VS</span>
                </div>
              </div>

              {/* Boss side */}
              <div className="text-center">
                <div className={cn(
                  'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl shadow-xl mx-auto',
                  diffConfig.bgGradient
                )}>
                  {difficulty === 'mudah' ? '👾' : difficulty === 'normal' ? '👹' : '👿'}
                </div>
                <p className="text-xs font-bold mt-2 text-rose-600">{bossInfo.name}</p>
              </div>
            </div>
          </div>

          <div>
            <Badge className="bg-muted text-foreground text-xs">{quizLabel}</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              {questions.length} pertanyaan • {diffConfig.timePerQuestion}d per soal
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <p className="text-lg font-black animate-pulse">
            {isListening ? 'Dengarkan baik-baik!' : 'Bersiap!'}
          </p>
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results') {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 50 ? 'B' : 'C';
    const gradeGradient = grade === 'S'
      ? 'from-yellow-400 via-amber-400 to-orange-400'
      : grade === 'A'
        ? 'from-teal-400 to-emerald-500'
        : grade === 'B'
          ? 'from-amber-400 to-yellow-500'
          : 'from-rose-400 to-red-500';

    const wrongQuestions = questions.filter((q) => q.userAnswer !== q.correct);
    const avgTime = questionTimes.length > 0
      ? (questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length).toFixed(1)
      : '0';

    const isBossDefeated = bossHp <= 0;

    return (
      <div className="space-y-4">
        {/* Result Card */}
        <Card className="border-0 overflow-hidden">
          <div className={cn('bg-gradient-to-br text-white p-6 text-center relative', gradeGradient)}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-8 text-7xl">{isBossDefeated ? '🏆' : '💀'}</div>
              <div className="absolute bottom-4 left-4 text-5xl">{grade === 'S' ? '⭐' : '✨'}</div>
            </div>
            <div className="relative z-10 space-y-3">
              <Trophy size={40} className="mx-auto" />
              <h2 className="text-2xl font-black">
                {isBossDefeated ? 'Boss Defeated!' : 'Boss Menang...'}
              </h2>
              <div className={cn(
                'text-7xl font-black drop-shadow-lg animate-in zoom-in-50 duration-700',
                grade === 'S' ? 'text-yellow-200' : 'text-white'
              )}>
                {grade}
              </div>
              <p className="text-white/80 text-sm">
                {grade === 'S' ? 'SEMPURNA! Luar biasa!' : grade === 'A' ? 'Hebat! Hampir sempurna!' : grade === 'B' ? 'Bagus! Terus berlatih!' : 'Jangan menyerah! Coba lagi!'}
              </p>
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* XP Earned */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl p-3 flex items-center gap-3 border border-amber-200 dark:border-amber-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-amber-700 dark:text-amber-400">+{xpEarned} XP</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500">
                  {diffConfig.label} • {QUIZ_TYPES.find(t => t.id === quizType)?.label}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card rounded-xl p-3 border text-center">
                <p className="text-lg font-black text-emerald-600">{score}/{questions.length}</p>
                <p className="text-[10px] text-muted-foreground">Benar</p>
              </div>
              <div className="bg-card rounded-xl p-3 border text-center">
                <p className="text-lg font-black">{pct}%</p>
                <p className="text-[10px] text-muted-foreground">Akurasi</p>
              </div>
              <div className="bg-card rounded-xl p-3 border text-center">
                <p className="text-lg font-black">{formatTime(totalTime)}</p>
                <p className="text-[10px] text-muted-foreground">Total Waktu</p>
              </div>
              <div className="bg-card rounded-xl p-3 border text-center">
                <p className="text-lg font-black">{avgTime}s</p>
                <p className="text-[10px] text-muted-foreground">Rata-rata/Soal</p>
              </div>
            </div>

            {/* Boss Result */}
            <div className="bg-card rounded-xl p-3 border flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl',
                diffConfig.bgGradient
              )}>
                {isBossDefeated ? '👻' : '👹'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{bossInfo.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isBossDefeated ? `Boss dikalahkan! Sisa HP: 0` : `Boss masih hidup! Sisa HP: ${bossHp}`}
                </p>
              </div>
              <Badge className={cn('text-xs', isBossDefeated ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
                {isBossDefeated ? 'Menang' : 'Kalah'}
              </Badge>
            </div>

            {/* Share Button */}
            <Button variant="outline" className="w-full" onClick={shareResults}>
              <Share2 size={14} className="mr-2" />
              {copied ? '✅ Tersalin!' : 'Bagikan Hasil'}
            </Button>

            {/* Wrong Questions Review */}
            {wrongQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <XCircle size={12} className="text-rose-500" /> Jawaban Salah ({wrongQuestions.length})
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {wrongQuestions.map((q, i) => {
                    const idx = questions.indexOf(q);
                    const isTimeout = q.userAnswer === -1;
                    return (
                      <div key={i} className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-3 border border-rose-100 dark:border-rose-900 text-xs space-y-1.5">
                        <p className="font-medium text-rose-700 dark:text-rose-400">
                          {idx + 1}. {q.question}
                        </p>
                        {q.jpText && (
                          <p className="font-bold text-base font-jp">
                            {q.jpText}
                          </p>
                        )}
                        <div className="flex items-start gap-2">
                          <div className="text-rose-500">
                            <p>Jawabanmu: {isTimeout ? '⏰ Waktu habis' : q.options[q.userAnswer!]}</p>
                          </div>
                        </div>
                        <div className="text-emerald-600">
                          <p>Jawaban benar: {q.options[q.correct]}</p>
                        </div>
                        <p className="text-muted-foreground">{q.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={resetQuiz} variant="outline">
                <RotateCcw size={14} className="mr-1.5" /> Menu
              </Button>
              <Button className={cn('flex-1 text-white border-0 bg-gradient-to-r', diffConfig.bgGradient)} onClick={() => { resetQuiz(); setTimeout(startQuiz, 100); }}>
                <Zap size={14} className="mr-1.5" /> Main Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing Phase
  const q = questions[current];
  const isAnswered = selected !== null;

  // Store user answer in the question object for results review
  if (isAnswered && q.userAnswer === undefined) {
    q.userAnswer = selected;
  }

  return (
    <div className="space-y-3">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {current + 1} / {questions.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {diffConfig.label}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-orange-600">
            <Star size={10} className="mr-0.5" /> +{Math.round(10 * diffConfig.xpMultiplier)} XP
          </Badge>
        </div>
        <Badge variant="outline" className="text-xs text-emerald-600 flex items-center gap-1">
          <Zap size={12} /> {score}
        </Badge>
      </div>

      {/* Progress */}
      <Progress value={((current + (isAnswered ? 1 : 0)) / questions.length) * 100} className="h-1.5" />

      {/* Boss HP Bar */}
      <BossHpBar currentHp={bossHp} maxHp={maxBossHp} />

      {/* Timer */}
      <TimerBar timeLeft={questionTimer} totalTime={diffConfig.timePerQuestion} />

      {/* Question Card */}
      <Card className="relative overflow-hidden">
        <SparkleBurst active={showSparkle} />
        <CardContent className="p-5 space-y-4 relative z-10">
          {/* Question type & label */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="capitalize text-xs">{q.type}</Badge>
            {q.type === 'listening' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSpeak(q.jpText || q.question)}
                disabled={isSpeaking}
              >
                <Volume2 size={14} className={cn('mr-1', isSpeaking && 'animate-pulse')} />
                {isSpeaking ? 'Memutar...' : 'Putar'}
              </Button>
            )}
          </div>

          {/* Japanese text (prominent) */}
          {q.jpText && (
            <div className="text-center py-3">
              <p className="text-3xl font-black tracking-wide font-jp">
                {q.jpText}
              </p>
              {q.questionLabel && (
                <p className="text-xs text-muted-foreground mt-1">{q.questionLabel}</p>
              )}
            </div>
          )}

          {/* Question text */}
          <h3 className="text-base font-bold text-center">{q.question}</h3>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const correctIdx = q.correct;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium relative overflow-hidden',
                    !isAnswered && 'hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 active:scale-[0.98]',
                    isAnswered && i === correctIdx && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                    isAnswered && isSelected && i !== correctIdx && 'border-rose-500 bg-rose-50 dark:bg-rose-950/30',
                    isAnswered && !isSelected && i !== correctIdx && 'opacity-40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold',
                      !isAnswered && 'bg-muted',
                      isAnswered && i === correctIdx && 'bg-emerald-500 text-white',
                      isAnswered && isSelected && i !== correctIdx && 'bg-rose-500 text-white',
                      isAnswered && !isSelected && i !== correctIdx && 'bg-muted text-muted-foreground',
                    )}>
                      {isAnswered && i === correctIdx ? <CheckCircle size={16} /> :
                        isAnswered && isSelected && i !== correctIdx ? <XCircle size={16} /> :
                          String.fromCharCode(65 + i)}
                    </span>
                    <span className={cn(
                      'flex-1',
                      isAnswered && i === correctIdx && 'font-bold text-emerald-700 dark:text-emerald-400',
                      isAnswered && isSelected && i !== correctIdx && 'text-rose-700 dark:text-rose-400 line-through',
                    )}>
                      {opt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className={cn(
              'rounded-xl p-3 text-sm animate-in slide-in-from-bottom-2 duration-300',
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800'
            )}>
              <p className="font-bold mb-1">
                {isCorrect ? '✅ Benar!' : isTimeout ? '⏰ Waktu habis!' : '❌ Salah!'}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <Button className="w-full" onClick={handleNext}>
              {current + 1 >= questions.length ? (
                <><Trophy size={16} className="mr-1.5" /> Lihat Hasil</>
              ) : (
                <><ChevronRight size={16} className="mr-1.5" /> Selanjutnya</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
