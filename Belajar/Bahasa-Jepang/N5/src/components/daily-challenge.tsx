'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Flame, Clock, Trophy, Volume2, Zap,
  Target, Eye, Shuffle, ChevronRight, Share2, Star,
  Lock, RotateCcw, Sparkles, CheckCircle2, XCircle, Timer
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { VOCABULARY, KANJI, GRAMMAR, speakJapanese } from '@/lib/n5-constants';

// ── Daily Challenge Component ────────────────────────────────
// ── Types ────────────────────────────────────────────────────
type ChallengeType = 'hidden-word' | 'kanji-detective' | 'scrambled' | 'speed-round' | 'particle-pass';
type Phase = 'start' | 'playing' | 'results';

interface ChallengeInfo {
  id: ChallengeType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

interface Question {
  prompt: string;
  promptJa?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface DailyState {
  correct: number;
  wrong: number;
  answers: { question: Question; selected: number; isCorrect: boolean }[];
  startTime: number;
  endTime?: number;
  speedTimer?: number;
  speedQuestionsLeft?: number;
  currentQuestionIndex: number;
  phase: Phase;
  selectedOption: number | null;
  showFeedback: boolean;
  feedbackCorrect: boolean;
}

// ── Constants ────────────────────────────────────────────────
const TOTAL_QUESTIONS = 5;
const SPEED_TIME_LIMIT = 30;
const FEEDBACK_DELAY = 1500;

const CHALLENGE_TYPES: ChallengeInfo[] = [
  {
    id: 'hidden-word',
    name: 'Kata Tersembunyi',
    description: 'Temukan kata dengan arti yang salah!',
    icon: Eye,
    color: 'text-rose-500',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-orange-500',
  },
  {
    id: 'kanji-detective',
    name: 'Kanji Detective',
    description: 'Tebak bacaan kanji yang benar!',
    icon: Target,
    color: 'text-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-500',
  },
  {
    id: 'scrambled',
    name: 'Kalimat Acak',
    description: 'Susun kata menjadi kalimat yang benar!',
    icon: Shuffle,
    color: 'text-teal-500',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-emerald-500',
  },
  {
    id: 'speed-round',
    name: 'Cepat Tepat',
    description: 'Jawab 5 pertanyaan dalam 30 detik!',
    icon: Zap,
    color: 'text-orange-500',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
  },
  {
    id: 'particle-pass',
    name: 'Partikel Pas',
    description: 'Isi partikel yang tepat dalam kalimat!',
    icon: Sparkles,
    color: 'text-emerald-500',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-500',
  },
];

// ── Helpers ──────────────────────────────────────────────────
function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seededRandomInt(seed: number, min: number, max: number): number {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = seededRandomInt(seed + i, 0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getTimeUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes} menit ${seconds} detik`;
  return `${seconds} detik`;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} jam ${minutes} menit`;
  if (minutes > 0) return `${minutes} menit ${seconds} detik`;
  return `${seconds} detik`;
}

function getGrade(score: number, total: number): { grade: string; label: string; gradient: string } {
  const pct = score / total;
  if (pct >= 1) return { grade: 'S', label: 'Sempurna!', gradient: 'from-amber-400 to-yellow-300' };
  if (pct >= 0.8) return { grade: 'A', label: 'Hebat!', gradient: 'from-emerald-500 to-teal-400' };
  if (pct >= 0.6) return { grade: 'B', label: 'Bagus!', gradient: 'from-sky-500 to-cyan-400' };
  return { grade: 'C', label: 'Terus Berlatih!', gradient: 'from-rose-400 to-pink-400' };
}

// ── localStorage helpers ─────────────────────────────────────
function getDailyCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('gemu-daily-completed') || '[]'); } catch { return []; }
}

