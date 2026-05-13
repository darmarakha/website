'use client';

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash, Volume2, VolumeX, CheckCircle2, XCircle, Clock,
  Star, Lightbulb, RotateCcw, Play, ArrowRight, Trophy,
  ChevronRight, BookOpen, Pen, HelpCircle, Sparkles, Target, Zap, ArrowUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { speakJapanese } from '@/lib/n5-constants';

// ─── Types ──────────────────────────────────────────────
interface NumberEntry {
  value: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  note?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ─── Number Data ────────────────────────────────────────
const DASAR: NumberEntry[] = [
  { value: 0, kanji: '零', hiragana: 'ぜろ', romaji: 'zero', meaning: 'Nol' },
  { value: 1, kanji: '一', hiragana: 'いち', romaji: 'ichi', meaning: 'Satu' },
  { value: 2, kanji: '二', hiragana: 'に', romaji: 'ni', meaning: 'Dua' },
  { value: 3, kanji: '三', hiragana: 'さん', romaji: 'san', meaning: 'Tiga' },
  { value: 4, kanji: '四', hiragana: 'し／よん', romaji: 'shi/yon', meaning: 'Empat', note: '"Yon" lebih umum' },
  { value: 5, kanji: '五', hiragana: 'ご', romaji: 'go', meaning: 'Lima' },
  { value: 6, kanji: '六', hiragana: 'ろく', romaji: 'roku', meaning: 'Enam' },
  { value: 7, kanji: '七', hiragana: 'なな／しち', romaji: 'nana/shichi', meaning: 'Tujuh', note: '"Nana" lebih umum' },
  { value: 8, kanji: '八', hiragana: 'はち', romaji: 'hachi', meaning: 'Delapan' },
  { value: 9, kanji: '九', hiragana: 'きゅう／く', romaji: 'kyuu/ku', meaning: 'Sembilan', note: '"Kyuu" lebih umum' },
  { value: 10, kanji: '十', hiragana: 'じゅう', romaji: 'juu', meaning: 'Sepuluh' },
];

const BELASAN: NumberEntry[] = [
  { value: 11, kanji: '十一', hiragana: 'じゅういち', romaji: 'juuichi', meaning: 'Sebelas' },
  { value: 12, kanji: '十二', hiragana: 'じゅうに', romaji: 'juuni', meaning: 'Dua belas' },
  { value: 13, kanji: '十三', hiragana: 'じゅうさん', romaji: 'juusan', meaning: 'Tiga belas' },
  { value: 14, kanji: '十四', hiragana: 'じゅうよん', romaji: 'juuyon', meaning: 'Empat belas' },
  { value: 15, kanji: '十五', hiragana: 'じゅうご', romaji: 'juugo', meaning: 'Lima belas' },
  { value: 16, kanji: '十六', hiragana: 'じゅうろく', romaji: 'juuroku', meaning: 'Enam belas' },
  { value: 17, kanji: '十七', hiragana: 'じゅうなな', romaji: 'juunana', meaning: 'Tujuh belas' },
  { value: 18, kanji: '十八', hiragana: 'じゅうはち', romaji: 'juuhachi', meaning: 'Delapan belas' },
  { value: 19, kanji: '十九', hiragana: 'じゅうきゅう', romaji: 'juukyuu', meaning: 'Sembilan belas' },
];

const PULUHAN: NumberEntry[] = [
  { value: 20, kanji: '二十', hiragana: 'にじゅう', romaji: 'niju', meaning: 'Dua puluh' },
  { value: 30, kanji: '三十', hiragana: 'さんじゅう', romaji: 'sanjuu', meaning: 'Tiga puluh' },
  { value: 40, kanji: '四十', hiragana: 'よんじゅう', romaji: 'yonjuu', meaning: 'Empat puluh' },
  { value: 50, kanji: '五十', hiragana: 'ごじゅう', romaji: 'gojuu', meaning: 'Lima puluh' },
  { value: 60, kanji: '六十', hiragana: 'ろくじゅう', romaji: 'rokujuu', meaning: 'Enam puluh' },
  { value: 70, kanji: '七十', hiragana: 'ななじゅう', romaji: 'nanajuu', meaning: 'Tujuh puluh' },
  { value: 80, kanji: '八十', hiragana: 'はちじゅう', romaji: 'hachijuu', meaning: 'Delapan puluh' },
  { value: 90, kanji: '九十', hiragana: 'きゅうじゅう', romaji: 'kyuujuu', meaning: 'Sembilan puluh' },
];

const RATUSAN: NumberEntry[] = [
  { value: 100, kanji: '百', hiragana: 'ひゃく', romaji: 'hyaku', meaning: 'Seratus' },
  { value: 200, kanji: '二百', hiragana: 'にひゃく', romaji: 'nihyaku', meaning: 'Dua ratus' },
  { value: 300, kanji: '三百', hiragana: 'さんびゃく', romaji: 'sanbyaku', meaning: 'Tiga ratus', note: 'Bentuk khusus!' },
  { value: 400, kanji: '四百', hiragana: 'よんひゃく', romaji: 'yonhyaku', meaning: 'Empat ratus' },
  { value: 500, kanji: '五百', hiragana: 'ごひゃく', romaji: 'gohyaku', meaning: 'Lima ratus' },
  { value: 600, kanji: '六百', hiragana: 'ろっぴゃく', romaji: 'roppyaku', meaning: 'Enam ratus', note: 'Bentuk khusus!' },
  { value: 700, kanji: '七百', hiragana: 'ななひゃく', romaji: 'nanahyaku', meaning: 'Tujuh ratus' },
  { value: 800, kanji: '八百', hiragana: 'はっぴゃく', romaji: 'happyaku', meaning: 'Delapan ratus', note: 'Bentuk khusus!' },
  { value: 900, kanji: '九百', hiragana: 'きゅうひゃく', romaji: 'kyuuhyaku', meaning: 'Sembilan ratus' },
];

const RIBUAN: NumberEntry[] = [
  { value: 1000, kanji: '千', hiragana: 'せん', romaji: 'sen', meaning: 'Seribu' },
  { value: 2000, kanji: '二千', hiragana: 'にせん', romaji: 'nisen', meaning: 'Dua ribu' },
  { value: 3000, kanji: '三千', hiragana: 'さんぜん', romaji: 'sanzen', meaning: 'Tiga ribu', note: 'Bentuk khusus!' },
  { value: 4000, kanji: '四千', hiragana: 'よんせん', romaji: 'yonsen', meaning: 'Empat ribu' },
  { value: 5000, kanji: '五千', hiragana: 'ごせん', romaji: 'gosen', meaning: 'Lima ribu' },
  { value: 6000, kanji: '六千', hiragana: 'ろくせん', romaji: 'rokusen', meaning: 'Enam ribu' },
  { value: 7000, kanji: '七千', hiragana: 'ななせん', romaji: 'nanasen', meaning: 'Tujuh ribu' },
  { value: 8000, kanji: '八千', hiragana: 'はっせん', romaji: 'hassen', meaning: 'Delapan ribu', note: 'Bentuk khusus!' },
  { value: 9000, kanji: '九千', hiragana: 'きゅうせん', romaji: 'kyuusen', meaning: 'Sembilan ribu' },
  { value: 10000, kanji: '一万', hiragana: 'いちまん', romaji: 'ichiman', meaning: 'Sepuluh ribu' },
];

const ALL_NUMBERS: NumberEntry[] = [...DASAR, ...BELASAN, ...PULUHAN, ...RATUSAN, ...RIBUAN];

// Category config for the Learn tab
const CATEGORIES = [
  { id: 'dasar', label: 'Dasar (0-10)', data: DASAR, color: 'from-teal-500 to-emerald-500', badgeBg: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300', borderAccent: 'border-l-teal-400' },
  { id: 'belasan', label: 'Belasan (11-19)', data: BELASAN, color: 'from-emerald-500 to-green-500', badgeBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300', borderAccent: 'border-l-emerald-400' },
  { id: 'puluhan', label: 'Puluhan (20-90)', data: PULUHAN, color: 'from-cyan-500 to-teal-500', badgeBg: 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300', borderAccent: 'border-l-cyan-400' },
  { id: 'ratusan', label: 'Ratusan (100-900)', data: RATUSAN, color: 'from-amber-500 to-orange-500', badgeBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300', borderAccent: 'border-l-amber-400' },
  { id: 'ribuan', label: 'Ribuan (1000-10000)', data: RIBUAN, color: 'from-rose-500 to-pink-500', badgeBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300', borderAccent: 'border-l-rose-400' },
];

// Helper: get a readable number for speaking
function numberToReadable(num: number): string {
  const entry = ALL_NUMBERS.find(n => n.value === num);
  if (entry) return entry.hiragana;
  // For compound numbers like 21, 35, etc.
  return String(num);
}

// Helper: generate romaji for any number 0-9999
function generateRomaji(num: number): string {
  if (num === 0) return 'zero';
  const map: Record<number, string> = {
    0: '', 1: 'ichi', 2: 'ni', 3: 'san', 4: 'yon', 5: 'go',
    6: 'roku', 7: 'nana', 8: 'hachi', 9: 'kyuu', 10: 'juu',
  };
  const hyakuMap: Record<number, string> = {
    1: 'hyaku', 2: 'nihyaku', 3: 'sanbyaku', 4: 'yonhyaku',
    5: 'gohyaku', 6: 'roppyaku', 7: 'nanahyaku', 8: 'happyaku', 9: 'kyuuhyaku',
  };
  const senMap: Record<number, string> = {
    1: 'sen', 2: 'nisen', 3: 'sanzen', 4: 'yonsen',
    5: 'gosen', 6: 'rokusen', 7: 'nanasen', 8: 'hassen', 9: 'kyuusen',
  };
  const thousands = Math.floor(num / 1000);
  const remainder1000 = num % 1000;
  const hundreds = Math.floor(remainder1000 / 100);
  const remainder100 = remainder1000 % 100;
  const tens = Math.floor(remainder100 / 10);
  const ones = remainder100 % 10;

  let parts: string[] = [];
  if (num === 10000) return 'ichiman';
  if (thousands > 0) {
    if (thousands === 1) parts.push('issen');
    else parts.push(senMap[thousands] || `${map[thousands]}sen`);
  }
  if (hundreds > 0) parts.push(hyakuMap[hundreds] || `${map[hundreds]}hyaku`);
  if (tens === 1) parts.push('juu');
  else if (tens > 1) parts.push(`${map[tens]}juu`);
  if (ones > 0) {
    if (tens === 0 && hundreds === 0 && thousands === 0) return map[ones] || '';
    parts.push(map[ones] || '');
  }
  return parts.join('');
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Grade helpers ──────────────────────────────────────
function getGrade(pct: number): { grade: string; label: string; color: string } {
  if (pct >= 90) return { grade: 'S', label: 'Sempurna!', color: 'from-amber-400 to-yellow-300 text-amber-900' };
  if (pct >= 75) return { grade: 'A', label: 'Hebat!', color: 'from-teal-400 to-emerald-400 text-white' };
  if (pct >= 60) return { grade: 'B', label: 'Bagus!', color: 'from-sky-400 to-blue-400 text-white' };
  return { grade: 'C', label: 'Terus berlatih!', color: 'from-slate-400 to-gray-400 text-white' };
}

// ─── MAIN COMPONENT ────────────────────────────────────
export default function KazuPractice() {
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 p-6 text-white shadow-lg shadow-teal-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Hash size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Latihan Angka</h1>
              <p className="text-teal-100 text-sm font-medium">数字 — Kazu</p>
            </div>
          </div>
          <p className="text-teal-50 text-sm mt-2 max-w-lg leading-relaxed">
            Pelajari angka bahasa Jepang dari 0 sampai 10000. Berlatih membaca, menulis, dan menghitung dengan tiga mode belajar interaktif.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              <BookOpen size={12} className="mr-1" /> 0 — 10000
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              <Volume2 size={12} className="mr-1" /> Audio
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              <Zap size={12} className="mr-1" /> 3 Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="learn" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/80">
          <TabsTrigger value="learn" className="py-2.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
            <BookOpen size={14} className="mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Belajar</span>
            <span className="sm:hidden">Belajar</span>
          </TabsTrigger>
          <TabsTrigger value="count" className="py-2.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
            <Pen size={14} className="mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Latihan Hitung</span>
            <span className="sm:hidden">Hitung</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="py-2.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
            <HelpCircle size={14} className="mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Quiz Angka</span>
            <span className="sm:hidden">Quiz</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learn">
          <LearnMode />
        </TabsContent>
        <TabsContent value="count">
          <CountMode />
        </TabsContent>
        <TabsContent value="quiz">
          <QuizMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── LEARN MODE ─────────────────────────────────────────
function LearnMode() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const togglePlay = (entry: NumberEntry) => {
    if (playingId === entry.value) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    } else {
      speakJapanese(entry.hiragana);
      setPlayingId(entry.value);
      setTimeout(() => setPlayingId(null), 1500);
    }
  };

  const displayedCategories = activeCategory
    ? CATEGORIES.filter(c => c.id === activeCategory)
    : CATEGORIES;

  return (
    <div className="space-y-5">
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
            !activeCategory
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Semua ({ALL_NUMBERS.length})
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Special Notes Card */}
      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Bentuk Khusus Perhatian!</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              Beberapa angka memiliki bacaan khusus: 300 (さんびゃく), 600 (ろっぴゃく), 800 (はっぴゃく), 3000 (さんぜん), 8000 (はっせん). Angka 4 dan 7 memiliki dua bacaan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Number Groups */}
      {displayedCategories.map(cat => (
        <div key={cat.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs font-bold border-0', cat.badgeBg)}>
              {cat.label}
            </Badge>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {cat.data.map(entry => (
              <motion.div
                key={entry.value}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative group rounded-xl border bg-card overflow-hidden cursor-pointer transition-all hover:shadow-lg',
                  'border-l-[3px]',
                  cat.borderAccent,
                  entry.note ? 'ring-1 ring-amber-200 dark:ring-amber-800' : ''
                )}
                onClick={() => togglePlay(entry)}
              >
                {/* Gradient top accent */}
                <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60', cat.color)} />

                <CardContent className="p-3 space-y-1.5">
                  {/* Kanji large */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground font-jp">
                      {entry.kanji}
                    </span>
                    <button
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        playingId === entry.value
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'bg-muted/80 text-muted-foreground group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                      )}
                      onClick={(e) => { e.stopPropagation(); togglePlay(entry); }}
                    >
                      {playingId === entry.value
                        ? <Volume2 size={13} className="animate-pulse" />
                        : <VolumeX size={12} />
                      }
                    </button>
                  </div>

                  {/* Hiragana */}
                  <p className="text-sm text-teal-600 dark:text-teal-400 font-medium font-jp">
                    {entry.hiragana}
                  </p>

                  {/* Romaji */}
                  <p className="text-xs text-muted-foreground italic">
                    {entry.romaji}
                  </p>

                  {/* Meaning */}
                  <p className="text-xs font-semibold text-foreground">
                    {entry.meaning}
                  </p>

                  {/* Note badge */}
                  {entry.note && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 mt-1">
                      ⚡ {entry.note}
                    </Badge>
                  )}
                </CardContent>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Counting Tip */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
        <CardContent className="p-4">
          <p className="text-sm font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2">
            <Sparkles size={14} /> Tips Membaca Angka Besar
          </p>
          <div className="mt-2 space-y-1.5 text-xs text-teal-600 dark:text-teal-400">
            <p>• <strong>25</strong> → にじゅうご (nijuugo) = 20 + 5</p>
            <p>• <strong>142</strong> → ひゃくよんじゅうに (hyakuyonjuuni) = 100 + 40 + 2</p>
            <p>• <strong>3500</strong> → さんぜんごひゃく (sanzen-gohyaku) = 3000 + 500</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── COUNT MODE (Latihan Hitung) ───────────────────────
type CountDifficulty = 'mudah' | 'normal' | 'sulit';
type CountPhase = 'setup' | 'playing' | 'results';

interface CountQuestion {
  value: number;
  correctRomaji: string;
  displayText: string;
  hiragana: string;
}

function CountMode() {
  const [phase, setPhase] = useState<CountPhase>('setup');
  const [difficulty, setDifficulty] = useState<CountDifficulty>('mudah');
  const [questions, setQuestions] = useState<CountQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<boolean[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const TOTAL_QUESTIONS = 10;

  const difficultyConfig = {
    mudah: { min: 0, max: 10, label: 'Mudah (0-10)', multiplier: 1, timePerQ: 0, description: 'Angka dasar dari 0 sampai 10' },
    normal: { min: 0, max: 100, label: 'Normal (0-100)', multiplier: 1.5, timePerQ: 0, description: 'Angka sampai seratus, termasuk belasan dan puluhan' },
    sulit: { min: 0, max: 10000, label: 'Sulit (0-10000)', multiplier: 2, timePerQ: 0, description: 'Semua angka termasuk ratusan dan ribuan' },
  };

  const generateQuestions = (diff: CountDifficulty) => {
    const config = difficultyConfig[diff];
    const qs: CountQuestion[] = [];
    const pools: Record<CountDifficulty, number[]> = {
      mudah: Array.from({ length: 11 }, (_, i) => i),
      normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 19, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      sulit: [0, 1, 3, 4, 7, 9, 10, 11, 15, 19, 20, 30, 40, 50, 100, 200, 300, 500, 600, 800, 1000, 2000, 3000, 5000, 8000, 10000],
    };
    const pool = pools[diff];
    const selected = shuffleArray(pool).slice(0, TOTAL_QUESTIONS);
    while (selected.length < TOTAL_QUESTIONS) {
      const rand = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      if (!selected.includes(rand)) selected.push(rand);
    }
    for (const num of selected) {
      const romaji = generateRomaji(num);
      qs.push({ value: num, correctRomaji: romaji, displayText: String(num), hiragana: numberToReadable(num) });
    }
    return qs;
  };

  const startGame = (diff: CountDifficulty) => {
    const qs = generateQuestions(diff);
    setQuestions(qs);
    setCurrentIndex(0);
    setUserInput('');
    setResults([]);
    setHintShown(false);
    setShowFeedback(null);
    setXpEarned(0);
    setDifficulty(diff);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = () => {
    const q = questions[currentIndex];
    if (!q || !userInput.trim()) return;
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedCorrect = q.correctRomaji.toLowerCase();
    // Also accept hiragana as answer
    const isCorrect = normalizedInput === normalizedCorrect ||
      normalizedInput === q.hiragana ||
      normalizedInput === String(q.value);
    const newResults = [...results, isCorrect];
    setResults(newResults);
    setShowFeedback({ correct: isCorrect, answer: q.correctRomaji });
    if (isCorrect) {
      const baseXp = 10 * difficultyConfig[difficulty].multiplier;
      setXpEarned(prev => prev + Math.round(baseXp));
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      // Save XP
      const totalXp = xpEarned;
      const currentXp = parseInt(localStorage.getItem('gemu-kazu-xp') || '0');
      localStorage.setItem('gemu-kazu-xp', String(currentXp + totalXp));
      setPhase('results');
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setHintShown(false);
      setShowFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const getHint = () => {
    const q = questions[currentIndex];
    if (!q) return '';
    return q.correctRomaji.charAt(0).toUpperCase() + '...';
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-5 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Target size={20} /> Latihan Hitung
            </h3>
            <p className="text-emerald-100 text-sm mt-1">Tuliskan angka dalam bahasa Jepang (romaji atau hiragana)</p>
          </div>
          <CardContent className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">Pilih tingkat kesulitan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['mudah', 'normal', 'sulit'] as CountDifficulty[]).map(diff => {
                const cfg = difficultyConfig[diff];
                return (
                  <button
                    key={diff}
                    onClick={() => startGame(diff)}
                    className={cn(
                      'relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-lg hover:-translate-y-1',
                      'border-teal-200 dark:border-teal-800 bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-900 dark:to-teal-950/20'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">×{cfg.multiplier}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cfg.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      <Play size={12} /> Mulai ({TOTAL_QUESTIONS} soal)
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Previous progress */}
        <ProgressCard />
      </div>
    );
  }

  // Results phase
  if (phase === 'results') {
    const correctCount = results.filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const grade = getGrade(pct);
    const finalXp = xpEarned;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
        {/* Grade Card */}
        <Card className="overflow-hidden">
          <div className={cn('bg-gradient-to-r p-8 text-center', grade.color)}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <span className="text-5xl font-black">{grade.grade}</span>
              </div>
            </motion.div>
            <p className="text-xl font-bold mt-2">{grade.label}</p>
            <p className="text-sm opacity-80 mt-1">
              {correctCount} benar dari {questions.length} soal ({pct}%)
            </p>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{correctCount}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">BENAR</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{questions.length - correctCount}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">SALAH</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">+{finalXp}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">XP</p>
              </div>
            </div>

            {/* Wrong answers review */}
            {results.some((r, i) => !r) && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-muted-foreground">Jawaban salah:</p>
                {questions.map((q, i) => {
                  if (results[i]) return null;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-sm">
                      <XCircle size={14} className="text-rose-500 shrink-0" />
                      <span className="font-bold">{q.value}</span>
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{q.correctRomaji}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setPhase('setup')}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw size={14} className="mr-2" /> Pilih Level
              </Button>
              <Button
                onClick={() => startGame(difficulty)}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500"
              >
                <Play size={14} className="mr-2" /> Ulangi
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Playing phase
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">{difficultyConfig[difficulty].label}</Badge>
          <span className="text-sm font-semibold text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Star size={14} className="fill-amber-400" />
          <span className="text-sm font-bold">+{xpEarned} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={((currentIndex) / questions.length) * 100} className="h-2" />

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              {/* Number display */}
              <div className="text-center space-y-3 mb-6">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Berapa ini dalam bahasa Jepang?
                </p>
                <div className="text-6xl sm:text-7xl font-black text-foreground">
                  {currentQ.value.toLocaleString('id-ID')}
                </div>
                <button
                  onClick={() => speakJapanese(currentQ.hiragana)}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                >
                  <Volume2 size={14} /> Dengarkan pengucapan
                </button>
              </div>

              {/* Hint */}
              {hintShown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                >
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2">
                    <Lightbulb size={14} /> Petunjuk: <span className="font-bold">{getHint()}</span>
                  </p>
                </motion.div>
              )}

              {/* Input */}
              {!showFeedback ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') checkAnswer();
                      }}
                      placeholder="Tulis romaji atau hiragana..."
                      className="text-center text-lg font-medium h-12 border-2 focus:border-teal-500"
                      autoComplete="off"
                      autoCapitalize="off"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHintShown(true)}
                      disabled={hintShown}
                      className="flex-1"
                    >
                      <Lightbulb size={14} className="mr-1.5" /> Petunjuk
                    </Button>
                    <Button
                      onClick={checkAnswer}
                      disabled={!userInput.trim()}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500"
                    >
                      <CheckCircle2 size={14} className="mr-1.5" /> Jawab
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  {/* Feedback */}
                  <div className={cn(
                    'p-4 rounded-xl text-center',
                    showFeedback.correct
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800'
                  )}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {showFeedback.correct
                        ? <CheckCircle2 size={24} className="text-emerald-500" />
                        : <XCircle size={24} className="text-rose-500" />
                      }
                      <span className={cn('text-lg font-bold', showFeedback.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
                        {showFeedback.correct ? 'Benar!' : 'Salah!'}
                      </span>
                    </div>
                    {!showFeedback.correct && (
                      <p className="text-sm text-muted-foreground">
                        Jawaban yang benar: <span className="font-bold text-teal-600 dark:text-teal-400">{showFeedback.answer}</span>
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={nextQuestion}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500"
                  >
                    {currentIndex + 1 >= questions.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── QUIZ MODE (Quiz Angka) ─────────────────────────────
type QuizDifficulty = 'mudah' | 'normal' | 'sulit';
type QuizPhase = 'setup' | 'playing' | 'results';
type QuizType = 'numToJa' | 'jaToNum' | 'pickReading';

interface QuizQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: QuizType;
}

function QuizMode() {
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('normal');
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TOTAL_QUESTIONS = 10;

  const quizConfig = {
    mudah: { label: 'Mudah', multiplier: 1, timePerQ: 30, description: 'Angka 0-10, 30 detik per soal' },
    normal: { label: 'Normal', multiplier: 1.5, timePerQ: 20, description: 'Angka 0-100, 20 detik per soal' },
    sulit: { label: 'Sulit', multiplier: 2, timePerQ: 15, description: 'Angka 0-10000, 15 detik per soal' },
  };

  const generateQuizQuestions = (diff: QuizDifficulty): QuizQ[] => {
    const pools: Record<QuizDifficulty, NumberEntry[]> = {
      mudah: [...DASAR, ...BELASAN],
      normal: [...DASAR, ...BELASAN, ...PULUHAN, ...RATUSAN],
      sulit: [...DASAR, ...BELASAN, ...PULUHAN, ...RATUSAN, ...RIBUAN],
    };
    const pool = pools[diff];
    const qs: QuizQ[] = [];
    const usedValues = new Set<number>();

    while (qs.length < TOTAL_QUESTIONS) {
      const type: QuizType = ['numToJa', 'jaToNum', 'pickReading'][Math.floor(Math.random() * 3)] as QuizType;
      const entry = pool[Math.floor(Math.random() * pool.length)];
      if (!entry || usedValues.has(entry.value)) continue;

      usedValues.add(entry.value);
      const others = shuffleArray(pool.filter(e => e.value !== entry.value)).slice(0, 3);

      if (type === 'numToJa') {
        // "Apa angka 42 dalam bahasa Jepang?"
        const options = shuffleArray([entry, ...others].map(e => `${e.romaji} (${e.hiragana})`));
        const correctIndex = options.findIndex(o => o.includes(entry.romaji));
        qs.push({
          question: `Apa angka ${entry.value.toLocaleString('id-ID')} dalam bahasa Jepang?`,
          options,
          correctIndex,
          explanation: `${entry.value} = ${entry.kanji} (${entry.hiragana}) = ${entry.romaji}`,
          type,
        });
      } else if (type === 'jaToNum') {
        // "Berapa 一百二十三?"
        const options = shuffleArray([entry, ...others].map(e => String(e.value.toLocaleString('id-ID'))));
        const correctIndex = options.indexOf(String(entry.value.toLocaleString('id-ID')));
        qs.push({
          question: `Berapa ${entry.kanji}?`,
          options,
          correctIndex,
          explanation: `${entry.kanji} (${entry.hiragana}) = ${entry.value.toLocaleString('id-ID')}`,
          type,
        });
      } else {
        // "Pilih bacaan yang benar untuk 7"
        const correctReading = entry.romaji;
        const wrongReadings = others.map(o => o.romaji);
        const options = shuffleArray([correctReading, ...wrongReadings]);
        const correctIndex = options.indexOf(correctReading);
        qs.push({
          question: `Pilih bacaan yang benar untuk ${entry.value.toLocaleString('id-ID')} (${entry.kanji})`,
          options,
          correctIndex,
          explanation: `Bacaan ${entry.value} adalah ${entry.romaji} (${entry.hiragana})`,
          type,
        });
      }
    }
    return qs;
  };

  const handleTimeUp = () => {
    if (selectedIdx !== null) return;
    const newResults = [...results, false];
    setResults(newResults);
    setSelectedIdx(-1); // -1 means timeout
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selectedIdx !== null) return;
    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit wrong
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, currentIndex, selectedIdx]);

  const startQuiz = (diff: QuizDifficulty) => {
    const qs = generateQuizQuestions(diff);
    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedIdx(null);
    setResults([]);
    setXpEarned(0);
    setTotalTime(0);
    setDifficulty(diff);
    setTimeLeft(quizConfig[diff].timePerQ);
    setPhase('playing');
  };

  const selectOption = (idx: number) => {
    if (selectedIdx !== null) return;
    const q = questions[currentIndex];
    if (!q) return;
    const isCorrect = idx === q.correctIndex;
    setSelectedIdx(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    const newResults = [...results, isCorrect];
    setResults(newResults);
    if (isCorrect) {
      const baseXp = 15 * quizConfig[difficulty].multiplier;
      setXpEarned(prev => prev + Math.round(baseXp));
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      // Save XP
      const currentXp = parseInt(localStorage.getItem('gemu-kazu-xp') || '0');
      localStorage.setItem('gemu-kazu-xp', String(currentXp + xpEarned));
      setPhase('results');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedIdx(null);
      setTimeLeft(quizConfig[difficulty].timePerQ);
    }
  };

  // Setup
  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-5 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <HelpCircle size={20} /> Quiz Angka
            </h3>
            <p className="text-cyan-100 text-sm mt-1">Uji pengetahuan angka bahasa Jepang dengan pilihan ganda</p>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['mudah', 'normal', 'sulit'] as QuizDifficulty[]).map(diff => {
                const cfg = quizConfig[diff];
                return (
                  <button
                    key={diff}
                    onClick={() => startQuiz(diff)}
                    className={cn(
                      'relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-lg hover:-translate-y-1',
                      'border-teal-200 dark:border-teal-800 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-900 dark:to-cyan-950/20'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">×{cfg.multiplier}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cfg.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      <Clock size={12} /> {cfg.timePerQ} detik/soal
                    </div>
                  </button>
                );
              })}
            </div>

            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">3 Jenis Soal:</strong>{' '}
                  angka → bahasa Jepang, bahasa Jepang → angka, dan pilih bacaan yang benar.
                  Masing-masing dengan 4 pilihan jawaban.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <ProgressCard />
      </div>
    );
  }

  // Results
  if (phase === 'results') {
    const correctCount = results.filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const grade = getGrade(pct);
    const finalXp = xpEarned;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
        <Card className="overflow-hidden">
          <div className={cn('bg-gradient-to-r p-8 text-center', grade.color)}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <span className="text-5xl font-black">{grade.grade}</span>
              </div>
            </motion.div>
            <p className="text-xl font-bold mt-2">{grade.label}</p>
            <p className="text-sm opacity-80 mt-1">
              {correctCount} benar dari {questions.length} soal ({pct}%)
            </p>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{correctCount}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">BENAR</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{questions.length - correctCount}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">SALAH</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">+{finalXp}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">XP</p>
              </div>
            </div>

            {/* Wrong answers review */}
            {results.some((r, i) => !r) && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-muted-foreground">Jawaban salah:</p>
                {questions.map((q, i) => {
                  if (results[i]) return null;
                  return (
                    <div key={i} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <XCircle size={14} className="text-rose-500 shrink-0" />
                        <span className="font-medium">{q.question}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        Jawaban: <span className="text-teal-600 dark:text-teal-400 font-semibold">{q.options[q.correctIndex]}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setPhase('setup')}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw size={14} className="mr-2" /> Pilih Level
              </Button>
              <Button
                onClick={() => startQuiz(difficulty)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500"
              >
                <Play size={14} className="mr-2" /> Ulangi
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Playing
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;
  const timePercent = quizConfig[difficulty].timePerQ > 0 ? (timeLeft / quizConfig[difficulty].timePerQ) * 100 : 100;
  const timeColor = timePercent > 60 ? 'bg-emerald-500' : timePercent > 30 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">{quizConfig[difficulty].label}</Badge>
          <span className="text-sm font-semibold text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Star size={14} className="fill-amber-400" />
          <span className="text-sm font-bold">+{xpEarned} XP</span>
        </div>
      </div>

      {/* Progress + Timer */}
      <div className="space-y-2">
        <Progress value={((currentIndex) / questions.length) * 100} className="h-2" />
        {/* Timer bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000 ease-linear', timeColor, timeLeft <= 5 && 'animate-pulse')}
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-semibold">
            {currentQ.type === 'numToJa' ? '🔤 Angka → Jepang' : currentQ.type === 'jaToNum' ? '🔢 Jepang → Angka' : '📝 Pilih Bacaan'}
          </p>
          <p className={cn('text-xs font-bold flex items-center gap-1', timeLeft <= 5 ? 'text-rose-500' : 'text-muted-foreground')}>
            <Clock size={12} /> {timeLeft} detik
          </p>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const showCorrectness = selectedIdx !== null;

                  let btnClass = 'border-2 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20';
                  if (showCorrectness) {
                    if (isCorrect) btnClass = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                    else if (isSelected && !isCorrect) btnClass = 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/30';
                    else btnClass = 'border-2 border-transparent opacity-50';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => selectOption(idx)}
                      disabled={selectedIdx !== null}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all text-sm font-medium',
                        btnClass,
                        selectedIdx === null && 'active:scale-[0.98]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          showCorrectness && isCorrect ? 'bg-emerald-500 text-white' :
                          showCorrectness && isSelected && !isCorrect ? 'bg-rose-500 text-white' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {showCorrectness && isCorrect ? <CheckCircle2 size={16} /> :
                           showCorrectness && isSelected && !isCorrect ? <XCircle size={16} /> :
                           String.fromCharCode(65 + idx)}
                        </div>
                        <span className="truncate">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation + Next */}
              {selectedIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 space-y-3"
                >
                  <div className={cn(
                    'p-3 rounded-xl text-sm',
                    selectedIdx === currentQ.correctIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                  )}>
                    <p className={cn('font-semibold', selectedIdx === currentQ.correctIndex ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}>
                      {selectedIdx === currentQ.correctIndex ? '✅ Benar!' : '❌ Kurang tepat'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{currentQ.explanation}</p>
                  </div>
                  <Button
                    onClick={nextQuestion}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  >
                    {currentIndex + 1 >= questions.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Shared: Progress Card ──────────────────────────────
function ProgressCard() {
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const progress = useMemo(() => {
    if (!isClient) return { learned: 0, total: ALL_NUMBERS.length, xp: 0 };
    const savedProgress = JSON.parse(localStorage.getItem('gemu-kazu-progress') || '{"learned":0}');
    const xp = parseInt(localStorage.getItem('gemu-kazu-xp') || '0');
    return {
      learned: savedProgress.learned || 0,
      total: ALL_NUMBERS.length,
      xp,
    };
  }, [isClient]);

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Trophy size={18} className="text-amber-500" />
          <h4 className="text-sm font-bold">Progres Belajar</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/50">
            <p className="text-xl font-black text-teal-600 dark:text-teal-400">{progress.learned}/{progress.total}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Angka Dipelajari</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/50">
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{progress.xp}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Total XP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
