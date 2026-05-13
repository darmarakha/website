'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Volume2, RotateCcw, Check, X, Shuffle, Brain, Timer, BarChart3,
  Trash2, Play, Sparkles, Keyboard, Headphones, ArrowRight, Trophy,
  ChevronRight, Languages, BookOpen, BookMarked
} from 'lucide-react';
import { StrokeOrderImage } from '@/components/stroke-order-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HIRAGANA, KATAKANA, KANJI, VOCABULARY, speakJapanese, type Character, type Kanji, type Vocabulary } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────
type DeckCategory = 'hiragana' | 'katakana' | 'kanji' | 'kosakata';
type QuizMode = 'text' | 'audio';

type CardItem = Character | Kanji | Vocabulary;

interface SRSItem {
  cardId: string;
  box: number;
  nextReview: number;
  lastReview: number;
  correctCount: number;
  wrongCount: number;
}

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  category: DeckCategory;
}

interface QuizState {
  phase: 'start' | 'quiz' | 'result';
  deck: DeckCategory;
  mode: QuizMode;
  cards: CardItem[];
  currentIndex: number;
  correct: number;
  wrong: number;
  wrongAnswers: WrongAnswer[];
  answerSubmitted: boolean;
  isCorrect: boolean;
  userInput: string;
  selectedOption: number | null;
  options: string[];
  audioPlaying: boolean;
}

// ── Constants ──────────────────────────────────────────────
const SRS_STORAGE_KEY = 'gemu-srs-data';

const BOX_INTERVALS: Record<number, number> = {
  1: 1 * 60 * 1000,
  2: 10 * 60 * 1000,
  3: 24 * 60 * 60 * 1000,
  4: 3 * 24 * 60 * 60 * 1000,
  5: 7 * 24 * 60 * 60 * 1000,
};

const BOX_COLORS: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', label: 'Baru' },
  2: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', label: 'Belajar' },
  3: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', label: 'Familiar' },
  4: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', label: 'Kuat' },
  5: { bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', label: 'Master' },
};

const DECK_INFO: Record<DeckCategory, { label: string; icon: React.ElementType; count: number; color: string; bgColor: string; desc: string }> = {
  hiragana: { label: 'Hiragana', icon: Languages, count: HIRAGANA.filter(c => c.category !== 'sokuon').length, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-950/30', desc: 'Huruf dasar Jepang' },
  katakana: { label: 'Katakana', icon: Languages, count: KATAKANA.filter(c => c.category !== 'sokuon').length, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', desc: 'Huruf untuk kata serapan' },
  kanji: { label: 'Kanji', icon: BookOpen, count: KANJI.length, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', desc: 'Karakter Tionghoa' },
  kosakata: { label: 'Kosakata', icon: BookMarked, count: VOCABULARY.length, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/30', desc: 'Kata-kata N5' },
};

// ── Helpers ────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getCardId(deck: DeckCategory, item: CardItem): string {
  switch (deck) {
    case 'hiragana': return `hiragana-${(item as Character).ja}`;
    case 'katakana': return `katakana-${(item as Character).ja}`;
    case 'kanji': return `kanji-${(item as Kanji).character}`;
    case 'kosakata': return `kosakata-${(item as Vocabulary).word}`;
  }
}

function getDisplayText(deck: DeckCategory, item: CardItem): string {
  switch (deck) {
    case 'hiragana':
    case 'katakana':
      return (item as Character).ja;
    case 'kanji':
      return (item as Kanji).character;
    case 'kosakata':
      return (item as Vocabulary).word;
  }
}

function getCorrectAnswer(deck: DeckCategory, item: CardItem): string {
  switch (deck) {
    case 'hiragana':
    case 'katakana': {
      const romaji = (item as Character).romaji;
      // Remove the "(sokuon)" suffix if present
      return romaji.replace(/\s*\(sokuon\)\s*/i, '').trim();
    }
    case 'kanji':
      return (item as Kanji).meaning;
    case 'kosakata':
      return (item as Vocabulary).meaning;
  }
}

function getAlternateAnswer(deck: DeckCategory, item: CardItem): string | null {
  if (deck === 'kosakata') {
    return (item as Vocabulary).reading;
  }
  return null;
}

function getAudioText(deck: DeckCategory, item: CardItem): string {
  switch (deck) {
    case 'hiragana':
    case 'katakana':
      return (item as Character).ja;
    case 'kanji':
      return (item as Kanji).character;
    case 'kosakata':
      return (item as Vocabulary).word;
  }
}

function checkAnswer(userInput: string, correctAnswer: string, alternateAnswer: string | null): boolean {
  const user = userInput.trim().toLowerCase();
  const correct = correctAnswer.trim().toLowerCase();
  if (user === correct) return true;
  if (alternateAnswer) {
    const alt = alternateAnswer.trim().toLowerCase();
    if (user === alt) return true;
  }
  // Partial match: user's answer is contained in correct or vice versa
  if (user.length >= 3 && (correct.includes(user) || user.includes(correct))) return true;
  return false;
}

function generateOptions(correctAnswer: string, allPossibleAnswers: string[], count: number = 4): string[] {
  const filtered = allPossibleAnswers.filter(a => a.trim().toLowerCase() !== correctAnswer.trim().toLowerCase());
  const shuffled = shuffleArray(filtered);
  const options = [correctAnswer, ...shuffled.slice(0, count - 1)];
  return shuffleArray(options);
}

function getAllAnswers(deck: DeckCategory): string[] {
  switch (deck) {
    case 'hiragana':
      return HIRAGANA.filter(c => c.category !== 'sokuon').map(c => c.romaji.replace(/\s*\(sokuon\)\s*/i, '').trim());
    case 'katakana':
      return KATAKANA.filter(c => c.category !== 'sokuon').map(c => c.romaji.replace(/\s*\(sokuon\)\s*/i, '').trim());
    case 'kanji':
      return KANJI.map(k => k.meaning);
    case 'kosakata':
      return VOCABULARY.map(v => v.meaning);
  }
}

function getDeckCards(deck: DeckCategory): CardItem[] {
  switch (deck) {
    case 'hiragana':
      return shuffleArray(HIRAGANA.filter(c => c.category !== 'sokuon'));
    case 'katakana':
      return shuffleArray(KATAKANA.filter(c => c.category !== 'sokuon'));
    case 'kanji':
      return shuffleArray(KANJI);
    case 'kosakata':
      return shuffleArray(VOCABULARY);
  }
}

// ── SRS Helpers ────────────────────────────────────────────
function loadSRSData(): Map<string, SRSItem> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    if (!raw) return new Map();
    const arr: SRSItem[] = JSON.parse(raw);
    const map = new Map<string, SRSItem>();
    for (const item of arr) {
      map.set(item.cardId, item);
    }
    return map;
  } catch {
    return new Map();
  }
}

function saveSRSData(data: Map<string, SRSItem>) {
  if (typeof window === 'undefined') return;
  const arr = Array.from(data.values());
  localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(arr));
}