function getDailyStreak(): number {
  const completed = getDailyCompleted();
  if (!completed.length) return 0;
  const sorted = [...completed].sort().reverse();
  const today = getTodayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().split('T')[0];

  let streak = 0;
  if (sorted[0] === today) streak = 1;
  else if (sorted[0] === yesterdayISO) streak = 1;
  else return 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

function saveDailyCompletion(score: number, total: number) {
  const completed = getDailyCompleted();
  const today = getTodayISO();
  if (!completed.includes(today)) {
    completed.push(today);
    localStorage.setItem('gemu-daily-completed', JSON.stringify(completed));
  }
  // Save best score
  const bestKey = `${score}/${total}`;
  const currentBest = localStorage.getItem('gemu-daily-best') || '';
  const currentPct = currentBest ? parseInt(currentBest.split('/')[0]) / parseInt(currentBest.split('/')[1]) : 0;
  const newPct = score / total;
  if (newPct > currentPct) {
    localStorage.setItem('gemu-daily-best', bestKey);
  }
  // Save XP
  const baseXP = 50;
  const accuracyBonus = Math.round((score / total) * 50);
  const totalXP = baseXP + accuracyBonus;
  const prevXP = parseInt(localStorage.getItem('gemu-daily-xp') || '0');
  localStorage.setItem('gemu-daily-xp', String(prevXP + totalXP));
  // Also add to quiz XP
  const prevQuizXP = parseInt(localStorage.getItem('gemu-quiz-xp') || '0');
  localStorage.setItem('gemu-quiz-xp', String(prevQuizXP + totalXP));
}

function isTodayCompleted(): boolean {
  return getDailyCompleted().includes(getTodayISO());
}

// ── Question Generation ──────────────────────────────────────
function generateHiddenWordQuestions(seed: number): Question[] {
  const questions: Question[] = [];
  const shuffled = shuffleWithSeed(VOCABULARY, seed);

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const qSeed = seed + i * 137;
    const correctWord = shuffled[i % shuffled.length];
    // Pick 3 other words for options
    const others = VOCABULARY.filter(v => v.word !== correctWord.word);
    const shuffledOthers = shuffleWithSeed(others, qSeed + 1);
    const wrongMeaningSource = shuffledOthers[0];

    // Create a fake word that looks like the correct one but has wrong meaning
    const fakeEntry = {
      word: correctWord.word,
      reading: correctWord.reading,
      meaning: wrongMeaningSource.meaning,
    };

    // Build 4 options: correct + 3 wrong (one of which is the fake)
    const wrongEntries = shuffledOthers.slice(0, 3);
    const allOptions = [
      { word: correctWord.word, meaning: correctWord.meaning },
      { word: fakeEntry.word, meaning: fakeEntry.meaning },
      ...wrongEntries.slice(1, 3).map(w => ({ word: w.word, meaning: w.meaning })),
    ];

    // For this question type, show 4 words with meanings. The wrong one is fakeEntry.
    // We present: "Mana yang artinya SALAH?"
    const displayOptions = allOptions.map(o => `${o.word} — ${o.meaning}`);
    const correctIdx = 1; // fakeEntry is at index 1

    questions.push({
      prompt: 'Kata mana yang artinya SALAH?',
      options: shuffleWithSeed(displayOptions, qSeed + 2),
      correctIndex: -1, // Will recalculate after shuffle
      explanation: `"${correctWord.word}" artinya "${correctWord.meaning}", bukan "${wrongMeaningSource.meaning}"`,
    });

    // Recalculate correct index after shuffle
    const fakeOption = `${fakeEntry.word} — ${fakeEntry.meaning}`;
    questions[i].correctIndex = questions[i].options.indexOf(fakeOption);
  }

  return questions;
}

function generateKanjiQuestions(seed: number): Question[] {
  const questions: Question[] = [];
  const shuffled = shuffleWithSeed(KANJI, seed);

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const qSeed = seed + i * 251;
    const kanji = shuffled[i % shuffled.length];
    const others = KANJI.filter(k => k.character !== kanji.character);
    const shuffledOthers = shuffleWithSeed(others, qSeed + 1);

    // Generate reading question variants
    const variant = seededRandomInt(qSeed, 0, 2);
    let prompt: string;
    let correctAnswer: string;
    let wrongAnswers: string[];

    if (variant === 0) {
      // Onyomi reading
      prompt = `Bacaan Onyomi dari ${kanji.character} adalah...`;
      correctAnswer = kanji.onyomi;
      wrongAnswers = shuffledOthers.slice(0, 3).map(k => k.onyomi);
    } else if (variant === 1) {
      // Meaning question
      prompt = `Apa arti dari kanji ${kanji.character}?`;
      correctAnswer = kanji.meaning;
      wrongAnswers = shuffledOthers.slice(0, 3).map(k => k.meaning);
    } else {
      // Kunyomi reading
      prompt = `Bacaan Kunyomi dari ${kanji.character} adalah...`;
      correctAnswer = kanji.kunyomi;
      wrongAnswers = shuffledOthers.slice(0, 3).map(k => k.kunyomi);
    }

    const allOptions = [correctAnswer, ...wrongAnswers];
    const shuffledOptions = shuffleWithSeed(allOptions, qSeed + 2);

    questions.push({
      prompt,
      promptJa: kanji.character,
      options: shuffledOptions,
      correctIndex: shuffledOptions.indexOf(correctAnswer),
      explanation: `${kanji.character}: ${kanji.meaning} | On: ${kanji.onyomi} | Kun: ${kanji.kunyomi}`,
    });
  }

  return questions;
}

