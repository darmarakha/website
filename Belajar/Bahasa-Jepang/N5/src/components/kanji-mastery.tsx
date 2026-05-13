'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Volume2, Search, Eye, Layers, RotateCcw } from 'lucide-react';
import { StrokeGuide } from '@/components/stroke-order-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KANJI, speakJapanese, type Kanji } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

type ViewMode = 'details' | 'quick' | 'flashcard';

function KanjiDetails({ kanji, onPlay }: { kanji: Kanji; onPlay: () => void }) {
  return (
    <Card className="border-teal-200 dark:border-teal-800">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-center shrink-0">
            <div className="text-6xl font-bold cursor-pointer hover:text-teal-600 transition-colors font-jp"
              onClick={onPlay}>
              {kanji.character}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{kanji.strokes} goresan</p>
            <Button size="sm" variant="ghost" className="mt-1 h-7 text-xs" onClick={onPlay}>
              <Volume2 size={14} /> Audio
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-lg font-bold">{kanji.meaning}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg p-2">
                <p className="text-[10px] font-bold text-rose-600 uppercase">Onyomi</p>
                <p className="text-xs mt-0.5">{kanji.onyomi}</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/30 rounded-lg p-2">
                <p className="text-[10px] font-bold text-teal-600 uppercase">Kunyomi</p>
                <p className="text-xs mt-0.5">{kanji.kunyomi}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-bold text-muted-foreground mb-1.5">Contoh:</p>
              <div className="space-y-1">
                {kanji.examples.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-2 py-1.5">
                    <span className="font-medium font-jp">{ex.word}</span>
                    <span className="text-xs text-muted-foreground">[{ex.reading}] {ex.meaning}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => speakJapanese(ex.reading)}>
                      <Volume2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <StrokeGuide
          character={kanji.character}
          size={160}
          className="mt-4"
          label="Panduan Goresan"
        />
      </CardContent>
    </Card>
  );
}

function QuickStudy({ kanjiList }: { kanjiList: Kanji[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {kanjiList.map((k, i) => (
        <Card key={i} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group text-center"
          onClick={() => speakJapanese(k.character)}>
          <CardContent className="p-3">
            <div className="text-3xl font-bold group-hover:text-teal-600 transition-colors font-jp">
              {k.character}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{k.meaning}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KanjiFlashcards({ kanjiList }: { kanjiList: Kanji[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const kanji = kanjiList[index];

  const next = () => { setIndex((i) => (i + 1) % kanjiList.length); setFlipped(false); };
  const prev = () => { setIndex((i) => (i - 1 + kanjiList.length) % kanjiList.length); setFlipped(false); };

  if (!kanji) return null;
  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">{index + 1} / {kanjiList.length}</div>
      <div className="mx-auto max-w-sm cursor-pointer" onClick={() => setFlipped(!flipped)}>
        <Card className={cn('transition-all duration-300 min-h-[250px]', flipped ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800' : '')}>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[250px]">
            {!flipped ? (
              <div className="text-center">
                <div className="text-7xl font-bold font-jp">{kanji.character}</div>
                <p className="text-sm text-muted-foreground mt-2">{kanji.strokes} goresan</p>
                <p className="text-xs text-muted-foreground mt-4">Tap untuk lihat jawaban</p>
              </div>
            ) : (
              <div className="text-center space-y-3 w-full">
                <p className="text-2xl font-bold">{kanji.meaning}</p>
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg p-2">
                  <p className="text-xs font-bold text-rose-600">Onyomi</p>
                  <p className="text-sm">{kanji.onyomi}</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/30 rounded-lg p-2">
                  <p className="text-xs font-bold text-teal-600">Kunyomi</p>
                  <p className="text-sm">{kanji.kunyomi}</p>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white mt-2" onClick={(e) => { e.stopPropagation(); speakJapanese(kanji.character); }}>
                  <Volume2 size={14} className="mr-1" /> Dengarkan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={prev}>← Sebelumnya</Button>
        <Button variant="outline" onClick={() => { setIndex(Math.floor(Math.random() * kanjiList.length)); setFlipped(false); }}>
          <RotateCcw size={14} className="mr-1" /> Acak
        </Button>
        <Button variant="outline" onClick={next}>Selanjutnya →</Button>
      </div>
    </div>
  );
}

export default function KanjiMastery() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('details');

  const filtered = useMemo(() => {
    if (!search.trim()) return KANJI;
    const q = search.toLowerCase();
    return KANJI.filter(k =>
      k.character.includes(q) || k.meaning.toLowerCase().includes(q) || k.onyomi.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="text-amber-600" size={22} /> Kanji Mastery
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Pelajari karakter kanji dasar untuk JLPT N5</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari kanji atau arti..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="details" className="gap-1"><Eye size={14} /> Detail</TabsTrigger>
            <TabsTrigger value="quick" className="gap-1"><Layers size={14} /> Quick</TabsTrigger>
            <TabsTrigger value="flashcard" className="gap-1">Flash</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'details' && filtered.map((k, i) => (
        <KanjiDetails key={i} kanji={k} onPlay={() => speakJapanese(k.character)} />
      ))}

      {viewMode === 'quick' && <QuickStudy kanjiList={filtered} />}

      {viewMode === 'flashcard' && <KanjiFlashcards kanjiList={filtered} />}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search size={32} className="mx-auto mb-2 opacity-30" />
          <p>Tidak ada hasil</p>
        </div>
      )}
    </div>
  );
}
