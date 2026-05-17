/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Type as TypeIcon, 
  Languages, 
  Layout, 
  MessageCircle, 
  ChevronRight, 
  CheckCircle2,
  Menu,
  X,
  Search,
  Sparkles,
  Volume2,
  RotateCcw,
  Trophy,
  BrainCircuit,
  Repeat,
  Mic,
  MicOff,
  VolumeX,
  Headphones,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

import { HIRAGANA, KATAKANA, VOCABULARY, KANJI, GRAMMAR } from './constants';
import { useGemini } from './hooks/useGemini';
import { useKaiwa } from './hooks/useKaiwa';
import { GrammarPoint, Kanji as KanjiType, Vocabulary as VocabType, Character } from './types';
import { ProgressProvider, useProgress } from './ProgressContext';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div className={cn("glass-card p-6", className)} onClick={onClick}>
    {children}
  </div>
);

const speak = (text: string, lang: string = 'ja-JP', onStart?: () => void, onEnd?: () => void) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => { if(onEnd) onEnd(); };
    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
};

export const parseFurigana = (text: string) => {
  const regex = /([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let keyIdx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <ruby key={`furi-${keyIdx++}`} className="[ruby-position:under] mx-0.5">
        {match[1]}
        <rt className="text-[10px] text-teal-600 tracking-tighter leading-none mb-1 opacity-90 font-bold">{match[2]}</rt>
      </ruby>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
};

const NavLink = ({ 
  to, 
  icon: Icon, 
  children, 
  active, 
  onClick 
}: { 
  to: string; 
  icon: any; 
  children: React.ReactNode; 
  active: boolean;
  onClick?: () => void;
}) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-100"
    )}
  >
    <Icon size={20} className={active ? "text-white" : "group-hover:text-indigo-600"} />
    <span className="font-medium">{children}</span>
  </Link>
);

// --- Sections ---