function getDueCards(deck: DeckCategory, srsData: Map<string, SRSItem>): SRSItem[] {
  const now = Date.now();
  const prefix = `${deck}-`;
  const due: SRSItem[] = [];
  for (const [id, item] of srsData) {
    if (id.startsWith(prefix) && item.nextReview <= now) {
      due.push(item);
    }
  }
  return due.sort((a, b) => a.nextReview - b.nextReview);
}

function getUnseenCards(deck: DeckCategory, srsData: Map<string, SRSItem>): string[] {
  const allCards = getDeckCards(deck);
  const unseen: string[] = [];
  for (const card of allCards) {
    const id = getCardId(deck, card);
    if (!srsData.has(id)) {
      unseen.push(id);
    }
  }
  return unseen;
}

function getBoxCounts(deck: DeckCategory, srsData: Map<string, SRSItem>): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const prefix = `${deck}-`;
  for (const [id, item] of srsData) {
    if (id.startsWith(prefix) && item.box >= 1 && item.box <= 5) {
      counts[item.box]++;
    }
  }
  return counts;
}

function findItemById(deck: DeckCategory, cardId: string): CardItem | null {
  const prefix = `${deck}-`;
  const identifier = cardId.replace(prefix, '');
  switch (deck) {
    case 'hiragana':
      return HIRAGANA.find(c => c.ja === identifier) ?? null;
    case 'katakana':
      return KATAKANA.find(c => c.ja === identifier) ?? null;
    case 'kanji':
      return KANJI.find(k => k.character === identifier) ?? null;
    case 'kosakata':
      return VOCABULARY.find(v => v.word === identifier) ?? null;
  }
}

// ── Initial quiz state factory ─────────────────────────────
function createQuizState(deck: DeckCategory, mode: QuizMode, cards?: CardItem[]): QuizState {
  const deckCards = cards ?? getDeckCards(deck);
  const allAnswers = getAllAnswers(deck);
  const firstCard = deckCards[0];
  const correctAnswer = firstCard ? getCorrectAnswer(deck, firstCard) : '';
  const options = mode === 'audio' && firstCard ? generateOptions(correctAnswer, allAnswers) : [];

  return {
    phase: 'quiz',
    deck,
    mode,
    cards: deckCards,
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    wrongAnswers: [],
    answerSubmitted: false,
    isCorrect: false,
    userInput: '',
    selectedOption: null,
    options,
    audioPlaying: false,
  };
}

// ── SRS Dashboard Component ────────────────────────────────
function SRSDashboard({
  deck,
  srsData,
  onStartReview,
  onReset,
  onToggle
}: {
  deck: DeckCategory;
  srsData: Map<string, SRSItem>;
  onStartReview: () => void;
  onReset: () => void;
  onToggle: () => void;
}) {
  const dueCards = getDueCards(deck, srsData);
  const unseen = getUnseenCards(deck, srsData);
  const boxCounts = getBoxCounts(deck, srsData);
  const totalInSRS = Object.values(boxCounts).reduce((a, b) => a + b, 0);
  const totalCards = DECK_INFO[deck].count;
  const boxMax = Math.max(...Object.values(boxCounts), 1);
  const hasCardsToStudy = dueCards.length > 0 || unseen.length > 0;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{dueCards.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Perlu Review</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{unseen.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Belum Dilihat</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalInSRS}/{totalCards}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Dalam SRS</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-teal-500" /> Distribusi Kotak SRS
          </h4>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map(box => {
              const colors = BOX_COLORS[box];
              const count = boxCounts[box];
              const pct = boxMax > 0 ? (count / boxMax) * 100 : 0;
              return (
                <div key={box} className="flex items-center gap-2">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border', colors.bg, colors.border, colors.text)}>
                    {box}
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', box === 5 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : box === 4 ? 'bg-emerald-500' : box === 3 ? 'bg-teal-500' : box === 2 ? 'bg-amber-500' : 'bg-rose-500')}
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground w-6 text-right">{count}</span>
                  <span className="text-[10px] text-muted-foreground/60 w-12 text-right">{colors.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
          onClick={onStartReview}
          disabled={!hasCardsToStudy}
        >
          <Play size={16} className="mr-1.5" />
          Mulai Review ({dueCards.length + unseen.length})
        </Button>
        {showResetConfirm ? (
          <Button variant="outline" size="sm" className="border-rose-300 text-rose-600 hover:bg-rose-50" onClick={() => { onReset(); setShowResetConfirm(false); }}>
            Konfirmasi
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(true)}>
            <Trash2 size={14} className="mr-1" /> Reset
          </Button>
        )}
      </div>

      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onToggle}>
        Kembali ke Mode Normal
      </Button>
    </div>
  );
}

// ── Start Screen ───────────────────────────────────────────
function StartScreen({ onStart }: { onStart: (deck: DeckCategory, mode: QuizMode) => void }) {
  const [selectedDeck, setSelectedDeck] = useState<DeckCategory>('hiragana');
  const [selectedMode, setSelectedMode] = useState<QuizMode>('text');

  return (
    <div className="space-y-5">
      {/* Category Selection */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <Shuffle size={14} className="text-teal-500" /> Pilih Kategori
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(DECK_INFO) as DeckCategory[]).map((key) => {
            const info = DECK_INFO[key];
            const Icon = info.icon;
            const isSelected = selectedDeck === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDeck(key)}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  isSelected
                    ? 'border-teal-500 dark:border-teal-400 shadow-md shadow-teal-500/10'
                    : 'border-muted hover:border-teal-300 dark:hover:border-teal-700'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check size={16} className="text-teal-600 dark:text-teal-400" />
                  </div>
                )}
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', info.bgColor)}>
                  <Icon size={18} className={info.color} />
                </div>
                <p className="font-bold text-sm">{info.label}</p>
                <p className="text-[11px] text-muted-foreground">{info.desc}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">
                  {info.count} kartu
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <Sparkles size={14} className="text-teal-500" /> Pilih Mode
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedMode('text')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all duration-200 text-center',
              selectedMode === 'text'
                ? 'border-teal-500 dark:border-teal-400 shadow-md shadow-teal-500/10 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-muted hover:border-teal-300 dark:hover:border-teal-700'
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', selectedMode === 'text' ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground')}>
              <Keyboard size={20} />
            </div>
            <p className="font-bold text-sm">Mode Teks</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Ketik jawabanmu</p>
          </button>
          <button
            onClick={() => setSelectedMode('audio')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all duration-200 text-center',
              selectedMode === 'audio'
                ? 'border-teal-500 dark:border-teal-400 shadow-md shadow-teal-500/10 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-muted hover:border-teal-300 dark:hover:border-teal-700'
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', selectedMode === 'audio' ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground')}>
              <Headphones size={20} />
            </div>
            <p className="font-bold text-sm">Mode Audio</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Dengar & pilih</p>
          </button>
        </div>
      </div>

      {/* Start Button */}
      <Button
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white h-12 text-base font-bold"
        onClick={() => onStart(selectedDeck, selectedMode)}
      >
        <Play size={18} className="mr-2" />
        Mulai Latihan
        <ChevronRight size={18} className="ml-1" />
      </Button>
    </div>
  );
}

