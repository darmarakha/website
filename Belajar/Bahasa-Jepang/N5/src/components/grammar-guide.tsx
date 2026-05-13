'use client';

import React, { useState, useMemo } from 'react';
import { BookMarked, Search, X, Volume2, ChevronDown, ChevronUp, Filter, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GRAMMAR, type GrammarPoint, speakJapanese } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

type GrammarCategory = 'Semua' | 'Partikel' | 'Bentuk Kata' | 'Kata Sifat' | 'Lainnya';

interface CategoryInfo {
  label: string;
  color: string;
  badgeBg: string;
  borderAccent: string;
}

const CATEGORIES: Record<GrammarCategory, CategoryInfo> = {
  Semua: { label: 'Semua', color: 'text-gray-600', badgeBg: 'bg-gray-100 dark:bg-gray-800', borderAccent: 'border-l-gray-400' },
  Partikel: { label: 'Partikel', color: 'text-teal-600', badgeBg: 'bg-teal-50 dark:bg-teal-950/30', borderAccent: 'border-l-teal-500' },
  'Bentuk Kata': { label: 'Bentuk Kata', color: 'text-rose-600', badgeBg: 'bg-rose-50 dark:bg-rose-950/30', borderAccent: 'border-l-rose-500' },
  'Kata Sifat': { label: 'Kata Sifat', color: 'text-amber-600', badgeBg: 'bg-amber-50 dark:bg-amber-950/30', borderAccent: 'border-l-amber-500' },
  Lainnya: { label: 'Lainnya', color: 'text-purple-600', badgeBg: 'bg-purple-50 dark:bg-purple-950/30', borderAccent: 'border-l-purple-500' },
};

function classifyGrammar(point: GrammarPoint): GrammarCategory {
  const t = point.title.toLowerCase();
  if (t.includes('partikel')) return 'Partikel';
  if (t.includes('bentuk') || t.includes('mashou') || t.includes('te kudasai') || t.includes('tai') || t.includes('nai') || t.includes('ta form')) return 'Bentuk Kata';
  if (t.includes('sifat') || t.includes('adjective')) return 'Kata Sifat';
  return 'Lainnya';
}

