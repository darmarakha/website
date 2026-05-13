'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Send, Volume2, VolumeX, BrainCircuit,
  MessageCircle, Loader2, RotateCcw, Zap, User, Bot,
  ChevronDown, Sparkles, BookOpen, Hash, StopCircle, AlertTriangle, Clock, Flag,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface KaiwaMessage {
  role: 'user' | 'model';
  text: string;
  id?: string;
}

// Maximum user messages before conversation ends
const MAX_CONVERSATION_TURNS = 20;

// Kaiwa topic presets
export const KAIWA_TOPICS = [
  { id: 'free', label: 'Bebas', emoji: '🌟', prompt: 'Ayo ngobrol bebas! Tanyakan apa saja.' },
  { id: 'restaurant', label: 'Di Restoran', emoji: '🍽️', prompt: 'Kita sedang di restoran Jepang. Pesan makanan dan minuman.' },
  { id: 'shopping', label: 'Belanja', emoji: '🛒', prompt: 'Kita lagi belanja di toko. Tanyakan harga dan beli sesuatu.' },
  { id: 'direction', label: 'Menanyakan Jalan', emoji: '🗺️', prompt: 'Kita tersesat di jalan. Tanyakan arah ke suatu tempat.' },
  { id: 'introduction', label: 'Perkenalan', emoji: '👋', prompt: 'Kita baru bertemu. Perkenalkan diri masing-masing.' },
  { id: 'hobby', label: 'Hobi & Waktu Luang', emoji: '⚽', prompt: 'Ngobrol tentang hobi dan apa yang dilakukan di waktu luang.' },
  { id: 'weather', label: 'Cuaca & Musim', emoji: '☀️', prompt: 'Ngobrol tentang cuaca hari ini dan rencana aktivitas.' },
  { id: 'phone', label: 'Telepon', emoji: '📞', prompt: 'Telepon teman untuk mengatur janjian bertemu.' },
  { id: 'school', label: 'Di Sekolah', emoji: '🏫', prompt: 'Kita di kelas. Tanyakan tentang pelajaran dan tugas.' },
  { id: 'travel', label: 'Travel & Liburan', emoji: '✈️', prompt: 'Ngobrol tentang rencana trip dan tempat wisata.' },
];

