'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Monitor, Volume2, VolumeX, Bell,
  Database, Trash2, Download, Upload, Info, Clock,
  Sparkles, Palette, AlertTriangle, Check, HardDrive,
  Languages as JapaneseIcon, RotateCcw, Archive, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

const LS_KEYS = [
  'gemu-study-sessions', 'gemu-flashcard-learned', 'gemu-flashcard-progress',
  'gemu-quiz-completed', 'gemu-quiz-xp', 'gemu-quiz-grade-s',
  'gemu-kana-quiz', 'gemu-kaiwa-sessions', 'gemu-choukai-completed',
  'gemu-achievements-unlocked', 'gemu-achievement-xp', 'gemu-reminder',
  'gemu-settings-font-size', 'gemu-settings-tts-speed',
  'gemu-settings-auto-play', 'gemu-settings-timer-sound',
  'gemu-settings-volume', 'gemu-sentence-builder-progress',
];

function getStorageCount(): number {
  if (typeof window === 'undefined') return 0;
  let count = 0;
  for (const key of LS_KEYS) {
    const val = localStorage.getItem(key);
    if (val && val !== 'false' && val !== '' && val !== '[]') count++;
  }
  return count;
}

function speakJapanese(text: string, rate = 1.0) {
  if (typeof window === 'undefined') return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize all settings from localStorage (lazy) or defaults
  const [fontSize, setFontSize] = useState<'kecil' | 'normal' | 'besar'>(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem('gemu-settings-font-size') as 'kecil' | 'normal' | 'besar') || 'normal'
      : 'normal'
  );
  const [ttsSpeed, setTtsSpeed] = useState(() =>
    typeof window !== 'undefined'
      ? parseFloat(localStorage.getItem('gemu-settings-tts-speed') || '1.0')
      : 1.0
  );
  const [autoPlay, setAutoPlay] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gemu-settings-auto-play') === 'true'
      : false
  );
  const [studyReminder, setStudyReminder] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gemu-reminder') === 'true'
      : false
  );
  const [timerSound, setTimerSound] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gemu-settings-timer-sound') !== 'false'
      : true
  );
  const [volume, setVolume] = useState(() =>
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('gemu-settings-volume') || '80', 10)
      : 80
  );
  const [storageCount, setStorageCount] = useState(() =>
    typeof window !== 'undefined' ? getStorageCount() : 0
  );

  // Download ZIP
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadZip = async () => {
    setDownloadLoading(true);
    try {
      const res = await fetch('/api/download');
      if (!res.ok) throw new Error('Download gagal');
      const contentLength = res.headers.get('Content-Length');
      const sizeMB = contentLength ? (parseInt(contentLength, 10) / (1024 * 1024)).toFixed(1) : null;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `gemu-nihongo-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'ZIP berhasil didownload!',
        description: sizeMB ? `Ukuran file: ${sizeMB} MB (termasuk semua backend & frontend)` : 'Semua file backend & frontend termasuk',
      });
    } catch {
      toast({ title: 'Gagal mendownload file ZIP', variant: 'destructive' });
    } finally {
      setDownloadLoading(false);
    }
  };

  // Clear dialog
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearLoading, setClearLoading] = useState(false);

  // ── Apply font size to root ────────────────────────────────────────────────
  useEffect(() => {
    const sizeMap = { kecil: '14px', normal: '16px', besar: '20px' };
    document.documentElement.style.setProperty('--jp-font-size', sizeMap[fontSize]);
  }, [fontSize]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFontSizeChange = (val: 'kecil' | 'normal' | 'besar') => {
    setFontSize(val);
    localStorage.setItem('gemu-settings-font-size', val);
    toast({ title: `Ukuran teks: ${val === 'kecil' ? 'Kecil' : val === 'normal' ? 'Normal' : 'Besar'}` });
  };

  const handleTtsSpeedChange = (val: number[]) => {
    const speed = val[0];
    setTtsSpeed(speed);
    localStorage.setItem('gemu-settings-tts-speed', String(speed));
  };

  const handleTtsSpeedPreview = () => {
    speakJapanese('こんにちは', ttsSpeed);
    toast({ title: `Preview TTS ${ttsSpeed.toFixed(1)}x` });
  };

  const handleAutoPlayChange = (checked: boolean) => {
    setAutoPlay(checked);
    localStorage.setItem('gemu-settings-auto-play', String(checked));
    toast({ title: checked ? 'Auto-play diaktifkan' : 'Auto-play dinonaktifkan' });
  };

  const handleStudyReminderChange = (checked: boolean) => {
    setStudyReminder(checked);
    localStorage.setItem('gemu-reminder', String(checked));
    toast({ title: checked ? 'Pengingat belajar diaktifkan' : 'Pengingat belajar dinonaktifkan' });
  };

  const handleTimerSoundChange = (checked: boolean) => {
    setTimerSound(checked);
    localStorage.setItem('gemu-settings-timer-sound', String(checked));
    toast({ title: checked ? 'Suara timer diaktifkan' : 'Suara timer dinonaktifkan' });
  };

  const handleVolumeChange = (val: number[]) => {
    const vol = val[0];
    setVolume(vol);
    localStorage.setItem('gemu-settings-volume', String(vol));
  };

  // ── Clear all data ─────────────────────────────────────────────────────────
  const handleClearAll = () => {
    setClearLoading(true);
    setTimeout(() => {
      LS_KEYS.forEach(key => localStorage.removeItem(key));
      setStorageCount(0);
      setClearLoading(false);
      setClearDialogOpen(false);
      setClearConfirmText('');
      setFontSize('normal');
      setTtsSpeed(1.0);
      setAutoPlay(false);
      setStudyReminder(false);
      setTimerSound(true);
      setVolume(80);
      setTheme('light');
      toast({ title: 'Semua data berhasil dihapus' });
    }, 600);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const data: Record<string, string | null> = {};
    LS_KEYS.forEach(key => {
      data[key] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemu-nihongo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data berhasil diekspor' });
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        let imported = 0;
        for (const [key, value] of Object.entries(data)) {
          if (LS_KEYS.includes(key)) {
            localStorage.setItem(key, value as string);
            imported++;
          }
        }
        // Re-read settings
        setFontSize(
          (localStorage.getItem('gemu-settings-font-size') as 'kecil' | 'normal' | 'besar') || 'normal'
        );
        setTtsSpeed(parseFloat(localStorage.getItem('gemu-settings-tts-speed') || '1.0'));
        setAutoPlay(localStorage.getItem('gemu-settings-auto-play') === 'true');
        setStudyReminder(localStorage.getItem('gemu-reminder') === 'true');
        setTimerSound(localStorage.getItem('gemu-settings-timer-sound') !== 'false');
        setVolume(parseInt(localStorage.getItem('gemu-settings-volume') || '80', 10));
        setStorageCount(getStorageCount());
        toast({ title: `${imported} item berhasil diimpor` });
      } catch {
        toast({ title: 'File tidak valid. Pastikan format JSON benar.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
          <Info size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">Pengaturan</h1>
          <p className="text-xs text-muted-foreground font-medium">Atur preferensi belajar kamu</p>
        </div>
      </div>

      {/* ═══════════════ 1. TAMPILAN ═══════════════ */}
      <Card>
        <SectionHeader
          icon={Palette}
          title="Tampilan"
          description="Sesuaikan tampilan aplikasi"
        />
        <CardContent className="space-y-6">
          {/* Dark Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Sun size={15} className="text-amber-500" />
              Tema
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'light', label: 'Terang', icon: Sun, colors: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
                { value: 'dark', label: 'Gelap', icon: Moon, colors: 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300' },
                { value: 'system', label: 'Sistem', icon: Monitor, colors: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400' },
              ] as const).map(opt => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      isActive
                        ? `${opt.colors} shadow-md ring-2 ring-teal-500/30`
                        : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30'
                    )}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-bold">{opt.label}</span>
                    {isActive && (
                      <Check size={14} className="text-teal-600 dark:text-teal-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <JapaneseIcon size={15} className="text-teal-500" />
              Ukuran Teks Bahasa Jepang
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'kecil' as const, label: 'Kecil', size: 'text-sm', jp: '日本語' },
                { value: 'normal' as const, label: 'Normal', size: 'text-base', jp: '日本語' },
                { value: 'besar' as const, label: 'Besar', size: 'text-xl', jp: '日本語' },
              ]).map(opt => {
                const isActive = fontSize === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleFontSizeChange(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 shadow-md ring-2 ring-teal-500/30'
                        : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30'
                    )}
                  >
                    <span className={cn('font-jp', opt.size)}>{opt.jp}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                    {isActive && (
                      <Check size={14} className="text-teal-600 dark:text-teal-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 2. AUDIO ═══════════════ */}
      <Card>
        <SectionHeader
          icon={Volume2}
          title="Audio"
          description="Atur pengaturan suara dan TTS"
        />
        <CardContent className="space-y-6">
          {/* TTS Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Clock size={15} className="text-teal-500" />
                Kecepatan TTS
              </Label>
              <Badge className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-xs font-bold border-0">
                {ttsSpeed.toFixed(1)}x
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[ttsSpeed]}
                onValueChange={handleTtsSpeedChange}
                min={0.5}
                max={2.0}
                step={0.1}
                className="flex-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Lambat (0.5x)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTtsSpeedPreview}
                className="h-8 text-xs gap-1.5 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              >
                <Volume2 size={13} />
                Preview
              </Button>
              <span className="text-[11px] text-muted-foreground">Cepat (2.0x)</span>
            </div>
          </div>

          <Separator />

          {/* Auto-play */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Auto-play Audio</p>
                <p className="text-xs text-muted-foreground truncate">
                  Putar audio otomatis saat teks Jepang ditampilkan
                </p>
              </div>
            </div>
            <Switch
              checked={autoPlay}
              onCheckedChange={handleAutoPlayChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 3. NOTIFIKASI ═══════════════ */}
      <Card>
        <SectionHeader
          icon={Bell}
          title="Notifikasi"
          description="Atur pengingat dan suara notifikasi"
        />
        <CardContent className="space-y-5">
          {/* Study Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Bell size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Pengingat Belajar</p>
                <p className="text-xs text-muted-foreground truncate">
                  Ingatkan untuk belajar setiap hari
                </p>
              </div>
            </div>
            <Switch
              checked={studyReminder}
              onCheckedChange={handleStudyReminderChange}
            />
          </div>

          <Separator />

          {/* Timer Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                {timerSound ? (
                  <Volume2 size={16} className="text-rose-600 dark:text-rose-400" />
                ) : (
                  <VolumeX size={16} className="text-rose-400 dark:text-rose-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Suara Timer</p>
                <p className="text-xs text-muted-foreground truncate">
                  Putar suara saat timer berakhir
                </p>
              </div>
            </div>
            <Switch
              checked={timerSound}
              onCheckedChange={handleTimerSoundChange}
            />
          </div>

          <Separator />

          {/* Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Volume2 size={15} className="text-teal-500" />
                Volume Suara
              </Label>
              <Badge className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-xs font-bold border-0">
                {volume}%
              </Badge>
            </div>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between">
              <span className="text-[11px] text-muted-foreground">Mute</span>
              <span className="text-[11px] text-muted-foreground">Maksimal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 4. DATA ═══════════════ */}
      <Card>
        <SectionHeader
          icon={Database}
          title="Data"
          description="Kelola data progress belajar"
        />
        <CardContent className="space-y-5">
          {/* Storage info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <HardDrive size={18} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{storageCount} item</span> tersimpan di perangkat
            </span>
          </div>

          <Separator />

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="h-11 gap-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 justify-start"
            >
              <Download size={16} />
              <span>Ekspor Data</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleImport}
              className="h-11 gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 justify-start"
            >
              <Upload size={16} />
              <span>Impor Data</span>
            </Button>
          </div>

          {/* Download Source Code */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-200/50 dark:border-teal-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                <Archive size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">Download Source Code</p>
                <p className="text-[11px] text-muted-foreground">ZIP seluruh project: frontend + backend + semua file</p>
              </div>
            </div>
            <Button
              onClick={handleDownloadZip}
              disabled={downloadLoading}
              className="w-full h-11 gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-md shadow-teal-500/20"
            >
              {downloadLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Membuat ZIP...
                </>
              ) : (
                <>
                  <Archive size={16} />
                  Download ZIP Project
                </>
              )}
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Separator />

          {/* Clear all */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(true)}
              className="w-full h-11 gap-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 justify-center"
            >
              <Trash2 size={16} />
              <span>Hapus Semua Progress</span>
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Tindakan ini tidak dapat dibatalkan
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 5. TENTANG ═══════════════ */}
      <Card>
        <SectionHeader
          icon={Info}
          title="Tentang"
          description="Informasi aplikasi"
        />
        <CardContent className="space-y-5">
          {/* App info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shrink-0">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Gemu Nihongo</h3>
              <p className="text-xs text-muted-foreground font-medium">Platform belajar bahasa Jepang JLPT N5 dengan AI</p>
              <Badge variant="secondary" className="mt-1 text-[10px] font-bold">
                v2.0.0
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Credits */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Teknologi</p>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'Tailwind CSS', 'AI'].map(tech => (
                <Badge
                  key={tech}
                  className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[11px] font-semibold border-teal-200 dark:border-teal-800"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* JLPT N5 Info Card */}
          <div className="rounded-xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-teal-500/5 dark:via-emerald-500/5 dark:to-cyan-500/5 border border-teal-200/50 dark:border-teal-800/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-teal-600 dark:text-teal-400" />
              <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400">Tentang JLPT N5</h4>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">JLPT N5</span> adalah level terdasar dalam ujian Japanese Language Proficiency Test.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-background/60 dark:bg-background/30">
                  <p className="font-bold text-foreground text-[11px]">Kanji</p>
                  <p className="text-[11px]">~100 karakter</p>
                </div>
                <div className="p-2 rounded-lg bg-background/60 dark:bg-background/30">
                  <p className="font-bold text-foreground text-[11px]">Kosakata</p>
                  <p className="text-[11px]">~800 kata</p>
                </div>
                <div className="p-2 rounded-lg bg-background/60 dark:bg-background/30">
                  <p className="font-bold text-foreground text-[11px]">Grammar</p>
                  <p className="text-[11px]">~100 pola</p>
                </div>
                <div className="p-2 rounded-lg bg-background/60 dark:bg-background/30">
                  <p className="font-bold text-foreground text-[11px]">Durasi</p>
                  <p className="text-[11px]">~150 jam belajar</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ CLEAR CONFIRMATION DIALOG ═══════════════ */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <AlertTriangle size={22} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <DialogTitle className="text-base">Hapus Semua Data?</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Tindakan ini tidak dapat dibatalkan
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Data berikut akan dihapus secara permanen:
            </p>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
              <ul className="text-xs space-y-1.5 text-rose-700 dark:text-rose-400">
                <li className="flex items-center gap-2">
                  <Trash2 size={12} /> Riwayat sesi belajar
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 size={12} /> Progress flashcard & kana quiz
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 size={12} /> Skor & XP boss quiz
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 size={12} /> Sesi kaiwa & choukai
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 size={12} /> Pencapaian (achievements)
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 size={12} /> Semua pengaturan
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Ketik <span className="font-bold text-rose-600 dark:text-rose-400">HAPUS</span> untuk mengkonfirmasi:
              </p>
              <Input
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="h-10 text-sm font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={clearLoading}
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearConfirmText !== 'HAPUS' || clearLoading}
              className="flex-1 sm:flex-none gap-2"
            >
              {clearLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Hapus Semua
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
