import { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

export type ChoukaiMaterial = {
  title: string;
  scenario: string;
  emoji: string;
  dialogue: { speaker: string; text: string; ro: string; id: string }[];
  quiz: { question: string; options: string[]; answer: number; explanation: string };
};

export function createWavBlob(base64Pcm: string, sampleRate = 24000) {
  const binaryString = window.atob(base64Pcm);
  const pcmBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);   
  view.setUint16(20, 1, true);    
  view.setUint16(22, 1, true);    
  view.setUint32(24, sampleRate, true); 
  view.setUint32(28, sampleRate * 2, true); 
  view.setUint16(32, 2, true);    
  view.setUint16(34, 16, true);   
  writeString(view, 36, 'data');
  view.setUint32(40, pcmBytes.length, true);

  return new Blob([wavHeader, pcmBytes], { type: 'audio/wav' });
}

export function useChoukai() {
  const [material, setMaterial] = useState<ChoukaiMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateMaterial = async (topic?: string) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Buatkan materi Choukai (Listening) bahasa Jepang JLPT N5. 
Topik: ${topic || 'Acak (seperti perkenalan, di restoran, belanja, menanyakan jalan, atau ngobrol dengan teman)'}.
Buatlah dialognya LUWES, NATURAL, asik, jangan kaku seperti robot, seperti percakapan sungguhan di kehidupan sehari-hari (boleh sedikit ada unsur kasual jika sesuai konteks, atau desu/masu yang natural).
Buat dalam format JSON persis seperti ini:
{
  "title": "Judul Skenario",
  "scenario": "Deskripsi singkat situasi untuk pengguna. (Misal: Kamu sedang mengobrol dengan teman di kafe)",
  "emoji": "☕", // 1 emoji besar atau emoticon yang sangat merepresentasikan dan cocok dengan situasinya
  "dialogue": [
    { "speaker": "A", "text": "...", "ro": "...", "id": "..." },
    { "speaker": "B", "text": "...", "ro": "...", "id": "..." }
  ],
  "quiz": {
    "question": "Pertanyaan pemahaman dalam bahasa Indonesia berdasarkan dialog",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "answer": 0, // indeks jawaban benar (0-3)
    "explanation": "Penjelasan singkat mengapa jawaban tsb benar, dan beri sedikit info tambahan."
  }
}
Pastikan HANYA mengembalikan JSON valid, tanpa teks markdown atau blok kode lainnya. Dialognya sekitar 5-7 baris.
Pastikan juga untuk menyertakan furigana untuk kanji pada bagian "text" dengan format Kanji[hiragana] seperti 食べる -> 食[た]べる agar pengguna bisa mendengarkannya dengan benar dan parse nya sukses.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let responseText = response.text || '';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(responseText) as ChoukaiMaterial;
      setMaterial(data);
    } catch (error) {
      console.error('Gemini generate choukai error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { material, isLoading, generateMaterial };
}