// Parse furigana: Kanji[hiragana] -> ruby annotations
export function parseFurigana(text: string) {
  const regex = /([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g;
  const parts: React.ReactNode[] = [];
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
        <rt className="text-[10px] text-teal-600 tracking-tighter leading-none mb-1 opacity-90 font-bold">
          {match[2]}
        </rt>
      </ruby>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

// Extract JP/RO/ID from formatted message
function parseKaiwaMessage(text: string) {
  const matchJp = text.match(/JP:\s*([\s\S]*?)(?=\nRO:|$)/);
  const matchRo = text.match(/RO:\s*([\s\S]*?)(?=\nID:|$)/);
  const matchId = text.match(/ID:\s*([\s\S]*?)$/);
  return {
    jp: matchJp?.[1]?.trim() || null,
    ro: matchRo?.[1]?.trim() || null,
    id: matchId?.[1]?.trim() || null,
    isFormatted: !!(matchJp && matchRo && matchId),
    isFeedback: text.includes('EVALUASI'),
  };
}

// Strip all emoji and emoticons from text for TTS
// Also converts Kanji[furigana] → furigana for correct Japanese pronunciation
function stripEmoji(text: string): string {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;
  const emoticonRegex = /[:;][-~]?[)DpP(/\\|]}xX>oO0*3\^]/g;
  let cleaned = text.replace(emojiRegex, '').replace(emoticonRegex, '');
  // Convert furigana: Kanji[reading] → reading only
  cleaned = cleaned.replace(/([一-龯々]+)\[([ぁ-んァ-ンー]+)\]/g, '$2');
  // Remove any remaining brackets and formatting
  cleaned = cleaned.replace(/\[.*?\]/g, '').replace(/[*#]/g, '');
  return cleaned.replace(/\s+/g, ' ').trim();
}

export default function KaiwaStudio() {
  const [messages, setMessages] = useState<KaiwaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'normal' | 'live'>('normal');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpokenIdx, setLastSpokenIdx] = useState(-1);
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(KAIWA_TOPICS[0]);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [convStartTime, setConvStartTime] = useState<number>(0);
  const [showStats, setShowStats] = useState(false);
  const [totalConversations, setTotalConversations] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatInitialized = useRef(false);
  const micAllowedRef = useRef(true);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Load conversation history count
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemu-kaiwa-history');
      if (saved) {
        const history = JSON.parse(saved);
        setTotalConversations(history.length || 0);
      }
    } catch {}
  }, []);

  // Initialize greeting
  useEffect(() => {
    if (!chatInitialized.current) {
      chatInitialized.current = true;
      setConvStartTime(Date.now());
      const hour = new Date().getHours();
      let greeting: string;
      if (hour >= 5 && hour < 12) {
        greeting = 'JP: おはようございます！今日[きょう]はどんな話[はなし]をしますか？\nRO: Ohayou gozaimasu! Kyou wa donna hanashi o shimasu ka?\nID: Selamat pagi! Hari ini kita mau ngobrol apa? 🌅';
      } else if (hour >= 12 && hour < 18) {
        greeting = 'JP: こんにちは！今日[きょう]は何[なに]について話[はな]しましょうか？\nRO: Konnichiwa! Kyou wa nani ni tsuite hanashimashou ka?\nID: Halo! Hari ini kita mau ngobrol tentang apa? ✨';
      } else {
        greeting = 'JP: こんばんは！今日[きょう]はどんな一日[いちにち]でしたか？\nRO: Konbanwa! Kyou wa donna ichinichi deshita ka?\nID: Selamat malam! Gimana hari ini? 🌙';
      }
      setMessages([{ role: 'model', text: greeting }]);
      setTimeout(() => speakText(greeting), 500);
    }
  }, []);

  // Auto-speak new AI messages — but ONLY if not already loading or speaking
  useEffect(() => {
    if (messages.length > 0 && !isLoading && !aiSpeaking) {
      const lastIndex = messages.length - 1;
      const lastMsg = messages[lastIndex];
      if (lastMsg.role === 'model' && lastSpokenIdx < lastIndex && !lastMsg.text.includes('EVALUASI')) {
        setLastSpokenIdx(lastIndex);
        speakText(lastMsg.text);
      }
    }
  }, [messages, isLoading, aiSpeaking]);

  // Stop mic when AI is loading OR speaking
  useEffect(() => {
    if (aiSpeaking || isLoading) {
      micAllowedRef.current = false;
      if (isListening) {
        forceStopListening();
      }
    } else {
      micAllowedRef.current = true;
    }
  }, [aiSpeaking, isLoading]);

  const forceStopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setAiSpeaking(false);
  }, []);

  const speakText = useCallback((text: string) => {
    const { jp } = parseKaiwaMessage(text);
    if (!jp) return;

    stopSpeaking();

    const cleanJp = stripEmoji(jp.replace(/\[.*?\]/g, '').replace(/[*#]/g, '').trim());
    if (!cleanJp) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(cleanJp);
    utterance.lang = 'ja-JP';
    utterance.rate = mode === 'live' ? 1.1 : 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.includes('ja') && /Google|Microsoft/i.test(v.name))
      || voices.find(v => v.lang === 'ja-JP')
      || voices.find(v => v.lang.includes('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    utterance.onstart = () => {
      setAiSpeaking(true);
      setInput('');
      micAllowedRef.current = false;
    };
    utterance.onend = () => setAiSpeaking(false);
    utterance.onerror = () => setAiSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [mode, stopSpeaking]);

  // Save conversation to localStorage history
  const saveConversationHistory = useCallback((msgs: KaiwaMessage[], topic: typeof KAIWA_TOPICS[0], m: string) => {
    try {
      const duration = Math.round((Date.now() - convStartTime) / 1000);
      const userCount = msgs.filter(msg => msg.role === 'user').length;
      const history: Array<{ date: string; topic: string; mode: string; messages: number; duration: number }> =
        JSON.parse(localStorage.getItem('gemu-kaiwa-history') || '[]');
      history.push({
        date: new Date().toISOString(),
        topic: topic.label,
        mode: m,
        messages: userCount,
        duration,
      });
      localStorage.setItem('gemu-kaiwa-history', JSON.stringify(history));
      localStorage.setItem('gemu-kaiwa-sessions', String(history.length));
      setTotalConversations(history.length);
    } catch {}
  }, [convStartTime]);

  // Request conversation review/feedback from AI
  const requestReview = async () => {
    if (isLoading || isReviewing) return;
    micAllowedRef.current = false;
    stopSpeaking();
    forceStopListening();
    setInput('');
    setIsReviewing(true);
    setIsLoading(true);

    try {
      const res = await fetch('/api/kaiwa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, mode, topic: selectedTopic, endConversation: true }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Add divider message
      setMessages(prev => [
        ...prev,
        { role: 'model', text: '💬 --- Percakapan Selesai ---\nKlik "Lihat Evaluasi" untuk melihat feedback dari AI.' },
      ]);

      // Add the actual review
      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
      setConversationEnded(true);

      // Save conversation to history
      saveConversationHistory(messages, selectedTopic, mode);
    } catch (error) {
      console.error('Review error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Maaf, gagal memuat evaluasi. Coba lagi nanti ya! 🥺' }]);
    } finally {
      setIsReviewing(false);
      setIsLoading(false);
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading || aiSpeaking || conversationEnded) return;

    micAllowedRef.current = false;
    forceStopListening();
    setInput('');

    const userMessage: KaiwaMessage = { role: 'user', text: textToSend.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Check if this will exceed the limit
    const newUserCount = newMessages.filter(m => m.role === 'user').length;
    const willEnd = newUserCount >= MAX_CONVERSATION_TURNS;

    try {
      const res = await fetch('/api/kaiwa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode, topic: selectedTopic }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (!data.response) throw new Error('Empty response from AI');

      const updatedMessages = [...newMessages, { role: 'model', text: data.response }];
      setMessages(updatedMessages);

      // If AI signaled end of conversation or we hit the limit, trigger review
      if (data.ended || willEnd) {
        setConversationEnded(true);
        // setIsLoading stays true — setTimeout will manage the review flow
        // Auto-request feedback after a short delay
        setTimeout(async () => {
          setIsReviewing(true);
          setIsLoading(true);
          try {
            const reviewRes = await fetch('/api/kaiwa/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: updatedMessages, mode, topic: selectedTopic, endConversation: true }),
            });
            const reviewData = await reviewRes.json();
            if (reviewData.response) {
              setMessages(prev => [
                ...prev,
                { role: 'model', text: '💬 --- Percakapan Selesai ---\nPercakapan telah berakhir. Berikut evaluasi dari AI:' },
                { role: 'model', text: reviewData.response },
              ]);
              // Save conversation to history
              saveConversationHistory(updatedMessages, selectedTopic, mode);
            }
          } catch {
            // silently fail review
          } finally {
            setIsReviewing(false);
            setIsLoading(false);
          }
        }, 1500);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'エラーが発生しました。(Terjadi kesalahan jaringan.) 😥'
      }]);
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    stopSpeaking();
    forceStopListening();
    chatInitialized.current = false;
    setLastSpokenIdx(-1);
    setMessages([]);
    setInput('');
    setConversationEnded(false);
    setIsReviewing(false);
    setShowStats(false);
    setConvStartTime(Date.now());

    setTimeout(() => {
      const hour = new Date().getHours();
      let greeting: string;
      if (hour >= 5 && hour < 12) {
        greeting = 'JP: おはようございます！今日[きょう]はどんな話[はなし]をしますか？\nRO: Ohayou gozaimasu! Kyou wa donna hanashi o shimasu ka?\nID: Selamat pagi! Hari ini kita mau ngobrol apa? 🌅';
      } else if (hour >= 12 && hour < 18) {
        greeting = 'JP: こんにちは！今日[きょう]は何[なに]について話[はな]しましょうか？\nRO: Konnichiwa! Kyou wa nani ni tsuite hanashimashou ka?\nID: Halo! Hari ini kita mau ngobrol tentang apa? ✨';
      } else {
        greeting = 'JP: こんばんは！今日[きょう]はどんな一日[いちにち]でしたか？\nRO: Konbanwa! Kyou wa donna ichinichi deshita ka?\nID: Selamat malam! Gimana hari ini? 🌙';
      }
      setMessages([{ role: 'model', text: greeting }]);
      setTimeout(() => speakText(greeting), 500);
    }, 100);
  };

  // Speech Recognition
  const startListening = () => {
    if (!micAllowedRef.current || conversationEnded) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      forceStopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    recognitionRef.current = recognition;
    let finalTranscript = input ? input + ' ' : '';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      if (!micAllowedRef.current) return;
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
      }
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSpeakButton = (text: string) => {
    if (aiSpeaking) { stopSpeaking(); } else { speakText(text); }
  };

  const inputDisabled = isLoading || aiSpeaking || conversationEnded;
  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const turnsRemaining = MAX_CONVERSATION_TURNS - userMsgCount;
  const turnsProgress = Math.min(userMsgCount / MAX_CONVERSATION_TURNS, 1);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <span className="text-3xl">🎙️</span> Kaiwa Studio
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Roleplay percakapan bahasa Jepang dengan AI
              {totalConversations > 0 && (
                <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
                  <MessageCircle size={10} className="mr-1" />{totalConversations} percakapan
                </Badge>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Topic Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTopics(!showTopics)}
                disabled={conversationEnded}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border',
                  'hover:bg-muted border-border',
                  conversationEnded && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-base">{selectedTopic.emoji}</span>
                <span className="hidden sm:inline max-w-[100px] truncate">{selectedTopic.label}</span>
                <ChevronDown size={14} className={cn("transition-transform", showTopics && "rotate-180")} />
              </button>
              {showTopics && !conversationEnded && (
                <div className="absolute top-full left-0 mt-2 w-64 z-50 bg-popover border rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Pilih Topik Percakapan
                  </p>
                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    {KAIWA_TOPICS.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => { setSelectedTopic(topic); setShowTopics(false); }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left',
                          selectedTopic.id === topic.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-muted'
                        )}
                      >
                        <span className="text-base">{topic.emoji}</span>
                        <span className="font-medium">{topic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-xl border bg-muted/50 p-1">
              <button
                onClick={() => { setMode('normal'); stopSpeaking(); }}
                className={cn(
                  'px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                  mode === 'normal'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageCircle size={14} />
                <span className="hidden sm:inline">Normal</span>
              </button>
              <button
                onClick={() => { setMode('live'); stopSpeaking(); }}
                className={cn(
                  'px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                  mode === 'live'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Zap size={14} />
                <span className="hidden sm:inline">Live</span>
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={resetChat} className="rounded-xl gap-1.5" title="Mulai percakapan baru">
              <RotateCcw size={14} />
            </Button>

            {/* Review Button - visible when conversation is active and has enough messages */}
            {!conversationEnded && userMsgCount >= 5 && (
              <Button
                variant="outline" size="sm"
                onClick={requestReview}
                disabled={isLoading || aiSpeaking || isReviewing}
                className="rounded-xl gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                title="Akhiri & evaluasi percakapan"
              >
                {isReviewing ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                <span className="hidden sm:inline">Evaluasi</span>
              </Button>
            )}

            {/* New Conversation Button when ended */}
            {conversationEnded && (
              <Button
                size="sm"
                onClick={resetChat}
                className="rounded-xl gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
              >
                <MessageCircle size={14} />
                <span className="hidden sm:inline">Percakapan Baru</span>
              </Button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border text-xs overflow-hidden">
          <Badge variant={mode === 'live' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">
            {mode === 'live' ? '⚡ LIVE' : '💬 NORMAL'}
          </Badge>
          <span className="text-muted-foreground">|</span>
          <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
            <Hash size={10} /> {selectedTopic.emoji} {selectedTopic.label}
          </Badge>

          {/* Conversation progress */}
          {!conversationEnded && userMsgCount > 0 && (
            <>
              <div className="flex-1 hidden sm:flex items-center gap-2 min-w-0">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      turnsProgress > 0.75 ? 'bg-amber-500' : turnsProgress > 0.5 ? 'bg-teal-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${turnsProgress * 100}%` }}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-bold shrink-0',
                  turnsRemaining <= 5 ? 'text-amber-600' : 'text-muted-foreground'
                )}>
                  <Clock size={10} className="inline mr-0.5" />
                  {turnsRemaining} sisa
                </span>
              </div>
            </>
          )}

          <div className="flex-1" />

          {conversationEnded && (
            <div className="flex items-center gap-1.5 text-amber-600 font-semibold shrink-0">
              <AlertTriangle size={12} /> Percakapan Selesai
            </div>
          )}
          {aiSpeaking && (
            <div className="flex items-center gap-1.5 text-orange-500 font-semibold animate-pulse shrink-0">
              <Volume2 size={12} className="animate-bounce" /> AI Sedang Bicara...
            </div>
          )}
          {!aiSpeaking && isLoading && !conversationEnded && (
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold shrink-0">
              <Loader2 size={12} className="animate-spin" /> {isReviewing ? 'Membuat evaluasi...' : 'AI Berpikir...'}
            </div>
          )}
          {!aiSpeaking && !isLoading && !conversationEnded && messages.length > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold shrink-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-2.5 py-1 rounded-lg animate-gradient-shift">
              <Mic size={12} className="text-emerald-500" /> Giliran Anda
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden mt-3 min-h-0 border shadow-sm bg-gradient-to-b from-muted/20 to-card/30">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎌</div>
              <h3 className="text-lg font-bold text-muted-foreground">Mulai Percakapan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ketik atau gunakan mikrofon untuk berbicara dalam bahasa Jepang
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const parsed = parseKaiwaMessage(m.text);
            const isLast = i === messages.length - 1;
            const isSeparator = m.role === 'model' && m.text.startsWith('💬 ---');

            if (isSeparator) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-3 py-2"
                >
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-bold text-muted-foreground">{m.text.replace('💬 --- ', '').replace(' ---', '')}</span>
                  <div className="flex-1 h-px bg-border" />
                </motion.div>
              );
            }

            return (
              <div
                key={i}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20, y: 5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={cn(
                    'max-w-[88%] md:max-w-[80%] rounded-2xl p-3.5 md:p-4 relative group transition-all duration-200',
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-sm shadow-md shadow-teal-200/30'
                      : parsed.isFeedback
                        ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border border-amber-300/60 dark:border-amber-700/40 rounded-tl-sm shadow-md animate-glow-pulse-warm'
                        : 'bg-card border border-border/80 rounded-tl-sm shadow-sm hover:shadow-md',
                  )}>
                  {/* Speaker icon */}
                  <div className="flex items-center gap-2 mb-2">
                    {m.role === 'model' ? (
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shadow-sm',
                        parsed.isFeedback
                          ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500'
                          : 'bg-gradient-to-br from-teal-400 to-emerald-500'
                      )}>
                        <BrainCircuit size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-teal-800 flex items-center justify-center shadow-sm">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-widest',
                      m.role === 'model' ? (parsed.isFeedback ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground') : 'text-white/70'
                    )}>
                      {m.role === 'model' ? (parsed.isFeedback ? 'EVALUASI PERCAKAPAN' : 'GEMU AI') : 'ANDA'}
                    </span>
                    {parsed.isFeedback && (
                      <Badge className="ml-auto text-[9px] px-2 py-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 font-bold shadow-sm">
                        <Sparkles size={10} className="mr-1" /> FEEDBACK
                      </Badge>
                    )}
                  </div>

                  {/* Message Content */}
                  {m.role === 'model' && parsed.isFormatted && !parsed.isFeedback ? (
                    <div className="space-y-3">
                      <div
                        className="text-xl md:text-2xl font-bold leading-relaxed md:leading-loose pr-8 font-jp"
                      >
                        {parseFurigana(parsed.jp || '')}
                      </div>
                      <div className="space-y-1.5 p-3 bg-teal-50/80 dark:bg-teal-950/30 rounded-xl border border-teal-100/50">
                        <div className="text-sm font-semibold text-teal-700 tracking-wide border-l-2 border-teal-400 pl-3">
                          {parsed.ro}
                        </div>
                        <div className="text-[13px] text-muted-foreground border-l-2 border-muted pl-3">
                          {parsed.id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      'text-sm leading-relaxed whitespace-pre-wrap',
                      m.role === 'user' ? 'text-white' : 'text-foreground'
                    )}>
                      {parsed.isFeedback ? (
                        <div className="prose prose-sm max-w-none">
                          {m.text.split('\n').map((line, idx) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <h3 key={idx} className="font-bold text-base mt-3 first:mt-0">{line.replace(/\*\*/g, '')}</h3>;
                            }
                            if (line.startsWith('- ')) {
                              return <li key={idx} className="ml-4 mt-1">{line.substring(2)}</li>;
                            }
                            if (line.trim() === '') return <div key={idx} className="h-2" />;
                            return <p key={idx} className="mt-1">{line}</p>;
                          })}
                        </div>
                      ) : (
                        m.text
                      )}
                    </div>
                  )}

                  {/* Play/Stop button for AI messages (not feedback) */}
                  {m.role === 'model' && !parsed.isFeedback && !isSeparator && (
                    <button
                      onClick={() => handleSpeakButton(m.text)}
                      className={cn(
                        'absolute -right-2.5 -bottom-2.5 p-1.5 rounded-full shadow-sm transition-all',
                        aiSpeaking && isLast
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 scale-110'
                          : 'bg-teal-100 text-teal-700 hover:bg-teal-200 opacity-0 group-hover:opacity-100'
                      )}
                      title={aiSpeaking && isLast ? 'Berhenti bicara' : 'Putar ulang'}
                    >
                      {aiSpeaking && isLast ? <StopCircle size={14} /> : <Volume2 size={14} />}
                    </button>
                  )}
                </motion.div>
              </div>
            );
          })}

          {isLoading && !isReviewing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border/80 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm">
                    <Bot size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">GEMU AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">AI sedang mengetik...</span>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && isReviewing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={16} className="text-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold text-amber-700">Menganalisis percakapan...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 border-t bg-background/80 backdrop-blur-sm shrink-0">
          {!conversationEnded ? (
            <div className="flex gap-2 items-end">
              {/* Mic Button */}
              <button
                onClick={startListening}
                disabled={inputDisabled}
                className={cn(
                  'h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition-all border-2 shadow-sm',
                  isListening
                    ? 'bg-red-500 border-red-500 text-white animate-pulse animate-mic-pulse-glow'
                    : inputDisabled
                      ? 'bg-muted border-muted text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-card text-foreground hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 hover:shadow-teal-100'
                )}
                title={
                  inputDisabled
                    ? aiSpeaking ? 'AI sedang bicara...' : 'Menunggu respons...'
                    : isListening ? 'Klik untuk berhenti' : 'Klik untuk mulai bicara'
                }
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Textarea
                  rows={1}
                  placeholder={
                    aiSpeaking
                      ? '⏳ AI sedang bicara...'
                      : isListening
                        ? '🎤 Mendengarkan... (Klik mic untuk stop)'
                        : isLoading
                          ? '⏳ Menunggu respons AI...'
                          : 'Ketik pesan dalam bahasa Jepang...'
                  }
                  className={cn(
                    'resize-none min-h-[48px] max-h-[120px] rounded-2xl pr-3 text-sm transition-all duration-300',
                    inputDisabled && 'opacity-50 cursor-not-allowed bg-muted/50',
                    !inputDisabled && 'focus:animate-border-glow focus:shadow-sm focus:shadow-teal-100'
                  )}
                  value={input}
                  disabled={inputDisabled}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={() => sendMessage()}
                disabled={inputDisabled || !input.trim()}
                size="sm"
                className="h-12 w-12 shrink-0 rounded-2xl p-0 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
              >
                <Send size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 text-sm">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="font-semibold text-amber-700 dark:text-amber-400">Percakapan sudah berakhir. Cek evaluasi di atas!</span>
              </div>
              <Button
                size="sm"
                onClick={resetChat}
                className="rounded-xl gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Baru</span>
              </Button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
            {!conversationEnded && (
              <>Enter untuk kirim &middot; Shift+Enter untuk baris baru &middot; {selectedTopic.emoji} {selectedTopic.label} &middot; Maks {MAX_CONVERSATION_TURNS} giliran</>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
