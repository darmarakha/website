'use client';

import React, { useState, useMemo } from 'react';
import { X, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Character map for small kana → large counterparts ─────────────────────
const CHAR_MAP: Record<string, string> = {
  'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
  'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ',
  'っ': 'つ', 'ッ': 'ツ',
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
};

// ── Props ──────────────────────────────────────────────────────────────────
interface SingleStrokeOrderImageProps {
  character: string;
  kanaType?: 'hiragana' | 'katakana';
  size?: 'small' | 'large';
}

interface StrokeOrderImageProps {
  character: string;
  kanaType?: 'hiragana' | 'katakana';
  size?: 'small' | 'large';
}

// ── Single Stroke Order Image ──────────────────────────────────────────────
// Note: This component resets its state on every mount. Parent components
// should pass a `key` prop tied to the character to ensure remounting.
function SingleStrokeOrderImage({
  character,
  kanaType,
  size = 'large',
}: SingleStrokeOrderImageProps) {
  const [error, setError] = useState(false);
  const [srcIdx, setSrcIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const lookupChar = CHAR_MAP[character] || character;

  const sources = useMemo(() => {
    const list: string[] = [];
    const hexCode = lookupChar.charCodeAt(0).toString(16).padStart(4, '0').toLowerCase();

    // Kana-specific URLs
    if (kanaType === 'hiragana') {
      list.push(
        `https://commons.wikimedia.org/wiki/Special:FilePath/Hiragana_${lookupChar}_stroke_order_animation.gif`
      );
    } else if (kanaType === 'katakana') {
      list.push(
        `https://commons.wikimedia.org/wiki/Special:FilePath/Katakana_${lookupChar}_stroke_order_animation.gif`
      );
    }

    // Wikimedia common patterns for kanji (also used as fallback for kana)
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${lookupChar}-order.gif`);
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${lookupChar}-stroke_order.gif`);
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/Stroke_order_${lookupChar}.gif`);
    list.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${lookupChar}-jocr.gif`);

    // GitHub repos for kanji GIFs
    list.push(`https://raw.githubusercontent.com/mistval/kanji_images/master/gifs/${hexCode}.gif`);
    list.push(`https://raw.githubusercontent.com/jcsilva/anim-kanji/master/kanji-gifs/${hexCode}.gif`);

    return list;
  }, [lookupChar, kanaType]);

  const handleNextSource = () => {
    if (srcIdx < sources.length - 1) {
      setSrcIdx((prev) => prev + 1);
      setIsLoading(true);
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-muted-foreground opacity-50">
        <X size={size === 'small' ? 16 : 24} className="mb-2" />
        <div className="text-[10px] font-black uppercase tracking-widest text-center leading-none">
          Animasi Goresan
          <br />
          Tidak Tersedia
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/20 z-10 rounded-lg">
          <div className="w-5 h-5 border-2 border-teal-100 dark:border-teal-900 border-t-teal-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={sources[srcIdx]}
        alt={`Urutan goresan ${character}`}
        onLoad={() => setIsLoading(false)}
        className={cn(
          'object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-500',
          size === 'large' ? 'max-w-full max-h-full' : 'w-full h-full',
          isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        )}
        onError={handleNextSource}
      />
    </div>
  );
}

// ── Stroke Order Image (multi-character support) ───────────────────────────
export function StrokeOrderImage({
  character,
  kanaType,
  size = 'large',
}: StrokeOrderImageProps) {
  const chars = Array.from(character);

  if (chars.length > 1) {
    return (
      <div className="flex items-center justify-center gap-2 w-full h-full">
        {chars.map((c, i) => (
          <div
            key={`${c}-${i}`}
            className="flex-1 flex items-center justify-center border-r last:border-r-0 border-muted h-full"
          >
            <SingleStrokeOrderImage character={c} kanaType={kanaType} size={size} />
          </div>
        ))}
      </div>
    );
  }

  return <SingleStrokeOrderImage character={character} kanaType={kanaType} size={size} />;
}

// ── Stroke Guide Wrapper ───────────────────────────────────────────────────
interface StrokeGuideProps {
  character: string;
  kanaType?: 'hiragana' | 'katakana';
  size?: number;
  sizeLabel?: 'small' | 'large';
  label?: string;
  className?: string;
}

export function StrokeGuide({
  character,
  kanaType,
  size = 200,
  sizeLabel = 'large',
  label,
  className,
}: StrokeGuideProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1.5">
        <PenLine size={14} className="text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
          {label ?? 'Panduan Goresan'}
        </span>
      </div>
      <div
        key={character}
        className="mx-auto rounded-xl border-2 border-dashed border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 dark:from-teal-950/30 dark:to-emerald-950/30 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <StrokeOrderImage character={character} kanaType={kanaType} size={sizeLabel} />
      </div>
    </div>
  );
}