function generateScrambledQuestions(seed: number): Question[] {
  const questions: Question[] = [];
  // Use grammar examples for sentence data
  const grammarExamples = GRAMMAR.flatMap(g =>
    g.examples.map(e => ({ ja: e.ja, en: e.en }))
  );

  const shuffledExamples = shuffleWithSeed(grammarExamples, seed);

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const qSeed = seed + i * 397;
    const example = shuffledExamples[i % shuffledExamples.length];

    // Split sentence into words (remove punctuation first)
    const cleanJa = example.ja.replace(/[。、!?]/g, '').trim();
    const words = cleanJa.split(/\s+/).filter(w => w.length > 0);

    if (words.length < 2) continue;

    // Shuffle the words to create wrong options
    const shuffledWords = shuffleWithSeed(words, qSeed + 1);
    // Make sure shuffled is different from original
    const isOriginal = shuffledWords.every((w, idx) => w === words[idx]);

    // Create options: correct order + shuffled variants
    const options: string[] = [];
    options.push(words.join(' '));
    options.push(shuffledWords.join(' '));

    // Generate more variants if needed
    for (let v = 2; v < 4; v++) {
      const variant = shuffleWithSeed(words, qSeed + v + 10);
      options.push(variant.join(' '));
    }

    // Remove duplicates
    const uniqueOptions = [...new Set(options)];
    while (uniqueOptions.length < 4 && uniqueOptions.length < words.length + 1) {
      const extra = shuffleWithSeed(words, qSeed + uniqueOptions.length * 17);
      const joined = extra.join(' ');
      if (!uniqueOptions.includes(joined)) uniqueOptions.push(joined);
    }

    // Shuffle options and track correct
    const finalOptions = shuffleWithSeed(uniqueOptions.slice(0, 4), qSeed + 50);
    const correctOrder = words.join(' ');

    questions.push({
      prompt: `Susun kata menjadi kalimat yang benar:\n"${example.en}"`,
      promptJa: cleanJa,
      options: finalOptions,
      correctIndex: finalOptions.indexOf(correctOrder),
      explanation: `Kalimat yang benar: ${words.join(' ')} (${example.en})`,
    });
  }

  // Pad if needed
  while (questions.length < TOTAL_QUESTIONS) {
    const qSeed = seed + questions.length * 397 + 9999;
    const example = grammarExamples[seededRandomInt(qSeed, 0, grammarExamples.length - 1)];
    const cleanJa = example.ja.replace(/[。、!?]/g, '').trim();
    const words = cleanJa.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      questions.push({
        prompt: `Susun kata menjadi kalimat yang benar:\n"${example.en}"`,
        promptJa: cleanJa,
        options: [words.join(' ')],
        correctIndex: 0,
        explanation: `Kalimat yang benar: ${words.join(' ')} (${example.en})`,
      });
    }
  }

  return questions.slice(0, TOTAL_QUESTIONS);
}

function generateSpeedRoundQuestions(seed: number): Question[] {
  const questions: Question[] = [];
  const shuffledVocab = shuffleWithSeed(VOCABULARY, seed);
  const shuffledKanji = shuffleWithSeed(KANJI, seed + 500);

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const qSeed = seed + i * 173;

    if (i < 3) {
      // Vocabulary questions
      const vocab = shuffledVocab[i % shuffledVocab.length];
      const others = VOCABULARY.filter(v => v.word !== vocab.word);
      const shuffledOthers = shuffleWithSeed(others, qSeed + 1);
      const variant = seededRandomInt(qSeed, 0, 1);

      let prompt: string;
      let correctAnswer: string;
      let wrongAnswers: string[];

      if (variant === 0) {
        prompt = `Apa arti "${vocab.word}"?`;
        correctAnswer = vocab.meaning;
        wrongAnswers = shuffledOthers.slice(0, 3).map(v => v.meaning);
      } else {
        prompt = `Kata mana yang berarti "${vocab.meaning}"?`;
        correctAnswer = vocab.word;
        wrongAnswers = shuffledOthers.slice(0, 3).map(v => v.word);
      }

      const allOptions = [correctAnswer, ...wrongAnswers];
      const shuffledOptions = shuffleWithSeed(allOptions, qSeed + 2);

      questions.push({
        prompt,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(correctAnswer),
        promptJa: variant === 0 ? vocab.word : undefined,
      });
    } else {
      // Kanji questions
      const kanji = shuffledKanji[(i - 3) % shuffledKanji.length];
      const others = KANJI.filter(k => k.character !== kanji.character);
      const shuffledOthers = shuffleWithSeed(others, qSeed + 1);

      const prompt = `Apa arti kanji ${kanji.character}?`;
      const correctAnswer = kanji.meaning;
      const wrongAnswers = shuffledOthers.slice(0, 3).map(k => k.meaning);
      const allOptions = [correctAnswer, ...wrongAnswers];
      const shuffledOptions = shuffleWithSeed(allOptions, qSeed + 2);

      questions.push({
        prompt,
        promptJa: kanji.character,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(correctAnswer),
      });
    }
  }

  return questions;
}

