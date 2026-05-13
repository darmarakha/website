'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore, lazy, Suspense } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Languages, BookMarked, BookOpen, ListChecks,
  Brain, Gamepad2, MessageSquare, Mic, Headphones,
  Menu, Globe, Sparkles, Sun, Moon, Trophy, Puzzle,
  CalendarCheck, ArrowUp, Flame, GraduationCap, HelpCircle, Info, Timer,
  ChevronRight, Settings, PenTool, Map, FileCheck, Hash, AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Lazy-load all page components for code splitting (significant perf improvement)
const HomeDashboard = lazy(() => import('@/components/home-dashboard'));
const KanaLibrary = lazy(() => import('@/components/kana-library'));
const VocabularyList = lazy(() => import('@/components/vocabulary'));
const KanjiMastery = lazy(() => import('@/components/kanji-mastery'));
const GrammarGuide = lazy(() => import('@/components/grammar-guide'));
const Flashcards = lazy(() => import('@/components/flashcards'));
const BossQuiz = lazy(() => import('@/components/boss-quiz'));
const GemuAIChat = lazy(() => import('@/components/gemu-ai-chat'));
const KaiwaStudio = lazy(() => import('@/components/kaiwa-studio'));
const ChoukaiLab = lazy(() => import('@/components/choukai-lab'));
const SentenceBuilder = lazy(() => import('@/components/sentence-builder'));
const Achievements = lazy(() => import('@/components/achievements'));
const StudyTimer = lazy(() => import('@/components/study-timer'));
const DailyChallenge = lazy(() => import('@/components/daily-challenge'));
const WritingPractice = lazy(() => import('@/components/writing-practice'));
const SettingsPage = lazy(() => import('@/components/settings'));
const StudyPlan = lazy(() => import('@/components/study-plan'));
const MockExam = lazy(() => import('@/components/mock-exam'));
const KazuPractice = lazy(() => import('@/components/kazu-practice'));

// Error boundary class component (React requires class for error boundaries)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: React.Component<
    { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> },
    { hasError: boolean; error: Error | null }
  >['props']) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}

// Loading fallback for lazy components
function SectionLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  );
}

// Error boundary for catching component crashes gracefully
function SectionErrorBoundary({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Terjadi Kesalahan</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Komponen gagal dimuat. Ini biasanya sementara.
      </p>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        className="mt-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
      >
        <AlertTriangle size={14} className="mr-1.5" />
        Coba Lagi
      </Button>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, color: 'text-teal-600' },
  { id: 'kana', label: 'Kana Library', icon: Languages, color: 'text-teal-500' },
  { id: 'vocab', label: 'Kosakata', icon: BookMarked, color: 'text-emerald-500' },
  { id: 'kanji', label: 'Kanji', icon: BookOpen, color: 'text-amber-500' },
  { id: 'grammar', label: 'Grammar', icon: ListChecks, color: 'text-rose-500' },
  { id: 'flashcards', label: 'Flashcards', icon: Brain, color: 'text-violet-500' },
  { id: 'quiz', label: 'Boss Quiz', icon: Gamepad2, color: 'text-red-500' },
  { id: 'ai-chat', label: 'Gemu AI', icon: MessageSquare, color: 'text-cyan-500' },
  { id: 'kaiwa', label: 'Kaiwa Studio', icon: Mic, color: 'text-teal-600' },
  { id: 'choukai', label: 'Choukai Lab', icon: Headphones, color: 'text-sky-500' },
  { id: 'achievements', label: 'Pencapaian', icon: Trophy, color: 'text-amber-500' },
  { id: 'timer', label: 'Study Timer', icon: Timer, color: 'text-teal-500' },
  { id: 'daily', label: 'Tantangan Harian', icon: CalendarCheck, color: 'text-orange-500' },
  { id: 'sentence', label: 'Bangun Kalimat', icon: Puzzle, color: 'text-pink-500' },
  { id: 'writing', label: 'Menulis', icon: PenTool, color: 'text-violet-500' },
  { id: 'plan', label: 'Rencana Belajar', icon: Map, color: 'text-emerald-500' },
  { id: 'kazu', label: 'Latihan Angka', icon: Hash, color: 'text-teal-500' },
  { id: 'mock-exam', label: 'Ujian Latihan', icon: FileCheck, color: 'text-emerald-500' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, color: 'text-gray-500' },
];

function getStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('gemu-study-sessions');
    // gemu-study-sessions stores { "2025-01-15": 3 } format
    const sessionMap: Record<string, number> = raw ? JSON.parse(raw) : {};
    if (!Object.keys(sessionMap).length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const checkDate = new Date(today);

    // Check today first (allow today to not yet have a session)
    const todayKey = checkDate.toISOString().split('T')[0];
    if (sessionMap[todayKey]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Then count backward for consecutive days
    for (let i = 0; i < 365; i++) {
      const key = checkDate.toISOString().split('T')[0];
      if (sessionMap[key] && sessionMap[key] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  } catch {
    return 0;
  }
}

function getOverallProgress(): number {
  if (typeof window === 'undefined') return 0;
  try {
    // gemu-study-sessions stores { "2025-01-15": 3 } format (object, NOT array)
    const raw = localStorage.getItem('gemu-study-sessions');
    const sessionMap: Record<string, number> = raw ? JSON.parse(raw) : {};
    const sessionCount = Object.keys(sessionMap).length;
    const flashcardsLearned = JSON.parse(localStorage.getItem('gemu-flashcard-learned') || '[]');
    const quizCompleted = JSON.parse(localStorage.getItem('gemu-quiz-completed') || '[]');
    const achievements = JSON.parse(localStorage.getItem('gemu-achievements-unlocked') || '[]');
    // Simple heuristic: sessions contribute to ~40%, flashcards ~20%, quizzes ~20%, achievements ~20%
    const sessionScore = Math.min(sessionCount / 30, 1) * 40;
    const flashcardScore = Math.min(flashcardsLearned.length / 58, 1) * 20;
    const quizScore = Math.min(quizCompleted.length / 10, 1) * 20;
    const achieveScore = Math.min(achievements.length / 17, 1) * 20;
    return Math.round(sessionScore + flashcardScore + quizScore + achieveScore);
  } catch {
    return 0;
  }
}

function SidebarNav({ active, onSelect, onMobileClose }: { active: string; onSelect: (id: string) => void; onMobileClose?: () => void }) {
  const handleClick = (id: string) => {
    onSelect(id);
    onMobileClose?.();
  };

  return (
    <div className="flex flex-col gap-1 py-2">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left relative',
              isActive
                ? 'bg-gradient-to-r from-teal-50 to-emerald-50/60 dark:from-teal-950/50 dark:to-emerald-950/30 text-teal-700 dark:text-teal-300 shadow-sm border-l-[4px] border-l-teal-500 dark:border-l-teal-400 rounded-l-lg'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground border-l-[4px] border-l-transparent'
            )}>
            <Icon size={18} className={cn(isActive ? 'text-teal-600 dark:text-teal-400' : '')} />
            <span className="truncate">{item.label}</span>
            {item.id === 'kaiwa' || item.id === 'choukai' ? (
              <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 animate-badge-new shadow-sm shadow-teal-500/30">
                AI
              </Badge>
            ) : null}
            {isActive && (
              <ChevronRight size={14} className="ml-auto text-teal-500/60 dark:text-teal-400/60" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="transition-colors duration-200 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
    >
      <Sun size={16} className="rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon size={16} className="absolute rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function ScrollToTopButton({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setShow(el.scrollTop > 200);
    }
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, scrollRef]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function MainPage() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // For header shadow on scroll
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 8);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const streak = mounted ? getStreak() : 0;
  const progress = mounted ? getOverallProgress() : 0;

  const activeLabel = NAV_ITEMS.find(n => n.id === activeSection)?.label ?? 'Home';

  const renderContent = () => {
    switch (activeSection) {
      case 'home': return <HomeDashboard onNavigate={setActiveSection} />;
      case 'kana': return <KanaLibrary />;
      case 'vocab': return <VocabularyList />;
      case 'kanji': return <KanjiMastery />;
      case 'grammar': return <GrammarGuide />;
      case 'flashcards': return <Flashcards />;
      case 'quiz': return <BossQuiz />;
      case 'ai-chat': return <GemuAIChat />;
      case 'kaiwa': return <KaiwaStudio />;
      case 'choukai': return <ChoukaiLab />;
      case 'achievements': return <Achievements />;
      case 'timer': return <StudyTimer />;
      case 'daily': return <DailyChallenge />;
      case 'sentence': return <SentenceBuilder />;
      case 'writing': return <WritingPractice />;
      case 'plan': return <StudyPlan />;
      case 'kazu': return <KazuPractice />;
      case 'mock-exam': return <MockExam />;
      case 'settings': return <SettingsPage />;
      default: return <HomeDashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-shadow duration-200',
          scrolled && 'shadow-md shadow-black/5 dark:shadow-black/20'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-4 pt-4 pb-2">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
                      <Globe size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-base font-black leading-none">Gemu Nihongo</p>
                      <p className="text-[10px] text-muted-foreground">JLPT N5</p>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigasi utama Gemu Nihongo - JLPT N5 Learning App
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-140px)] px-3">
                  <SidebarNav active={activeSection} onSelect={setActiveSection} onMobileClose={() => setMobileOpen(false)} />
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-sm">
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Globe size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">
                  Gemu <span className="text-teal-600 dark:text-teal-400">Nihongo</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                  JLPT N5 Practice
                </p>
              </div>
            </div>

            {/* Mobile: Current section name */}
            <div className="sm:hidden flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground truncate max-w-[160px]">
                {activeLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Badge className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold border border-teal-200 dark:border-teal-800">
              <Sparkles size={10} /> AI
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-56 flex-col border-r bg-gradient-to-b from-slate-50 via-white to-teal-50/20 dark:from-slate-950 dark:via-slate-950 dark:to-teal-950/10">
          {/* Sidebar Header */}
          <div className="px-4 pt-5 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Globe size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black leading-none">Gemu Nihongo</p>
                <p className="text-[10px] text-muted-foreground font-medium">JLPT N5 Practice</p>
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarNav active={activeSection} onSelect={setActiveSection} />
          </div>

          {/* Learning Streak Indicator */}
          <div className="p-4 border-t border-border/60">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                <Flame size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
                  {streak > 0 ? `${streak} Hari Berturut` : 'Mulai Belajar!'}
                </p>
                <p className="text-[10px] text-orange-500/70 dark:text-orange-400/60 font-medium">
                  {streak >= 7 ? 'Luar biasa!' : streak >= 3 ? 'Lanjutkan!' : streak > 0 ? 'Jangan berhenti!' : 'Belajar hari ini'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main ref={mainScrollRef} className="flex-1 min-w-0 overflow-auto relative">
          <div className="max-w-4xl mx-auto px-4 py-5">
            {/* Page transition animation with shimmer loading effect */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative"
              >
                {/* Top shimmer bar during load-in */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-full overflow-hidden z-10"
                  initial={{ scaleX: 1, opacity: 1 }}
                  animate={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left' }}
                >
                  <div className="w-full h-full skeleton-shimmer" />
                </motion.div>
                <React.Suspense fallback={<SectionLoader />}>
                  <ErrorBoundary FallbackComponent={SectionErrorBoundary}>
                    {renderContent()}
                  </ErrorBoundary>
                </React.Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Scroll to top button */}
          <ScrollToTopButton scrollRef={mainScrollRef} />
        </main>
      </div>

      {/* Footer */}
      <footer className="shrink-0 mt-auto bg-gradient-to-r from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-teal-950/10 border-t">
        <div className="px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Top row: links + badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Info size={13} className="text-teal-500" />
                      <span>Tentang</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Tentang Gemu Nihongo</DialogTitle>
                      <DialogDescription>Platform belajar bahasa Jepang JLPT N5</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <p><strong className="text-foreground">Gemu Nihongo</strong> adalah platform belajar bahasa Jepang interaktif yang dirancang untuk persiapan ujian JLPT N5.</p>
                      <p>Dengan fitur <strong className="text-foreground">19 modul belajar</strong> termasuk percakapan AI, latihan mendengar, kuis, flashcard, dan banyak lagi.</p>
                      <p>Dibuat dengan ❤️ menggunakan Next.js, AI, dan teknologi modern.</p>
                      <div className="pt-2 border-t">
                        <p className="text-xs">Versi 0.2.0 · © {new Date().getFullYear()}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle size={13} className="text-teal-500" />
                      <span>Bantuan</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Bantuan</DialogTitle>
                      <DialogDescription>Panduan penggunaan aplikasi</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <div>
                        <p className="font-semibold text-foreground">🏠 Home</p>
                        <p>Dashboard utama dengan kata hari ini, statistik belajar, dan rekomendasi.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">🎙️ Kaiwa Studio</p>
                        <p>Latih percakapan bahasa Jepang dengan AI. Ketik atau gunakan mikrofon. Maks 20 giliran, lalu AI akan memberi evaluasi.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">🎧 Choukai Lab</p>
                        <p>Dengarkan dialog N5 lalu jawab pertanyaan pemahaman. Gunakan mode AI Audio untuk suara yang lebih jelas.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">🎮 Boss Quiz</p>
                        <p>Tantang ujian dengan 3 tingkat kesulitan. Kumpulkan XP dan naik level!</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">💡 Tips</p>
                        <p>Gunakan tombol 🎵 di setiap kata untuk mendengar pengucapannya.</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Badge className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-[10px] font-bold border-0 shadow-sm">
                <GraduationCap size={11} className="mr-1" />
                JLPT N5
              </Badge>
            </div>
            {/* Bottom row: credits */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground">
                &copy; {new Date().getFullYear()} Gemu Nihongo
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                Built with
                <span className="font-semibold text-teal-600 dark:text-teal-400">Next.js</span>
                &
                <span className="font-semibold text-teal-600 dark:text-teal-400">AI</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
