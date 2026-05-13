'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send, Loader2, Bot, User, Sparkles, Trash2, Zap, BookOpen, HelpCircle, Lightbulb, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { VOCABULARY, GRAMMAR, speakJapanese } from '@/lib/n5-constants';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

const SUGGESTED_QUESTIONS = [
  { icon: BookOpen, text: 'Apa perbedaan wa dan ga?', color: 'text-teal-600' },
  { icon: HelpCircle, text: 'Bagaimana cara menghitung sampai 10?', color: 'text-amber-600' },
  { icon: Zap, text: 'Jelaskan bentuk ta-form', color: 'text-rose-600' },
  { icon: Lightbulb, text: '', color: 'text-purple-600' }, // dynamic
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function GemuAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Random word suggestion
  const randomWord = useMemo(() => {
    const word = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
    return `Apa arti kata "${word.word}" (${word.reading})?`;
  }, []);

  // Add dynamic suggestion
  const suggestions = useMemo(() => {
    return SUGGESTED_QUESTIONS.map(s =>
      s.text === '' ? { ...s, text: randomWord } : s
    );
  }, [randomWord]);

  // Welcome message
  const welcomeMessage: ChatMessage = useMemo(() => ({
    role: 'model',
    text: 'Hai! Aku GEMU AI, asisten belajar bahasa Jepangmu.\n\nKamu bisa tanya tentang:\n- Grammar / Tata bahasa\n- Kosakata & Kanji\n- Budaya Jepang\n- Tips belajar JLPT N5\n\nSilakan tanya apa saja atau pilih salah satu saran di bawah!',
    timestamp: formatTime(new Date()),
  }), []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msgText, timestamp: formatTime(new Date()) };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages([...newMessages, { role: 'model', text: data.response, timestamp: formatTime(new Date()) }]);
      } else {
        setMessages([...newMessages, { role: 'model', text: 'Maaf, terjadi kesalahan. Coba lagi ya!', timestamp: formatTime(new Date()) }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'model', text: 'Maaf, gagal menghubungi server. Coba lagi nanti!', timestamp: formatTime(new Date()) }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayMessages = messages.length > 0 ? messages : [welcomeMessage];

  // Typing dots animation
  const TypingIndicator = () => (
    <div className="flex gap-2 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <Bot size={14} className="text-white" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">GEMU AI sedang mengetik...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-220px)] min-h-[400px]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <MessageSquare className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gemu AI Chat</h2>
              <p className="text-xs text-muted-foreground">Tanya apa saja tentang bahasa Jepang</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-muted-foreground hover:text-rose-600 h-8 px-2 text-xs gap-1"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Hapus Chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Chat Card */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg">
        {/* Chat Header Bar */}
        <div className="border-b px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/10">
            <Bot size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">GEMU AI</p>
              <Sparkles size={12} className="text-yellow-300" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                loading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
              )} />
              <p className="text-[10px] text-teal-100">
                {loading ? 'Sedang mengetik...' : 'Online — Japanese Learning Assistant'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/15 text-white border-0 text-[10px] h-5">
            N5
          </Badge>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-2xl mx-auto">
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={cn('max-w-[80%] min-w-0', msg.role === 'user' && 'order-first')}>
                  {/* Message Bubble */}
                  <div className={cn(
                    'text-sm whitespace-pre-wrap leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm'
                      : 'bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm'
                  )}>
                    {msg.text}
                  </div>
                  {/* Timestamp */}
                  {msg.timestamp && (
                    <p className={cn(
                      'text-[10px] text-muted-foreground mt-1 px-1',
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    )}>
                      {msg.timestamp}
                    </p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Suggestion Chips (only when empty) */}
        {messages.length === 0 && !loading && (
          <div className="px-4 pb-2 shrink-0">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <Zap size={10} />
                Saran Pertanyaan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                      'hover:shadow-sm hover:-translate-y-0.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
                      'hover:border-teal-300 dark:hover:border-teal-700'
                    )}
                  >
                    <s.icon size={12} className={s.color} />
                    <span className="text-foreground/80">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-3 bg-muted/30 shrink-0">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Tanya tentang grammar, kosakata, kanji..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 pr-10 bg-background"
              />
            </div>
            <Button
              size="icon"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shrink-0 shadow-sm w-10 h-10 rounded-xl"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <ArrowUp size={16} />
              }
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            GEMU AI bisa salah. Selalu verifikasi informasi penting.
          </p>
        </div>
      </Card>
    </div>
  );
}