function generateParticleQuestions(seed: number): Question[] {
  const questions: Question[] = [];
  const particleData: { particle: string; usage: string; examples: { ja: string; en: string }[] }[] = [
    { particle: 'は', usage: 'Topik kalimat', examples: GRAMMAR.filter(g => g.title.includes('は')).flatMap(g => g.examples) },
    { particle: 'が', usage: 'Subjek / Keberadaan', examples: GRAMMAR.filter(g => g.title.includes('が')).flatMap(g => g.examples) },
    { particle: 'を', usage: 'Objek langsung', examples: GRAMMAR.filter(g => g.title.includes('を')).flatMap(g => g.examples) },
    { particle: 'に', usage: 'Tujuan / Waktu', examples: GRAMMAR.filter(g => g.title.includes('に')).flatMap(g => g.examples) },
    { particle: 'へ', usage: 'Arah tujuan', examples: GRAMMAR.filter(g => g.title.includes('へ')).flatMap(g => g.examples) },
    { particle: 'の', usage: 'Kepemilikan', examples: GRAMMAR.filter(g => g.title.includes('の')).flatMap(g => g.examples) },
    { particle: 'も', usage: 'Juga', examples: GRAMMAR.filter(g => g.title.includes('も')).flatMap(g => g.examples) },
  ];

  const shuffledParticleData = shuffleWithSeed(particleData, seed);
  const allParticles = particleData.map(p => p.particle);

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const qSeed = seed + i * 311;
    const pData = shuffledParticleData[i % shuffledParticleData.length];
    const example = pData.examples.length > 0
      ? pData.examples[seededRandomInt(qSeed, 0, pData.examples.length - 1)]
      : { ja: `わたし___がくせいです。`, en: 'Saya adalah mahasiswa.' };

    // Replace the particle with blank
    const blankJa = example.ja.replace(pData.particle, '___');

    // Get wrong particles
    const wrongParticles = allParticles.filter(p => p !== pData.particle);
    const shuffledWrong = shuffleWithSeed(wrongParticles, qSeed + 1);
    const options = [pData.particle, ...shuffledWrong.slice(0, 3)];
    const shuffledOptions = shuffleWithSeed(options, qSeed + 2);

    questions.push({
      prompt: `Isi partikel yang tepat:\n${blankJa}\n(${example.en})`,
      options: shuffledOptions,
      correctIndex: shuffledOptions.indexOf(pData.particle),
      promptJa: blankJa,
      explanation: `Jawaban: "${pData.particle}" — ${pData.usage}`,
    });
  }

  return questions;
}

function generateQuestions(type: ChallengeType, seed: number): Question[] {
  switch (type) {
    case 'hidden-word': return generateHiddenWordQuestions(seed);
    case 'kanji-detective': return generateKanjiQuestions(seed);
    case 'scrambled': return generateScrambledQuestions(seed);
    case 'speed-round': return generateSpeedRoundQuestions(seed);
    case 'particle-pass': return generateParticleQuestions(seed);
    default: return generateSpeedRoundQuestions(seed);
  }
}

