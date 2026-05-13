'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Languages, Volume2, Info, Brain, CheckCircle2, XCircle, RotateCcw, Sparkles, Trophy, ArrowRight, Play } from 'lucide-react';
import { StrokeGuide } from '@/components/stroke-order-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { HIRAGANA, KATAKANA, speakJapanese, type Character } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'basic', label: 'Dasar', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  { id: 'dakuon', label: 'Dakuon', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  { id: 'handakuon', label: 'Handakuon', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  { id: 'yoon', label: 'Yoon', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
  { id: 'sokuon', label: 'Sokuon', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200' },
];

// ─── Kana Grid (existing) ────────────────────────────────────────────────────

function KanaGrid({ characters, type }: { characters: Character[]; type: 'hiragana' | 'katakana' }) {
  const [activeCategory, setActiveCategory] = useState('basic');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  const filtered = useMemo(() =>
    characters.filter(c => c.category === activeCategory),
    [characters, activeCategory]
  );

  const handleCharClick = (char: Character) => {
    speakJapanese(char.ja);
    setSelectedChar(char);
  };

  const kanaType = type === 'hiragana' ? 'hiragana' as const : 'katakana' as const;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Badge key={cat.id} variant="outline" className={cn(
            'cursor-pointer transition-all hover:scale-105 px-3 py-1',
            activeCategory === cat.id ? cat.color + ' border-transparent' : ''
          )} onClick={() => setActiveCategory(cat.id)}>
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Sokuon Explanation */}
      {activeCategory === 'sokuon' && (
        <Card className="border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-sky-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-sky-900 dark:text-sky-100">Sokuon (っ/ッ)</p>
                <p className="text-xs text-sky-800 dark:text-sky-200 mt-1">
                  Sokuon adalah konsonan ganda dalam bahasa Jepang. Contoh: ちょっと (chotto - sebentar), がっこう (gakkou - sekolah).
                  Tanda sokuon memperpanjang konsonan suku kata berikutnya.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Character Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {filtered.map((char, i) => (
          <Card key={`${char.ja}-${i}`} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
            onClick={() => handleCharClick(char)}>
            <CardContent className="p-2 sm:p-3 flex flex-col items-center gap-0.5">
              <span className="text-2xl sm:text-3xl font-bold group-hover:text-teal-600 transition-colors font-jp">
                {char.ja}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{char.romaji}</span>
              <Volume2 size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Character Detail Dialog */}
      <Dialog open={!!selectedChar} onOpenChange={() => setSelectedChar(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages size={18} className="text-teal-600" />
              Detail Karakter
            </DialogTitle>
          </DialogHeader>
          {selectedChar && (
            <div className="space-y-4 text-center">
              <div className="text-7xl font-bold py-4 font-jp">
                {selectedChar.ja}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">{selectedChar.romaji}</p>
                <Badge variant="outline" className="capitalize">{selectedChar.category}</Badge>
                <Badge variant="outline" className="capitalize ml-1">{selectedChar.type}</Badge>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => speakJapanese(selectedChar.ja)}>
                <Volume2 size={16} className="mr-2" /> Dengarkan
              </Button>
              <StrokeGuide
                character={selectedChar.ja}
                kanaType={kanaType}
                size={200}
                label="Panduan Goresan"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Kana Quiz Types ─────────────────────────────────────────────────────────

type CharSet = 'hiragana' | 'katakana' | 'both';
type CategoryFilter = 'basic' | 'all';
type QuestionCount = 5 | 10 | 15 | 20;
type QuizType = 'kana-to-romaji' | 'romaji-to-kana';

interface QuizQuestion {
  character: Character;
  options: Character[];
  correctIndex: number;
}

interface QuizAnswer {
  question: QuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getCharacterSet(charSet: CharSet, categoryFilter: CategoryFilter): Character[] {
  let chars: Character[] = [];
  if (charSet === 'hiragana' || charSet === 'both') {
    chars = [...chars, ...HIRAGANA];
  }
  if (charSet === 'katakana' || charSet === 'both') {
    chars = [...chars, ...KATAKANA];
  }
  if (categoryFilter === 'basic') {
    chars = chars.filter(c => c.category === 'basic');
  }
  // Exclude sokuon for quiz since its romaji is "tsu (sokuon)" which is ambiguous
  chars = chars.filter(c => c.category !== 'sokuon');
  return chars;
}

function generateQuestions(
  pool: Character[],
  count: QuestionCount,
  quizType: QuizType
): QuizQuestion[] {
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, pool.length));
  const uniqueRomajis = new Set<string>();

  return selected.map(char => {
    // For generating distractors: pick 3 from the same pool, excluding the correct one
    // Ensure no duplicate romaji in options for kana-to-romaji mode
    const distractors = shuffleArray(pool.filter(c => c.ja !== char.ja))
      .filter(d => !uniqueRomajis.has(d.romaji) || quizType === 'romaji-to-kana')
      .slice(0, 3);

    const options = shuffleArray([char, ...distractors]);
    const correctIndex = options.findIndex(o => o.ja === char.ja && o.romaji === char.romaji);

    if (quizType === 'kana-to-romaji') {
      uniqueRomajis.add(char.romaji);
    }

    return { character: char, options, correctIndex };
  });
}

function getGrade(percentage: number): { grade: string; color: string; label: string } {
  if (percentage === 100) return { grade: 'S', color: 'text-amber-500', label: 'Sempurna!' };
  if (percentage >= 80) return { grade: 'A', color: 'text-emerald-500', label: 'Hebat!' };
  if (percentage >= 60) return { grade: 'B', color: 'text-sky-500', label: 'Bagus!' };
  return { grade: 'C', color: 'text-rose-500', label: 'Terus berlatih!' };
}

// ─── Quiz Settings Component ─────────────────────────────────────────────────

function QuizSettings({ onStart }: { onStart: (settings: {
  charSet: CharSet;
  categoryFilter: CategoryFilter;
  questionCount: QuestionCount;
  quizType: QuizType;
}) => void }) {
  const [charSet, setCharSet] = useState<CharSet>('hiragana');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('basic');
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [quizType, setQuizType] = useState<QuizType>('kana-to-romaji');

  // Calculate available characters count
  const availableCount = useMemo(() => {
    return getCharacterSet(charSet, categoryFilter).length;
  }, [charSet, categoryFilter]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white mb-2">
          <Brain size={32} />
        </div>
        <h3 className="text-xl font-bold">Kana Quiz</h3>
        <p className="text-sm text-muted-foreground">Uji pengetahuan huruf Jepangmu!</p>
      </div>

      {/* Settings Card */}
      <Card className="border-teal-200 dark:border-teal-800">
        <CardContent className="p-5 space-y-6">
          {/* Character Set */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Languages size={14} className="text-teal-600" />
              Set Karakter
            </Label>
            <RadioGroup value={charSet} onValueChange={(v) => setCharSet(v as CharSet)} className="grid-cols-3">
              {[
                { value: 'hiragana' as CharSet, label: 'Hiragana', icon: 'あ' },
                { value: 'katakana' as CharSet, label: 'Katakana', icon: 'ア' },
                { value: 'both' as CharSet, label: 'Keduanya', icon: 'あア' },
              ].map(opt => (
                <Label
                  key={opt.value}
                  htmlFor={`charset-${opt.value}`}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm',
                    charSet === opt.value
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-muted hover:border-teal-300'
                  )}
                >
                  <span className="text-lg font-bold font-jp">
                    {opt.icon}
                  </span>
                  <span className="text-xs font-medium">{opt.label}</span>
                  <RadioGroupItem value={opt.value} id={`charset-${opt.value}`} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Info size={14} className="text-teal-600" />
              Kategori
            </Label>
            <RadioGroup value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)} className="grid-cols-2">
              {[
                { value: 'basic' as CategoryFilter, label: 'Dasar Saja', desc: '46 karakter dasar' },
                { value: 'all' as CategoryFilter, label: 'Semua', desc: 'Dasar + Dakuon + Yoon' },
              ].map(opt => (
                <Label
                  key={opt.value}
                  htmlFor={`cat-${opt.value}`}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm',
                    categoryFilter === opt.value
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-muted hover:border-teal-300'
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  <RadioGroupItem value={opt.value} id={`cat-${opt.value}`} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Question Count */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Jumlah Soal</Label>
            <RadioGroup value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v) as QuestionCount)} className="grid-cols-4">
              {([5, 10, 15, 20] as QuestionCount[]).map(n => (
                <Label
                  key={n}
                  htmlFor={`count-${n}`}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm',
                    questionCount === n
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-muted hover:border-teal-300'
                  )}
                >
                  <span className="text-lg font-bold text-teal-600">{n}</span>
                  <span className="text-[10px] text-muted-foreground">soal</span>
                  <RadioGroupItem value={String(n)} id={`count-${n}`} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Quiz Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Sparkles size={14} className="text-teal-600" />
              Tipe Quiz
            </Label>
            <RadioGroup value={quizType} onValueChange={(v) => setQuizType(v as QuizType)} className="grid-cols-1 gap-3">
              {[
                { value: 'kana-to-romaji' as QuizType, label: 'Kana → Romaji', desc: 'Lihat karakter, pilih romaji yang benar' },
                { value: 'romaji-to-kana' as QuizType, label: 'Romaji → Kana', desc: 'Lihat romaji, pilih karakter yang benar' },
              ].map(opt => (
                <Label
                  key={opt.value}
                  htmlFor={`type-${opt.value}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm',
                    quizType === opt.value
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-muted hover:border-teal-300'
                  )}
                >
                  <RadioGroupItem value={opt.value} id={`type-${opt.value}`} className="shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium block">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Available count info */}
      <p className="text-center text-xs text-muted-foreground">
        Tersedia <span className="font-semibold text-teal-600">{availableCount}</span> karakter dalam pool
      </p>

      {/* Start Button */}
      <Button
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
        disabled={availableCount < 4}
        onClick={() => onStart({ charSet, categoryFilter, questionCount, quizType })}
      >
        <Play size={20} className="mr-2" />
        Mulai Quiz
      </Button>

      {availableCount < 4 && (
        <p className="text-center text-xs text-rose-500">
          Karakter tidak cukup. Pilih set yang lebih besar.
        </p>
      )}
    </div>
  );
}

// ─── Quiz Gameplay Component ─────────────────────────────────────────────────

function QuizGameplay({
  questions,
  quizType,
  onFinish,
  onExit,
}: {
  questions: QuizQuestion[];
  quizType: QuizType;
  onFinish: (answers: QuizAnswer[]) => void;
  onExit: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const correctCount = answers.filter(a => a.isCorrect).length;

  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
    setShowFeedback(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    const answer: QuizAnswer = {
      question: currentQuestion,
      selectedIndex: optionIndex,
      isCorrect,
    };

    setAnswers(prev => [...prev, answer]);

    // Speak the correct answer for kana-to-romaji mode
    if (isCorrect && quizType === 'kana-to-romaji') {
      speakJapanese(currentQuestion.character.ja);
    } else if (!isCorrect && quizType === 'kana-to-romaji') {
      speakJapanese(currentQuestion.character.ja);
    }

    // Auto-advance after delay
    setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSelectedOption(null);
          setShowFeedback(false);
          setIsTransitioning(false);
        } else {
          // Quiz finished - include this last answer
          onFinish([...answers, answer]);
        }
      }, 200);
    }, 1200);
  }, [showFeedback, currentQuestion, currentIndex, questions.length, answers, quizType, onFinish]);

  const getOptionButtonClass = (index: number) => {
    const base = 'w-full p-4 sm:p-5 rounded-xl border-2 font-semibold text-lg transition-all duration-200';

    if (!showFeedback) {
      return cn(base, 'border-muted hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:shadow-md cursor-pointer active:scale-[0.98]');
    }

    if (index === currentQuestion.correctIndex) {
      return cn(base, 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-md');
    }

    if (index === selectedOption && !answers[answers.length]?.isCorrect) {
      // Check if the just-selected answer was wrong (we need to check from the current selection)
      const isCorrectAnswer = index === currentQuestion.correctIndex;
      if (!isCorrectAnswer && index === selectedOption) {
        return cn(base, 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 shadow-md');
      }
    }

    return cn(base, 'border-muted opacity-50');
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          ✕ Keluar
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{correctCount}/{currentIndex + (showFeedback ? 1 : 0)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Soal {currentIndex + 1} dari {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      {/* Question Card */}
      <Card className={cn(
        'border-2 border-teal-200 dark:border-teal-800 shadow-lg transition-opacity duration-200',
        isTransitioning ? 'opacity-0' : 'opacity-100'
      )}>
        <CardContent className="p-6 sm:p-8">
          {/* Question prompt */}
          <p className="text-sm text-muted-foreground text-center mb-4">
            {quizType === 'kana-to-romaji' ? 'Apa romaji dari karakter ini?' : 'Karakter mana yang benar?'}
          </p>

          {/* Question Display */}
          <div className="text-center py-6">
            {quizType === 'kana-to-romaji' ? (
              <span
                className="text-7xl sm:text-8xl font-bold text-foreground block font-jp"
              >
                {currentQuestion.character.ja}
              </span>
            ) : (
              <span className="text-5xl sm:text-6xl font-bold text-foreground block tracking-wide">
                {currentQuestion.character.romaji}
              </span>
            )}
            <p className="text-xs text-muted-foreground mt-3 capitalize">
              {currentQuestion.character.type} · {currentQuestion.character.category}
            </p>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={cn(
              'flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto w-fit text-sm font-semibold transition-all',
              selectedOption === currentQuestion.correctIndex
                ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40'
                : 'text-rose-600 bg-rose-100 dark:bg-rose-950/40'
            )}>
              {selectedOption === currentQuestion.correctIndex ? (
                <>
                  <CheckCircle2 size={18} /> Benar!
                </>
              ) : (
                <>
                  <XCircle size={18} /> Salah! Jawaban: {quizType === 'kana-to-romaji' ? currentQuestion.character.romaji : currentQuestion.character.ja}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options */}
      <div className={cn(
        'grid grid-cols-2 gap-3 transition-opacity duration-200',
        isTransitioning ? 'opacity-0' : 'opacity-100'
      )}>
        {currentQuestion.options.map((option, idx) => (
          <button
            key={`${option.ja}-${idx}`}
            className={getOptionButtonClass(idx)}
            onClick={() => handleOptionSelect(idx)}
            disabled={showFeedback}
          >
            {quizType === 'kana-to-romaji' ? (
              <span className="text-xl">{option.romaji}</span>
            ) : (
              <span
                className="text-3xl sm:text-4xl block font-jp"
              >
                {option.ja}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Quiz Results Component ──────────────────────────────────────────────────

function QuizResults({
  answers,
  questions,
  quizType,
  onRetry,
  onNewQuiz,
}: {
  answers: QuizAnswer[];
  questions: QuizQuestion[];
  quizType: QuizType;
  onRetry: (wrongQuestions: QuizQuestion[]) => void;
  onNewQuiz: () => void;
}) {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = Math.round((correctCount / total) * 100);
  const grade = getGrade(percentage);
  const wrongAnswers = answers.filter(a => !a.isCorrect);

  // Decorative confetti-like elements for S grade
  const isPerfect = percentage === 100;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Grade Card */}
      <Card className={cn(
        'border-2 text-center overflow-hidden',
        isPerfect
          ? 'border-amber-400 dark:border-amber-600'
          : percentage >= 80
            ? 'border-emerald-400 dark:border-emerald-600'
            : percentage >= 60
              ? 'border-sky-400 dark:border-sky-600'
              : 'border-rose-400 dark:border-rose-600'
      )}>
        {/* Gradient Header */}
        <div className={cn(
          'px-6 py-8',
          isPerfect
            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500'
            : percentage >= 80
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : percentage >= 60
                ? 'bg-gradient-to-br from-sky-500 to-cyan-600'
                : 'bg-gradient-to-br from-rose-500 to-pink-600'
        )}>
          {isPerfect && (
            <div className="text-3xl mb-2">🏆</div>
          )}
          <div className={cn(
            'text-7xl font-black mb-2',
            isPerfect ? 'text-amber-100' : 'text-white'
          )}>
            {grade.grade}
          </div>
          <p className="text-lg font-semibold text-white/90">{grade.label}</p>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Score */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-600">{correctCount}</p>
              <p className="text-xs text-muted-foreground">Benar</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black text-rose-500">{total - correctCount}</p>
              <p className="text-xs text-muted-foreground">Salah</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Akurasi</p>
            </div>
          </div>

          {/* Progress */}
          <Progress value={percentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Wrong Answers Review */}
      {wrongAnswers.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-600">
              <XCircle size={16} />
              Jawaban Salah ({wrongAnswers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {wrongAnswers.map((answer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20"
              >
                {/* What was shown */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  {quizType === 'kana-to-romaji' ? (
                    <span
                      className="text-xl font-bold font-jp"
                    >
                      {answer.question.character.ja}
                    </span>
                  ) : (
                    <span className="text-base font-bold">{answer.question.character.romaji}</span>
                  )}
                </div>

                <ArrowRight size={16} className="text-muted-foreground shrink-0" />

                {/* Your answer (wrong) */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">Jawabanmu:</p>
                  <p className="text-sm font-semibold text-rose-600 line-through truncate">
                    {quizType === 'kana-to-romaji'
                      ? answer.question.options[answer.selectedIndex].romaji
                      : answer.question.options[answer.selectedIndex].ja}
                  </p>
                </div>

                <ArrowRight size={16} className="text-emerald-500 shrink-0" />

                {/* Correct answer */}
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10px] text-muted-foreground">Jawaban benar:</p>
                  <p className="text-sm font-semibold text-emerald-600 truncate">
                    {quizType === 'kana-to-romaji'
                      ? answer.question.character.romaji
                      : answer.question.character.ja}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {wrongAnswers.length > 0 && (
          <Button
            variant="outline"
            className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/30"
            onClick={() => onRetry(wrongAnswers.map(a => a.question))}
          >
            <RotateCcw size={16} className="mr-2" />
            Ulangi Salah
          </Button>
        )}
        <Button
          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
          onClick={onNewQuiz}
        >
          <Sparkles size={16} className="mr-2" />
          Quiz Baru
        </Button>
      </div>
    </div>
  );
}

// ─── Main Kana Library Component ─────────────────────────────────────────────

export default function KanaLibrary() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Languages className="text-teal-600" size={22} /> Kana Library
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Belajar huruf dasar bahasa Jepang: Hiragana dan Katakana</p>
      </div>

      <Tabs defaultValue="hiragana">
        <TabsList className="w-full">
          <TabsTrigger value="hiragana" className="flex-1">ひらがな Hiragana</TabsTrigger>
          <TabsTrigger value="katakana" className="flex-1">カタカナ Katakana</TabsTrigger>
          <TabsTrigger value="quiz" className="flex-1">
            <Brain size={14} className="mr-1" /> Quiz
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hiragana" className="mt-4">
          <KanaGrid characters={HIRAGANA} type="hiragana" />
        </TabsContent>
        <TabsContent value="katakana" className="mt-4">
          <KanaGrid characters={KATAKANA} type="katakana" />
        </TabsContent>
        <TabsContent value="quiz" className="mt-4">
          <KanaQuiz />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Kana Quiz Container ────────────────────────────────────────────────────

function KanaQuiz() {
  // 'settings' | 'playing' | 'results'
  const [phase, setPhase] = useState<'settings' | 'playing' | 'results'>('settings');
  const [settings, setSettings] = useState<{
    charSet: CharSet;
    categoryFilter: CategoryFilter;
    questionCount: QuestionCount;
    quizType: QuizType;
  } | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const handleStart = useCallback((newSettings: {
    charSet: CharSet;
    categoryFilter: CategoryFilter;
    questionCount: QuestionCount;
    quizType: QuizType;
  }) => {
    const pool = getCharacterSet(newSettings.charSet, newSettings.categoryFilter);
    const generatedQuestions = generateQuestions(pool, newSettings.questionCount, newSettings.quizType);
    setSettings(newSettings);
    setQuestions(generatedQuestions);
    setAnswers([]);
    setPhase('playing');
  }, []);

  const handleFinish = useCallback((finalAnswers: QuizAnswer[]) => {
    setAnswers(finalAnswers);
    setPhase('results');
  }, []);

  const handleRetryWrong = useCallback((wrongQuestions: QuizQuestion[]) => {
    // Regenerate questions from wrong ones, keeping same quiz type
    if (!settings) return;
    const pool = getCharacterSet(settings.charSet, settings.categoryFilter);
    // For retry, just reuse the wrong questions but shuffle options
    const retryQuestions = wrongQuestions.map(q => {
      const distractors = shuffleArray(pool.filter(c => c.ja !== q.character.ja)).slice(0, 3);
      const options = shuffleArray([q.character, ...distractors]);
      const correctIndex = options.findIndex(o => o.ja === q.character.ja && o.romaji === q.character.romaji);
      return { character: q.character, options, correctIndex };
    });
    setQuestions(retryQuestions);
    setAnswers([]);
    setPhase('playing');
  }, [settings]);

  const handleNewQuiz = useCallback(() => {
    setSettings(null);
    setQuestions([]);
    setAnswers([]);
    setPhase('settings');
  }, []);

  return (
    <div>
      {phase === 'settings' && (
        <QuizSettings onStart={handleStart} />
      )}
      {phase === 'playing' && settings && questions.length > 0 && (
        <QuizGameplay
          questions={questions}
          quizType={settings.quizType}
          onFinish={handleFinish}
          onExit={handleNewQuiz}
        />
      )}
      {phase === 'results' && settings && (
        <QuizResults
          answers={answers}
          questions={questions}
          quizType={settings.quizType}
          onRetry={handleRetryWrong}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}
