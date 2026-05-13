'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  PenTool, Play, Undo2, Trash2, ChevronLeft, ChevronRight,
  Eye, EyeOff, Check, Volume2, Pencil, Brush, Pen,
  Sparkles, Hash, RotateCcw, ArrowRight, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { HIRAGANA, KANJI, speakJapanese, type Character, type Kanji } from '@/lib/n5-constants';

// ── Types ──────────────────────────────────────────────────────
interface PracticedChar {
  char: string;
  date: string;
}

// ── localStorage helpers ───────────────────────────────────────
function getPracticedChars(): PracticedChar[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('gemu-writing-practiced');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePracticedChars(chars: PracticedChar[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gemu-writing-practiced', JSON.stringify(chars));
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getStats() {
  const all = getPracticedChars();
  const today = getTodayString();
  const todayCount = all.filter((c) => c.date === today).length;
  const uniqueTotal = new Set(all.map((c) => c.char)).size;
  return { todayCount, uniqueTotal };
}

// ── Grid background for canvas ─────────────────────────────────
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, dark: boolean) {
  ctx.save();
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  const step = 40;
  // Vertical lines
  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  // Horizontal lines
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  // Center cross (fainter)
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(w / 2 + 0.5, 0);
  ctx.lineTo(w / 2 + 0.5, h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, h / 2 + 0.5);
  ctx.lineTo(w, h / 2 + 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawGuide(ctx: CanvasRenderingContext2D, char: string, w: number, h: number, dark: boolean) {
  ctx.save();
  const fontSize = Math.min(w, h) * 0.7;
  ctx.font = `${fontSize}px "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  ctx.fillText(char, w / 2, h / 2);
  ctx.restore();
}

// ── Canvas drawing component ───────────────────────────────────
interface DrawingCanvasProps {
  guideChar?: string;
  showGuide: boolean;
  brushSize: number;
  inkColor: string;
  isDark: boolean;
  onStrokeCount?: (count: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokeHistory: ImageData[];
  setStrokeHistory: React.Dispatch<React.SetStateAction<ImageData[]>>;
}

function DrawingCanvas({
  guideChar,
  showGuide,
  brushSize,
  inkColor,
  isDark,
  canvasRef,
  strokeHistory,
  setStrokeHistory,
}: DrawingCanvasProps) {
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const redrawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    // Clear
    ctx.fillStyle = isDark ? '#1e1e2e' : '#ffffff';
    ctx.fillRect(0, 0, w, h);
    // Grid
    drawGrid(ctx, w, h, isDark);
    // Guide
    if (showGuide && guideChar) {
      drawGuide(ctx, guideChar, w, h, isDark);
    }
  }, [guideChar, showGuide, isDark, canvasRef]);

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    redrawBackground();
    // Save initial state
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory([imgData]);
  }, [showGuide, guideChar, isDark]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      redrawBackground();
      setStrokeHistory([]);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [isDark]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    isDrawing.current = true;
    lastPos.current = pos;
    // Save state before this stroke
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokeHistory((prev) => [...prev, imgData]);
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getPos(e);
    if (!pos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
    } else {
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl cursor-crosshair touch-none"
      style={{ background: isDark ? '#1e1e2e' : '#ffffff' }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onTouchStart={startDraw}
      onTouchMove={draw}
      onTouchEnd={endDraw}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function WritingPractice() {
  const [activeTab, setActiveTab] = useState<string>('hiragana');
  const [selectedHiragana, setSelectedHiragana] = useState<Character | null>(() => HIRAGANA.length > 0 ? HIRAGANA[0] : null);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(() => KANJI.length > 0 ? KANJI[0] : null);
  const [showGuide, setShowGuide] = useState(true);
  const [brushSize, setBrushSize] = useState(6);
  const [inkColor, setInkColor] = useState('#1a1a2e');
  const [checked, setChecked] = useState(false);
  const [statsCounter, setStatsCounter] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  // Hydration-safe mount detection
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Stats derived on client (re-reads on statsCounter change)
  const stats = useMemo(() => (mounted ? getStats() : { todayCount: 0, uniqueTotal: 0 }), [mounted, statsCounter]);

  // Get current character info
  const currentChar = activeTab === 'hiragana' ? selectedHiragana?.ja : selectedKanji?.character;
  const currentLabel = activeTab === 'hiragana' ? selectedHiragana?.romaji : selectedKanji?.meaning;
  const currentMeaning = activeTab === 'hiragana'
    ? selectedHiragana?.romaji || ''
    : selectedKanji ? `${selectedKanji.kunyomi} / ${selectedKanji.meaning}` : '';

  // Check for dark mode via useSyncExternalStore
  const isDark = useSyncExternalStore(
    (cb) => {
      const el = document.documentElement;
      const observer = new MutationObserver(cb);
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains('dark'),
    () => false
  );

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    ctx.fillStyle = isDark ? '#1e1e2e' : '#ffffff';
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, w, h, isDark);
    if (showGuide && currentChar) {
      drawGuide(ctx, currentChar, w, h, isDark);
    }
    setChecked(false);
  }, [isDark, showGuide, currentChar]);

  // Undo
  const undo = useCallback(() => {
    if (strokeHistory.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Remove current state
    const prev = strokeHistory[strokeHistory.length - 2];
    ctx.putImageData(prev, 0, 0);
    setStrokeHistory((h) => h.slice(0, -1));
    setChecked(false);
  }, [strokeHistory]);

  // Record practice
  const recordPractice = useCallback((char: string) => {
    const practiced = getPracticedChars();
    practiced.push({ char, date: getTodayString() });
    savePracticedChars(practiced);
    setStatsCounter((c) => c + 1);
  }, []);

  // Check drawing
  const handleCheck = useCallback(() => {
    setChecked(true);
    if (currentChar) {
      recordPractice(currentChar);
    }
  }, [currentChar, recordPractice]);

  // Next character
  const handleNext = useCallback(() => {
    if (activeTab === 'hiragana') {
      const idx = selectedHiragana ? HIRAGANA.indexOf(selectedHiragana) : -1;
      const nextIdx = (idx + 1) % HIRAGANA.length;
      setSelectedHiragana(HIRAGANA[nextIdx]);
    } else {
      const idx = selectedKanji ? KANJI.indexOf(selectedKanji) : -1;
      const nextIdx = (idx + 1) % KANJI.length;
      setSelectedKanji(KANJI[nextIdx]);
    }
    setChecked(false);
  }, [activeTab, selectedHiragana, selectedKanji]);

  // Prev character
  const handlePrev = useCallback(() => {
    if (activeTab === 'hiragana') {
      const idx = selectedHiragana ? HIRAGANA.indexOf(selectedHiragana) : 0;
      const prevIdx = (idx - 1 + HIRAGANA.length) % HIRAGANA.length;
      setSelectedHiragana(HIRAGANA[prevIdx]);
    } else {
      const idx = selectedKanji ? KANJI.indexOf(selectedKanji) : 0;
      const prevIdx = (idx - 1 + KANJI.length) % KANJI.length;
      setSelectedKanji(KANJI[prevIdx]);
    }
    setChecked(false);
  }, [activeTab, selectedHiragana, selectedKanji]);

  // Select a character
  const selectHiragana = useCallback((char: Character) => {
    setSelectedHiragana(char);
    setChecked(false);
  }, []);

  const selectKanji = useCallback((kanji: Kanji) => {
    setSelectedKanji(kanji);
    setChecked(false);
  }, []);

  // Filter hiragana for display (exclude sokuon for practice)
  const displayHiragana = useMemo(
    () => HIRAGANA.filter((c) => c.category !== 'sokuon'),
    []
  );

  // Brush size options
  const brushSizes = [
    { label: 'Tipis', value: 3, icon: Pencil },
    { label: 'Sedang', value: 6, icon: Pen },
    { label: 'Tebal', value: 12, icon: Brush },
  ];

  // Ink colors
  const inkColors = [
    { value: '#1a1a2e', label: 'Hitam' },
    { value: '#dc2626', label: 'Merah' },
    { value: '#16a34a', label: 'Hijau' },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <PenTool size={18} className="text-white" />
            </div>
            Latihan Menulis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latih tulisan hiragana dan kanji dengan kanvas interaktif
          </p>
        </div>

        {/* Stats badges */}
        {mounted && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1.5 rounded-full border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300">
              <Hash size={12} className="mr-1" />
              Hari ini: {stats.todayCount}
            </Badge>
            <Badge variant="outline" className="text-xs px-3 py-1.5 rounded-full border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
              <Sparkles size={12} className="mr-1" />
              Total: {stats.uniqueTotal} karakter
            </Badge>
          </div>
        )}
      </div>

      {/* ── Character Selector + Canvas Layout ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left Panel: Character Selector ──────────────── */}
        <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
          <Card className="border-0 overflow-hidden">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-bold">Pilih Karakter</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setChecked(false); }}>
                <TabsList className="w-full grid grid-cols-2 mb-3 h-9">
                  <TabsTrigger value="hiragana" className="text-xs">
                    Hiragana
                  </TabsTrigger>
                  <TabsTrigger value="kanji" className="text-xs">
                    Kanji
                  </TabsTrigger>
                </TabsList>

                {/* Hiragana Grid */}
                <TabsContent value="hiragana" className="mt-0">
                  <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
                    {['basic', 'dakuon', 'handakuon', 'yoon'].map((cat) => {
                      const chars = displayHiragana.filter((c) => c.category === cat);
                      if (chars.length === 0) return null;
                      const catLabels: Record<string, string> = {
                        basic: 'Dasar',
                        dakuon: 'Dakuon',
                        handakuon: 'Handakuon',
                        yoon: 'Yōon',
                      };
                      return (
                        <div key={cat}>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                            {catLabels[cat] || cat}
                          </p>
                          <div className="grid grid-cols-5 gap-1.5">
                            {chars.map((c) => (
                              <button
                                key={c.ja}
                                onClick={() => selectHiragana(c)}
                                className={cn(
                                  'aspect-square rounded-lg text-lg font-bold transition-all duration-150 flex items-center justify-center font-jp',
                                  'hover:scale-105 active:scale-95',
                                  selectedHiragana?.ja === c.ja
                                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
                                )}
                              >
                                {c.ja}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Kanji Grid */}
                <TabsContent value="kanji" className="mt-0">
                  <div className="max-h-80 overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Kanji N5
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {KANJI.map((k) => (
                        <button
                          key={k.character}
                          onClick={() => selectKanji(k)}
                          className={cn(
                            'aspect-square rounded-lg text-xl font-bold transition-all duration-150 flex flex-col items-center justify-center gap-0.5 font-jp',
                            'hover:scale-105 active:scale-95',
                            selectedKanji?.character === k.character
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          )}
                        >
                          <span>{k.character}</span>
                          <span className="text-[8px] font-normal opacity-70">{k.meaning}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Panel: Canvas + Controls ──────────────── */}
        <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2 space-y-4">
          {/* Reference display + Canvas row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Reference Card */}
            <div className="md:col-span-4">
              <Card className={cn(
                'border-0 h-full overflow-hidden relative',
                checked
                  ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900'
                  : ''
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50/50 to-cyan-50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-cyan-950/40" />
                <CardContent className="p-5 relative z-10 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                  {/* Target character */}
                  <div className="w-24 h-24 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-center justify-center mb-3">
                    <span
                      className="text-5xl font-black text-teal-700 dark:text-teal-300 font-jp"
                    >
                      {currentChar || '？'}
                    </span>
                  </div>

                  {/* Reading */}
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100 font-jp">
                    {currentLabel || 'Pilih karakter'}
                  </p>

                  {/* Meaning */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentMeaning || '—'}
                  </p>

                  {/* Audio button */}
                  {currentChar && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 rounded-full border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                      onClick={() => speakJapanese(currentChar)}
                    >
                      <Volume2 size={14} className="mr-1.5" />
                      Dengarkan
                    </Button>
                  )}

                  {/* Checked feedback */}
                  {checked && (
                    <div className="mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Check size={16} className="animate-bounce" />
                      <span className="text-xs font-bold">Sudah dilatih!</span>
                    </div>
                  )}

                  {/* Kanji extra info */}
                  {activeTab === 'kanji' && selectedKanji && (
                    <div className="mt-3 space-y-1 w-full">
                      <div className="text-[10px] text-muted-foreground">
                        <span className="font-semibold">Onyomi:</span> {selectedKanji.onyomi}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        <span className="font-semibold">Kunyomi:</span> {selectedKanji.kunyomi}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        <span className="font-semibold">Goresan:</span> {selectedKanji.strokes || '?'} stroke
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Canvas */}
            <div className="md:col-span-8">
              <Card className="border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative" style={{ height: '320px' }}>
                    <DrawingCanvas
                      canvasRef={canvasRef}
                      guideChar={currentChar || undefined}
                      showGuide={showGuide}
                      brushSize={brushSize}
                      inkColor={inkColor}
                      isDark={isDark}
                      strokeHistory={strokeHistory}
                      setStrokeHistory={setStrokeHistory}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Controls Bar ──────────────────────────────── */}
          <Card className="border-0">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Brush sizes */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                    Kuas:
                  </span>
                  {brushSizes.map((bs) => {
                    const Icon = bs.icon;
                    return (
                      <button
                        key={bs.value}
                        onClick={() => setBrushSize(bs.value)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                          brushSize === bs.value
                            ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 shadow-sm'
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                        title={bs.label}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{bs.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-border" />

                {/* Ink colors */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                    Warna:
                  </span>
                  {inkColors.map((ic) => (
                    <button
                      key={ic.value}
                      onClick={() => setInkColor(ic.value)}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110',
                        inkColor === ic.value
                          ? 'border-teal-500 shadow-md scale-110'
                          : 'border-gray-200 dark:border-gray-700'
                      )}
                      style={{ backgroundColor: ic.value }}
                      title={ic.label}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-border" />

                {/* Guide toggle */}
                <button
                  onClick={() => setShowGuide((g) => !g)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                    showGuide
                      ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                      : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {showGuide ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>Panduan {showGuide ? 'ON' : 'OFF'}</span>
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={undo}
                    disabled={strokeHistory.length <= 1}
                    title="Undo"
                  >
                    <Undo2 size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={clearCanvas}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Navigation + Check row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={handlePrev}
                  disabled={!currentChar}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Sebelumnya
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-9 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-full shadow-sm"
                    onClick={handleCheck}
                    disabled={!currentChar}
                  >
                    <Check size={16} className="mr-1.5" />
                    Periksa
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 px-5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-full shadow-sm"
                    onClick={handleNext}
                    disabled={!currentChar}
                  >
                    Selanjutnya
                    <ArrowRight size={16} className="ml-1.5" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={handleNext}
                  disabled={!currentChar}
                >
                  Berikutnya
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Tips Card ─────────────────────────────────── */}
          <Card className="border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Info size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold mb-1">Tips Menulis Kanji</h3>
                  <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                    <li>• Ikuti urutan goresan (stroke order) dari kiri ke kanan, atas ke bawah</li>
                    <li>• Aktifkan <strong>Panduan</strong> untuk melihat bayangan karakter target</li>
                    <li>• Gunakan kuas tebal untuk latihan dasar, tipis untuk detail</li>
                    <li>• Klik <strong>Periksa</strong> untuk mencatat karakter yang sudah dilatih</li>
                    <li>• Gunakan <strong>Undo</strong> jika ingin menghapus goresan terakhir</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
