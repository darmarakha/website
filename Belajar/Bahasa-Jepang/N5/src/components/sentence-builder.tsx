'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Puzzle, Volume2, ChevronRight, RotateCcw, CheckCircle2,
  XCircle, Trophy, Star, ArrowRight, Play, Sparkles,
  BookOpen, Layers, Target, Zap, VolumeX,
} from 'lucide-react';
import { speakJapanese } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────

interface WordChip {
  id: string;
  text: string;
  isCorrect: boolean;
  isUsed: boolean;
}

type ExerciseType = 'fill-blank' | 'build-sentence';

interface Exercise {
  id: number;
  category: CategoryKey;
  type: ExerciseType;
  // For fill-blank: sentence has ___ gaps, options to pick from
  sentence: string;          // Japanese with ___ for blanks
  correctAnswer: string;     // The full correct Japanese sentence (for audio)
  meaning: string;           // Indonesian meaning
  // For fill-blank
  options: string[];         // Chips to pick from
  blankAnswers: string[];    // Correct answer for each blank in order
  // For build-sentence
  sentenceParts?: string[];  // Correct word order for sentence building
  hint?: string;             // Optional hint
}

type CategoryKey = 'partikel' | 'desumasu' | 'tai' | 'te-kudasai' | 'masen';

interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  description: string;
}

// ── Categories ─────────────────────────────────────────────────