// ── Text Mode Card ─────────────────────────────────────────
function TextModeCard({
  state,
  setState,
}: {
  state: QuizState;
  setState: React.Dispatch<React.SetStateAction<QuizState>>;
}) {
  const { deck, cards, currentIndex, answerSubmitted, isCorrect, userInput } = state;
  const card = cards[currentIndex];
  const inputRef = useRef<HTMLInputElement>(null);
  const correctAnswer = card ? getCorrectAnswer(deck, card) : '';
  const alternateAnswer = card ? getAlternateAnswer(deck, card) : null;

  useEffect(() => {
    if (!answerSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, answerSubmitted]);

  if (!card) return null;

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    const correct = checkAnswer(userInput, correctAnswer, alternateAnswer);
    setState(prev => ({
      ...prev,
      answerSubmitted: true,
      isCorrect: correct,
      correct: correct ? prev.correct + 1 : prev.correct,
      wrong: correct ? prev.wrong : prev.wrong + 1,
      wrongAnswers: correct ? prev.wrongAnswers : [
        ...prev.wrongAnswers,
        {
          question: getDisplayText(deck, card),
          userAnswer: userInput.trim(),
          correctAnswer,
          category: deck,
        }
      ],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !answerSubmitted) {
      handleSubmit();
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      setState(prev => ({ ...prev, phase: 'result' }));
    } else {
      const nextCard = cards[nextIndex];
      setState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        answerSubmitted: false,
        isCorrect: false,
        userInput: '',
        selectedOption: null,
      }));
    }
  };

  const displayText = getDisplayText(deck, card);

  // Subtitle info for the card
  const subtitle = (() => {
    switch (deck) {
      case 'hiragana':
      case 'katakana':
        return 'Ketik romaji';
      case 'kanji':
        return 'Ketik arti dalam Bahasa Indonesia';
      case 'kosakata':
        return 'Ketik arti dalam Bahasa Indonesia';
    }
  })();

  return (
    <div className="space-y-4">
      {/* Question Card */}
      <Card className={cn(
        'transition-all duration-300',
        answerSubmitted
          ? isCorrect
            ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-rose-400 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
          : 'border-muted'
      )}>
        <CardContent className="p-6 flex flex-col items-center">
          <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
          <div className="text-6xl sm:text-7xl font-bold mb-2 font-jp">
            {displayText}
          </div>

          {/* Kanji extra info */}
          {deck === 'kanji' && !answerSubmitted && (
            <p className="text-xs text-muted-foreground mt-1">
              {(card as Kanji).strokes} goresan
            </p>
          )}

          {/* Vocabulary reading */}
          {deck === 'kosakata' && !answerSubmitted && (
            <p className="text-sm text-muted-foreground mt-1 font-jp">
              [{(card as Vocabulary).reading}]
            </p>
          )}

          {/* Audio button */}
          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => speakJapanese(getAudioText(deck, card))}
          >
            <Volume2 size={14} className="mr-1" /> Dengarkan
          </Button>
        </CardContent>
      </Card>

      {/* Input Area */}
      {!answerSubmitted ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setState(prev => ({ ...prev, userInput: e.target.value }))}
              onKeyDown={handleKeyDown}
              placeholder="Ketik jawabanmu..."
              className="h-12 text-base"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <Button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white h-12 px-6"
            >
              Cek
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Feedback */}
          {isCorrect ? (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce">
                <Check size={18} strokeWidth={3} />
              </div>
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">Benar!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">{correctAnswer}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-[shake_0.5s_ease-in-out]">
                  <X size={18} strokeWidth={3} />
                </div>
                <div>
                  <p className="font-bold text-rose-700 dark:text-rose-400">Salah!</p>
                  <p className="text-xs text-rose-600 dark:text-rose-500">
                    Kamu menjawab: <span className="font-semibold line-through">{userInput.trim()}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-100 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700">
                <p className="text-sm">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">Jawaban yang benar: </span>
                  <span className="text-teal-600 dark:text-teal-500">{correctAnswer}</span>
                </p>
              </div>
              {deck === 'kanji' && (card as Kanji).examples.length > 0 && (
                <Card className="border-muted">
                  <CardContent className="p-3 space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground">Detail Kanji:</p>
                    <div className="text-xs space-y-1">
                      <p><span className="font-semibold text-rose-600">Onyomi:</span> {(card as Kanji).onyomi}</p>
                      <p><span className="font-semibold text-teal-600">Kunyomi:</span> {(card as Kanji).kunyomi}</p>
                      <p className="font-medium font-jp">
                        {(card as Kanji).examples[0]?.word} <span className="text-muted-foreground">({(card as Kanji).examples[0]?.meaning})</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Button
            className="w-full h-12 text-base font-semibold"
            variant={isCorrect ? 'default' : 'outline'}
            onClick={handleNext}
          >
            {currentIndex + 1 < cards.length ? (
              <>
                Selanjutnya <ArrowRight size={16} className="ml-1" />
              </>
            ) : (
              <>
                Lihat Hasil <Trophy size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Audio Mode Card ────────────────────────────────────────
function AudioModeCard({
  state,
  setState,
}: {
  state: QuizState;
  setState: React.Dispatch<React.SetStateAction<QuizState>>;
}) {
  const { deck, cards, currentIndex, answerSubmitted, isCorrect, selectedOption, options } = state;
  const card = cards[currentIndex];
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const correctAnswer = card ? getCorrectAnswer(deck, card) : '';
  const audioText = card ? getAudioText(deck, card) : '';

  const playAudio = useCallback(() => {
    setState(prev => ({ ...prev, audioPlaying: true }));
    speakJapanese(audioText);
    setTimeout(() => {
      setState(prev => ({ ...prev, audioPlaying: false }));
    }, 1500);
  }, [audioText, setState]);

  // Auto-play on card change
  useEffect(() => {
    if (!answerSubmitted && card) {
      const timer = setTimeout(() => {
        playAudio();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, answerSubmitted, playAudio, card]);

  // Auto-advance after correct answer
  useEffect(() => {
    if (answerSubmitted && isCorrect && card) {
      autoAdvanceRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= cards.length) {
          setState(prev => ({ ...prev, phase: 'result' }));
        } else {
          setState(prev => ({
            ...prev,
            currentIndex: nextIndex,
            answerSubmitted: false,
            isCorrect: false,
            userInput: '',
            selectedOption: null,
            options: (() => {
              const nextCard = cards[nextIndex];
              const nextCorrect = getCorrectAnswer(deck, nextCard);
              return generateOptions(nextCorrect, getAllAnswers(deck));
            })(),
          }));
        }
      }, 1500);
    }
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [answerSubmitted, isCorrect, currentIndex, cards, deck, setState, card]);

  if (!card) return null;

  const handleSelect = (index: number) => {
    if (answerSubmitted) return;
    const selected = options[index];
    const correct = checkAnswer(selected, correctAnswer, null);
    setState(prev => ({
      ...prev,
      answerSubmitted: true,
      isCorrect: correct,
      selectedOption: index,
      correct: correct ? prev.correct + 1 : prev.correct,
      wrong: correct ? prev.wrong : prev.wrong + 1,
      wrongAnswers: correct ? prev.wrongAnswers : [
        ...prev.wrongAnswers,
        {
          question: audioText,
          userAnswer: selected,
          correctAnswer,
          category: deck,
        }
      ],
    }));
  };

  const handleNext = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      setState(prev => ({ ...prev, phase: 'result' }));
    } else {
      const nextCard = cards[nextIndex];
      setState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        answerSubmitted: false,
        isCorrect: false,
        userInput: '',
        selectedOption: null,
        options: (() => {
          const nextCorrect = getCorrectAnswer(deck, nextCard);
          return generateOptions(nextCorrect, getAllAnswers(deck));
        })(),
      }));
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-4">
      {/* Audio Player Card */}
      <Card className="border-muted">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <button
            onClick={playAudio}
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200',
              state.audioPlaying
                ? 'bg-teal-100 dark:bg-teal-900/40 scale-110'
                : 'bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 active:scale-95'
            )}
          >
            <Volume2 size={32} className={cn('transition-colors', state.audioPlaying ? 'text-teal-600 dark:text-teal-400 animate-pulse' : 'text-white')} />
          </button>
          <p className="text-sm text-muted-foreground font-medium">
            {state.audioPlaying ? 'Memutar audio...' : 'Ketuk untuk memutar ulang'}
          </p>
          <p className="text-xs text-muted-foreground">
            {deck === 'hiragana' ? 'Pilih romaji yang benar'
              : deck === 'katakana' ? 'Pilih romaji yang benar'
                : 'Pilih arti yang benar'}
          </p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option, idx) => {
          let buttonClass = 'border-muted hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20';
          if (answerSubmitted) {
            const isThisCorrect = checkAnswer(option, correctAnswer, null);
            const isThisSelected = idx === selectedOption;
            if (isThisCorrect) {
              buttonClass = 'border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-950/40';
            } else if (isThisSelected && !isCorrect) {
              buttonClass = 'border-rose-400 dark:border-rose-600 bg-rose-100 dark:bg-rose-950/40 animate-[shake_0.5s_ease-in-out]';
            } else {
              buttonClass = 'border-muted opacity-50';
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answerSubmitted}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                buttonClass
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                answerSubmitted && checkAnswer(option, correctAnswer, null)
                  ? 'bg-emerald-500 text-white'
                  : answerSubmitted && idx === selectedOption && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : 'bg-muted text-muted-foreground'
              )}>
                {answerSubmitted && checkAnswer(option, correctAnswer, null) ? (
                  <Check size={16} />
                ) : answerSubmitted && idx === selectedOption && !isCorrect ? (
                  <X size={16} />
                ) : (
                  optionLabels[idx]
                )}
              </div>
              <span className={cn(
                'font-medium text-sm',
                deck === 'hiragana' || deck === 'katakana' ? 'font-mono' : ''
              )}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Wrong answer feedback + next button */}
      {answerSubmitted && !isCorrect && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-100 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700">
            <p className="text-sm">
              <span className="font-semibold text-teal-700 dark:text-teal-400">Jawaban yang benar: </span>
              <span className="text-teal-600 dark:text-teal-500">{correctAnswer}</span>
            </p>
          </div>
          <Button className="w-full h-12 text-base font-semibold" variant="outline" onClick={handleNext}>
            {currentIndex + 1 < cards.length ? (
              <>Selanjutnya <ArrowRight size={16} className="ml-1" /></>
            ) : (
              <>Lihat Hasil <Trophy size={16} className="ml-1" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Result Screen ──────────────────────────────────────────
function ResultScreen({
  state,
  onRetryWrong,
  onNewSession,
}: {
  state: QuizState;
  onRetryWrong: () => void;
  onNewSession: () => void;
}) {
  const { correct, wrong, wrongAnswers, deck, cards, mode } = state;
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const emoji = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 50 ? '💪' : '📚';

  return (
    <div className="space-y-5">
      {/* Score Card */}
      <Card className="border-muted">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-5xl">{emoji}</div>
          <h3 className="text-xl font-black">
            {accuracy >= 90 ? 'Luar Biasa!' : accuracy >= 70 ? 'Bagus Sekali!' : accuracy >= 50 ? 'Terus Berlatih!' : 'Jangan Menyerah!'}
          </h3>

          {/* Score Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{correct}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Benar</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{wrong}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Salah</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30">
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{accuracy}%</p>
              <p className="text-[10px] text-muted-foreground font-medium">Akurasi</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {DECK_INFO[deck].label} • {mode === 'text' ? 'Mode Teks' : 'Mode Audio'} • {total} kartu
          </p>
        </CardContent>
      </Card>

      {/* Wrong Answers List */}
      {wrongAnswers.length > 0 && (
        <Card className="border-muted">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <X size={14} className="text-rose-500" /> Jawaban Salah ({wrongAnswers.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wrongAnswers.map((wa, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-jp">
                      {wa.question}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                      {DECK_INFO[wa.category].label}
                    </Badge>
                  </div>
                  <p className="text-xs">
                    <span className="text-rose-600 line-through">{wa.userAnswer}</span>
                    <ArrowRight size={10} className="inline mx-1 text-muted-foreground" />
                    <span className="text-emerald-600 font-semibold">{wa.correctAnswer}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {wrongAnswers.length > 0 && (
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={onRetryWrong}
          >
            <RotateCcw size={16} className="mr-1.5" />
            Ulangi yang Salah ({wrongAnswers.length})
          </Button>
        )}
        <Button
          className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
          onClick={onNewSession}
        >
          <Shuffle size={16} className="mr-1.5" />
          Sesi Baru
        </Button>
      </div>
    </div>
  );
}

// ── SRS Result Screen ──────────────────────────────────────
function SRSResultScreen({
  correct,
  wrong,
  onBack,
  onDashboard,
}: {
  correct: number;
  wrong: number;
  onBack: () => void;
  onDashboard: () => void;
}) {
  const total = correct + wrong;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="max-w-sm mx-auto">
      <CardContent className="p-8 text-center space-y-3">
        <div className="text-5xl">🎯</div>
        <h3 className="font-bold text-lg">Review SRS Selesai!</h3>
        <div className="space-y-1 text-sm">
          <p className="text-emerald-600">Benar: {correct}</p>
          <p className="text-rose-600">Salah: {wrong}</p>
          <p className="font-bold mt-2">Akurasi: {pct}%</p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-950/30 rounded-lg p-3 text-xs text-teal-700 dark:text-teal-400 mt-3">
          <Sparkles size={12} className="inline mr-1" />
          Kartu yang benar dipindah ke kotak berikutnya. Kartu yang salah kembali ke kotak 1.
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Kembali
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" onClick={onDashboard}>
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function Flashcards() {
  const isClient = typeof window !== 'undefined';

  // Main quiz state
  const [quizState, setQuizState] = useState<QuizState>({
    phase: 'start',
    deck: 'hiragana',
    mode: 'text',
    cards: [],
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    wrongAnswers: [],
    answerSubmitted: false,
    isCorrect: false,
    userInput: '',
    selectedOption: null,
    options: [],
    audioPlaying: false,
  });

  // SRS mode state
  const [srsMode, setSrsMode] = useState(false);
  const [srsStarted, setSrsStarted] = useState(false);
  const [srsIndex, setSrsIndex] = useState(0);
  const [srsCorrect, setSrsCorrect] = useState(0);
  const [srsWrong, setSrsWrong] = useState(0);
  const [srsData, setSrsData] = useState<Map<string, SRSItem>>(() => isClient ? loadSRSData() : new Map());
  const [srsAnswerSubmitted, setSrsAnswerSubmitted] = useState(false);
  const [srsIsCorrect, setSrsIsCorrect] = useState(false);
  const [srsUserInput, setSrsUserInput] = useState('');
  const [srsSelectedOption, setSrsSelectedOption] = useState<number | null>(null);
  const [srsOptions, setSrsOptions] = useState<string[]>([]);
  const [srsModeType, setSrsModeType] = useState<QuizMode>('text');

  // SRS deck selection
  const [srsDeck, setSrsDeck] = useState<DeckCategory>('hiragana');

  // SRS computed
  const dueCards = useMemo(() => isClient ? getDueCards(srsDeck, srsData) : [], [srsDeck, srsData, isClient]);
  const unseenCards = useMemo(() => isClient ? getUnseenCards(srsDeck, srsData) : [], [srsDeck, srsData, isClient]);
  const srsReviewQueue = useMemo(() => {
    const queue = [...dueCards.map(d => d.cardId)];
    const maxNew = Math.min(unseenCards.length, 10);
    for (let i = 0; i < maxNew; i++) {
      queue.push(unseenCards[i]);
    }
    return queue;
  }, [dueCards, unseenCards]);

  const hasCardsToStudy = dueCards.length > 0 || unseenCards.length > 0;
  const currentSRSCardId = srsReviewQueue[srsIndex] ?? null;
  const currentSRSItem = currentSRSCardId ? srsData.get(currentSRSCardId) ?? null : null;
  const currentSRSCard = currentSRSCardId ? findItemById(srsDeck, currentSRSCardId) : null;
  const srsComplete = srsStarted && srsIndex >= srsReviewQueue.length;
  const srsTotal = srsCorrect + srsWrong;
  const srsPct = srsTotal > 0 ? Math.round((srsCorrect / srsTotal) * 100) : 0;

  // Handlers for normal mode
  const handleStart = useCallback((deck: DeckCategory, mode: QuizMode) => {
    const cards = getDeckCards(deck);
    const allAnswers = getAllAnswers(deck);
    const firstCard = cards[0];
    const correctAnswer = firstCard ? getCorrectAnswer(deck, firstCard) : '';
    const options = mode === 'audio' && firstCard ? generateOptions(correctAnswer, allAnswers) : [];

    setQuizState({
      phase: 'quiz',
      deck,
      mode,
      cards,
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      wrongAnswers: [],
      answerSubmitted: false,
      isCorrect: false,
      userInput: '',
      selectedOption: null,
      options,
      audioPlaying: false,
    });
  }, []);

  const handleRetryWrong = useCallback(() => {
    const { deck, mode, wrongAnswers } = quizState;
    if (wrongAnswers.length === 0) return;
    // Rebuild cards from wrong answers
    const wrongCardIds = wrongAnswers.map(wa => {
      const prefix = `${wa.category}-`;
      return wa.question;
    });
    const originalCards = getDeckCards(deck);
    const retryCards = originalCards.filter(card =>
      wrongCardIds.includes(getDisplayText(deck, card))
    );

    if (retryCards.length === 0) {
      setQuizState(prev => ({ ...prev, phase: 'start' }));
      return;
    }

    const allAnswers = getAllAnswers(deck);
    const firstCard = retryCards[0];
    const correctAnswer = firstCard ? getCorrectAnswer(deck, firstCard) : '';
    const options = mode === 'audio' && firstCard ? generateOptions(correctAnswer, allAnswers) : [];

    setQuizState({
      phase: 'quiz',
      deck,
      mode,
      cards: retryCards,
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      wrongAnswers: [],
      answerSubmitted: false,
      isCorrect: false,
      userInput: '',
      selectedOption: null,
      options,
      audioPlaying: false,
    });
  }, [quizState]);

  const handleNewSession = useCallback(() => {
    setQuizState(prev => ({ ...prev, phase: 'start' }));
  }, []);

  // SRS handlers
  const handleSRSToggle = useCallback(() => {
    setSrsMode(prev => {
      if (!prev) {
        setSrsData(loadSRSData());
        setSrsStarted(false);
        setSrsIndex(0);
        setSrsCorrect(0);
        setSrsWrong(0);
        setSrsAnswerSubmitted(false);
        setSrsUserInput('');
        setSrsSelectedOption(null);
      }
      return !prev;
    });
  }, []);

  const handleSRSResult = useCallback((cardId: string, isCorrect: boolean) => {
    setSrsData(prev => {
      const next = new Map(prev);
      const existing = next.get(cardId);
      const now = Date.now();

      if (existing) {
        if (isCorrect) {
          existing.box = Math.min(existing.box + 1, 5);
          existing.correctCount++;
        } else {
          existing.box = 1;
          existing.wrongCount++;
        }
        existing.nextReview = now + (BOX_INTERVALS[existing.box] || BOX_INTERVALS[1]);
        existing.lastReview = now;
        next.set(cardId, existing);
      } else {
        const newItem: SRSItem = {
          cardId,
          box: isCorrect ? 2 : 1,
          nextReview: now + (BOX_INTERVALS[isCorrect ? 2 : 1]),
          lastReview: now,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
        };
        next.set(cardId, newItem);
      }

      saveSRSData(next);
      return next;
    });

    if (isCorrect) setSrsCorrect(c => c + 1);
    else setSrsWrong(w => w + 1);
  }, []);

  const handleSRSNext = useCallback(() => {
    setSrsAnswerSubmitted(false);
    setSrsIsCorrect(false);
    setSrsUserInput('');
    setSrsSelectedOption(null);
    setSrsIndex(i => i + 1);
  }, []);

  const handleSRSReset = useCallback(() => {
    setSrsData(prev => {
      const next = new Map(prev);
      const prefix = `${srsDeck}-`;
      for (const [id] of next) {
        if (id.startsWith(prefix)) {
          next.delete(id);
        }
      }
      saveSRSData(next);
      return next;
    });
    setSrsStarted(false);
    setSrsIndex(0);
    setSrsCorrect(0);
    setSrsWrong(0);
  }, [srsDeck]);

  const handleSRSDeckChange = useCallback((deck: DeckCategory) => {
    setSrsDeck(deck);
    setSrsData(loadSRSData());
    setSrsStarted(false);
    setSrsIndex(0);
    setSrsCorrect(0);
    setSrsWrong(0);
    setSrsAnswerSubmitted(false);
  }, []);

  // SRS text mode submit
  const handleSRSTextSubmit = useCallback(() => {
    if (!currentSRSCard || srsAnswerSubmitted || !srsUserInput.trim()) return;
    const correctAnswer = getCorrectAnswer(srsDeck, currentSRSCard);
    const alternateAnswer = getAlternateAnswer(srsDeck, currentSRSCard);
    const correct = checkAnswer(srsUserInput, correctAnswer, alternateAnswer);
    setSrsAnswerSubmitted(true);
    setSrsIsCorrect(correct);
    handleSRSResult(currentSRSCardId!, correct);
  }, [currentSRSCard, srsAnswerSubmitted, srsUserInput, srsDeck, currentSRSCardId, handleSRSResult]);

  // Compute SRS options via useMemo (not setState inside effect)
  const computedSrsOptions = useMemo(() => {
    if (currentSRSCard && !srsAnswerSubmitted && srsModeType === 'audio') {
      const correctAnswer = getCorrectAnswer(srsDeck, currentSRSCard);
      return generateOptions(correctAnswer, getAllAnswers(srsDeck));
    }
    return srsOptions;
  }, [currentSRSCard, srsAnswerSubmitted, srsModeType, srsDeck, srsOptions]);

  // SRS audio mode select
  const handleSRSAudioSelect = useCallback((index: number) => {
    if (!currentSRSCard || srsAnswerSubmitted) return;
    const selected = computedSrsOptions[index];
    const correctAnswer = getCorrectAnswer(srsDeck, currentSRSCard);
    const correct = checkAnswer(selected, correctAnswer, null);
    setSrsAnswerSubmitted(true);
    setSrsIsCorrect(correct);
    setSrsSelectedOption(index);
    handleSRSResult(currentSRSCardId!, correct);
  }, [currentSRSCard, srsAnswerSubmitted, computedSrsOptions, srsDeck, currentSRSCardId, handleSRSResult]);

  // SRS auto-advance in audio mode
  const srsAutoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (srsAnswerSubmitted && srsIsCorrect && srsModeType === 'audio') {
      srsAutoAdvanceRef.current = setTimeout(() => {
        handleSRSNext();
      }, 1500);
    }
    return () => {
      if (srsAutoAdvanceRef.current) clearTimeout(srsAutoAdvanceRef.current);
    };
  }, [srsAnswerSubmitted, srsIsCorrect, srsModeType, handleSRSNext]);

  // Play SRS audio on card change
  useEffect(() => {
    if (currentSRSCard && !srsAnswerSubmitted && srsModeType === 'audio') {
      const timer = setTimeout(() => {
        speakJapanese(getAudioText(srsDeck, currentSRSCard));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentSRSCard, srsAnswerSubmitted, srsModeType, srsDeck]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="text-teal-600" size={22} /> Flashcards
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {srsMode ? 'Spaced Repetition — hafalan jangka panjang!' : 'Active recall — cara paling efektif menghafal!'}
          </p>
        </div>
        {/* SRS Toggle */}
        <button
          onClick={handleSRSToggle}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
            srsMode
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-sm'
              : 'bg-muted text-muted-foreground hover:text-foreground border-transparent hover:border-teal-300'
          )}
        >
          <Timer size={12} />
          SRS
          {srsMode && dueCards.length > 0 && (
            <Badge className="ml-1 bg-white/20 text-white text-[9px] px-1.5 py-0 border-0">
              {dueCards.length}
            </Badge>
          )}
        </button>
      </div>

      {/* ═══════════════════ SRS MODE ═══════════════════ */}
      {srsMode && (
        <>
          {/* SRS Deck selector */}
          {!srsStarted && (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DECK_INFO) as DeckCategory[]).map((key) => {
                const info = DECK_INFO[key];
                const isSelected = srsDeck === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSRSDeckChange(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                      isSelected
                        ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400'
                        : 'border-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* SRS Mode selector */}
          {!srsStarted && (
            <div className="flex gap-2">
              <button
                onClick={() => setSrsModeType('text')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                  srsModeType === 'text'
                    ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400'
                    : 'border-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Keyboard size={12} /> Teks
              </button>
              <button
                onClick={() => setSrsModeType('audio')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                  srsModeType === 'audio'
                    ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400'
                    : 'border-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Headphones size={12} /> Audio
              </button>
            </div>
          )}

          {/* SRS Dashboard */}
          {srsMode && !srsStarted && (
            <SRSDashboard
              deck={srsDeck}
              srsData={srsData}
              onStartReview={() => {
                if (hasCardsToStudy) setSrsStarted(true);
              }}
              onReset={handleSRSReset}
              onToggle={handleSRSToggle}
            />
          )}

          {/* SRS Quiz - Text Mode */}
          {srsStarted && !srsComplete && currentSRSCard && srsModeType === 'text' && (
            <>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {srsIndex + 1} / {srsReviewQueue.length}
                  </Badge>
                  <Badge className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 text-xs">
                    <Timer size={10} className="mr-1" /> SRS
                  </Badge>
                  {currentSRSItem && (
                    <Badge className={cn('text-xs', BOX_COLORS[currentSRSItem.box].bg, BOX_COLORS[currentSRSItem.box].text, BOX_COLORS[currentSRSItem.box].border, 'border')}>
                      Box {currentSRSItem.box}/5
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> {srsCorrect}</span>
                  <span className="text-rose-600 flex items-center gap-1"><X size={12} /> {srsWrong}</span>
                </div>
              </div>
              <Progress value={((srsIndex + 1) / srsReviewQueue.length) * 100} className="h-1.5" />

              <div className="space-y-4">
                <Card className={cn(
                  'transition-all duration-300',
                  srsAnswerSubmitted
                    ? srsIsCorrect
                      ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-rose-400 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-muted'
                )}>
                  <CardContent className="p-6 flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      {srsDeck === 'hiragana' || srsDeck === 'katakana' ? 'Ketik romaji' : 'Ketik arti dalam Bahasa Indonesia'}
                    </p>
                    <div className="text-6xl sm:text-7xl font-bold mb-2 font-jp">
                      {getDisplayText(srsDeck, currentSRSCard)}
                    </div>
                    {srsDeck === 'kanji' && !srsAnswerSubmitted && (
                      <p className="text-xs text-muted-foreground mt-1">{(currentSRSCard as Kanji).strokes} goresan</p>
                    )}
                    {srsDeck === 'kosakata' && !srsAnswerSubmitted && (
                      <p className="text-sm text-muted-foreground mt-1 font-jp">
                        [{(currentSRSCard as Vocabulary).reading}]
                      </p>
                    )}
                    <Button size="sm" variant="ghost" className="mt-3" onClick={() => speakJapanese(getAudioText(srsDeck, currentSRSCard))}>
                      <Volume2 size={14} className="mr-1" /> Dengarkan
                    </Button>
                  </CardContent>
                </Card>

                {!srsAnswerSubmitted ? (
                  <div className="flex gap-2">
                    <Input
                      value={srsUserInput}
                      onChange={(e) => setSrsUserInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSRSTextSubmit(); }}
                      placeholder="Ketik jawabanmu..."
                      className="h-12 text-base"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    <Button
                      onClick={handleSRSTextSubmit}
                      disabled={!srsUserInput.trim()}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white h-12 px-6"
                    >
                      Cek
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {srsIsCorrect ? (
                      <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce">
                          <Check size={18} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-700 dark:text-emerald-400">Benar!</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">{getCorrectAnswer(srsDeck, currentSRSCard)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700">
                          <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-[shake_0.5s_ease-in-out]">
                            <X size={18} strokeWidth={3} />
                          </div>
                          <div>
                            <p className="font-bold text-rose-700 dark:text-rose-400">Salah!</p>
                            <p className="text-xs text-rose-600 dark:text-rose-500">
                              Kamu menjawab: <span className="font-semibold line-through">{srsUserInput.trim()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-100 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700">
                          <p className="text-sm">
                            <span className="font-semibold text-teal-700 dark:text-teal-400">Jawaban benar: </span>
                            <span className="text-teal-600 dark:text-teal-500">{getCorrectAnswer(srsDeck, currentSRSCard)}</span>
                          </p>
                        </div>
                      </div>
                    )}
                    <Button className="w-full h-12 text-base font-semibold" onClick={handleSRSNext}>
                      Selanjutnya <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SRS Quiz - Audio Mode */}
          {srsStarted && !srsComplete && currentSRSCard && srsModeType === 'audio' && (
            <>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {srsIndex + 1} / {srsReviewQueue.length}
                  </Badge>
                  <Badge className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 text-xs">
                    <Timer size={10} className="mr-1" /> SRS
                  </Badge>
                  {currentSRSItem && (
                    <Badge className={cn('text-xs', BOX_COLORS[currentSRSItem.box].bg, BOX_COLORS[currentSRSItem.box].text, BOX_COLORS[currentSRSItem.box].border, 'border')}>
                      Box {currentSRSItem.box}/5
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> {srsCorrect}</span>
                  <span className="text-rose-600 flex items-center gap-1"><X size={12} /> {srsWrong}</span>
                </div>
              </div>
              <Progress value={((srsIndex + 1) / srsReviewQueue.length) * 100} className="h-1.5" />

              <div className="space-y-4">
                <Card className="border-muted">
                  <CardContent className="p-6 flex flex-col items-center gap-4">
                    <button
                      onClick={() => speakJapanese(getAudioText(srsDeck, currentSRSCard))}
                      className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Volume2 size={32} className="text-white" />
                    </button>
                    <p className="text-sm text-muted-foreground font-medium">
                      {srsDeck === 'hiragana' || srsDeck === 'katakana' ? 'Pilih romaji yang benar' : 'Pilih arti yang benar'}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {computedSrsOptions.map((option, idx) => {
                    const correctAnswer = getCorrectAnswer(srsDeck, currentSRSCard);
                    let buttonClass = 'border-muted hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20';
                    if (srsAnswerSubmitted) {
                      const isThisCorrect = checkAnswer(option, correctAnswer, null);
                      const isThisSelected = idx === srsSelectedOption;
                      if (isThisCorrect) {
                        buttonClass = 'border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-950/40';
                      } else if (isThisSelected && !srsIsCorrect) {
                        buttonClass = 'border-rose-400 dark:border-rose-600 bg-rose-100 dark:bg-rose-950/40 animate-[shake_0.5s_ease-in-out]';
                      } else {
                        buttonClass = 'border-muted opacity-50';
                      }
                    }
                    const optionLabels = ['A', 'B', 'C', 'D'];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSRSAudioSelect(idx)}
                        disabled={srsAnswerSubmitted}
                        className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left', buttonClass)}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                          srsAnswerSubmitted && checkAnswer(option, correctAnswer, null)
                            ? 'bg-emerald-500 text-white'
                            : srsAnswerSubmitted && idx === srsSelectedOption && !srsIsCorrect
                              ? 'bg-rose-500 text-white'
                              : 'bg-muted text-muted-foreground'
                        )}>
                          {srsAnswerSubmitted && checkAnswer(option, correctAnswer, null) ? (
                            <Check size={16} />
                          ) : srsAnswerSubmitted && idx === srsSelectedOption && !srsIsCorrect ? (
                            <X size={16} />
                          ) : (
                            optionLabels[idx]
                          )}
                        </div>
                        <span className={cn(
                          'font-medium text-sm',
                          srsDeck === 'hiragana' || srsDeck === 'katakana' ? 'font-mono' : ''
                        )}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {srsAnswerSubmitted && !srsIsCorrect && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-100 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700">
                      <p className="text-sm">
                        <span className="font-semibold text-teal-700 dark:text-teal-400">Jawaban benar: </span>
                        <span className="text-teal-600 dark:text-teal-500">{getCorrectAnswer(srsDeck, currentSRSCard)}</span>
                      </p>
                    </div>
                    <Button className="w-full h-12 text-base font-semibold" variant="outline" onClick={handleSRSNext}>
                      Selanjutnya <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SRS Complete */}
          {srsMode && srsComplete && (
            <SRSResultScreen
              correct={srsCorrect}
              wrong={srsWrong}
              onBack={handleSRSToggle}
              onDashboard={() => {
                setSrsStarted(false);
                setSrsIndex(0);
                setSrsCorrect(0);
                setSrsWrong(0);
                setSrsData(loadSRSData());
              }}
            />
          )}

          {/* SRS Empty */}
          {srsMode && srsStarted && !currentSRSCard && !srsComplete && (
            <Card className="max-w-sm mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-bold text-lg text-teal-700 dark:text-teal-400">Semua Kartu Sudah Dipelajari!</h3>
                <p className="text-sm text-muted-foreground">
                  Tidak ada kartu yang perlu direview saat ini.
                  <br />Kembali besok untuk review berikutnya.
                </p>
                <Button variant="outline" onClick={handleSRSToggle}>
                  Kembali ke Mode Normal
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ═══════════════════ NORMAL MODE ═══════════════════ */}
      {!srsMode && (
        <>
          {quizState.phase === 'start' && (
            <StartScreen onStart={handleStart} />
          )}

          {quizState.phase === 'quiz' && (
            <>
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {quizState.currentIndex + 1} / {quizState.cards.length}
                  </Badge>
                  <Badge className={cn('text-xs', DECK_INFO[quizState.deck].bgColor, DECK_INFO[quizState.deck].color, 'border border-current/20')}>
                    {DECK_INFO[quizState.deck].label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {quizState.mode === 'text' ? (
                      <><Keyboard size={10} className="mr-1" /> Teks</>
                    ) : (
                      <><Headphones size={10} className="mr-1" /> Audio</>
                    )}
                  </Badge>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> {quizState.correct}</span>
                  <span className="text-rose-600 flex items-center gap-1"><X size={12} /> {quizState.wrong}</span>
                </div>
              </div>
              <Progress value={((quizState.currentIndex + 1) / quizState.cards.length) * 100} className="h-1.5" />

              {/* Card Content */}
              {quizState.mode === 'text' ? (
                <TextModeCard state={quizState} setState={setQuizState} />
              ) : (
                <AudioModeCard state={quizState} setState={setQuizState} />
              )}
            </>
          )}

          {quizState.phase === 'result' && (
            <ResultScreen
              state={quizState}
              onRetryWrong={handleRetryWrong}
              onNewSession={handleNewSession}
            />
          )}
        </>
      )}
    </div>
  );
}
