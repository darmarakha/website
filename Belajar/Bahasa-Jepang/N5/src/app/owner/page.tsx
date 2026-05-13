'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Save, X, Settings, 
  Database, Sparkles, LogOut, ChevronRight,
  PlusCircle, Info, BookOpen, User, Users,
  CheckCircle2, AlertCircle, Loader2, Search, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OwnerDashboard() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const OWNER_EMAIL = "darmarakha2@gmail.com";
  const OWNER_PASS = "1234cowo";

  useEffect(() => {
    // Auto-login if session exists (simplified for now)
    const saved = localStorage.getItem('gemu-owner-session');
    if (saved === 'active') setIsLoggedIn(true);
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (Array.isArray(data)) setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === OWNER_PASS) {
      setIsLoggedIn(true);
      localStorage.setItem('gemu-owner-session', 'active');
      toast({ title: "Login Berhasil", description: "Selamat datang kembali, Owner!" });
    } else {
      toast({ title: "Login Gagal", description: "Password salah.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('gemu-owner-session');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      const res = await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMaterials(materials.filter(m => m.id !== id));
        toast({ title: "Berhasil", description: "Materi telah dihapus." });
      }
    } catch (err) {
      toast({ title: "Gagal", description: "Terjadi kesalahan.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEdit),
      });
      if (res.ok) {
        await fetchMaterials();
        setIsEditing(false);
        setCurrentEdit(null);
        toast({ title: "Berhasil", description: "Materi telah disimpan." });
      }
    } catch (err) {
      toast({ title: "Gagal", description: "Gagal menyimpan materi.", variant: "destructive" });
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-900 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-teal-500/50">
              <Settings className="text-teal-400" size={32} />
            </div>
            <CardTitle className="text-2xl font-black text-white">Owner Access</CardTitle>
            <CardDescription className="text-slate-400">Silakan masukkan password untuk mengelola materi.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold">
                Masuk Dashboard
              </Button>
              <Link href="/" className="block text-center text-xs text-slate-500 hover:text-slate-300">
                Kembali ke Beranda
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Database className="text-teal-500" size={32} />
              N5 Material Manager
            </h1>
            <p className="text-slate-500 flex items-center gap-2">
              <User size={14} className="text-teal-600" />
              {OWNER_EMAIL} (Owner Mode)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => {
                setIsEditing(true);
                setCurrentEdit({
                  title: '', topic: '', scenario: '', context: '', emoji: '📚', difficulty: 'easy',
                  speakers: [
                    { id: 'A', name: 'Char A', nameRo: 'CharA', gender: 'pria', role: 'Speaker A', emoji: '🧑', colorClass: 'blue' },
                    { id: 'B', name: 'Char B', nameRo: 'CharB', gender: 'wanita', role: 'Speaker B', emoji: '👩', colorClass: 'rose' }
                  ],
                  dialogue: [{ speaker: 'A', text: '', ro: '', id: '' }],
                  quiz: { question: '', options: ['', '', '', ''], answer: 0, explanation: '' }
                });
              }}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold gap-2 shadow-lg shadow-teal-500/20"
            >
              <PlusCircle size={18} />
              Materi Baru
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={16} />
              Keluar
            </Button>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-3 border shadow-sm">
            <div className="p-3 flex items-center gap-3">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari materi berdasarkan judul atau topik..." 
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>
          <Card className="flex items-center justify-center p-3 border shadow-sm bg-teal-50 dark:bg-teal-950/20">
            <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
              Total: {materials.length} Materi
            </p>
          </Card>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))
          ) : filteredMaterials.map((m) => (
            <Card key={m.id} className="group overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                      {m.emoji}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{m.title}</h3>
                      <p className="text-xs text-slate-500 truncate">{m.topic}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {m.difficulty}
                  </Badge>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                  "{m.scenario}"
                </p>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => { setCurrentEdit(m); setIsEditing(true); }}
                  >
                    <Edit3 size={14} />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 size={14} />
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Modal / Fullscreen Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-slate-200">
            <CardHeader className="border-b bg-slate-50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentEdit?.id?.startsWith('n5-') ? 'Edit Materi' : 'Buat Materi Baru'}
                    <Sparkles className="text-amber-500" size={18} />
                  </CardTitle>
                  <CardDescription>Sesuaikan detail materi N5 di bawah ini.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-8 pb-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Judul Materi</label>
                    <Input 
                      value={currentEdit.title} 
                      onChange={e => setCurrentEdit({...currentEdit, title: e.target.value})}
                      placeholder="Contoh: Belanja di Supermarket"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Topik</label>
                    <Input 
                      value={currentEdit.topic} 
                      onChange={e => setCurrentEdit({...currentEdit, topic: e.target.value})}
                      placeholder="Contoh: Kaimono (買い物)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Emoji Icon</label>
                    <Input 
                      value={currentEdit.emoji} 
                      onChange={e => setCurrentEdit({...currentEdit, emoji: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Kesulitan</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={currentEdit.difficulty}
                      onChange={e => setCurrentEdit({...currentEdit, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Skenario (Singkat)</label>
                  <Input 
                    value={currentEdit.scenario} 
                    onChange={e => setCurrentEdit({...currentEdit, scenario: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Konteks (Detail untuk User)</label>
                  <Textarea 
                    value={currentEdit.context} 
                    onChange={e => setCurrentEdit({...currentEdit, context: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Dialogue Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Plus className="text-teal-500" size={16} /> 
                      Dialog Percakapan
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newDialogue = [...currentEdit.dialogue, { speaker: 'A', text: '', ro: '', id: '' }];
                      setCurrentEdit({...currentEdit, dialogue: newDialogue});
                    }}>
                      Tambah Baris
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {currentEdit.dialogue.map((line: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-xl bg-slate-50/50 space-y-3">
                        <div className="flex items-center gap-3">
                          <select 
                            className="h-8 px-2 rounded-md border text-xs font-bold"
                            value={line.speaker}
                            onChange={e => {
                              const newD = [...currentEdit.dialogue];
                              newD[idx].speaker = e.target.value;
                              setCurrentEdit({...currentEdit, dialogue: newD});
                            }}
                          >
                            <option value="A">Speaker A</option>
                            <option value="B">Speaker B</option>
                          </select>
                          <div className="flex-1 h-px bg-slate-200" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => {
                            const newD = currentEdit.dialogue.filter((_: any, i: number) => i !== idx);
                            setCurrentEdit({...currentEdit, dialogue: newD});
                          }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input 
                            placeholder="Teks Jepang (Kanji[furigana])" 
                            className="text-sm font-jp"
                            value={line.text}
                            onChange={e => {
                              const newD = [...currentEdit.dialogue];
                              newD[idx].text = e.target.value;
                              setCurrentEdit({...currentEdit, dialogue: newD});
                            }}
                          />
                          <Input 
                            placeholder="Romaji" 
                            className="text-sm"
                            value={line.ro}
                            onChange={e => {
                              const newD = [...currentEdit.dialogue];
                              newD[idx].ro = e.target.value;
                              setCurrentEdit({...currentEdit, dialogue: newD});
                            }}
                          />
                          <Input 
                            placeholder="Arti Indonesia" 
                            className="text-sm"
                            value={line.id}
                            onChange={e => {
                              const newD = [...currentEdit.dialogue];
                              newD[idx].id = e.target.value;
                              setCurrentEdit({...currentEdit, dialogue: newD});
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiz Editor */}
                <div className="space-y-4 p-5 border rounded-2xl bg-amber-50/20 border-amber-200">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-amber-800">
                    <HelpCircle size={16} /> Quiz Pengecekan
                  </h3>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Pertanyaan Quiz" 
                      value={currentEdit.quiz.question}
                      onChange={e => setCurrentEdit({...currentEdit, quiz: {...currentEdit.quiz, question: e.target.value}})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {currentEdit.quiz.options.map((opt: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <Badge variant={currentEdit.quiz.answer === i ? 'default' : 'outline'} className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">
                            {i + 1}
                          </Badge>
                          <Input 
                            placeholder={`Opsi ${i + 1}`} 
                            value={opt}
                            onChange={e => {
                              const newOpt = [...currentEdit.quiz.options];
                              newOpt[i] = e.target.value;
                              setCurrentEdit({...currentEdit, quiz: {...currentEdit.quiz, options: newOpt}});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Jawaban Benar (0-3)</label>
                        <Input 
                          type="number" min="0" max="3" 
                          value={currentEdit.quiz.answer}
                          onChange={e => setCurrentEdit({...currentEdit, quiz: {...currentEdit.quiz, answer: parseInt(e.target.value)}})}
                        />
                      </div>
                      <div className="flex-[3] space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Penjelasan</label>
                        <Input 
                          placeholder="Mengapa jawaban ini benar?" 
                          value={currentEdit.quiz.explanation}
                          onChange={e => setCurrentEdit({...currentEdit, quiz: {...currentEdit.quiz, explanation: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <CardHeader className="border-t bg-slate-50 dark:bg-slate-900 shrink-0 p-4">
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                <Button className="bg-teal-600 hover:bg-teal-500 text-white gap-2" onClick={handleSave}>
                  <Save size={18} />
                  Simpan Materi
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}