function GrammarCard({ point, index }: { point: GrammarPoint; index: number }) {
  const [open, setOpen] = useState(false);
  const category = classifyGrammar(point);
  const catInfo = CATEGORIES[category];

  return (
    <Card className={cn(
      'overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      catInfo.borderAccent
    )}>
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-xs">{index + 1}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm truncate">{point.title}</h3>
                <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 h-5 font-medium', catInfo.badgeBg, catInfo.color)}>
                  {category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">{point.structure}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground hidden sm:inline">{point.examples.length} contoh</span>
            {open
              ? <ChevronUp size={16} className="text-muted-foreground" />
              : <ChevronDown size={16} className="text-muted-foreground" />
            }
          </div>
        </CardContent>
      </button>
      {open && (
        <div className="border-t bg-muted/30">
          <CardContent className="p-4 space-y-4">
            {/* Structure */}
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Struktur
              </p>
              <div className="bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-3 font-mono text-sm border border-slate-700">
                <span className="text-teal-400">&gt;</span> {point.structure}
              </div>
            </div>
            {/* Explanation */}
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Penjelasan
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">{point.explanation}</p>
            </div>
            {/* Examples */}
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Contoh Kalimat
              </p>
              <div className="space-y-2">
                {point.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="group bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700 transition-all duration-150 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm leading-relaxed font-jp"
                        >
                          {ex.ja}
                        </p>
                        <p className="text-muted-foreground text-xs mt-1">{ex.en}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(ex.ja);
                        }}
                        className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-950/50 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        aria-label="Putar audio"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal text-muted-foreground">
                        {i + 1}/{point.examples.length}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}

export default function GrammarGuide() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<GrammarCategory>('Semua');

  // Categorize all grammar points
  const categorizedGrammar = useMemo(() => {
    const groups: Record<string, GrammarPoint[]> = {
      Partikel: [],
      'Bentuk Kata': [],
      'Kata Sifat': [],
      Lainnya: [],
    };
    GRAMMAR.forEach((point, idx) => {
      const cat = classifyGrammar(point);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ ...point, _index: idx } as GrammarPoint & { _index: number });
    });
    return groups;
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<GrammarCategory, number> = {
      Semua: GRAMMAR.length,
      Partikel: 0,
      'Bentuk Kata': 0,
      'Kata Sifat': 0,
      Lainnya: 0,
    };
    GRAMMAR.forEach(p => {
      const cat = classifyGrammar(p);
      counts[cat]++;
    });
    return counts;
  }, []);

  // Filtered results
  const filteredGrammar = useMemo(() => {
    let results = GRAMMAR;
    if (activeCategory !== 'Semua') {
      results = results.filter(p => classifyGrammar(p) === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.structure.toLowerCase().includes(q) ||
        p.explanation.toLowerCase().includes(q) ||
        p.examples.some(ex => ex.ja.includes(q) || ex.en.toLowerCase().includes(q))
      );
    }
    return results;
  }, [search, activeCategory]);

  // Group filtered results for display
  const groupedFiltered = useMemo(() => {
    if (activeCategory !== 'Semua') return null;
    const groups: Record<string, typeof filteredGrammar> = {
      Partikel: [],
      'Bentuk Kata': [],
      'Kata Sifat': [],
      Lainnya: [],
    };
    filteredGrammar.forEach(p => {
      const cat = classifyGrammar(p);
      groups[cat].push(p);
    });
    return groups;
  }, [filteredGrammar, activeCategory]);

  const hasResults = activeCategory === 'Semua'
    ? Object.values(groupedFiltered!).some(arr => arr.length > 0)
    : filteredGrammar.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <BookMarked className="text-white" size={16} />
            </div>
            <h2 className="text-xl font-bold">Grammar Guide N5</h2>
            <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              {GRAMMAR.length} poin
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Panduan tata bahasa Jepang tingkat N5 dengan contoh kalimat</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari grammar, contoh: partikel wa, ta-form..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <Filter size={14} className="text-muted-foreground shrink-0" />
        {(Object.keys(CATEGORIES) as GrammarCategory[]).map(cat => (
          <Button
            key={cat}
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'shrink-0 h-7 px-3 text-xs rounded-full transition-all duration-150',
              activeCategory === cat
                ? cn('shadow-sm', cat === 'Semua'
                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                  : cat === 'Partikel'
                    ? 'bg-teal-600 text-white'
                    : cat === 'Bentuk Kata'
                      ? 'bg-rose-600 text-white'
                      : cat === 'Kata Sifat'
                        ? 'bg-amber-600 text-white'
                        : 'bg-purple-600 text-white'
                )
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {CATEGORIES[cat].label}
            <Badge
              variant="secondary"
              className={cn(
                'ml-1.5 text-[10px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full',
                activeCategory === cat ? 'bg-white/20 text-white' : 'bg-muted'
              )}
            >
              {categoryCounts[cat]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Display count */}
      {(search || activeCategory !== 'Semua') && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Search size={12} />
          Menampilkan {filteredGrammar.length} dari {GRAMMAR.length} grammar
        </p>
      )}

      {/* Grammar Content */}
      <div className="space-y-3">
        {!hasResults ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-sm mb-1">Grammar tidak ditemukan</p>
              <p className="text-xs text-muted-foreground">Coba kata kunci lain atau ubah filter kategori</p>
              {(search || activeCategory !== 'Semua') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => { setSearch(''); setActiveCategory('Semua'); }}
                >
                  Reset filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : activeCategory !== 'Semua' ? (
          // Single category view
          <div className="space-y-2">
            {filteredGrammar.map((point, i) => (
              <GrammarCard key={point.title} point={point} index={GRAMMAR.indexOf(point)} />
            ))}
          </div>
        ) : search ? (
          // Search results (flat)
          <div className="space-y-2">
            {filteredGrammar.map((point, i) => (
              <GrammarCard key={point.title} point={point} index={GRAMMAR.indexOf(point)} />
            ))}
          </div>
        ) : (
          // Grouped by category
          Object.entries(groupedFiltered!).map(([category, points]) => {
            if (points.length === 0) return null;
            const catInfo = CATEGORIES[category as GrammarCategory];
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 pt-2">
                  <h3 className={cn('text-sm font-bold', catInfo.color)}>{catInfo.label}</h3>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                    {points.length}
                  </Badge>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {points.map(point => (
                  <GrammarCard
                    key={point.title}
                    point={point}
                    index={GRAMMAR.indexOf(point)}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Tips Card */}
      <Card className="border-0 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-1">Tips Belajar Grammar</p>
            <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
              Latih setiap pola kalimat dengan membuat kalimat sendiri. Gunakan tombol audio untuk mendengarkan pelafalan contoh kalimat. Mulai dari partikel dasar, lalu lanjut ke bentuk kata!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