const CATEGORIES: CategoryDef[] = [
  { key: 'partikel', label: 'Partikel', icon: Layers, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', badgeBg: 'bg-teal-100 text-teal-700', description: 'は, が, を, に, へ, の, も' },
  { key: 'desumasu', label: 'Bentuk ～です/ます', icon: BookOpen, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', badgeBg: 'bg-emerald-100 text-emerald-700', description: 'Kalimat is/am/are' },
  { key: 'tai', label: 'Bentuk ～たい', icon: Target, color: 'text-rose-500', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', badgeBg: 'bg-rose-100 text-rose-700', description: 'Keinginan (want to)' },
  { key: 'te-kudasai', label: 'Bentuk ～てください', icon: Zap, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', badgeBg: 'bg-amber-100 text-amber-700', description: 'Permintaan (please do)' },
  { key: 'masen', label: 'Bentuk ～ません', icon: VolumeX, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', badgeBg: 'bg-purple-100 text-purple-700', description: 'Kalimat negatif' },
];

// ── Exercises Data (24 exercises) ──────────────────────────────

const EXERCISES: Exercise[] = [
  // ─── PARTIKEL (7 exercises) ───
  {
    id: 1, category: 'partikel', type: 'fill-blank',
    sentence: 'わたし ___ がくせいです。',
    correctAnswer: 'わたし は がくせいです。',
    meaning: 'Saya adalah mahasiswa.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['は'],
  },
  {
    id: 2, category: 'partikel', type: 'fill-blank',
    sentence: 'りんご ___ たべます。',
    correctAnswer: 'りんご を たべます。',
    meaning: 'Saya makan apel.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['を'],
  },
  {
    id: 3, category: 'partikel', type: 'fill-blank',
    sentence: 'にほん ___ いきます。',
    correctAnswer: 'にほん に いきます。',
    meaning: 'Saya pergi ke Jepang.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['に'],
  },
  {
    id: 4, category: 'partikel', type: 'fill-blank',
    sentence: 'えき ___ あります。',
    correctAnswer: 'えき に あります。',
    meaning: 'Ada stasiun kereta.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['に'],
  },
  {
    id: 5, category: 'partikel', type: 'fill-blank',
    sentence: 'わたし ___ がくせいです。たなかさん ___ がくせいです。',
    correctAnswer: 'わたし は がくせいです。たなかさん も がくせいです。',
    meaning: 'Saya mahasiswa. Tanaka juga mahasiswa.',
    options: ['は', 'が', 'を', 'も'],
    blankAnswers: ['は', 'も'],
  },
  {
    id: 6, category: 'partikel', type: 'fill-blank',
    sentence: 'わたし ___ ほんです。',
    correctAnswer: 'わたし の ほんです。',
    meaning: 'Ini buku saya.',
    options: ['は', 'が', 'の', 'に'],
    blankAnswers: ['の'],
  },
  {
    id: 7, category: 'partikel', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'がっこうへいきます。',
    meaning: 'Saya pergi ke sekolah.',
    options: ['がっこう', 'へ', 'いきます', 'に', 'ます'],
    sentenceParts: ['がっこう', 'へ', 'いきます'],
  },

  // ─── BENTUK です/ます (5 exercises) ───
  {
    id: 8, category: 'desumasu', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'わたしはがくせいです。',
    meaning: 'Saya adalah mahasiswa.',
    options: ['わたし', 'は', 'がくせい', 'です', 'ます'],
    sentenceParts: ['わたし', 'は', 'がくせい', 'です'],
  },
  {
    id: 9, category: 'desumasu', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'きょうはいいてんきです。',
    meaning: 'Hari ini cuacanya bagus.',
    options: ['きょう', 'は', 'いいてんき', 'です', 'ます'],
    sentenceParts: ['きょう', 'は', 'いいてんき', 'です'],
  },
  {
    id: 10, category: 'desumasu', type: 'fill-blank',
    sentence: 'にほんご ___ はなします。',
    correctAnswer: 'にほんご を はなします。',
    meaning: 'Saya berbicara bahasa Jepang.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['を'],
  },
  {
    id: 11, category: 'desumasu', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'でんわをかきます。',
    meaning: 'Saya menelepon.',
    options: ['でんわ', 'を', 'かき', 'ます', 'です'],
    sentenceParts: ['でんわ', 'を', 'かき', 'ます'],
  },
  {
    id: 12, category: 'desumasu', type: 'fill-blank',
    sentence: '７じ ___ おきます。',
    correctAnswer: '７じ に おきます。',
    meaning: 'Saya bangun jam 7.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['に'],
  },

  // ─── BENTUK ～たい (4 exercises) ───
  {
    id: 13, category: 'tai', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'すしをたべたいです。',
    meaning: 'Saya ingin makan sushi.',
    options: ['すし', 'を', 'たべ', 'たい', 'です'],
    sentenceParts: ['すし', 'を', 'たべ', 'たい', 'です'],
  },
  {
    id: 14, category: 'tai', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'にほんへいきたいです。',
    meaning: 'Saya ingin pergi ke Jepang.',
    options: ['にほん', 'へ', 'いき', 'たい', 'です'],
    sentenceParts: ['にほん', 'へ', 'いき', 'たい', 'です'],
  },
  {
    id: 15, category: 'tai', type: 'fill-blank',
    sentence: 'えいが ___ みたいです。',
    correctAnswer: 'えいが を みたいです。',
    meaning: 'Saya ingin menonton film.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['を'],
  },
  {
    id: 16, category: 'tai', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'みずをのみたいです。',
    meaning: 'Saya ingin minum air.',
    options: ['みず', 'に', 'のむ', 'たい', 'です'],
    sentenceParts: ['みず', 'を', 'のみ', 'たい', 'です'],
  },

  // ─── BENTUK ～てください (4 exercises) ───
  {
    id: 17, category: 'te-kudasai', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'きいてください。',
    meaning: 'Tolong dengarkan.',
    options: ['きい', 'て', 'くだ', 'さい', 'ください'],
    sentenceParts: ['きい', 'て', 'ください'],
  },
  {
    id: 18, category: 'te-kudasai', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'まってください。',
    meaning: 'Tolong tunggu.',
    options: ['まっ', 'て', 'くだ', 'さい', 'ください'],
    sentenceParts: ['まっ', 'て', 'ください'],
  },
  {
    id: 19, category: 'te-kudasai', type: 'fill-blank',
    sentence: 'ここ ___ すわってください。',
    correctAnswer: 'ここ に すわってください。',
    meaning: 'Tolong duduk di sini.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['に'],
  },
  {
    id: 20, category: 'te-kudasai', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'おちゃをのんでください。',
    meaning: 'Tolong minum tehnya.',
    options: ['おちゃ', 'を', 'のん', 'で', 'ください'],
    sentenceParts: ['おちゃ', 'を', 'のん', 'で', 'ください'],
  },

  // ─── BENTUK ～ません (4 exercises) ───
  {
    id: 21, category: 'masen', type: 'fill-blank',
    sentence: 'わたし ___ たべません。',
    correctAnswer: 'わたし は たべません。',
    meaning: 'Saya tidak makan.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['は'],
  },
  {
    id: 22, category: 'masen', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'にほんごをはなしません。',
    meaning: 'Saya tidak berbicara bahasa Jepang.',
    options: ['にほんご', 'を', 'はなし', 'ませ', 'ん'],
    sentenceParts: ['にほんご', 'を', 'はなし', 'ません'],
  },
  {
    id: 23, category: 'masen', type: 'fill-blank',
    sentence: 'きのう ほん ___ よみませんでした。',
    correctAnswer: 'きのう ほん を よみませんでした。',
    meaning: 'Kemarin saya tidak membaca buku.',
    options: ['は', 'が', 'を', 'に'],
    blankAnswers: ['を'],
  },
  {
    id: 24, category: 'masen', type: 'build-sentence',
    sentence: '___',
    correctAnswer: 'がっこうにいきません。',
    meaning: 'Saya tidak pergi ke sekolah.',
    options: ['がっこう', 'に', 'いき', 'ませ', 'ん'],
    sentenceParts: ['がっこう', 'に', 'いき', 'ません'],
  },
];

// ── Utility: Shuffle array ─────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Grade helper ───────────────────────────────────────────────

function getGrade(pct: number): { letter: string; color: string; label: string } {
  if (pct >= 90) return { letter: 'S', color: 'from-teal-400 to-emerald-500', label: 'Luar Biasa!' };
  if (pct >= 75) return { letter: 'A', color: 'from-emerald-400 to-teal-500', label: 'Bagus Sekali!' };
  if (pct >= 60) return { letter: 'B', color: 'from-amber-400 to-orange-500', label: 'Cukup Baik!' };
  return { letter: 'C', color: 'from-rose-400 to-red-500', label: 'Terus Berlatih!' };
}

// ══════════════════════════════════════════════════════════════
// Inner component: Exercise Playground (remounts via key)
// ══════════════════════════════════════════════════════════════

function ExercisePlayground({
  exercise,
  onComplete,
}: {
  exercise: Exercise;
  onComplete: (correct: boolean) => void;
}) {
  // Initialize chips on mount (this component remounts via key)
  const [chips, setChips] = useState<WordChip[]>(() =>
    shuffle(exercise.options).map((opt, i) => ({
      id: `chip-${i}`,
      text: opt,
      isCorrect: false,
      isUsed: false,
    }))
  );
  const [filledBlanks, setFilledBlanks] = useState<string[]>([]);
  const [currentBlank, setCurrentBlank] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [shakeKey, setShakeKey] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  const handleChipClick = useCallback((chipId: string) => {
    if (status !== 'playing') return;
    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.isUsed) return;

    if (exercise.type === 'fill-blank') {
      const expectedAnswer = exercise.blankAnswers[currentBlank];
      if (chip.text === expectedAnswer) {
        setFilledBlanks(prev => [...prev, chip.text]);
        setChips(prev => prev.map(c => c.id === chipId ? { ...c, isUsed: true } : c));
        setCurrentBlank(prev => prev + 1);
        if (currentBlank + 1 >= exercise.blankAnswers.length) {
          setStatus('correct');
          onComplete(true);
        }
      } else {
        setStatus('wrong');
        setShakeKey(prev => prev + 1);
        wrongTimerRef.current = setTimeout(() => {
          setStatus('playing');
          setFilledBlanks([]);
          setCurrentBlank(0);
          setChips(prev => prev.map(c => ({ ...c, isUsed: false })));
        }, 800);
      }
    } else {
      const correctParts = exercise.sentenceParts || [];
      const expectedWord = correctParts[currentBlank];
      if (chip.text === expectedWord) {
        setFilledBlanks(prev => [...prev, chip.text]);
        setChips(prev => prev.map(c => c.id === chipId ? { ...c, isUsed: true } : c));
        setCurrentBlank(prev => prev + 1);
        if (currentBlank + 1 >= correctParts.length) {
          setStatus('correct');
          onComplete(true);
        }
      } else {
        setStatus('wrong');
        setShakeKey(prev => prev + 1);
        wrongTimerRef.current = setTimeout(() => {
          setStatus('playing');
          setFilledBlanks([]);
          setCurrentBlank(0);
          setChips(prev => prev.map(c => ({ ...c, isUsed: false })));
        }, 800);
      }
    }
  }, [chips, status, exercise, filledBlanks, currentBlank, onComplete]);

  const playAudio = useCallback(() => {
    speakJapanese(exercise.correctAnswer);
  }, [exercise]);

  const renderSentence = () => {
    if (exercise.type === 'fill-blank') {
      const parts = exercise.sentence.split('___');
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 text-2xl sm:text-3xl font-medium font-jp">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < parts.length - 1 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-lg text-xl sm:text-2xl transition-all duration-300 border-2',
                    status === 'correct' && i < filledBlanks.length
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                      : status === 'wrong' && i === currentBlank
                        ? 'animate-[shake_0.5s_ease-in-out] bg-rose-100 border-rose-400 text-rose-700'
                        : i === currentBlank
                          ? 'bg-teal-50 border-teal-300 border-dashed text-muted-foreground'
                          : 'bg-muted/50 border-muted-foreground/20 text-muted-foreground',
                  )}
                >
                  {filledBlanks[i] || (
                    <span className="text-muted-foreground/50 text-lg">?</span>
                  )}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    } else {
      const correctParts = exercise.sentenceParts || [];
      return (
        <div className="flex flex-wrap items-center justify-center gap-2 text-2xl sm:text-3xl font-medium font-jp">
          {filledBlanks.length === 0 ? (
            <span className="text-muted-foreground/40 text-lg flex items-center gap-2">
              <Target size={20} />
              Susun kata menjadi kalimat...
            </span>
          ) : (
            filledBlanks.map((word, i) => (
              <span
                key={`built-${i}`}
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-lg transition-all duration-300',
                  status === 'correct'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-teal-50 text-teal-800 border border-teal-200',
                )}
              >
                {word}
              </span>
            ))
          )}
          {status !== 'correct' && filledBlanks.length < correctParts.length && (
            <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-lg bg-muted/50 border-2 border-dashed border-teal-300 text-muted-foreground/50 text-xl">
              ?
            </span>
          )}
          {status === 'correct' && (
            <span className="text-emerald-500 text-lg">。</span>
          )}
        </div>
      );
    }
  };

  const catDef = CATEGORIES.find(c => c.key === exercise.category);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Card className={cn(
        'relative overflow-hidden transition-all duration-300 border-2',
        status === 'correct' ? 'border-emerald-300 shadow-emerald-100 shadow-lg' :
        status === 'wrong' ? 'border-rose-300' :
        'border-transparent',
      )}>
        {status === 'correct' && (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 to-transparent pointer-events-none" />
        )}
        {status === 'wrong' && (
          <div className="absolute inset-0 bg-gradient-to-b from-rose-50/60 to-transparent pointer-events-none" />
        )}

        <CardContent className="relative p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={cn('text-[11px]', catDef?.badgeBg)}>
              {exercise.type === 'fill-blank' ? 'Isi Partikel' : 'Bangun Kalimat'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={playAudio}
              disabled={status !== 'correct'}
            >
              <Volume2 size={16} className={status === 'correct' ? 'text-teal-600' : 'text-muted-foreground'} />
            </Button>
          </div>

          <div key={shakeKey} className={cn(
            'transition-all duration-200 min-h-[4rem] flex items-center justify-center',
            status === 'wrong' && 'animate-[shake_0.5s_ease-in-out]',
          )}>
            {renderSentence()}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 inline-block">
              {exercise.meaning}
            </p>
          </div>

          {status === 'playing' && exercise.type === 'fill-blank' && (
            <div className="text-center">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-teal-600 hover:text-teal-700 hover:underline transition-colors"
              >
                {showHint ? 'Sembunyikan petunjuk' : 'Lihat petunjuk'}
              </button>
              {showHint && (
                <p className="text-xs text-muted-foreground mt-1">
                  Partikel yang benar: <span className="font-bold text-teal-600">{exercise.blankAnswers[currentBlank]}</span>
                </p>
              )}
            </div>
          )}

          {status === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 animate-[zoomIn_0.3s_ease-out]">
              <CheckCircle2 size={20} />
              <span className="font-bold">Benar!</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                onClick={playAudio}
              >
                <Volume2 size={14} className="mr-1" />
                Dengarkan
              </Button>
            </div>
          )}
          {status === 'wrong' && (
            <div className="flex items-center justify-center gap-2 text-rose-500 animate-[zoomIn_0.3s_ease-out]">
              <XCircle size={20} />
              <span className="font-bold">Salah, coba lagi!</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          {exercise.type === 'fill-blank' ? 'Pilih partikel:' : 'Klik kata dalam urutan yang benar:'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {chips.map(chip => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.id)}
              disabled={chip.isUsed || status !== 'playing'}
              className={cn(
                'inline-flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 border-2 font-jp',
                chip.isUsed
                  ? 'bg-muted text-muted-foreground/40 border-muted cursor-not-allowed line-through'
                  : status === 'playing'
                    ? 'bg-white border-teal-200 text-teal-800 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                    : 'bg-white border-muted text-muted-foreground cursor-default',
              )}
            >
              {chip.text}
            </button>
          ))}
        </div>
      </div>

      {exercise.type === 'build-sentence' && status === 'playing' && filledBlanks.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Sudah: {filledBlanks.join(' ')}{filledBlanks.length < (exercise.sentenceParts?.length || 0) ? ' ...' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

export default function SentenceBuilder() {
  const [phase, setPhase] = useState<'select' | 'play' | 'result'>('select');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  const currentExercise = exercises[currentIndex] || null;
  const catDef = currentExercise ? CATEGORIES.find(c => c.key === currentExercise.category) : null;

  const startExercises = useCallback((cat: CategoryKey | 'all') => {
    setSelectedCategory(cat);
    const pool = cat === 'all' ? EXERCISES : EXERCISES.filter(e => e.category === cat);
    setExercises(shuffle(pool));
    setCurrentIndex(0);
    setScore(0);
    setWrongAnswers([]);
    setPhase('play');
  }, []);

  const handleExerciseComplete = useCallback((correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, currentIndex]);
    }
  }, [currentIndex]);

  const nextExercise = useCallback(() => {
    if (currentIndex + 1 >= exercises.length) {
      setPhase('result');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, exercises.length]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of EXERCISES) {
      counts[e.category] = (counts[e.category] || 0) + 1;
    }
    return counts;
  }, []);

  const progressPct = exercises.length > 0
    ? (Math.min(currentIndex + 1, exercises.length) / exercises.length) * 100
    : 0;

  // ══════════════════════════════════════════════════════════════
  // RENDER: Category Selection
  // ══════════════════════════════════════════════════════════════

  if (phase === 'select') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg mb-2">
            <Puzzle size={28} className="text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bangun Kalimat
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Latih tata bahasa N5 dengan menyusun kata atau mengisi partikel yang benar dalam kalimat bahasa Jepang.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const count = countByCategory[cat.key] || 0;
            return (
              <Card
                key={cat.key}
                className={cn(
                  'cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-2',
                  cat.borderColor,
                )}
                onClick={() => startExercises(cat.key)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', cat.bgColor)}>
                    <Icon size={24} className={cat.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                  </div>
                  <Badge variant="secondary" className={cn('text-xs shrink-0', cat.badgeBg)}>
                    {count} soal
                  </Badge>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}

          <Card
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50"
            onClick={() => startExercises('all')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">Semua Kategori</h3>
                <p className="text-xs text-muted-foreground truncate">Campurkan semua soal ({EXERCISES.length} total)</p>
              </div>
              <Badge className="bg-teal-100 text-teal-700 text-xs shrink-0">
                {EXERCISES.length} soal
              </Badge>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen size={16} className="text-teal-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Cara Bermain</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>&bull; <strong>Isi Partikel</strong>: Klik partikel yang tepat untuk mengisi bagian kosong (___)</li>
                <li>&bull; <strong>Bangun Kalimat</strong>: Klik kata-kata dalam urutan yang benar untuk menyusun kalimat</li>
                <li>&bull; Jawaban salah akan menggetar dan reset &mdash; coba lagi!</li>
                <li>&bull; Dengarkan kalimat yang benar setelah menjawab dengan tombol 🔊</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER: Results
  // ══════════════════════════════════════════════════════════════

  if (phase === 'result') {
    const total = exercises.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade = getGrade(accuracy);
    const catLabel = selectedCategory === 'all' ? 'Semua' : CATEGORIES.find(c => c.key === selectedCategory)?.label;

    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <Card className="overflow-hidden">
          <div className={cn('bg-gradient-to-br p-8 text-center text-white', grade.color)}>
            <div className="animate-[zoomIn_0.5s_ease-out]">
              <Trophy size={48} className="mx-auto mb-3 opacity-90" />
              <div className="text-6xl font-black mb-1">{grade.letter}</div>
              <p className="text-lg font-semibold opacity-90">{grade.label}</p>
            </div>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {catLabel} &middot; {total} Soal
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-black text-emerald-700">{score}</p>
                <p className="text-xs text-emerald-600">Benar</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-rose-50 border border-rose-100">
                <XCircle size={20} className="text-rose-500 mx-auto mb-1" />
                <p className="text-xl font-black text-rose-700">{total - score}</p>
                <p className="text-xs text-rose-600">Salah</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-teal-50 border border-teal-100">
                <Star size={20} className="text-teal-500 mx-auto mb-1" />
                <p className="text-xl font-black text-teal-700">{accuracy}%</p>
                <p className="text-xs text-teal-600">Akurasi</p>
              </div>
            </div>

            {wrongAnswers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                  <RotateCcw size={14} /> Jawaban Salah
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {wrongAnswers.map(idx => {
                    const ex = exercises[idx];
                    if (!ex) return null;
                    const c = CATEGORIES.find(cat => cat.key === ex.category);
                    return (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                        <Badge variant="outline" className={cn('shrink-0 text-[10px]', c?.badgeBg)}>
                          {c?.label}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate font-jp">
                            {ex.correctAnswer}
                          </p>
                          <p className="text-muted-foreground truncate">{ex.meaning}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setPhase('select')}
          >
            <RotateCcw size={16} className="mr-2" />
            Pilih Kategori
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
            onClick={() => startExercises(selectedCategory)}
          >
            <Play size={16} className="mr-2" />
            Ulangi
          </Button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER: Gameplay
  // ══════════════════════════════════════════════════════════════

  if (!currentExercise) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-[11px]', catDef?.badgeBg)}>
              {catDef?.label}
            </Badge>
            <span className="text-muted-foreground font-medium">
              Soal {currentIndex + 1}/{exercises.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
              <CheckCircle2 size={12} className="mr-1" />
              {score}
            </Badge>
          </div>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <ExercisePlayground
        key={currentExercise.id}
        exercise={currentExercise}
        onComplete={handleExerciseComplete}
      />

      <div className="flex gap-3 max-w-lg mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPhase('select')}
          className="shrink-0"
        >
          Kembali
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
          onClick={nextExercise}
        >
          {currentIndex + 1 >= exercises.length ? (
            <>Lihat Hasil <Trophy size={16} className="ml-2" /></>
          ) : (
            <>Selanjutnya <ArrowRight size={16} className="ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
