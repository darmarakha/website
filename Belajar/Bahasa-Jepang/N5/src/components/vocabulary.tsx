'use client';

import React, { useState, useMemo } from 'react';
import {
  BookMarked, Volume2, Search, Lightbulb,
  LayoutGrid, List, BookOpen, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { VOCABULARY, speakJapanese, type Vocabulary } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

// ─── Category Definitions ──────────────────────────────────────────────────

type VocabCategory = 'All' | 'Angka' | 'Hitungan' | 'Waktu' | 'Kata Kerja' | 'Kata Sifat' | 'Tempat' | 'Barang' | 'Orang' | 'Pekerjaan';

interface CategoryDef {
  id: VocabCategory;
  label: string;
  icon: string;
  chipColor: string;       // active filter chip bg
  badgeBg: string;         // category badge on cards
  badgeText: string;
  borderAccent: string;    // left-border accent on cards
}

const CATEGORIES: CategoryDef[] = [
  { id: 'All', label: 'Semua', icon: '📚', chipColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', badgeBg: 'bg-gray-100 dark:bg-gray-800', badgeText: 'text-gray-700 dark:text-gray-300', borderAccent: 'border-l-teal-400' },
  { id: 'Angka', label: 'Angka', icon: '🔢', chipColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', badgeBg: 'bg-violet-100 dark:bg-violet-900/60', badgeText: 'text-violet-800 dark:text-violet-200', borderAccent: 'border-l-violet-400' },
  { id: 'Hitungan', label: 'Hitungan', icon: '🔢', chipColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60', badgeText: 'text-indigo-800 dark:text-indigo-200', borderAccent: 'border-l-indigo-400' },
  { id: 'Waktu', label: 'Waktu', icon: '⏰', chipColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', badgeBg: 'bg-amber-100 dark:bg-amber-900/60', badgeText: 'text-amber-800 dark:text-amber-200', borderAccent: 'border-l-amber-400' },
  { id: 'Kata Kerja', label: 'Kata Kerja', icon: '🏃', chipColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60', badgeText: 'text-emerald-800 dark:text-emerald-200', borderAccent: 'border-l-emerald-400' },
  { id: 'Kata Sifat', label: 'Kata Sifat', icon: '🎨', chipColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200', badgeBg: 'bg-rose-100 dark:bg-rose-900/60', badgeText: 'text-rose-800 dark:text-rose-200', borderAccent: 'border-l-rose-400' },
  { id: 'Tempat', label: 'Tempat', icon: '📍', chipColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200', badgeBg: 'bg-sky-100 dark:bg-sky-900/60', badgeText: 'text-sky-800 dark:text-sky-200', borderAccent: 'border-l-sky-400' },
  { id: 'Barang', label: 'Barang', icon: '📦', chipColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', badgeBg: 'bg-orange-100 dark:bg-orange-900/60', badgeText: 'text-orange-800 dark:text-orange-200', borderAccent: 'border-l-orange-400' },
  { id: 'Orang', label: 'Orang', icon: '👤', chipColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', badgeBg: 'bg-teal-100 dark:bg-teal-900/60', badgeText: 'text-teal-800 dark:text-teal-200', borderAccent: 'border-l-teal-400' },
  { id: 'Pekerjaan', label: 'Pekerjaan', icon: '💼', chipColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', badgeBg: 'bg-pink-100 dark:bg-pink-900/60', badgeText: 'text-pink-800 dark:text-pink-200', borderAccent: 'border-l-pink-400' },
];

function getCategoryDef(category: string): CategoryDef {
  return CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
}

// ─── Vocabulary Card ───────────────────────────────────────────────────────

function VocabCard({
  v,
  index,
  onClick,
}: {
  v: Vocabulary;
  index: number;
  onClick: () => void;
}) {
  const cat = getCategoryDef(v.category);

  return (
    <Card
      className={cn(
        'cursor-pointer border-l-4 transition-all duration-200 group',
        'hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        'bg-white dark:bg-gray-950',
        cat.borderAccent,
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Japanese Word */}
            <span
              className="text-xl font-bold block leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-jp"
            >
              {v.word}
            </span>

            {/* Reading */}
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              {v.reading}
            </p>

            {/* Meaning */}
            <p className="text-sm font-semibold mt-1 text-foreground/90">
              {v.meaning}
            </p>

            {/* Category Badge */}
            <Badge
              className={cn(
                'mt-2 text-[10px] font-medium px-2 py-0 border-0',
                cat.badgeBg, cat.badgeText,
              )}
            >
              {v.category}
            </Badge>
          </div>

          {/* Audio Button */}
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(v.word);
            }}
          >
            <Volume2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── List Row ──────────────────────────────────────────────────────────────

function VocabListRow({
  v,
  index,
  onClick,
}: {
  v: Vocabulary;
  index: number;
  onClick: () => void;
}) {
  const cat = getCategoryDef(v.category);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer',
        'transition-all duration-150',
        'hover:bg-teal-50 dark:hover:bg-teal-950/20',
        'border-b border-border/50 last:border-0',
      )}
      style={{ animationDelay: `${index * 20}ms` }}
      onClick={onClick}
    >
      {/* Word */}
      <span
        className="text-base font-bold w-28 sm:w-36 shrink-0 truncate font-jp"
      >
        {v.word}
      </span>

      {/* Reading */}
      <span className="text-xs text-muted-foreground w-24 sm:w-28 shrink-0 truncate italic hidden sm:block">
        {v.reading}
      </span>

      {/* Meaning */}
      <span className="text-sm font-medium flex-1 min-w-0 truncate text-foreground/90">
        {v.meaning}
      </span>

      {/* Category Badge */}
      <Badge
        className={cn(
          'text-[10px] px-2 py-0 border-0 shrink-0',
          cat.badgeBg, cat.badgeText,
        )}
      >
        {v.category}
      </Badge>

      {/* Audio */}
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 h-7 w-7 text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
        onClick={(e) => {
          e.stopPropagation();
          speakJapanese(v.word);
        }}
      >
        <Volume2 size={14} />
      </Button>
    </div>
  );
}

// ─── Word Detail Modal ─────────────────────────────────────────────────────

function WordDetailModal({
  word,
  onClose,
}: {
  word: Vocabulary;
  onClose: () => void;
}) {
  const cat = getCategoryDef(word.category);

  // Related words: same category, excluding current word, max 4
  const relatedWords = useMemo(() => {
    return VOCABULARY.filter(
      v => v.category === word.category && v.word !== word.word
    ).slice(0, 4);
  }, [word.category, word.word]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen size={18} className="text-teal-600" />
            Detail Kosakata
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Main Word Display */}
          <div className="text-center py-3">
            <div
              className="text-5xl font-bold mb-1 text-foreground font-jp"
            >
              {word.word}
            </div>
            <p className="text-muted-foreground italic text-sm">
              {word.reading}
            </p>
            <p className="text-lg font-bold mt-2 text-foreground">
              {word.meaning}
            </p>
            <Badge
              className={cn('mt-2 text-xs px-3 py-0.5 border-0', cat.badgeBg, cat.badgeText)}
            >
              {word.category}
            </Badge>
          </div>

          {/* Audio Button */}
          <Button
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md"
            onClick={() => speakJapanese(word.word)}
          >
            <Volume2 size={16} className="mr-2" />
            Dengarkan Pengucapan
          </Button>

          {/* Explanation */}
          {word.explanation && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={15} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  Penjelasan
                </span>
              </div>
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                {word.explanation}
              </p>
            </div>
          )}

          {/* Formula */}
          {word.formula && (
            <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-200 block mb-1">
                Rumus / Pola
              </span>
              <p className="text-sm text-teal-900 dark:text-teal-100 font-mono leading-relaxed">
                {word.formula}
              </p>
            </div>
          )}

          {/* Related Words */}
          {relatedWords.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Kata Terkait ({word.category})
              </p>
              <div className="space-y-1.5">
                {relatedWords.map((rw) => {
                  const rwCat = getCategoryDef(rw.category);
                  return (
                    <div
                      key={rw.word}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer',
                        'hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors',
                        'border-l-3', rwCat.borderAccent,
                      )}
                      onClick={() => speakJapanese(rw.word)}
                    >
                      <span
                        className="font-bold text-sm flex-1 font-jp"
                      >
                        {rw.word}
                      </span>
                      <span className="text-[11px] text-muted-foreground hidden sm:block">
                        {rw.reading}
                      </span>
                      <span className="text-xs font-medium text-foreground/80">
                        {rw.meaning}
                      </span>
                      <Volume2 size={12} className="text-muted-foreground shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────

function EmptyState({ search, activeCategory }: { search: string; activeCategory: VocabCategory }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Search size={32} className="text-gray-400" />
      </div>
      <p className="text-lg font-semibold text-foreground mb-1">
        Tidak ada hasil
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {search ? (
          <>
            Tidak ditemukan kata untuk &quot;<span className="font-semibold text-foreground">{search}</span>&quot;
            {activeCategory !== 'All' && (
              <span> dalam kategori <span className="font-semibold text-foreground">{activeCategory}</span></span>
            )}
          </>
        ) : (
          `Tidak ada kata dalam kategori ${activeCategory}`
        )}
      </p>
      {(search || activeCategory !== 'All') && (
        <p className="text-xs text-muted-foreground mt-2">
          Coba ubah kata kunci pencarian atau pilih kategori lain
        </p>
      )}
    </div>
  );
}

// ─── Main Vocabulary Component ─────────────────────────────────────────────

export default function VocabularyList() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<VocabCategory>('All');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selected, setSelected] = useState<Vocabulary | null>(null);

  // Count vocabulary per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of VOCABULARY) {
      counts[v.category] = (counts[v.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered vocabulary
  const filtered = useMemo(() => {
    let result = VOCABULARY;

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(v => v.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.word.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [search, activeCategory]);

  const totalCount = activeCategory === 'All'
    ? VOCABULARY.length
    : (categoryCounts[activeCategory] || 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookMarked className="text-emerald-600" size={22} />
          Kosakata N5
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar kata-kata penting untuk JLPT N5
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Cari kata, reading, atau arti..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSearch('')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const count = cat.id === 'All'
            ? VOCABULARY.length
            : (categoryCounts[cat.id] || 0);
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
                'hover:scale-[1.03] active:scale-[0.97]',
                isActive
                  ? cn(cat.chipColor, 'border-transparent shadow-sm')
                  : 'bg-white dark:bg-gray-900 border-border text-muted-foreground hover:border-teal-300 dark:hover:border-teal-700 hover:text-foreground',
              )}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={cn(
                'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1',
                isActive
                  ? 'bg-white/30 dark:bg-black/20 text-current'
                  : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground',
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        {/* Count Display */}
        <p className="text-sm text-muted-foreground">
          Menampilkan{' '}
          <span className="font-semibold text-foreground">{filtered.length}</span>
          {' '}dari{' '}
          <span className="font-semibold text-foreground">{totalCount}</span>
          {' '}kata
        </p>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              viewMode === 'card'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-900 text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Card</span>
          </button>
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-900 text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setViewMode('list')}
          >
            <List size={14} />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length > 0 ? (
        viewMode === 'card' ? (
          /* Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((v, i) => (
              <VocabCard
                key={`${v.word}-${i}`}
                v={v}
                index={i}
                onClick={() => setSelected(v)}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <Card className="overflow-hidden">
            {/* List Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="w-28 sm:w-36 shrink-0">Kata</span>
              <span className="w-24 sm:w-28 shrink-0 hidden sm:block">Reading</span>
              <span className="flex-1">Arti</span>
              <span className="w-20 text-center shrink-0">Kategori</span>
              <span className="w-7 shrink-0" />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filtered.map((v, i) => (
                <VocabListRow
                  key={`${v.word}-${i}`}
                  v={v}
                  index={i}
                  onClick={() => setSelected(v)}
                />
              ))}
            </div>
          </Card>
        )
      ) : (
        <EmptyState search={search} activeCategory={activeCategory} />
      )}

      {/* Detail Modal */}
      {selected && (
        <WordDetailModal
          word={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
