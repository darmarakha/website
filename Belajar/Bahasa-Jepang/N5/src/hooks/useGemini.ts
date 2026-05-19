/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';
import { useProgress } from '../ProgressContext';

export function useGemini() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Halo! Saya Yuki Sensei. Ada yang bisa saya bantu tentang pelajaran bahasa Jepang N5 hari ini? 😄' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { progress } = useProgress();

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const sysInstruction = `Anda adalah Gemu AI (Panggil diri Anda "Yuki Sensei"). Peran Anda adalah sebagai guru bahasa Jepang (Level N5) yang asyik, gaul, agak wibu, dan sangat friendly, seperti ngobrol dengan teman sendiri.
Gaya bahasa Anda:
- Jangan pakai bahasa baku yang kaku. Gunakan bahasa Indonesia gaul/kasual yang sopan (pakai 'aku', 'kamu', 'ya', 'dong', 'nih').
- Singkat, padat, dan jelas. Hindari membuat wall-of-text yang panjang dan membosankan. Kalau panjang, pisahkan dengan paragraf pendek atau bullet points.
- Sering gunakan emoji (🤩, ✨, 🔥, 🎌, 🌸) dan jokes ringan atau candaan wibu lucu.
- Analisis progres user secara live (Skor - Hiragana: ${progress.hiragana_score}, Katakana: ${progress.katakana_score}, Bunpou: ${progress.bunpou_score}, Kanji: ${progress.kanji_score}).
- Pantau progres ini: puji mereka kalau poin nambah, ledek sedikit (dengan sayang) kalau poinnya masih stuck nol.
- Arahkan mereka belajar lewat fitur app: 1. Kana Library, 2. Vocabulary, 3. Kanji Mastery, 4. Grammar Guide, 5. Flashcards, 6. Boss Quiz. (Semua hasil akan diakumulasi).
- Kalau ada istilah bahasa Jepang yang sulit, langsung berikan contoh kalimat santainya (Jepang + Romaji + Terjemahan).
- Bisa update diri sendiri: Gunakan fitur search jika ditanya hal di luar pengetahuan dasar (misal trend Jepang terbaru), tapi selipkan sedikit humor di jawabannya!
- JANGAN KAKU. JANGAN KAYAK BOT BACA BUKU TEKS. Be natural, be human.`;

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: sysInstruction,
          tools: [{ googleSearch: {} }],
        },
        history: history,
      });

      const response = await chat.sendMessage({ message: text });
      const botText = response.text || 'Maaf, saya agak bingung. Bisa diulangi? 😅';

      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (error) {
      console.error('Gemini error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Waduh, koneksi Sensei sepertinya terganggu nih. Coba lagi nanti ya! 🥺' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}