// ── Indonesian date formatting ───────────────────────────────
function formatDateID(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ── Main Component ───────────────────────────────────────────
export default function DailyChallenge() {
  const [dailyState, setDailyState] = useState<DailyState>({
    correct: 0,
    wrong: 0,
    answers: [],
    startTime: 0,
    endTime: undefined,
    speedTimer: SPEED_TIME_LIMIT,
    speedQuestionsLeft: TOTAL_QUESTIONS,
    currentQuestionIndex: 0,
    phase: 'start',
    selectedOption: null,
    showFeedback: false,
    feedbackCorrect: false,
  });
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sparkleIdRef = useRef(0);

  // Compute daily challenge type
  const { challengeType, challengeInfo, challengeNumber, questions } = useMemo(() => {
    const seed = getDailySeed();
    const dayOfYear = getDayOfYear();
    const typeIndex = dayOfYear % 5;
    const type: ChallengeType = CHALLENGE_TYPES[typeIndex].id;
    const info = CHALLENGE_TYPES[typeIndex];
    const qs = generateQuestions(type, seed);
    return { challengeType: type, challengeInfo: info, challengeNumber: dayOfYear, questions: qs };
  }, []);

  const streak = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    return getDailyStreak();
  }, [dailyState.phase]);
  const completed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return isTodayCompleted();
  }, [dailyState.phase]);

  // Countdown to midnight
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time timer
  useEffect(() => {
    if (dailyState.phase !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const start = dailyState.startTime;
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - start);
    }, 200);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dailyState.phase, dailyState.startTime]);

  // Speed round countdown
  useEffect(() => {
    if (challengeType !== 'speed-round' || dailyState.phase !== 'playing') return;

    const interval = setInterval(() => {
      setDailyState(prev => {
        const newTimer = prev.speedTimer ? prev.speedTimer - 1 : 0;
        if (newTimer <= 0) {
          return { ...prev, endTime: Date.now(), phase: 'results' };
        }
        return { ...prev, speedTimer: newTimer };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challengeType, dailyState.phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const triggerSparkles = useCallback(() => {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: sparkleIdRef.current++,
      x: (seededRandom(Date.now() + i) - 0.5) * 200,
      y: (seededRandom(Date.now() + i + 100) - 0.5) * 150,
    }));
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 800);
  }, []);

  const handleStart = useCallback(() => {
    setDailyState({
      correct: 0,
      wrong: 0,
      answers: [],
      startTime: Date.now(),
      endTime: undefined,
      speedTimer: challengeType === 'speed-round' ? SPEED_TIME_LIMIT : undefined,
      speedQuestionsLeft: TOTAL_QUESTIONS,
      currentQuestionIndex: 0,
      phase: 'playing',
      selectedOption: null,
      showFeedback: false,
      feedbackCorrect: false,
    });
    setElapsedTime(0);
  }, [challengeType]);

  const handleSelectOption = useCallback((optionIndex: number) => {
    if (dailyState.showFeedback) return;

    const currentQuestion = questions[dailyState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    // Speak Japanese if available
    if (currentQuestion.promptJa) {
      speakJapanese(currentQuestion.promptJa);
    }

    setDailyState(prev => ({
      ...prev,
      selectedOption: optionIndex,
      showFeedback: true,
      feedbackCorrect: isCorrect,
    }));

    if (!isCorrect) {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    } else {
      triggerSparkles();
    }

    // Auto-advance after delay
    feedbackTimerRef.current = setTimeout(() => {
      setDailyState(prev => {
        const newAnswers = [...prev.answers, {
          question: currentQuestion,
          selected: optionIndex,
          isCorrect,
        }];

        const nextIndex = prev.currentQuestionIndex + 1;
        const allDone = nextIndex >= TOTAL_QUESTIONS;

        if (allDone) {
          // Save results
          const finalCorrect = isCorrect ? prev.correct + 1 : prev.correct;
          const finalWrong = isCorrect ? prev.wrong : prev.wrong + 1;
          saveDailyCompletion(finalCorrect, TOTAL_QUESTIONS);
          return {
            ...prev,
            answers: newAnswers,
            correct: finalCorrect,
            wrong: finalWrong,
            endTime: Date.now(),
            phase: 'results',
            currentQuestionIndex: nextIndex,
            selectedOption: null,
            showFeedback: false,
          };
        }

        return {
          ...prev,
          answers: newAnswers,
          correct: isCorrect ? prev.correct + 1 : prev.correct,
          wrong: isCorrect ? prev.wrong : prev.wrong + 1,
          currentQuestionIndex: nextIndex,
          selectedOption: null,
          showFeedback: false,
          feedbackCorrect: false,
        };
      });
    }, FEEDBACK_DELAY);
  }, [dailyState, questions, triggerSparkles]);

  const handleShareResults = useCallback(() => {
    const total = dailyState.correct + dailyState.wrong;
    const pct = Math.round((dailyState.correct / total) * 100);
    const grade = getGrade(dailyState.correct, total);
    const timeStr = dailyState.endTime && dailyState.startTime
      ? formatTime(dailyState.endTime - dailyState.startTime)
      : '--';

    const text = `🎯 Tantangan Harian Gemu Nihongo #${challengeNumber}\n` +
      `📝 ${challengeInfo.name}\n` +
      `📊 Hasil: ${dailyState.correct}/${total} Benar (${pct}%)\n` +
      `⏱️ Waktu: ${timeStr}\n` +
      `${'⭐'.repeat(dailyState.correct)}${'✖️'.repeat(dailyState.wrong)}\n` +
      `Nilai: ${grade.grade} - ${grade.label}\n\n` +
      `Belajar bahasa Jepang dengan Gemu Nihongo! 🇯🇵`;

    navigator.clipboard.writeText(text).catch(() => {});
  }, [dailyState, challengeNumber, challengeInfo]);

  const currentQuestion = questions[dailyState.currentQuestionIndex];
  const progressPct = ((dailyState.currentQuestionIndex + (dailyState.showFeedback ? 1 : 0)) / TOTAL_QUESTIONS) * 100;

  // ── Render: Start Screen ───────────────────────────────
  if (dailyState.phase === 'start') {
    const Icon = challengeInfo.icon;

    return (
      <div className="space-y-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-teal-500/20">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-white/20 hover:bg-white/20 text-white text-xs font-bold px-3 py-1 border-0">
                <CalendarCheck size={14} className="mr-1.5" />
                Tantangan #{challengeNumber}
              </Badge>
              {completed && (
                <Badge className="bg-emerald-500/80 hover:bg-emerald-500/80 text-white text-xs font-bold px-3 py-1 border-0">
                  <CheckCircle2 size={14} className="mr-1" />
                  Selesai
                </Badge>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              Tantangan Harian
            </h2>
            <p className="text-white/70 text-sm mb-4">
              {formatDateID(new Date())}
            </p>

            {/* Challenge type card */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center')}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{challengeInfo.name}</h3>
                  <p className="text-white/70 text-xs">{challengeInfo.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Target size={14} /> {TOTAL_QUESTIONS} Soal
                </span>
                {challengeType === 'speed-round' && (
                  <span className="flex items-center gap-1">
                    <Timer size={14} /> {SPEED_TIME_LIMIT} Detik
                  </span>
                )}
              </div>
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-orange-500/30 rounded-full px-3 py-1.5">
                  <Flame size={16} className="text-orange-300" />
                  <span className="text-sm font-bold">{streak} hari berturut menyelesaikan</span>
                </div>
              </div>
            )}

            {/* Start Button */}
            {!completed ? (
              <Button
                onClick={handleStart}
                size="lg"
                className="w-full sm:w-auto bg-white text-teal-700 hover:bg-white/90 font-bold text-base shadow-lg hover:shadow-xl transition-all rounded-xl px-8 h-12"
              >
                <Zap size={20} className="mr-2" />
                Mulai Tantangan
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-white/90 font-bold text-base shadow-lg hover:shadow-xl transition-all rounded-xl px-6 h-12"
                >
                  <RotateCcw size={18} className="mr-2" />
                  Ulangi
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Type Preview */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-muted/50 to-muted/30">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-teal-500" />
              Jenis Tantangan
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {CHALLENGE_TYPES.map((ct, idx) => {
                const isToday = ct.id === challengeType;
                const TypeIcon = ct.icon;
                return (
                  <div
                    key={ct.id}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all',
                      isToday
                        ? 'bg-gradient-to-br ' + ct.gradientFrom + ' ' + ct.gradientTo + ' text-white shadow-md scale-105'
                        : 'bg-background/60 text-muted-foreground hover:bg-background'
                    )}
                  >
                    <TypeIcon size={18} />
                    <span className="text-[9px] font-bold leading-tight text-center">{ct.name}</span>
                    {isToday && (
                      <span className="text-[8px] font-bold bg-white/30 rounded-full px-1.5 py-0.5">
                        HARI INI
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Tantangan berganti setiap hari. Semua berputar secara otomatis!
            </p>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
              <Star size={16} />
              Tips Tantangan
            </h3>
            <ul className="space-y-1.5 text-xs text-amber-600/80 dark:text-amber-400/70">
              <li>• Jawab semua {TOTAL_QUESTIONS} soal untuk mendapat XP bonus</li>
              <li>• Semakin tinggi akurasi, semakin banyak XP yang didapat</li>
              <li>• Selesaikan setiap hari untuk membangun streak!</li>
              {challengeType === 'speed-round' && (
                <li className="text-orange-600 dark:text-orange-400 font-semibold">
                  • Mode Cepat Tepat: Jawab cepat sebelum waktu habis!
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render: Playing Screen ─────────────────────────────
  if (dailyState.phase === 'playing' && currentQuestion) {
    return (
      <div className="space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-bold text-xs">
              <CalendarCheck size={13} className="mr-1" />
              #{challengeNumber}
            </Badge>
            <Badge className={cn('font-bold text-xs bg-gradient-to-r', challengeInfo.gradientFrom, challengeInfo.gradientTo, 'text-white border-0')}>
              {challengeInfo.name}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {challengeType === 'speed-round' && (
              <div className={cn(
                'flex items-center gap-1 font-bold text-base tabular-nums px-2.5 py-1 rounded-lg',
                (dailyState.speedTimer ?? SPEED_TIME_LIMIT) <= 10
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  : 'bg-muted text-muted-foreground'
              )}>
                <Timer size={16} />
                {dailyState.speedTimer ?? SPEED_TIME_LIMIT}s
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={14} />
              <span className="text-xs tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar + Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold">Soal {dailyState.currentQuestionIndex + 1} / {TOTAL_QUESTIONS}</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> {dailyState.correct}
              </span>
              <span className="text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                <XCircle size={13} /> {dailyState.wrong}
              </span>
            </div>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {questions.map((_, idx) => {
            const answered = dailyState.answers[idx];
            const isCurrent = idx === dailyState.currentQuestionIndex;
            return (
              <div
                key={idx}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  isCurrent && 'ring-2 ring-offset-2 ring-offset-background ring-teal-500 scale-125',
                  answered?.isCorrect && 'bg-emerald-500',
                  answered && !answered.isCorrect && 'bg-rose-500',
                  !answered && !isCurrent && 'bg-muted',
                  !answered && isCurrent && 'bg-teal-500',
                )}
              />
            );
          })}
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={dailyState.currentQuestionIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card className={cn(
              'border-0 shadow-lg overflow-hidden',
              shakeWrong && 'animate-[shake_0.5s_ease-in-out]'
            )} style={shakeWrong ? undefined : undefined}>
              {/* Sparkle particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {sparkles.map(s => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{ opacity: 0, scale: 1, x: s.x, y: s.y }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 w-3 h-3"
                  >
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </motion.div>
                ))}
              </div>

              <CardContent className="p-6 sm:p-8 relative">
                {/* Question Prompt */}
                <div className="text-center mb-6">
                  {currentQuestion.promptJa && (
                    <button
                      onClick={() => speakJapanese(currentQuestion.promptJa!)}
                      className="text-4xl sm:text-5xl font-bold mb-3 hover:opacity-80 transition-opacity cursor-pointer font-jp"
                      aria-label="Putar audio"
                    >
                      {currentQuestion.promptJa}
                      <Volume2 size={20} className="inline-block ml-2 text-muted-foreground" />
                    </button>
                  )}
                  <p className="text-sm sm:text-base text-foreground font-medium whitespace-pre-line leading-relaxed">
                    {currentQuestion.prompt}
                  </p>
                </div>

                {/* Options (2x2 grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = dailyState.selectedOption === idx;
                    const isCorrectOption = idx === currentQuestion.correctIndex;
                    const isWrongSelection = dailyState.showFeedback && isSelected && !isCorrectOption;

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!dailyState.showFeedback ? { scale: 1.02, y: -1 } : undefined}
                        whileTap={!dailyState.showFeedback ? { scale: 0.98 } : undefined}
                        onClick={() => handleSelectOption(idx)}
                        disabled={dailyState.showFeedback}
                        className={cn(
                          'relative p-4 rounded-xl border-2 text-left text-sm font-medium transition-all duration-200 min-h-[56px] flex items-center',
                          !dailyState.showFeedback && !isSelected && 'border-border bg-background hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 cursor-pointer',
                          !dailyState.showFeedback && isSelected && 'border-teal-500 bg-teal-50 dark:bg-teal-950/30',
                          dailyState.showFeedback && isCorrectOption && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/20',
                          dailyState.showFeedback && isWrongSelection && 'border-rose-500 bg-rose-50 dark:bg-rose-950/30',
                          dailyState.showFeedback && !isCorrectOption && !isWrongSelection && 'border-border bg-muted/30 opacity-60',
                          isSelected && 'ring-2 ring-teal-400/30'
                        )}
                      >
                        {/* Option Label */}
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mr-3 shrink-0',
                          dailyState.showFeedback && isCorrectOption
                            ? 'bg-emerald-500 text-white'
                            : dailyState.showFeedback && isWrongSelection
                              ? 'bg-rose-500 text-white'
                              : isSelected
                                ? 'bg-teal-500 text-white'
                                : 'bg-muted text-muted-foreground'
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>

                        <span className={cn(
                          'flex-1',
                          dailyState.showFeedback && isCorrectOption && 'text-emerald-700 dark:text-emerald-300 font-bold',
                          dailyState.showFeedback && isWrongSelection && 'text-rose-600 dark:text-rose-400 line-through',
                          option.length > 15 && 'text-xs leading-relaxed',
                        )}>
                          {option}
                        </span>

                        {/* Feedback icons */}
                        {dailyState.showFeedback && isCorrectOption && (
                          <CheckCircle2 size={20} className="text-emerald-500 shrink-0 ml-2" />
                        )}
                        {dailyState.showFeedback && isWrongSelection && (
                          <XCircle size={20} className="text-rose-500 shrink-0 ml-2" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Feedback explanation */}
                <AnimatePresence>
                  {dailyState.showFeedback && !dailyState.feedbackCorrect && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        <span className="font-bold">Jawaban yang benar:</span> {currentQuestion.options[currentQuestion.correctIndex]}
                      </p>
                      {currentQuestion.explanation && (
                        <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                          {currentQuestion.explanation}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Render: Results Screen ────────────────────────────
  if (dailyState.phase === 'results') {
    const total = dailyState.correct + dailyState.wrong;
    const pct = total > 0 ? Math.round((dailyState.correct / total) * 100) : 0;
    const grade = getGrade(dailyState.correct, total);
    const timeTaken = dailyState.endTime && dailyState.startTime
      ? formatTime(dailyState.endTime - dailyState.startTime)
      : formatTime(elapsedTime);
    const baseXP = 50;
    const accuracyBonus = Math.round((dailyState.correct / total) * 50);
    const totalXP = baseXP + accuracyBonus;
    const GradeIcon = grade.grade === 'S' ? Trophy : grade.grade === 'A' ? Star : ChevronRight;

    return (
      <div className="space-y-6">
        {/* Grade Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-8 text-white shadow-2xl"
        >
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10" />

          <div className="relative z-10 text-center">
            <p className="text-sm text-white/50 font-medium mb-2">Hasil Tantangan</p>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg"
            >
              <span className={cn('bg-gradient-to-br bg-clip-text text-5xl font-black text-transparent', grade.gradient)}>
                {grade.grade}
              </span>
            </motion.div>

            <h2 className="text-2xl font-black mb-1">{grade.label}</h2>
            <p className="text-white/50 text-sm">{challengeInfo.name}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Card className="border-0 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{dailyState.correct}/{total}</p>
              <p className="text-xs text-muted-foreground font-medium">Benar</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-rose-50/50 dark:bg-rose-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-rose-500">{pct}%</p>
              <p className="text-xs text-muted-foreground font-medium">Akurasi</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-teal-50/50 dark:bg-teal-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1">
                <Clock size={18} />
                <span className="text-lg">{timeTaken}</span>
              </p>
              <p className="text-xs text-muted-foreground font-medium">Waktu</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-amber-500">+{totalXP}</p>
              <p className="text-xs text-muted-foreground font-medium">XP</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 p-4"
        >
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            Rincian XP
          </h4>
          <div className="space-y-1 text-xs text-amber-600/80 dark:text-amber-400/70">
            <div className="flex justify-between">
              <span>Menyelesaikan tantangan</span>
              <span className="font-bold">+{baseXP} XP</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus akurasi ({pct}%)</span>
              <span className="font-bold">+{accuracyBonus} XP</span>
            </div>
            <div className="flex justify-between border-t border-amber-200/50 dark:border-amber-800/30 pt-1 font-bold text-amber-700 dark:text-amber-400">
              <span>Total</span>
              <span>+{totalXP} XP</span>
            </div>
          </div>
        </motion.div>

        {/* Wrong Answers Review */}
        {dailyState.answers.some(a => !a.isCorrect) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <XCircle size={16} className="text-rose-500" />
                  Jawaban Salah
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {dailyState.answers.filter(a => !a.isCorrect).map((answer, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200/50 dark:border-rose-800/30">
                      <p className="text-xs font-medium text-foreground mb-1">{answer.question.prompt}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-rose-500 line-through">
                          Jawabmu: {answer.question.options[answer.selected]}
                        </span>
                        <ChevronRight size={12} className="text-muted-foreground" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Benar: {answer.question.options[answer.question.correctIndex]}
                        </span>
                      </div>
                      {answer.question.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">{answer.question.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={handleShareResults}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold text-sm"
          >
            <Share2 size={16} className="mr-2" />
            Bagikan Hasil
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1 h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg"
          >
            <RotateCcw size={16} className="mr-2" />
            Ulangi Tantangan
          </Button>
        </motion.div>

        {/* Next Challenge Countdown */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-muted/50 to-muted/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Tantangan Besok</p>
                  <p className="text-xs text-muted-foreground">
                    {CHALLENGE_TYPES[(getDayOfYear() + 1) % 5].name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-orange-500 tabular-nums">
                  {formatCountdown(countdown)}
                </p>
                <p className="text-[10px] text-muted-foreground">menuju tantangan berikutnya</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}