const Home = () => {
  const { progress } = useProgress();

  const totalScore = progress.hiragana_score + progress.katakana_score + progress.bunpou_score + progress.kanji_score;
  
  let recommendation = { title: 'Mulai dari Dasar', path: '/kana', desc: 'Ayo mulai belajar huruf Hiragana dulu!', action: 'Mulai Belajar' };
  if (progress.hiragana_score >= 20 && progress.katakana_score < 20) {
    recommendation = { title: 'Lanjut Katakana', path: '/kana', desc: 'Hiragana sudah lumayan, yuk mulai Katakana!', action: 'Lanjut Belajar' };
  } else if (progress.hiragana_score >= 20 && progress.katakana_score >= 20 && progress.bunpou_score < 20) {
    recommendation = { title: 'Pelajari Tata Bahasa', path: '/grammar', desc: 'Saatnya merangkai kalimat dengan panduan tata bahasa.', action: 'Belajar Grammar' };
  } else if (progress.bunpou_score >= 20 && progress.kanji_score < 20) {
    recommendation = { title: 'Mulai Hafal Kanji', path: '/kanji', desc: 'Kenali huruf Kanji untuk membaca teks N5.', action: 'Hafalkan Kanji' };
  } else if (totalScore > 80) {
    recommendation = { title: 'Latih Kaiwa & Ujian', path: '/kaiwa', desc: 'Kamu sudah hebat! Ayo latihan ngobrol bahasa Jepang.', action: 'Latih Kaiwa' };
  }

  const [reminders, setReminders] = useState<{ enabled: boolean; frequency: 'daily' | 'weekly'; time: string }>({
    enabled: false,
    frequency: 'daily',
    time: '09:00'
  });

  useEffect(() => {
    const savedReminders = localStorage.getItem('gemu_reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  const saveReminders = (newReminders: typeof reminders) => {
    setReminders(newReminders);
    localStorage.setItem('gemu_reminders', JSON.stringify(newReminders));
  };

  const modules = [
    { 
      name: 'Kana Library', 
      desc: 'Hiragana & Katakana', 
      icon: Languages, 
      color: 'bg-indigo-600 text-white shadow-indigo-100', 
      link: '/kana',
      percent: progress.hiragana_score + progress.katakana_score
    },
    { 
      name: 'Vocabulary', 
      desc: '800+ kata untuk level N5', 
      icon: BookOpen, 
      color: 'bg-emerald-600 text-white shadow-emerald-100', 
      link: '/vocabulary',
      percent: 0 // Progress info for Vocabulary is not tracked per SQL context
    },
    { 
      name: 'Kanji Mastery', 
      desc: '100 Kanji pertama Anda', 
      icon: BookOpen, 
      color: 'bg-orange-600 text-white shadow-orange-100', 
      link: '/kanji',
      percent: progress.kanji_score
    },
    { 
      name: 'Grammar Guide', 
      desc: 'Partikel dan struktur kalimat', 
      icon: Layout, 
      color: 'bg-blue-600 text-white shadow-blue-100', 
      link: '/grammar',
      percent: progress.bunpou_score
    },
  ];

  const activities = [
    { name: 'Kanal Flash Mastery', link: '/flashcards', icon: BrainCircuit, color: 'border-rose-200 bg-rose-50 text-rose-700', desc: 'Active Recall' },
    { name: 'Boss Quiz', link: '/quiz', icon: Trophy, color: 'border-amber-200 bg-amber-50 text-amber-700', desc: 'AI Assessment' },
    { name: 'Gemu AI Chat', link: '/ai-sensei', icon: Sparkles, color: 'border-indigo-200 bg-indigo-50 text-indigo-700', desc: 'Practice Companion' },
    { name: 'Kaiwa Studio', link: '/kaiwa', icon: Mic, color: 'border-teal-200 bg-teal-50 text-teal-700', desc: 'Voice Roleplay' },
    { name: 'Choukai Lab', link: '/choukai', icon: Headphones, color: 'border-sky-200 bg-sky-50 text-sky-700', desc: 'Listening Practice' },
  ];

  return (
    <div className="space-y-16 pb-20">
      <header className="space-y-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          <Sparkles size={14} /> Level: JLPT N5 Beginner
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-slate-900">
          Gemu <br/> <span className="text-indigo-600">Nihongo.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
          Kuasai dasar bahasa Jepang dengan platform berbasis AI. Lacak progres belajar harianmu di sini.
        </p>
      </header>

      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity:1, y:0}} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-200">Rekomendasi Belajar</h3>
            <h2 className="text-3xl font-black">{recommendation.title}</h2>
            <p className="text-indigo-100 max-w-md">{recommendation.desc}</p>
          </div>
          <Link to={recommendation.path} className="bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black shrink-0 text-center hover:scale-105 transition-transform shadow-lg">
            {recommendation.action}
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {modules.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
          >
            <Link to={m.link}>
              <Card className="h-full p-8 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all cursor-pointer group rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-500 bg-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500", m.color)}>
                    <m.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-slate-900 tracking-tight">{m.name}</h3>
                  <p className="text-slate-500 text-sm font-bold leading-relaxed mb-6">{m.desc}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Progress</span>
                      <span className="text-indigo-600">{m.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.percent}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className={cn("h-full rounded-full", m.color.split(' ')[0])}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-3 transition-transform relative z-10">
                  Lanjut Belajar <ChevronRight size={18} className="ml-1" />
                </div>
                
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" /> Power Tools
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((act) => (
              <Link key={act.name} to={act.link}>
                <div className={cn("p-8 rounded-[2.5rem] border-2 flex flex-col h-full items-center justify-center gap-4 hover:shadow-2xl transition-all active:scale-95 group bg-white", act.color)}>
                  <div className="p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <act.icon size={36} />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-lg">{act.name}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest leading-none">{act.desc}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <Card className="bg-slate-900 text-white border-none p-10 h-full flex flex-col items-center justify-center text-center space-y-8 rounded-[3rem] relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-6 w-full">
              <div className="text-6xl font-black japanese-text text-indigo-400 rotate-[-5deg]">勉強</div>
              <div className="space-y-2">
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Study Reminders</p>
                <h4 className="text-2xl font-black">Pengingat Belajar</h4>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Aktifkan</span>
                  <button 
                    onClick={() => saveReminders({...reminders, enabled: !reminders.enabled})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      reminders.enabled ? "bg-indigo-500" : "bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      reminders.enabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                {reminders.enabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2 border-t border-white/5"
                  >
                    <div className="flex gap-2">
                      <button 
                        onClick={() => saveReminders({...reminders, frequency: 'daily'})}
                        className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all", reminders.frequency === 'daily' ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400")}
                      >
                        Harian
                      </button>
                      <button 
                        onClick={() => saveReminders({...reminders, frequency: 'weekly'})}
                        className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all", reminders.frequency === 'weekly' ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400")}
                      >
                        Mingguan
                      </button>
                    </div>
                    <input 
                      type="time" 
                      value={reminders.time}
                      onChange={(e) => saveReminders({...reminders, time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center font-bold text-indigo-400 outline-none focus:border-indigo-500"
                    />
                  </motion.div>
                )}
              </div>

              <p className="text-slate-400 text-xs italic">
                {reminders.enabled ? `Kami akan mengingatkanmu setiap ${reminders.frequency === 'daily' ? 'hari' : 'minggu'} jam ${reminders.time}.` : "Set pengingat agar belajarmu lebih konsisten!"}
              </p>
            </div>
            {/* Ambient light */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-60" />
          </Card>
        </div>
      </div>

      <section className="relative group">
        <div className="absolute inset-0 bg-indigo-600 rounded-[3.5rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
        <Card className="bg-white text-slate-900 border-none overflow-hidden relative rounded-[3.5rem] p-12 min-h-[400px] flex items-center shadow-2xl border-2 border-indigo-100">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16 w-full text-center md:text-left">
            <div className="md:w-3/5 space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100">
                <Sparkles size={16} /> New Feature
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-slate-900">
                Latihan <br/> Percakapan AI <br/> <span className="text-indigo-600">Gemu.</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                Gemu AI kini bisa mendeteksi partikel yang salah dan memberikan koreksi tata bahasa secara instan.
              </p>
              <Link to="/ai-sensei" className="inline-flex items-center gap-4 bg-indigo-600 text-white px-10 py-6 rounded-[2rem] font-black text-xl hover:shadow-indigo-500/40 hover:shadow-[0_20px_60px_-15px] transition-all hover:-translate-y-2">
                Mulai Chat Gemu <MessageCircle size={28} />
              </Link>
            </div>
            <div className="md:w-2/5 relative flex justify-center">
              <div className="absolute w-72 h-72 bg-indigo-50 rounded-full blur-2xl -z-10 animate-pulse" />
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="w-64 h-64 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-[10rem] border-4 border-slate-50"
              >
                🎎
              </motion.div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="space-y-2">
    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
    <p className="text-slate-500 text-lg max-w-2xl">{subtitle}</p>
  </div>
);

const Characters = () => {
  const [tab, setTab] = useState<'hira' | 'kata'>('hira');
  const [category, setCategory] = useState<'basic' | 'dakuon' | 'handakuon' | 'yoon' | 'sokuon'>('basic');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  
  const rawData = tab === 'hira' ? HIRAGANA : KATAKANA;
  const data = rawData.filter(c => c.category === category);

  const categories = [
    { id: 'basic', label: 'Dasar' },
    { id: 'dakuon', label: 'Dakuon' },
    { id: 'handakuon', label: 'Handakuon' },
    { id: 'yoon', label: 'Yoon' },
    { id: 'sokuon', label: 'Sokuon' },
  ];

  const handleCharClick = (c: Character) => {
    setSelectedChar(c);
    speak(c.ja);
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Kana Library" subtitle="Pelajari Hiragana dan Katakana lengkap dengan variasi Dakuon dan Yoon." />
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setTab('hira')}
            className={cn("px-10 py-2.5 rounded-xl text-sm font-black transition-all", tab === 'hira' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-700")}
          >
            Hiragana
          </button>
          <button 
            onClick={() => setTab('kata')}
            className={cn("px-10 py-2.5 rounded-xl text-sm font-black transition-all", tab === 'kata' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-700")}
          >
            Katakana
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                category === cat.id ? "bg-indigo-50 border-indigo-600 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${tab}-${category}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-8"
        >
          {category === 'sokuon' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 p-6 md:p-10 rounded-[3rem] shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200 shrink-0 mx-auto md:mx-0">
                    <span className="text-4xl md:text-6xl font-black japanese-text">っ</span>
                  </div>
                  <div className="space-y-4 flex-1 text-center md:text-left">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-indigo-900 tracking-tight">Sokuon (促音)</h3>
                      <p className="text-indigo-500 font-bold tracking-widest uppercase text-xs md:text-sm mt-1">Konsonan Ganda (Double Consonants)</p>
                    </div>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                      Sokuon ditandai dengan karakter <b>Tsu kecil (っ / ッ)</b>. Fungsinya bukan dibaca sebagai "tsu", melainkan memberikan <b>jeda singkat</b> dan menggandakan konsonan berikutnya.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6">
                      <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm flex flex-col items-center md:items-start text-center md:text-left hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-black text-indigo-600 japanese-text mb-1">がっこう</div>
                        <div className="text-sm font-bold text-slate-700">ga-k-kou</div>
                        <div className="text-xs text-slate-400 mt-1">Sekolah</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm flex flex-col items-center md:items-start text-center md:text-left hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-black text-indigo-600 japanese-text mb-1">きって</div>
                        <div className="text-sm font-bold text-slate-700">ki-t-te</div>
                        <div className="text-xs text-slate-400 mt-1">Perangko</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm flex flex-col items-center md:items-start text-center md:text-left hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-black text-indigo-600 japanese-text mb-1">マッチ</div>
                        <div className="text-sm font-bold text-slate-700">ma-c-chi</div>
                        <div className="text-xs text-slate-400 mt-1">Korek Api</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 md:gap-6">
            {data.length > 0 ? data.map((c) => (
              <motion.div
                key={c.ja}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="h-full"
              >
                <Card 
                  onClick={() => handleCharClick(c)}
                  className="p-3 md:p-6 text-center cursor-pointer hover:shadow-xl hover:border-indigo-600 transition-all group relative overflow-hidden bg-white border-2 border-slate-100 rounded-3xl h-full flex flex-col items-center justify-center aspect-square"
                >
                  <div className={cn(
                    "font-black japanese-text text-slate-800 group-hover:text-indigo-600 transition-colors leading-none flex items-center justify-center whitespace-nowrap",
                    c.ja.length > 1 ? "text-xl md:text-3xl tracking-tighter" : "text-3xl md:text-5xl"
                  )}>
                    {c.ja}
                  </div>
                  <div className="mt-2 text-[9px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-black">{c.romaji}</div>
                </Card>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold italic bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                Karakter untuk kategori ini akan segera hadir!
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedChar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChar(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm"
            >
              <Card className="p-8 text-center space-y-6 rounded-[3rem] shadow-2xl bg-white border-none overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="space-y-1 relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                    <div className="text-[15rem] font-black japanese-text">{selectedChar.ja}</div>
                  </div>
                  <motion.div 
                    key={selectedChar.ja}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[7rem] md:text-[9rem] font-black text-indigo-600 japanese-text drop-shadow-xl relative flex items-center justify-center whitespace-nowrap flex-nowrap leading-none"
                  >
                    <span className="relative z-10">{selectedChar.ja}</span>
                    <motion.div 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 text-indigo-100 opacity-20 blur-sm flex items-center justify-center pointer-events-none"
                    >
                      {selectedChar.ja}
                    </motion.div>
                  </motion.div>
                  <div className="text-2xl font-black uppercase tracking-[0.3em] text-slate-800 pb-1 border-b-2 border-indigo-50 inline-block px-4">{selectedChar.romaji}</div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <span className="w-6 h-[1px] bg-slate-200" /> Stroke Guide <span className="w-6 h-[1px] bg-slate-200" />
                  </p>
                  <div className="p-4 bg-slate-50/50 rounded-[2.5rem] space-y-4 border border-slate-100/50">
                    <div className="aspect-square bg-white rounded-[2rem] flex items-center justify-center p-6 shadow-inner overflow-hidden border border-slate-100 w-full relative">
                      <StrokeOrderImage character={selectedChar.ja} kanaType={tab as 'hira' | 'kata'} />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 bg-indigo-600 shadow-lg shadow-indigo-100 rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0">!</div>
                        <p className="text-left text-[11px] font-bold text-slate-600 leading-snug">Gunakan urutan ini untuk hasil tulisan yang lebih rapi dan seimbang.</p>
                      </div>
                      <div className="pt-2 border-t border-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
                        Stroke order (Kakujun) sangat penting untuk estetika kanji & kana.
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const s = selectedChar.ja;
                        setSelectedChar(null);
                        setTimeout(() => setSelectedChar(rawData.find(c => c.ja === s)), 10);
                      }}
                      className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-white px-3 py-1.5 rounded-full transition-all"
                    >
                      <RotateCcw size={10} /> Ulangi
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => speak(selectedChar.ja)}
                    className="flex items-center justify-center gap-2 bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black hover:bg-indigo-200 transition-all active:scale-95 group"
                  >
                    <Volume2 size={24} className="group-hover:animate-pulse" /> Suara
                  </button>
                  <button 
                    onClick={() => setSelectedChar(null)}
                    className="bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95"
                  >
                    Tutup
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-emerald-100 rounded-[2.5rem]">
        <div className="bg-white/20 p-4 rounded-3xl rotate-3">
          <BookOpen size={48} className="text-white" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black">Tips Belajar Gemu</h3>
          <p className="text-emerald-50 md:max-w-xl font-medium">
            Gunakan Gemu AI untuk menanyakan asal usul karakter! Mengetahui sejarah karakter membantu daya ingat jangka panjang.
          </p>
        </div>
      </Card>
    </div>
  );
};

const Vocabulary = () => {
  const [search, setSearch] = useState('');
  const filtered = VOCABULARY.filter(v => 
    v.word.includes(search) || v.reading.toLowerCase().includes(search.toLowerCase()) || v.meaning.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(VOCABULARY.map(v => v.category)));

  return (
    <div className="space-y-8">
      <SectionHeader title="Kosakata" subtitle="Kumpulan kosakata dasar yang sering muncul di JLPT N5." />
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari kata, hiragana, atau arti..." 
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v, i) => (
          <Card key={i} className="flex flex-col gap-4 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold japanese-text text-indigo-600">{v.word}</div>
                  <button 
                    onClick={() => speak(v.word)}
                    className="p-1 hover:bg-indigo-50 rounded-lg text-indigo-400 transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <div className="text-sm text-slate-400 font-mono tracking-tight">{v.reading}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-700">{v.meaning}</div>
                <div className="text-[10px] uppercase text-indigo-400 font-black">{v.category}</div>
              </div>
            </div>
            
            {(v.explanation || v.formula) && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                {v.explanation && (
                  <p className="text-slate-600"><span className="font-bold text-slate-800">Kenapa:</span> {v.explanation}</p>
                )}
                {v.formula && (
                  <p className="text-indigo-600 font-mono bg-white p-1 px-2 rounded inline-block border border-indigo-100">
                    <span className="font-bold mr-1">Rumus:</span> {v.formula}
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

const SingleStrokeOrderImage = ({ character, kanaType, size = "large" }: { character: string, kanaType?: 'hira' | 'kata', size?: 'small' | 'large' }) => {
  const [error, setError] = useState(false);
  const [srcIdx, setSrcIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Map small kana to large counterparts for better hit rate on animations
  const charMap: Record<string, string> = {
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
    'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ',
    'っ': 'つ', 'ッ': 'ツ',
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ'
  };

  const lookupChar = charMap[character] || character;

  const sources = useMemo(() => {
    const list = [];
    const hexCode = lookupChar.charCodeAt(0).toString(16).toLowerCase();
    
    if (kanaType === 'hira') {
      list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/Hiragana_${lookupChar}_stroke_order_animation.gif`);
    } else if (kanaType === 'kata') {
      list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/Katakana_${lookupChar}_stroke_order_animation.gif`);
    }

    // Common patterns for Kanji on Wikimedia (these are often animated GIFs)
    // Pattern: Character-order.gif is the standard for animated stroke order
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${lookupChar}-order.gif`);
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${lookupChar}-stroke_order.gif`);
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/Stroke_order_${lookupChar}.gif`);
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${lookupChar}-jocr.gif`);
    
    // Github fallback repos for Kanji gifs
    list.push(`https://raw.githubusercontent.com/mistval/kanji_images/master/gifs/${hexCode}.gif`);
    list.push(`https://raw.githubusercontent.com/jcsilva/anim-kanji/master/kanji-gifs/${hexCode}.gif`);

    // Remove static images and generic Wikipedia names (like ${lookupChar}.gif) 
    // to strictly enforce animations and avoid Wikipedia disambiguation images (like 円 as "circle").
    
    return list;
  }, [lookupChar, kanaType]);

  const handleNextSource = () => {
    if (srcIdx < sources.length - 1) {
      setSrcIdx(srcIdx + 1);
      setIsLoading(true);
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSrcIdx(0);
    setError(false);
    setIsLoading(true);
  }, [character]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-slate-300 opacity-60">
        <X size={24} className="mb-2" />
        <div className="text-[10px] font-black uppercase tracking-widest text-center leading-none">
          Stroke Animation<br/>Unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={sources[srcIdx]}
        alt={`Stroke order ${character}`}
        onLoad={() => setIsLoading(false)}
        className={cn(
          "object-contain mix-blend-multiply transition-all duration-500", 
          size === "large" ? "max-w-full max-h-full" : "w-full h-full",
          isLoading ? "opacity-0 scale-90" : "opacity-100 scale-100"
        )}
        onError={handleNextSource}
      />
    </div>
  );
};

const StrokeOrderImage = ({ character, kanaType }: { character: string, kanaType?: 'hira' | 'kata' }) => {
  const chars = Array.from(character);
  
  if (chars.length > 1) {
    return (
      <div className="flex items-center justify-center gap-2 w-full h-full">
        {chars.map((c, i) => (
          <div key={i} className="flex-1 flex items-center justify-center border-r last:border-r-0 border-slate-100 h-full">
            <SingleStrokeOrderImage character={c} kanaType={kanaType} />
          </div>
        ))}
      </div>
    );
  }

  return <SingleStrokeOrderImage character={character} kanaType={kanaType} />;
};

const Kanji = () => {
  const [viewMode, setViewMode] = useState<'details' | 'quick' | 'flashcards' | 'mastery' | 'download'>('details');

  const navItems = [
    { id: 'details', label: 'DETAILS VIEW' },
    { id: 'quick', label: 'QUICK STUDY' },
    { id: 'flashcards', label: 'FLASHCARDS' },
    { id: 'mastery', label: 'MY MASTERY' },
    { id: 'download', label: 'DOWNLOAD' },
  ];

  const quickGrid = ['人', '一', '日', '大', '年', '出', '本', '中', '子', '見', '国', '上', '分', '生', '行', '二', '間', '時', '気', '十', '女', '三', '前', '入', '小', '後', '長', '下', '学', '月', '何', '来', '話', '山', '高', '今', '書', '五', '名', '金', '男', '外', '四', '先', '川', '東', '聞', '語', '九', '食', '八', '水', '天', '木', '六', '万', '白', '七', '円', '電', '父', '北', '車', '母', '半', '百', '土', '西', '読', '千', '校', '右', '南', '左', '友', '火', '毎', '雨', '休', '午'];

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-6">
        <SectionHeader title="Mastery Kanji N5" subtitle="Daftar lengkap 80 Kanji level JLPT N5 dengan cara baca, arti, dan audio." />
        
        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl w-fit mx-auto md:mx-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all",
                viewMode === item.id 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Quick Grid */}
        <Card className="p-6 rounded-[2.5rem] border-none bg-slate-50/50 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-indigo-600 text-[10px] text-white font-black px-3 py-1 rounded-full">JLPT N5</span>
            <h4 className="text-sm font-black text-slate-800">Cepat Pilih (80 Karakter)</h4>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(35px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(45px,1fr))] gap-2">
            {quickGrid.map((char) => (
              <motion.button
                key={char}
                whileHover={{ scale: 1.1, backgroundColor: '#4f46e5', color: '#fff' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const el = document.getElementById(`kanji-${char}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="aspect-square bg-white rounded-xl flex items-center justify-center text-sm md:text-lg font-black text-slate-600 shadow-sm border border-slate-100 transition-colors japanese-text"
              >
                {char}
              </motion.button>
            ))}
          </div>
        </Card>
      </div>
      
      {viewMode === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
          {KANJI.map((k, i) => (
            <motion.div
              key={i}
              id={`kanji-${k.character}`}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: (i % 5) * 0.1 }}
            >
              <Card className="h-full flex flex-col p-8 rounded-[3rem] border-2 border-slate-100 hover:border-indigo-200 transition-all group bg-white shadow-sm hover:shadow-2xl overflow-hidden relative">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <div className="text-7xl font-black japanese-text text-slate-800 group-hover:text-indigo-600 transition-colors leading-none">
                      {k.character}
                    </div>
                    <div className="flex items-center gap-2 pl-1">
                      <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">Karakter</p>
                      {k.strokes && (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest leading-none">
                          {k.strokes} Goresan
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => speak(k.character)}
                      className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100"
                      title="Dengarkan Karakter"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                </div>

                {/* Meanings & Readings */}
                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{k.meaning}</h4>
                    <div className="w-12 h-1 bg-indigo-500 rounded-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50/40 rounded-3xl border border-indigo-100/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Onyomi</p>
                        <button onClick={() => speak(k.onyomi)} className="text-indigo-300 hover:text-indigo-600 transition-colors">
                          <Volume2 size={12} />
                        </button>
                      </div>
                      <p className="text-base font-black text-indigo-900 japanese-text break-words leading-snug">{k.onyomi}</p>
                    </div>

                    <div className="p-4 bg-emerald-50/40 rounded-3xl border border-emerald-100/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Kunyomi</p>
                        <button onClick={() => speak(k.kunyomi)} className="text-emerald-300 hover:text-emerald-600 transition-colors">
                          <Volume2 size={12} />
                        </button>
                      </div>
                      <p className="text-base font-black text-emerald-900 japanese-text break-words leading-snug">{k.kunyomi}</p>
                    </div>
                  </div>

                  {/* Expanded Examples */}
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contoh Kata (Min. 5)</p>
                      <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      {k.examples.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent transition-all group/ex">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-black japanese-text text-slate-700 group-hover/ex:text-indigo-600 transition-colors">{ex.word}</div>
                            <div className="space-y-0.5">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{ex.reading}</div>
                              <div className="text-[10px] font-bold text-slate-600">{ex.meaning}</div>
                            </div>
                          </div>
                          <button onClick={() => speak(ex.word)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                            <Volume2 size={14} />
                          </button>
                        </div>
                      ))}
                      {/* Placeholder indicators if data is less than 5 */}
                      {k.examples.length < 5 && [1, 2, 3, 4, 5].slice(k.examples.length).map(v => (
                        <div key={v} className="h-14 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                           <p className="text-[8px] font-black uppercase text-slate-200 tracking-[0.2em]">Data Segera Ditambahkan</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Visual - Interactive Stroke Order */}
                <div className="mt-auto pt-8">
                   <div className="relative group/stroke bg-slate-50 p-4 rounded-[2.5rem] border border-slate-100 shadow-inner overflow-hidden transition-all hover:bg-white hover:shadow-xl hover:border-indigo-200">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-slate-200 shrink-0 relative shadow-sm group-hover/stroke:border-indigo-400 transition-colors">
                           <StrokeOrderImage character={k.character} />
                           
                           {/* Animation Overlay Hint */}
                           <div className="absolute inset-0 bg-indigo-600/0 group-hover/stroke:bg-indigo-600/5 transition-colors flex items-center justify-center">
                              <RotateCcw size={20} className="text-indigo-600 opacity-0 group-hover/stroke:opacity-100 transition-opacity" />
                           </div>
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 truncate">Stroke Animation</p>
                            <Sparkles size={12} className="text-indigo-400 shrink-0 group-hover/stroke:animate-spin ml-2" />
                          </div>
                          <p className="text-sm md:text-base font-black text-indigo-700 leading-none truncate">Urutan Goresan</p>
                          <p className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 md:line-clamp-none whitespace-normal">
                            Sentuh atau tahan karakter untuk melihat animasi langkah demi langkah.
                          </p>
                        </div>
                      </div>
                      
                      {/* Interaction Area (Invisible but functional for mobile) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const char = k.character;
                          // Trigger reload of the image by briefly removing and re-adding?
                          // Actually img tags reload on source change, or we can just hope the user sees the loop.
                          speak(char);
                        }}
                        className="absolute inset-0 w-full h-full z-10 opacity-0 cursor-pointer"
                        title="Dengarkan & Lihat Animasi"
                      />
                   </div>
                </div>

                {/* Subtle background element */}
                <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-slate-50 japanese-text select-none pointer-events-none group-hover:text-indigo-50/50 transition-colors">
                  {k.character}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {viewMode !== 'details' && (
        <Card className="py-20 flex flex-col items-center justify-center text-center space-y-6 rounded-[4rem] border-4 border-dashed border-slate-200 bg-slate-50">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100">
             <BookOpen size={40} className="text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-800">Mode {navItems.find(n => n.id === viewMode)?.label}</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">Halaman ini adalah bagian dari ekosistem belajar Kanji Gemu yang akan datang.</p>
          </div>
          <button onClick={() => setViewMode('details')} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all text-xs tracking-widest uppercase">
            Kembali ke Detail
          </button>
        </Card>
      )}
    </div>
  );
};

const Grammar = () => {
  const { progress, addProgress } = useProgress();
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gemu_grammar_completed');
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handleComplete = (idx: number) => {
    if (!completed.includes(idx)) {
      const updated = [...completed, idx];
      setCompleted(updated);
      localStorage.setItem('gemu_grammar_completed', JSON.stringify(updated));
      addProgress('bunpou_score', 10);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-6 rounded-[2rem]">
        <SectionHeader title="Tata Bahasa" subtitle="Pahami dasar-dasar penyusunan kalimat bahasa Jepang." />
        <div className="bg-white px-5 py-3 rounded-full font-black text-blue-600 shadow-sm">
          Skor Bunpou: {progress.bunpou_score}
        </div>
      </div>
      
      <div className="space-y-6">
        {GRAMMAR.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="space-y-4 border-l-4 border-l-indigo-600 relative">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-black">{g.title}</h3>
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">{g.structure}</span>
                </div>
                {!completed.includes(i) ? (
                  <button 
                    onClick={() => handleComplete(i)}
                    className="shrink-0 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                     👍 Tandai Selesai (+10 Poin)
                  </button>
                ) : (
                  <div className="shrink-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Selesai
                  </div>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed">{g.explanation}</p>
              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <p className="text-xs uppercase font-black text-slate-400">Contoh Kalimat:</p>
                {g.examples.map((ex, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-bold text-lg japanese-text">{ex.ja}</div>
                    <div className="text-sm text-slate-500 italic">{ex.en}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AISensei = () => {
  const { messages, sendMessage, isLoading } = useGemini();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-6rem)] flex flex-col space-y-4">
      <div className="shrink-0">
        <SectionHeader title="Gemu AI" subtitle="Asisten belajar pribadi Anda. Tanyakan apa saja tentang materi N5." />
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden p-0 shadow-2xl border-none min-h-0 bg-white/70 backdrop-blur-md">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[90%] md:max-w-[80%] rounded-3xl p-4 md:p-5 shadow-sm",
                m.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none"
              )}>
                <div className="prose prose-slate max-w-none text-[15px] leading-relaxed prose-headings:mb-2 prose-p:mb-2 prose-p:last:mb-0 prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-a:text-indigo-500">
                  <ReactMarkdown>
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-5 flex gap-1.5 items-center shadow-sm">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              rows={input.split('\\n').length > 1 ? Math.min(input.split('\\n').length, 4) : 1}
              placeholder="Ngobrol sama Yuki Sensei... (Shift+Enter buat baris baru)" 
              className="flex-1 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-[15px] resize-none overflow-y-auto"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-[52px] bg-indigo-600 text-white px-6 rounded-2xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center"
            >
              Kirim
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- App Shell ---

const Flashcards = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reviewedIndices, setReviewedIndices] = useState<Set<number>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [category, setCategory] = useState<'hira' | 'kata' | 'mixed' | 'kanji'>('mixed');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  
  const pool = useMemo(() => {
    if (category === 'hira') return HIRAGANA;
    if (category === 'kata') return KATAKANA;
    if (category === 'kanji') return KANJI.map(k => ({ ja: k.character, romaji: k.meaning }));
    return [...HIRAGANA, ...KATAKANA];
  }, [category]);

  const char = pool[currentIdx] || pool[0];
  const { addProgress } = useProgress();

  const generateOptions = (correct: string) => {
    const others = pool
      .filter(c => c.ja !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.ja);
    return [correct, ...others].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setReviewedIndices(new Set());
    handleNext();
  }, [category]);

  useEffect(() => {
    if (mode === 'audio' && char) {
      setOptions(generateOptions(char.ja));
    }
  }, [char, mode]);

  const handleCheck = (input: string) => {
    const isCorrect = mode === 'text' 
      ? input.toLowerCase().trim() === char.romaji.toLowerCase()
      : input === char.ja;

    if (isCorrect) {
      setFeedback('correct');
      setIsFlipped(true);
      if (!reviewedIndices.has(currentIdx)) {
        if (category === 'hira') addProgress('hiragana_score', 1);
        else if (category === 'kata') addProgress('katakana_score', 1);
        else if (category === 'kanji') addProgress('kanji_score', 1);
        else if (category === 'mixed') {
          // If mixed, randomly assign to hiragana or katakana
          Math.random() > 0.5 ? addProgress('hiragana_score', 1) : addProgress('katakana_score', 1);
        }
      }
      setReviewedIndices(prev => new Set(prev).add(currentIdx));
      setTimeout(handleNext, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setUserInput('');
    setFeedback(null);
    setCurrentIdx(Math.floor(Math.random() * pool.length));
  };

  const categories = [
    { id: 'hira', label: 'Hiragana' },
    { id: 'kata', label: 'Katakana' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'kanji', label: 'Kanji N5' },
  ];

  const progressPercent = Math.round((reviewedIndices.size / pool.length) * 100);

  return (
    <div className="space-y-12 max-w-2xl mx-auto py-10 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Kanal Flash Mastery</h2>
        <p className="text-slate-500 font-medium tracking-tight">Latih ingatanmu dengan cepat dan menyenangkan.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 block">Session Progress</span>
              <p className="text-2xl font-black text-slate-900">{reviewedIndices.size} <span className="text-slate-300 text-lg">/ {pool.length}</span></p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">{progressPercent}%</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2",
                category === cat.id ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100" : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-3xl w-fit mx-auto">
          <button 
            onClick={() => setMode('text')}
            className={cn("px-8 py-3 rounded-2xl text-sm font-black transition-all", mode === 'text' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-500 hover:bg-slate-200")}
          >
            <div className="flex items-center gap-2 tracking-widest uppercase"><TypeIcon size={16} /> Text</div>
          </button>
          <button 
            onClick={() => setMode('audio')}
            className={cn("px-8 py-3 rounded-2xl text-sm font-black transition-all", mode === 'audio' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-500 hover:bg-slate-200")}
          >
            <div className="flex items-center gap-2 tracking-widest uppercase"><Volume2 size={16} /> Audio Quiz</div>
          </button>
        </div>
      </div>

      <div className="perspective-1000 h-[450px] w-full relative">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full h-full relative preserve-3d"
        >
          {/* Front */}
          <Card className={cn(
            "absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 rounded-[3.5rem] border-4 shadow-2xl bg-white",
            feedback === 'wrong' ? "border-rose-400" : (feedback === 'correct' ? "border-emerald-400" : "border-indigo-100")
          )}>
            {mode === 'text' ? (
              <div className="text-[10rem] font-black text-slate-900 japanese-text leading-none">{char?.ja}</div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => speak(char?.ja)}
                  className="w-32 h-32 bg-indigo-100 text-indigo-600 rounded-[2.5rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-2xl shadow-indigo-50"
                >
                  <Volume2 size={60} />
                </button>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Dengarkan Suara</p>
              </div>
            )}

            {mode === 'text' ? (
              <form onSubmit={(e) => { e.preventDefault(); handleCheck(userInput); }} className="mt-12 w-full max-w-xs space-y-4">
                <input 
                  placeholder="Romaji / Arti..."
                  value={userInput}
                  onChange={(e) => { setUserInput(e.target.value); setFeedback(null); }}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border-4 text-center font-black uppercase text-2xl focus:outline-none transition-all",
                    feedback === 'wrong' ? "border-rose-500 bg-rose-50 text-rose-600 shadow-rose-100" : "border-slate-100 focus:border-indigo-600 focus:ring-8 focus:ring-indigo-100"
                  )}
                />
              </form>
            ) : (
              <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleCheck(opt)}
                    className={cn(
                      "p-6 rounded-2xl border-2 font-black text-3xl transition-all japanese-text",
                      "border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 text-slate-800 shadow-sm"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 md:p-12 rounded-[3.5rem] border-4 border-emerald-100 bg-emerald-50 shadow-2xl [transform:rotateY(180deg)] overflow-hidden">
            <div className="space-y-4 text-center relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 block">Excellent!</span>
              <div className={cn(
                "font-black text-emerald-900 uppercase leading-none break-words px-4",
                char?.romaji.length > 10 ? "text-3xl md:text-5xl" : "text-[4rem] md:text-[7rem]"
              )}>
                {char?.romaji}
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl md:text-4xl font-black japanese-text text-slate-400">{char?.ja}</div>
                
                {/* Stroke Order on Flashcard Back */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-emerald-200/50 flex items-center justify-center p-4 shadow-inner mt-2">
                   <StrokeOrderImage character={char?.ja} />
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 flex items-center gap-3 bg-emerald-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest animate-bounce relative z-10">
              <Sparkles size={20} /> Smart Choice!
            </div>
            
            {/* Background character decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
               <div className="text-[20rem] font-black japanese-text text-emerald-900">{char?.ja}</div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex gap-4 justify-center">
        <button 
          onClick={handleNext}
          className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-slate-200 text-slate-600 rounded-[2rem] font-black hover:shadow-lg transition-all active:scale-95"
        >
          <Repeat size={24} /> Skip
        </button>
      </div>
    </div>
  );
};

const Quiz = () => {
  const [topic, setTopic] = useState('umum');
  const [difficulty, setDifficulty] = useState<'N5' | 'N4' | 'N3'>('N5');
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { addProgress } = useProgress();

  const generateQuiz = async () => {
    setIsLoading(true);
    setQuizData(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Generate a Japanese quiz about ${topic} for level ${difficulty} in Indonesian. 
      Topic: ${topic}
      Level: ${difficulty}
      Return ONLY a JSON object with this structure:
      {
        "title": "Quiz Title",
        "questions": [
          {
            "id": 1,
            "question": "Question text in Japanese/Indonesian",
            "options": ["A", "B", "C", "D"],
            "correct": "Correct option exactly as in options list",
            "explanation": "Brief explanation in Indonesian why this is correct"
          }
        ]
      }
      Generate 5 challenging questions. Use Japanese characters where appropriate.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const text = response.text.replace(/```json|```/g, '').trim();
      setQuizData(JSON.parse(text));
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Gagal membuat kuis. Coba lagi ya!');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.questions.forEach((q: any, i: number) => {
      if (userAnswers[i] === q.correct) score++;
    });
    return Math.round((score / quizData.questions.length) * 100);
  };

  const handleKirimJawaban = () => {
    setShowResults(true);
    let score = 0;
    quizData.questions.forEach((q: any, i: number) => {
      if (userAnswers[i] === q.correct) score++;
    });
    // Menambahkan poin secara acak ke bunpou_score atau kanji_score bila kuis diselesaikan
    if (score > 0) {
       addProgress(topic === 'Kanji Dasar' ? 'kanji_score' : 'bunpou_score', score * 5);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="AI Mastery Quiz" subtitle="Tantang dirimu dengan kuis cerdas dari Yuki AI." />
      
      {!quizData && !isLoading && (
        <Card className="max-w-2xl mx-auto space-y-8 text-center py-16 border-t-4 border-t-indigo-600 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200 rotate-6 transform hover:rotate-0 transition-transform">
            <Trophy size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Siap Uji Nyali?</h2>
            <p className="text-slate-500 font-medium">Pilih tingkat kesulitan dan topik yang ingin kamu kuasai.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest text-left ml-2">Pilih Level</p>
              <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl">
                {(['N5', 'N4', 'N3'] as const).map(l => (
                  <button 
                    key={l}
                    onClick={() => setDifficulty(l)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                      difficulty === l ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-left">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Pilih Topik</p>
              <div className="flex flex-wrap gap-2">
                {['Hiragana & Katakana', 'Kehidupan Sehari-hari', 'Transportasi', 'Keluarga', 'Kata Kerja Lampau', 'Kanji Dasar'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all",
                      topic === t ? "bg-indigo-50 border-indigo-600 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={generateQuiz}
            className="w-full bg-indigo-600 text-white px-8 py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            Mulai Kuis <ChevronRight size={28} />
          </button>
        </Card>
      )}

      {isLoading && (
        <div className="text-center py-24 space-y-6 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-slate-100 max-w-2xl mx-auto">
          <div className="relative">
            <div className="w-20 h-20 border-8 border-indigo-100 rounded-full mx-auto" />
            <div className="w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0 mx-auto" />
          </div>
          <p className="text-2xl font-black text-indigo-600 animate-pulse">Sensei sedang meracik soal...</p>
        </div>
      )}

      {quizData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-indigo-600 rounded-3xl text-white shadow-2xl shadow-indigo-200">
            <div>
              <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Topik: {topic}</p>
              <h2 className="text-2xl font-black">{quizData.title}</h2>
            </div>
            {showResults && (
              <div className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-3xl shadow-inner">
                Skor: {calculateScore()}%
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {quizData.questions.map((q: any, i: number) => (
              <Card key={i} className={cn(
                "space-y-6 p-8 border-2 transition-all",
                showResults ? (userAnswers[i] === q.correct ? "border-emerald-200 bg-emerald-50/20" : "border-rose-200 bg-rose-50/20") : "border-slate-100 hover:border-indigo-100"
              )}>
                <div className="flex gap-6">
                  <span className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0 shadow-sm text-xl">
                    {i + 1}
                  </span>
                  <p className="text-2xl font-black text-slate-800 japanese-text">{q.question}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-18">
                  {q.options.map((opt: string) => (
                    <button 
                      key={opt}
                      disabled={showResults}
                      onClick={() => setUserAnswers(prev => ({ ...prev, [i]: opt }))}
                      className={cn(
                        "px-6 py-4 rounded-2xl border-2 text-left font-bold transition-all text-lg",
                        !showResults && userAnswers[i] === opt ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-y-1" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600",
                        showResults && opt === q.correct && "bg-emerald-500 border-emerald-500 text-white",
                        showResults && userAnswers[i] === opt && opt !== q.correct && "bg-rose-500 border-rose-500 text-white"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {showResults && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm"
                  >
                    <p className="text-indigo-600 font-black uppercase text-xs tracking-widest mb-2">Penjelasan Sensei</p>
                    <p className="text-slate-600 font-medium leading-relaxed italic">{q.explanation}</p>
                  </motion.div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            {!showResults ? (
              <button 
                onClick={handleKirimJawaban}
                disabled={Object.keys(userAnswers).length < quizData.questions.length}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-2xl hover:bg-black shadow-2xl transition-all disabled:opacity-50"
              >
                Kirim Jawaban
              </button>
            ) : (
              <button 
                onClick={() => setQuizData(null)}
                className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-indigo-700 shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw size={28} /> Selesai & Cari Topik Baru
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Sidebar = ({ mobile, close }: { mobile?: boolean; close?: () => void }) => {
  const location = useLocation();
  
  const links = [
    { to: '/', icon: Layout, label: 'Dashboard' },
    { to: '/kana', icon: TypeIcon, label: 'Hiragana & Katakana' },
    { to: '/vocabulary', icon: Languages, label: 'Kosakata' },
    { to: '/kanji', icon: BookOpen, label: 'Kanji N5' },
    { to: '/grammar', icon: BookOpen, label: 'Tata Bahasa' },
    { to: '/flashcards', icon: BrainCircuit, label: 'Kanal Flash Mastery' },
    { to: '/quiz', icon: Trophy, label: 'Boss Quiz' },
    { to: '/kaiwa', icon: Mic, label: 'Kaiwa Studio' },
    { to: '/choukai', icon: Headphones, label: 'Choukai (Listening)' },
    { to: '/ai-sensei', icon: Sparkles, label: 'Gemu AI' },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-slate-200 p-6 space-y-8", mobile && "w-72")}>
      <div className="flex items-center gap-3 px-2">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl shadow-indigo-100 rotate-[-10deg]">G</div>
        <div className="font-black text-xl tracking-tight text-slate-800">GEMU <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">NIHONGO</span></div>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} icon={l.icon} active={location.pathname === l.to} onClick={close}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2">
        <Card className="bg-slate-900 border-none p-5 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
          <div className="relative z-10 text-white">
            <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Masterpiece By</p>
            <h4 className="text-xl font-black mb-1">Darma</h4>
            <p className="text-[10px] text-slate-500 font-bold italic">"Belajar hari ini, kuasai masa depan."</p>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-8 -right-8 opacity-10"
          >
            <Sparkles size={120} className="text-white" />
          </motion.div>
        </Card>
      </div>
    </div>
  );
};

import { useChoukai } from './hooks/useChoukai';

const Choukai = () => {
  const { material, isLoading, generateMaterial } = useChoukai();
  const [showScript, setShowScript] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState<number | null>(null);
  const activeUtterances = useRef<SpeechSynthesisUtterance[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    generateMaterial();
    
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        const jaVoices = availableVoices.filter(v => v.lang.includes('ja') || v.lang.includes('JP'));
        setVoices(jaVoices);
      }
    };
    
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      activeUtterances.current = [];
    }
  }, []);

  const playBrowserTTS = () => {
    if (!material || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    activeUtterances.current = [];
    
    const uniqueSpeakers = Array.from(new Set(material.dialogue.map(l => l.speaker)));
    const speakerVoices: Record<string, SpeechSynthesisVoice | null> = {};
    
    let femaleVoice = voices.find(v => /Ayumi|Haruka|Kyoko|Nanami|Female|Mei|Hattori/i.test(v.name));
    let maleVoice = voices.find(v => /Ichiro|Otoya|Keita|Male|Daishi|Rokuro/i.test(v.name));
    
    // Fallback if specific names aren't found
    if (!femaleVoice && voices.length > 0) {
      femaleVoice = voices.find(v => !maleVoice || v !== maleVoice) || voices[0];
    }
    if (!maleVoice && voices.length > 1) {
      maleVoice = voices.find(v => v !== femaleVoice) || voices[0];
    }
    
    const defaultVoice = voices[0] || null;
    
    // Assign different distinct voices to each speaker if available
    uniqueSpeakers.forEach((s, idx) => {
      if (idx === 0) {
        speakerVoices[s] = femaleVoice || defaultVoice;
      } else if (idx === 1) {
        speakerVoices[s] = maleVoice || defaultVoice;
      } else {
        speakerVoices[s] = voices[idx % voices.length] || defaultVoice;
      }
    });

    setIsPlaying(true);
    // Jika user belum melihat naskah, otomatis buka naskahnya sedikit (atau kasi tau) biar ga bingung pas di-highlight
    setShowScript(true);
    let utterancesCompleted = 0;

    material.dialogue.forEach((line, index) => {
      const cleanJp = line.text.replace(/\[.*?\]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanJp);
      utterance.lang = 'ja-JP';
      
      if (speakerVoices[line.speaker]) {
         utterance.voice = speakerVoices[line.speaker] as SpeechSynthesisVoice;
      }
      
      // Kembalikan pitch natural, jangan diubah agar suara tak aneh seperti robot
      utterance.pitch = 1.0;
      utterance.rate = 0.85;
      
      activeUtterances.current.push(utterance);
      
      utterance.onstart = () => {
        setActiveSpeakingIndex(index);
      };
      
      utterance.onend = () => {
        utterancesCompleted++;
        if (utterancesCompleted === material.dialogue.length) {
          setIsPlaying(false);
          setActiveSpeakingIndex(null);
          activeUtterances.current = [];
        }
      };
      
      utterance.onerror = () => {
        utterancesCompleted++;
        if (utterancesCompleted === material.dialogue.length) {
          setIsPlaying(false);
          setActiveSpeakingIndex(null);
          activeUtterances.current = [];
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveSpeakingIndex(null);
    } else {
      setShowScript(true); // Tampilkan teks otomatis saat play
      playBrowserTTS();
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-10 px-4">
      <SectionHeader title="Choukai (Listening) 🎧" subtitle="Latih pendengaranmu dengan skenario harian N5." />

      {isLoading ? (
        <Card className="flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-md">
          <div className="flex gap-2 items-center text-teal-600 font-bold mb-4">
            <span className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" />
            <span className="w-3 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-3 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <p className="text-slate-500 font-medium">Sedang menyiapkan materi listening...</p>
        </Card>
      ) : material ? (
        <div className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-md">
            <div className="flex items-start gap-4">
              {material.emoji && (
                <div className="text-5xl shrink-0 p-4 bg-teal-50 rounded-3xl border border-teal-100/50 shadow-sm">
                  {material.emoji}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{material.title}</h3>
                <p className="text-slate-600 mb-6">{material.scenario}</p>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div>
                <p className="font-bold text-teal-900 mb-1">Dengarkan Dialog</p>
                <p className="text-sm text-teal-700">Coba dengarkan tanpa lihat teks dulu ya.</p>
              </div>
              <button 
                onClick={togglePlay}
                className={cn(
                  "w-full sm:w-auto px-6 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                  isPlaying ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200 text-white animate-pulse" : "bg-teal-600 hover:bg-teal-700 shadow-teal-200 text-white"
                )}
              >
                {isPlaying ? (
                  <><VolumeX size={24} /> Berhenti</>
                ) : (
                  <><Volume2 size={24} /> Putar Audio</>
                )}
              </button>
            </div>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md space-y-6">
            <h4 className="text-xl font-bold text-slate-800">Soal Pemahaman</h4>
            <div className="space-y-4">
              <p className="font-medium text-slate-700 text-lg">{material.quiz.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {material.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "p-4 rounded-2xl text-left border-2 transition-all font-medium",
                      selectedAnswer === null 
                        ? "border-slate-100 hover:border-teal-300 hover:bg-teal-50 bg-white" 
                        : selectedAnswer === i
                          ? i === material.quiz.answer
                            ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                            : "bg-rose-100 border-rose-400 text-rose-800"
                          : i === material.quiz.answer
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700" 
                            : "bg-white border-slate-100 opacity-50 cursor-not-allowed"
                    )}
                  >
                    {opt}
                    {selectedAnswer !== null && i === material.quiz.answer && (
                      <span className="ml-2 text-emerald-600 text-sm font-bold">(Benar)</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedAnswer !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("p-6 rounded-3xl text-sm font-medium space-y-4", selectedAnswer === material.quiz.answer ? "bg-emerald-50 border border-emerald-100" : "bg-rose-50 border border-rose-100")}
                >
                  <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xl text-white shadow-sm", selectedAnswer === material.quiz.answer ? "bg-emerald-500" : "bg-rose-500")}>
                          {selectedAnswer === material.quiz.answer ? "✓" : "×"}
                      </div>
                      <div className={cn("text-lg font-black", selectedAnswer === material.quiz.answer ? "text-emerald-800" : "text-rose-800")}>
                          {selectedAnswer === material.quiz.answer ? "Tepat Sekali!" : "Oops, kurang tepat."}
                      </div>
                  </div>
                  
                  <div className="bg-white/60 p-4 rounded-2xl">
                      <p className="font-bold text-slate-800 mb-1">Penjelasan:</p>
                      <p className="text-slate-700 leading-relaxed text-[15px]">{material.quiz.explanation}</p>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedAnswer(null);
                          setShowScript(false);
                          generateMaterial();
                        }}
                        className={cn("px-6 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center gap-2", selectedAnswer === material.quiz.answer ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-teal-600 hover:bg-teal-700 shadow-teal-200")}
                      >
                        Tahap Selanjutnya <ChevronRight size={20} />
                      </button>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          <div className="flex justify-center">
            <button 
              onClick={() => setShowScript(!showScript)}
              className="text-slate-500 hover:text-teal-600 font-bold underline underline-offset-4 text-sm"
            >
              {showScript ? 'Sembunyikan Naskah' : 'Lihat Naskah (Bila Menyerah)'}
            </button>
          </div>

          <AnimatePresence>
            {showScript && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Card className="bg-slate-50 border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-4">Naskah Dialog</h4>
                  <div className="space-y-4">
                    {material.dialogue.map((line, i) => (
                      <div 
                        key={i} 
                        className={cn("flex gap-4 p-3 rounded-2xl transition-all", activeSpeakingIndex === i ? "bg-teal-100 ring-2 ring-teal-400 shadow-sm" : "")}
                      >
                        <div className={cn("w-10 h-10 rounded-full font-black flex items-center justify-center shrink-0 shadow-sm", activeSpeakingIndex === i ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-600")}>
                          {line.speaker}
                        </div>
                        <div className="space-y-1 pt-0.5">
                          <p className="text-lg font-bold japanese-text text-slate-800">
                            {parseFurigana(line.text)}
                          </p>
                          <p className="text-sm font-medium text-slate-500">{line.ro}</p>
                          <p className="text-[13px] text-slate-400">{line.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
};

const Kaiwa = () => {
  const { messages, sendMessage, getFeedback, isLoading, isLiveActive, connectLive, disconnectLive, aiSpeaking, currentAudioRef: cAudioRef } = useKaiwa();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  
  const isSpeaking = isSpeakingLocal || aiSpeaking;
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIndexRef = useRef<number>(0); 
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (cAudioRef && cAudioRef.current) {
        currentAudioRef.current = cAudioRef.current;
    }
  }, [cAudioRef]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const recognitionRef = useRef<any>(null);

  const handleSpeak = (text: string, m?: typeof messages[0]) => {
    // Stop currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    const onStart = () => {
      setIsSpeakingLocal(true);
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };
    const onEnd = () => setIsSpeakingLocal(false);

    if (m?.audioUrl) {
      onStart();
      const audio = new Audio(m.audioUrl);
      currentAudioRef.current = audio;
      audio.onended = onEnd;
      audio.onerror = onEnd;
      audio.play().catch(e => {
        console.error("Audio playback failed", e);
        onEnd();
      });
      return;
    }

    // Fallback to browser TTS if audioUrl not present
    const matchJp = text.match(/JP:\s*(.*)/);
    
    if (matchJp && !text.includes('EVALUASI')) {
      const cleanJp = matchJp[1].replace(/\[.*?\]/g, ''); 
      speak(cleanJp, 'ja-JP', onStart, onEnd);
    } else {
      const cleanText = text.replace(/[*#]/g, '');
      speak(cleanText, 'id-ID', onStart, onEnd);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && !isLoading && !isLiveActive) {
      const lastIndex = messages.length - 1;
      const lastMsg = messages[lastIndex];
      // Only auto-speak if it is a new model message AND not live active since Live Active auto plays
      if (lastMsg.role === 'model' && !lastMsg.text.includes('EVALUASI') && lastSpokenIndexRef.current < lastIndex) {
        lastSpokenIndexRef.current = lastIndex;
        handleSpeak(lastMsg.text, lastMsg);
      }
    }
  }, [messages, isLoading, isLiveActive]);

  const handleSend = () => {
    if (input.trim() && !isLoading && !isSpeaking) {
      sendMessage(input);
      setInput('');
    }
  };
  
  const toggleListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur Voice Input. Coba gunakan Chrome.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Auto-detect lang setting based on whether AI is in "Indonesian Mode" or "Japanese Mode"
    const lastMsg = messages[messages.length - 1];
    const isMode2 = lastMsg && lastMsg.role === 'model' && !lastMsg.text.match(/JP:\s*/);
    recognition.lang = isMode2 ? 'id-ID' : 'ja-JP';
    
    recognitionRef.current = recognition;

    let finalTranscript = input ? input + ' ' : '';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          alert("Akses mikrofon ditolak. Coba beri izin di browser, atau pastikan aplikasi ini tidak memblokir akses mikrofon.");
        }
      }
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Determine which messages to show based on user preferences for a clean chatbox
  let visibleMessages = messages;
  if (messages.length > 1) {
     if (isLoading) {
         visibleMessages = [messages[messages.length - 1]];
     } else {
         visibleMessages = messages.slice(-2);
     }
  }

  return (
    <div className="h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-6rem)] flex flex-col space-y-4">
      <div className="shrink-0 flex justify-between items-center bg-teal-50 border border-teal-100 p-6 rounded-[2rem]">
        <SectionHeader title="Kaiwa Studio 🎙️" subtitle="Roleplay percakapan dengan AI. Coba gunakan fitur Suara!" />
        <div className="flex gap-2">
           <button
             onClick={isLiveActive ? disconnectLive : connectLive}
             disabled={isLoading && !isLiveActive}
             className={cn("shrink-0 px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2", isLiveActive ? "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700" : "bg-purple-600 text-white hover:bg-purple-700")}
           >
             {isLiveActive ? <MicOff size={18} /> : <span><Volume2 size={18} className="inline mr-1"/>Mode Live</span>}
           </button>
           <button
             onClick={getFeedback}
             disabled={isLoading || isLiveActive}
             className="shrink-0 bg-white hover:bg-teal-600 text-teal-600 hover:text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
           >
             <BrainCircuit size={18} /> Evaluasi
           </button>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden p-0 shadow-2xl border-none min-h-0 bg-white/70 backdrop-blur-md">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {visibleMessages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[90%] md:max-w-[80%] rounded-3xl p-4 md:p-5 shadow-sm relative group",
                m.role === 'user' ? "bg-teal-600 text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none"
              )}>
                {(() => {
                  const matchJp = m.text.match(/JP:\s*(.*)/);
                  const matchRo = m.text.match(/RO:\s*(.*)/);
                  const matchId = m.text.match(/ID:\s*(.*)/);

                  if (m.role === 'model' && matchJp && matchRo && matchId && !m.text.includes('EVALUASI')) {
                    return (
                      <div className="space-y-4 py-2">
                        <div className="text-xl md:text-2xl font-bold japanese-text text-teal-900 leading-relaxed md:leading-loose pr-8">
                          {parseFurigana(matchJp[1])}
                        </div>
                        <div className="space-y-1.5 p-3 md:p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                          <div className="text-sm font-semibold text-teal-700 tracking-wide border-l-2 border-teal-400 pl-3">
                            {matchRo[1]}
                          </div>
                          <div className="text-[13px] text-slate-500 font-medium border-l-2 border-slate-200 pl-3">
                            {matchId[1]}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="prose prose-slate max-w-none text-[15px] leading-relaxed prose-headings:mb-2 prose-p:mb-2 prose-p:last:mb-0">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    );
                  }
                })()}
                {m.role === 'model' && !m.text.includes('EVALUASI') && !isSpeaking && (
                  <button 
                    onClick={() => handleSpeak(m.text, m)}
                    className="absolute -right-3 -bottom-3 p-2 bg-teal-100 text-teal-700 rounded-full shadow-sm hover:bg-teal-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-5 flex gap-1.5 items-center shadow-sm">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          {isSpeaking && (
            <div className="flex items-center gap-2 mb-2 px-2 text-teal-600 font-bold text-xs uppercase tracking-widest animate-pulse">
              <Volume2 size={14} /> AI Sedang Berbicara...
            </div>
          )}
          {!isSpeaking && !isLoading && (
            <div className="flex items-center gap-2 mb-2 px-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-emerald-500" /> Sekarang Giliran Anda
            </div>
          )}
          <div className="flex gap-2 items-end">
            <button
               onClick={toggleListening}
               disabled={isLoading || isSpeaking}
               className={cn(
                 "h-[52px] w-[52px] shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                 isListening ? "bg-rose-500 text-white animate-pulse" : (isLoading || isSpeaking) ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-300"
               )}
            >
               <Mic size={24} />
            </button>
            <textarea
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
              placeholder={isSpeaking ? "AI sedang bicara..." : isListening ? "Mendengarkan... (Klik mic lagi untuk stop)" : "Balas di sini..."}
              className={cn("flex-1 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all text-[15px] resize-none overflow-y-auto", (isLoading || isSpeaking) && "opacity-70 cursor-not-allowed")}
              value={input}
              disabled={isLoading || isSpeaking}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || isSpeaking || !input.trim()}
              className={cn("h-[52px] bg-teal-600 text-white px-6 rounded-2xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center shrink-0", (isLoading || isSpeaking || !input.trim()) && "opacity-50 hover:bg-teal-600 cursor-not-allowed")}
            >
              Kirim
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ProgressProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-[#FDFCFB]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 sticky top-0 h-screen">
            <Sidebar />
          </aside>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {mobileNavOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileNavOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
                />
                <motion.aside 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 z-50 lg:hidden"
                >
                  <div className="h-full relative">
                     <button 
                       onClick={() => setMobileNavOpen(false)}
                       className="absolute top-6 right-[-3rem] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg lg:hidden"
                     >
                       <X size={20} />
                     </button>
                     <Sidebar mobile close={() => setMobileNavOpen(false)} />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs italic">G</div>
                <div className="font-black tracking-tight text-slate-800">GEMU NIHONGO</div>
              </div>
              <button 
                onClick={() => setMobileNavOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
              >
                <Menu size={24} />
              </button>
            </header>

            <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-[calc(100vh-80px)] flex flex-col">
              <div className="flex-1 overflow-x-hidden mb-20 lg:mb-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/kana" element={<Characters />} />
                  <Route path="/vocabulary" element={<Vocabulary />} />
                  <Route path="/kanji" element={<Kanji />} />
                  <Route path="/grammar" element={<Grammar />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/kaiwa" element={<Kaiwa />} />
                  <Route path="/choukai" element={<Choukai />} />
                  <Route path="/ai-sensei" element={<AISensei />} />
                </Routes>
              </div>
              
              <footer className="mt-auto pt-8 pb-4 text-center text-slate-400 text-sm font-medium">
                Created with 💖 by Darma
              </footer>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </ProgressProvider>
  );
}
