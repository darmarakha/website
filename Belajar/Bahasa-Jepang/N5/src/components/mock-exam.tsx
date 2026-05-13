'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { VOCABULARY, KANJI, GRAMMAR, speakJapanese } from '@/lib/n5-constants';
import {
  FileCheck, Play, Clock, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, Bookmark, BookmarkCheck, RotateCcw, Home, Share2,
  Volume2, BookOpen, Languages, Headphones, Star, Award,
  AlertTriangle, ArrowRight, Trophy, Target, Zap
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExamQuestion {
  id: number;
  section: 'moji' | 'bunpou' | 'choukai';
  question: string;
  questionJa?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audioText?: string;
  typeLabel: string;
}

interface ExamResult {
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  sectionScores: { section: string; correct: number; total: number; percentage: number }[];
  xpEarned: number;
  timeElapsed: number;
  wrongAnswers: { question: ExamQuestion; userAnswer: number }[];
}

type ExamPhase = 'start' | 'playing' | 'results';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function getGrade(pct: number): { grade: string; label: string; color: string; gradient: string } {
  if (pct >= 90) return { grade: 'S', label: 'Luar Biasa!', color: 'text-amber-500', gradient: 'from-amber-400 via-yellow-400 to-orange-400' };
  if (pct >= 75) return { grade: 'A', label: 'Hebat!', color: 'text-teal-500', gradient: 'from-teal-400 via-emerald-400 to-green-400' };
  if (pct >= 60) return { grade: 'B', label: 'Bagus!', color: 'text-blue-500', gradient: 'from-blue-400 via-indigo-400 to-violet-400' };
  return { grade: 'C', label: 'Terus Belajar!', color: 'text-rose-500', gradient: 'from-rose-400 via-pink-400 to-red-400' };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const SECTION_CONFIG = {
  moji: { label: 'Moji Goi', subtitle: '文字語彙', icon: BookOpen, color: 'bg-teal-500', badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', borderColor: 'border-teal-200 dark:border-teal-800', count: 10 },
  bunpou: { label: 'Bunpou', subtitle: '文法', icon: Languages, color: 'bg-rose-500', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', borderColor: 'border-rose-200 dark:border-rose-800', count: 8 },
  choukai: { label: 'Choukai', subtitle: '聴解', icon: Headphones, color: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', borderColor: 'border-amber-200 dark:border-amber-800', count: 5 },
} as const;

// ─── Question Generators ────────────────────────────────────────────────────

function generateMojiGoiQuestions(): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  let id = 0;

  // Type 1: Kanji reading (from kanji examples)
  const kanjiWithReading = KANJI.flatMap(k =>
    k.examples.filter(e => e.word !== e.reading && e.word.length > 1).map(e => ({
      word: e.word, reading: e.reading, meaning: e.meaning, kanjiChar: k.character
    }))
  );
  const readingQs = pickRandom(kanjiWithReading, Math.min(5, kanjiWithReading.length));
  for (const q of readingQs) {
    const allMeanings = kanjiWithReading.map(e => e.meaning).filter(m => m !== q.meaning);
    const distractors = pickRandom(allMeanings, 3);
    questions.push({
      id: id++, section: 'moji',
      question: `Apa arti dari ${q.word}？`,
      questionJa: q.word,
      options: shuffle([q.meaning, ...distractors]),
      correctIndex: 0,
      explanation: `${q.word} dibaca "${q.reading}", artinya "${q.meaning}".`,
      typeLabel: 'Kanji Reading',
    });
    // Fix correctIndex after shuffle
    questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(q.meaning);
  }

  // Type 2: Vocabulary meaning
  const vocabQs = pickRandom(VOCABULARY, Math.min(3, VOCABULARY.length));
  for (const v of vocabQs) {
    const sameCategory = VOCABULARY.filter(vv => vv.meaning !== v.meaning && vv.category === v.category);
    const diffCategory = VOCABULARY.filter(vv => vv.meaning !== v.meaning && vv.category !== v.category);
    const pool = sameCategory.length >= 2 ? [...pickRandom(sameCategory, 2), ...pickRandom(diffCategory, 1)] : pickRandom(diffCategory, 3);
    questions.push({
      id: id++, section: 'moji',
      question: `Arti dari "${v.word}" adalah?`,
      questionJa: v.word,
      options: shuffle([v.meaning, ...pool.map(p => p.meaning)]),
      correctIndex: 0,
      explanation: `${v.word} (${v.reading}) artinya "${v.meaning}".`,
      typeLabel: 'Arti Kosakata',
    });
    questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(v.meaning);
  }

  // Type 3: Reverse vocab - which word means X?
  const reverseQs = pickRandom(VOCABULARY.filter(v => v.category === 'Kata Kerja' || v.category === 'Kata Sifat'), Math.min(2, VOCABULARY.length));
  for (const v of reverseQs) {
    const pool = pickRandom(VOCABULARY.filter(vv => vv.meaning !== v.meaning), 3);
    questions.push({
      id: id++, section: 'moji',
      question: `Kata mana yang berarti "${v.meaning}"?`,
      options: shuffle([v.word, ...pool.map(p => p.word)]),
      correctIndex: 0,
      explanation: `"${v.meaning}" dalam bahasa Jepang adalah "${v.word}" (${v.reading}).`,
      typeLabel: 'Kosakata Terbalik',
    });
    questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(v.word);
  }

  return shuffle(questions).slice(0, 10);
}

function generateBunpouQuestions(): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  let id = 100;

  // Type 1: Particle selection
  const particleQs: { sentence: string; particle: string; meaning: string; correctParticle: string; wrongParticles: string[] }[] = [
    { sentence: 'わたし ___ がくせいです。', meaning: 'Saya adalah mahasiswa.', correctParticle: 'は', particle: 'は', wrongParticles: ['が', 'を', 'に'] },
    { sentence: 'コーヒー ___ のみます。', meaning: 'Saya minum kopi.', correctParticle: 'を', particle: 'を', wrongParticles: ['は', 'が', 'に'] },
    { sentence: 'がっこう ___ いきます。', meaning: 'Pergi ke sekolah.', correctParticle: 'に', particle: 'に', wrongParticles: ['へ', 'は', 'を'] },
    { sentence: 'にほん ___ いきたいです。', meaning: 'Ingin pergi ke Jepang.', correctParticle: 'へ', particle: 'へ', wrongParticles: ['に', 'を', 'が'] },
    { sentence: 'わたし ___ ほんです。', meaning: 'Ini buku saya.', correctParticle: 'の', particle: 'の', wrongParticles: ['が', 'は', 'を'] },
    { sentence: 'わたし ___ がくせいです。', meaning: 'Saya juga mahasiswa.', correctParticle: 'も', particle: 'も', wrongParticles: ['は', 'が', 'を'] },
    { sentence: 'つくえ ___ あります。', meaning: 'Ada meja.', correctParticle: 'が', particle: 'が', wrongParticles: ['は', 'を', 'に'] },
    { sentence: 'えき ___ あります。', meaning: 'Ada (di) stasiun.', correctParticle: 'に', particle: 'に', wrongParticles: ['が', 'を', 'は'] },
  ];

  const selectedParticleQs = pickRandom(particleQs, 4);
  for (const pq of selectedParticleQs) {
    questions.push({
      id: id++, section: 'bunpou',
      question: pq.meaning,
      questionJa: pq.sentence.replace('___', '？'),
      options: shuffle([pq.correctParticle, ...pq.wrongParticles]),
      correctIndex: 0,
      explanation: `Partikel yang benar adalah "${pq.correctParticle}". Kalimat: ${pq.sentence.replace('___', pq.correctParticle)}`,
      typeLabel: 'Partikel',
    });
    questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(pq.correctParticle);
  }

  // Type 2: Grammar pattern - choose correct form
  const grammarFormQs: { question: string; questionJa: string; correct: string; wrong: string[]; explanation: string }[] = [
    { question: 'Pilih bentuk yang benar: "Saya tidak makan"', questionJa: 'ごはんを ___ 。', correct: 'たべない', wrong: ['たべる', 'たべます', 'たべなかった'], explanation: 'Bentuk nai-form dari たべる adalah たべない.' },
    { question: 'Pilih bentuk yang benar: "Sudah pergi"', questionJa: 'がっこうに ___ 。', correct: 'いきました', wrong: ['いきます', 'いかない', 'いきたい'], explanation: 'Bentuk ta-form (masa lalu) dari いく adalah いきました.' },
    { question: 'Pilih bentuk yang benar: "Ayo makan"', questionJa: '___ ましょう。', correct: 'たべ', wrong: ['たべる', 'たべない', 'たべた'], explanation: 'Bentuk mashou menggunakan masu-stem: たべ + ましょう.' },
    { question: 'Pilih bentuk yang benar: "Tolong tunggu"', questionJa: 'ちょっと ___ ください。', correct: 'まって', wrong: ['まつ', 'まち', 'まった'], explanation: 'Bentuk te-form dari まつ adalah まって.' },
  ];

  for (const gq of grammarFormQs) {
    questions.push({
      id: id++, section: 'bunpou',
      question: gq.question,
      questionJa: gq.questionJa,
      options: shuffle([gq.correct, ...gq.wrong]),
      correctIndex: 0,
      explanation: gq.explanation,
      typeLabel: 'Bentuk Kata',
    });
    questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(gq.correct);
  }

  // Type 3: Fill in blank with grammar
  const fillQs: { question: string; questionJa: string; correct: string; wrong: string[]; explanation: string }[] = [
    { question: 'Kalimat ini artinya?', questionJa: 'この ほんは たかいです。', correct: 'Buku ini mahal.', wrong: ['Buku ini murah.', 'Buku ini bagus.', 'Buku ini kecil.'], explanation: 'たかい (takai) artinya mahal/tinggi. Kalimat ini berarti "Buku ini mahal."' },
    { question: 'Kalimat ini artinya?', questionJa: 'きのう、ともだちに あいました。', correct: 'Kemarin, bertemu teman.', wrong: ['Besok, bertemu teman.', 'Hari ini, bertemu guru.', 'Kemarin, bertemu guru.'], explanation: 'きのう = kemarin, ともだち = teman, あいました = bertemu. Artinya "Kemarin bertemu teman."' },
    { question: 'Pilih partikel yang tepat:', questionJa: '７じ ___ おきます。', correct: 'に', wrong: ['は', 'を', 'で'], explanation: 'Partikel に digunakan untuk menandai waktu spesifik (jam 7 bangun).' },
    { question: 'Kalimat mana yang benar?', questionJa: '', correct: 'がっこうへ いきます。', wrong: ['がっこうを いきます。', 'がっこうが いきます。', 'がっこうの いきます。'], explanation: 'Partikel へ atau に digunakan untuk tujuan pergerakan. がっこうへ いきます = pergi ke sekolah.' },
  ];

  for (const fq of fillQs) {
    questions.push({
      id: id++, section: 'bunpou',
      question: fq.question,
      questionJa: fq.questionJa || undefined,
      options: shuffle([fq.correct, ...fq.wrong]),
      correctIndex: 0,
      explanation: fq.explanation,
      typeLabel: 'Isi Titik-titik',
    });
    questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(fq.correct);
  }

  return shuffle(questions).slice(0, 8);
}

function generateChoukaiQuestions(): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  let id = 200;

  const passages: { text: string; questions: { q: string; correct: string; wrong: string[]; explanation: string }[] }[] = [
    {
      text: 'わたしは まいにち がっこうに いきます。がっこうは ちかいです。あるいて １５ふん です。',
      questions: [
        { q: 'わたしは まいにち どこに いきますか？', correct: 'がっこう', wrong: ['いえ', 'レストラン', 'としょかん'], explanation: 'わたしは まいにち がっこうに いきます = Saya pergi ke sekolah setiap hari.' },
        { q: 'がっこうまで どのくらい かかりますか？', correct: '１５ふん', wrong: ['１０ふん', '２０ふん', '３０ふん'], explanation: 'あるいて １５ふんです = 15 menit berjalan kaki.' },
      ],
    },
    {
      text: 'きのうは ともだちと えきの まえで あいました。そして、レストランで たべました。すしを たべました。とても おいしかったです。',
      questions: [
        { q: 'きのう なにを たべましたか？', correct: 'すし', wrong: ['ラーメン', 'てんぷら', 'ごはん'], explanation: 'すしを たべました = Makan sushi.' },
        { q: 'どこで たべましたか？', correct: 'レストラン', wrong: ['いえ', 'がっこう', 'えき'], explanation: 'レストランで たべました = Makan di restoran.' },
      ],
    },
    {
      text: 'あしたは ともだちの たんじょうびです。プレゼントを かいました。ほんです。',
      questions: [
        { q: 'あしたは なんですか？', correct: 'ともだちの たんじょうび', wrong: ['わたしの たんじょうび', 'せんせいの たんじょうび', 'かぞくの たんじょうび'], explanation: 'あしたは ともだちの たんじょうびです = Besok adalah ulang tahun teman.' },
        { q: 'プレゼントは なんですか？', correct: 'ほん', wrong: ['でんわ', 'かさ', 'てがみ'], explanation: 'ほんです = Buku.' },
      ],
    },
    {
      text: 'にほんごの じゅぎょうは なんようびですか。すいようびです。すいようびの ごごに あります。せんせいは とても しんせつです。',
      questions: [
        { q: 'にほんごの じゅぎょうは いつですか？', correct: 'すいようびの ごご', wrong: ['げつようびの あさ', 'もくようびの ごご', 'かようびの ひる'], explanation: 'すいようびの ごごに あります = Ada pada hari Rabu siang.' },
        { q: 'せんせいは どうですか？', correct: 'とても しんせつ', wrong: ['とても きびしい', 'ちょっと かわいい', 'とても げんき'], explanation: 'せんせいは とても しんせつです = Guru sangat baik/baik hati.' },
      ],
    },
    {
      text: 'らいしゅうの どようびに ともだちと いっしょに えいがを みに いきます。えいがかんは えきの となりに あります。きっぷは １８００えんです。',
      questions: [
        { q: 'いつ えいがを みに いきますか？', correct: 'らいしゅうの どようび', wrong: ['きのうの どようび', 'こんしゅうの どようび', 'らいしゅうの にちようび'], explanation: 'らいしゅうの どようび = Sabtu minggu depan.' },
        { q: 'えいがかんは どこに ありますか？', correct: 'えきの となり', wrong: ['がっこうの まえ', 'いえの となり', 'えきの なか'], explanation: 'えきの となりに あります = Ada di sebelah stasiun.' },
        { q: 'だれと いきますか？', correct: 'ともだち', wrong: ['せんせい', 'かぞく', 'ひとりで'], explanation: 'ともだちと いっしょに = Bersama teman.' },
      ],
    },
  ];

  const selectedPassages = pickRandom(passages, 3);
  for (const passage of selectedPassages) {
    const pq = pickRandom(passage.questions, Math.min(2, passage.questions.length));
    for (const q of pq) {
      questions.push({
        id: id++, section: 'choukai',
        question: q.q,
        questionJa: undefined,
        options: shuffle([q.correct, ...q.wrong]),
        correctIndex: 0,
        explanation: q.explanation,
        audioText: passage.text,
        typeLabel: 'Pemahaman',
      });
      questions[questions.length - 1].correctIndex = questions[questions.length - 1].options.indexOf(q.correct);
    }
  }

  return shuffle(questions).slice(0, 5);
}

function generateAllQuestions(sections: ('moji' | 'bunpou' | 'choukai')[]): ExamQuestion[] {
  const all: ExamQuestion[] = [];
  let idx = 0;
  if (sections.includes('moji')) {
    const qs = generateMojiGoiQuestions();
    all.push(...qs.map((q, i) => ({ ...q, id: idx++ })));
  }
  if (sections.includes('bunpou')) {
    const qs = generateBunpouQuestions();
    all.push(...qs.map((q, i) => ({ ...q, id: idx++ })));
  }
  if (sections.includes('choukai')) {
    const qs = generateChoukaiQuestions();
    all.push(...qs.map((q, i) => ({ ...q, id: idx++ })));
  }
  return all;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MockExam() {
  const [phase, setPhase] = useState<ExamPhase>('start');
  const [selectedSections, setSelectedSections] = useState<Set<'moji' | 'bunpou' | 'choukai'>>(new Set(['moji', 'bunpou', 'choukai']));
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [showOverview, setShowOverview] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isClient = typeof window !== 'undefined';

  const previousScores = React.useMemo(() => {
    if (!isClient) return [];
    try {
      const history = JSON.parse(localStorage.getItem('gemu-exam-history') || '[]');
      return history.slice(0, 5);
    } catch { return []; }
  }, [isClient]);

  const bestScore = React.useMemo(() => {
    if (!isClient) return null;
    try {
      const best = JSON.parse(localStorage.getItem('gemu-exam-best') || '{}');
      return best.score !== undefined ? best as { score: number; grade: string } : null;
    } catch { return null; }
  }, [isClient]);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  const toggleSection = (s: 'moji' | 'bunpou' | 'choukai') => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const startExam = () => {
    const qs = generateAllQuestions(Array.from(selectedSections));
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers({});
    setMarked(new Set());
    setResult(null);
    setElapsed(0);
    setShowOverview(false);
    setPhase('playing');
  };

  const selectAnswer = (qId: number, optIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const toggleMark = (qId: number) => {
    setMarked(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let totalCorrect = 0;
    const wrongAnswers: ExamResult['wrongAnswers'] = [];
    const sectionMap: Record<string, { correct: number; total: number }> = {};

    for (const q of questions) {
      const sectionKey = q.section;
      if (!sectionMap[sectionKey]) sectionMap[sectionKey] = { correct: 0, total: 0 };
      sectionMap[sectionKey].total++;

      const userAns = answers[q.id];
      if (userAns === q.correctIndex) {
        totalCorrect++;
        sectionMap[sectionKey].correct++;
      } else {
        wrongAnswers.push({ question: q, userAnswer: userAns ?? -1 });
      }
    }

    const pct = Math.round((totalCorrect / totalQuestions) * 100);
    const { grade } = getGrade(pct);
    const sectionScores = Object.entries(sectionMap).map(([key, val]) => ({
      section: SECTION_CONFIG[key as keyof typeof SECTION_CONFIG]?.label || key,
      correct: val.correct,
      total: val.total,
      percentage: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
    }));

    const xpEarned = Math.round(totalCorrect * 10 + pct * 2);

    const res: ExamResult = {
      totalCorrect, totalQuestions, percentage: pct,
      grade, sectionScores, xpEarned, timeElapsed: elapsed, wrongAnswers,
    };
    setResult(res);
    setPhase('results');

    // Save to localStorage
    if (isClient) {
      try {
        const history = JSON.parse(localStorage.getItem('gemu-exam-history') || '[]');
        history.unshift({ score: totalCorrect, total: totalQuestions, date: new Date().toLocaleDateString('id-ID'), grade });
        localStorage.setItem('gemu-exam-history', JSON.stringify(history.slice(0, 20)));

        const best = JSON.parse(localStorage.getItem('gemu-exam-best') || '{}');
        if (!best.score || pct > best.score) {
          localStorage.setItem('gemu-exam-best', JSON.stringify({ score: pct, grade }));
        }

        const totalXp = JSON.parse(localStorage.getItem('gemu-exam-xp') || '0');
        localStorage.setItem('gemu-exam-xp', JSON.stringify(totalXp + xpEarned));

        const quizXp = JSON.parse(localStorage.getItem('gemu-quiz-xp') || '0');
        localStorage.setItem('gemu-quiz-xp', JSON.stringify(quizXp + xpEarned));
      } catch { /* ignore */ }
    }
  };

  const speakText = useCallback((text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakJapanese(text);
    setTimeout(() => setIsSpeaking(false), 3000);
  }, [isSpeaking]);

  const shareResults = () => {
    if (!result) return;
    const text = `📚 Ujian Latihan JLPT N5 - Gemu Nihongo\n${'═'.repeat(30)}\nGrade: ${result.grade} (${result.percentage}%)\nBenar: ${result.totalCorrect}/${result.totalQuestions}\nWaktu: ${formatTime(result.timeElapsed)}\n${'═'.repeat(30)}\n${result.sectionScores.map(s => `${s.section}: ${s.correct}/${s.total}`).join('\n')}\nXP: +${result.xpEarned}\n\n#GemuNihongo #JLPTN5`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // ─── Render: Start Screen ─────────────────────────────────────────────────

  if (phase === 'start') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <FileCheck className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Ujian Latihan N5</h2>
            <p className="text-sm text-muted-foreground">Uji kemampuan JLPT N5 kamu</p>
          </div>
        </div>

        {/* Hero Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 p-6 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} />
                <span className="font-bold text-sm uppercase tracking-wider">Mini Mock Exam</span>
              </div>
              <h3 className="text-2xl font-black mb-2">JLPT N5 Practice Test</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Simulasi ujian JLPT N5 mini dengan soal dari tiga kategori: Moji Goi, Bunpou, dan Choukai.
                Latih kemampuan bahasa Jepang kamu secara menyeluruh!
              </p>
            </div>
          </div>
        </Card>

        {/* Section Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Target size={16} className="text-teal-500" />
              Pilih Seksi Ujian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['moji', 'bunpou', 'choukai'] as const).map((key) => {
              const cfg = SECTION_CONFIG[key];
              const Icon = cfg.icon;
              const isSelected = selectedSections.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    isSelected
                      ? `${cfg.borderColor} bg-opacity-50 dark:bg-opacity-20 shadow-sm`
                      : 'border-transparent bg-muted/50 hover:bg-muted opacity-60'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 transition-opacity', cfg.color, isSelected ? 'opacity-100' : 'opacity-50')}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">{cfg.subtitle} — {cfg.count} soal</p>
                  </div>
                  <Badge variant="secondary" className={cn('text-xs shrink-0', isSelected ? cfg.badgeColor : 'bg-muted')}>
                    {cfg.count}
                  </Badge>
                </button>
              );
            })}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-foreground">
                  {Array.from(selectedSections).reduce((sum, s) => sum + SECTION_CONFIG[s].count, 0)} soal
                </span> dari 3 seksi terpilih
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-teal-950/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <p className="font-bold text-sm">Peraturan Ujian</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-teal-500 mt-0.5 shrink-0" /> Tidak ada batas waktu per soal</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-teal-500 mt-0.5 shrink-0" /> Tandai soal untuk ditinjau kembali di akhir</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-teal-500 mt-0.5 shrink-0" /> Bisa navigasi maju-mundur antar soal</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-teal-500 mt-0.5 shrink-0" /> 4 pilihan per soal (A/B/C/D)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Previous Scores */}
        {previousScores.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                Riwayat Ujian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousScores.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn('font-black', getGrade(Math.round((s.score / s.total) * 100)).color)}>
                        {s.grade}
                      </Badge>
                      <span className="text-sm font-medium">{s.score}/{s.total}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.date}</span>
                  </div>
                ))}
                {bestScore && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    Skor terbaik: <span className="font-bold text-teal-600 dark:text-teal-400">{bestScore.score}%</span> (Grade {bestScore.grade})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Button */}
        <Button
          onClick={startExam}
          disabled={selectedSections.size === 0}
          className="w-full h-14 text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 rounded-xl transition-all duration-200"
        >
          <Play size={18} className="mr-2" />
          Mulai Ujian
        </Button>
      </div>
    );
  }

  // ─── Render: Playing ──────────────────────────────────────────────────────

  if (phase === 'playing' && currentQ) {
    const sectionCfg = SECTION_CONFIG[currentQ.section];
    const SectionIcon = sectionCfg.icon;
    const userAnswer = answers[currentQ.id];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = userAnswer === currentQ.correctIndex;
    const isLast = currentIdx === totalQuestions - 1;

    return (
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className={cn('shrink-0', sectionCfg.badgeColor)}>
              <SectionIcon size={12} className="mr-1" />
              {sectionCfg.label}
            </Badge>
            <Badge variant="outline" className="shrink-0 text-xs">
              {currentIdx + 1}/{totalQuestions}
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock size={14} />
              <span className="font-mono font-semibold">{formatTime(elapsed)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOverview(!showOverview)}
              className="text-xs px-2"
            >
              {showOverview ? 'Tutup' : 'Navigasi'}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={((currentIdx + 1) / totalQuestions) * 100} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{answeredCount} dijawab</span>
            <span>{totalQuestions - answeredCount} tersisa</span>
          </div>
        </div>

        {/* Question Overview */}
        {showOverview && (
          <Card className="border-dashed">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Ringkasan Soal</p>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                {questions.map((q, i) => {
                  const isAns = answers[q.id] !== undefined;
                  const isCurr = i === currentIdx;
                  const isMarked = marked.has(q.id);
                  const cfg = SECTION_CONFIG[q.section];
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setCurrentIdx(i); setShowOverview(false); }}
                      className={cn(
                        'relative w-full aspect-square rounded-lg text-[11px] font-bold flex items-center justify-center transition-all',
                        isCurr ? 'ring-2 ring-teal-500 ring-offset-1' : '',
                        isAns ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {i + 1}
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white dark:border-gray-900" />
                      )}
                      {!isAns && !isCurr && (
                        <span className={cn('absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg', cfg.color)} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-teal-200 dark:bg-teal-800" /> Dijawab</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-muted" /> Belum</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ditandai</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Section for Choukai */}
        {currentQ.section === 'choukai' && currentQ.audioText && (
          <Card className={cn('border-2', sectionCfg.borderColor)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 size={16} className="text-amber-500" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Bagian Dengarkan</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Tekan tombol play untuk mendengarkan teks, atau baca teks di bawah:
              </p>
              <Button
                variant="outline"
                onClick={() => speakText(currentQ.audioText!)}
                className={cn(
                  'mb-3 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                  isSpeaking && 'bg-amber-100 dark:bg-amber-900/30'
                )}
              >
                <Volume2 size={16} className={cn('mr-2', isSpeaking && 'animate-pulse')} />
                {isSpeaking ? 'Sedang Memutar...' : 'Putar Audio'}
              </Button>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                <p className="text-sm font-jp leading-relaxed">
                  {currentQ.audioText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            {/* Question Number & Type */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                Soal {currentIdx + 1}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {currentQ.typeLabel}
              </Badge>
            </div>

            {/* Question Text */}
            <p className="text-base font-semibold mb-2 leading-relaxed">
              {currentQ.question}
            </p>
            {currentQ.questionJa && (
              <p className="text-lg font-jp mb-4 p-3 rounded-lg bg-muted/50 leading-relaxed">
                {currentQ.questionJa}
              </p>
            )}

            {/* Options */}
            <div className="grid gap-2.5 mt-4">
              {currentQ.options.map((opt, i) => {
                const isSelected = userAnswer === i;
                const isCorrectOpt = i === currentQ.correctIndex;
                const showResult = isAnswered;

                let optStyle = 'border-muted bg-card hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50/50 dark:hover:bg-teal-900/10';
                if (showResult) {
                  if (isCorrectOpt) optStyle = 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
                  else if (isSelected && !isCorrectOpt) optStyle = 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20';
                  else optStyle = 'border-muted/50 bg-muted/30 opacity-60';
                } else if (isSelected) {
                  optStyle = 'border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !isAnswered && selectAnswer(currentQ.id, i)}
                    disabled={isAnswered}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 text-left w-full',
                      optStyle
                    )}
                  >
                    <span className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      showResult && isCorrectOpt
                        ? 'bg-emerald-500 text-white'
                        : showResult && isSelected && !isCorrectOpt
                          ? 'bg-rose-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    )}>
                      {showResult && isCorrectOpt ? (
                        <CheckCircle2 size={16} />
                      ) : showResult && isSelected && !isCorrectOpt ? (
                        <XCircle size={16} />
                      ) : (
                        OPTION_LABELS[i]
                      )}
                    </span>
                    <span className={cn(
                      'text-sm font-medium flex-1',
                      opt.includes('font-jp') && 'font-jp text-base',
                      showResult && isCorrectOpt && 'text-emerald-700 dark:text-emerald-300',
                      showResult && isSelected && !isCorrectOpt && 'text-rose-700 dark:text-rose-300 line-through'
                    )}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {isAnswered && (
              <div className={cn(
                'mt-4 p-3 rounded-lg text-sm',
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              )}>
                <p className="font-semibold mb-1">
                  {isCorrect ? '✓ Benar!' : `✗ Salah. Jawaban benar: ${currentQ.options[currentQ.correctIndex]}`}
                </p>
                <p className="text-xs opacity-80">{currentQ.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="rounded-xl"
            >
              <ChevronLeft size={16} className="mr-1" />
              Sebelumnya
            </Button>
          </div>

          <button
            onClick={() => toggleMark(currentQ.id)}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors',
              marked.has(currentQ.id)
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                : 'text-muted-foreground hover:text-amber-600'
            )}
          >
            {marked.has(currentQ.id) ? (
              <BookmarkCheck size={14} />
            ) : (
              <Bookmark size={14} />
            )}
            {marked.has(currentQ.id) ? 'Ditandai' : 'Tandai'}
          </button>

          <div className="flex items-center gap-2">
            {isLast && answeredCount === totalQuestions ? (
              <Button
                onClick={finishExam}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-md rounded-xl font-bold"
              >
                Selesai
                <ArrowRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setCurrentIdx(Math.min(totalQuestions - 1, currentIdx + 1))}
                disabled={isLast}
                className="rounded-xl"
              >
                Berikutnya
                <ChevronRight size={16} className="ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Finish Exam Button (when all answered) */}
        {answeredCount === totalQuestions && !isLast && (
          <Button
            onClick={finishExam}
            className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg rounded-xl font-bold text-sm"
          >
            <CheckCircle2 size={16} className="mr-2" />
            Selesaikan Ujian ({totalQuestions}/{totalQuestions} dijawab)
          </Button>
        )}
      </div>
    );
  }

  // ─── Render: Results ──────────────────────────────────────────────────────

  if (phase === 'results' && result) {
    const gradeInfo = getGrade(result.percentage);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <FileCheck className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Hasil Ujian</h2>
            <p className="text-sm text-muted-foreground">Ujian Latihan N5 — Selesai</p>
          </div>
        </div>

        {/* Grade Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className={cn('bg-gradient-to-br p-6 text-white text-center relative', gradeInfo.gradient)}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-10 -translate-x-10" />
            <div className="relative z-10">
              <div className="text-6xl font-black mb-1 animate-[zoom-in_0.5s_ease-out]">{gradeInfo.grade}</div>
              <p className="text-lg font-bold mb-2 opacity-90">{gradeInfo.label}</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Benar</p>
                  <p className="font-bold">{result.totalCorrect}/{result.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Akurasi</p>
                  <p className="font-bold">{result.percentage}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Waktu</p>
                  <p className="font-bold">{formatTime(result.timeElapsed)}</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                +{result.xpEarned} XP earned
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Target size={16} className="text-teal-500" />
              Skor per Seksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.sectionScores.map((s) => {
              const secKey = Object.entries(SECTION_CONFIG).find(([, v]) => v.label === s.section)?.[0] as keyof typeof SECTION_CONFIG | undefined;
              const cfg = secKey ? SECTION_CONFIG[secKey] : null;
              const Icon = cfg?.icon || BookOpen;
              const sg = getGrade(s.percentage);
              return (
                <div key={s.section} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cfg && <Icon size={14} className={cn('text-white rounded', cfg.color, 'p-0.5')} />}
                      <span className="text-sm font-semibold">{s.section}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{s.correct}/{s.total}</span>
                      <Badge variant="outline" className={cn('font-bold text-xs', sg.color)}>
                        {s.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={s.percentage} className="h-2.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Wrong Answers Review */}
        {result.wrongAnswers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <XCircle size={16} className="text-rose-500" />
                Review Jawaban Salah ({result.wrongAnswers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {result.wrongAnswers.map((w, i) => {
                const secCfg = SECTION_CONFIG[w.question.section];
                return (
                  <div key={i} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px]" variant="outline">#{questions.findIndex(q => q.id === w.question.id) + 1}</Badge>
                      <Badge className={cn('text-[10px]', secCfg.badgeColor)}>
                        {secCfg.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">{w.question.question}</p>
                    {w.question.questionJa && (
                      <p className="text-sm font-jp text-muted-foreground">
                        {w.question.questionJa}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 text-xs">
                      <p className="text-rose-600 dark:text-rose-400">
                        <XCircle size={12} className="inline mr-1" />
                        Jawabanmu: {w.userAnswer >= 0 ? w.question.options[w.userAnswer] : 'Tidak dijawab'}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} className="inline mr-1" />
                        Jawaban benar: {w.question.options[w.question.correctIndex]}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{w.question.explanation}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareResults}
            variant="outline"
            className="h-12 rounded-xl font-semibold"
          >
            <Share2 size={16} className="mr-2" />
            Bagikan
          </Button>
          <Button
            onClick={() => setPhase('start')}
            variant="outline"
            className="h-12 rounded-xl font-semibold"
          >
            <Home size={16} className="mr-2" />
            Kembali
          </Button>
        </div>

        <Button
          onClick={startExam}
          className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg rounded-xl font-bold"
        >
          <RotateCcw size={16} className="mr-2" />
          Ulangi Ujian
        </Button>
      </div>
    );
  }

  return null;
}
