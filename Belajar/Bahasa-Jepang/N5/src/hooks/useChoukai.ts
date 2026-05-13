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
    setMaterial(null); // Reset material to avoid showing old one
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in environment');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Buatkan materi Choukai (Listening) bahasa Jepang JLPT N5. 
Topik: ${topic || 'Acak (perkenalan, belanja, di restoran, atau menanyakan jalan)'}.
Skenario harus SANGAT MENARIK dan memberikan gambaran visual yang kuat.

PENTING: 
1. Gunakan banyak emoji (🌸, 🍱, 🚂, 🏮, dsb) di setiap bagian: judul, skenario, dan ID terjemahan.
2. Dialog harus LUWES dan NATURAL (gunakan ekspresi seperti 'ano...', 'ee...', 'sou desu ne').
3. Gunakan format Kanji[hiragana] untuk SEMUA kanji pada bagian "text".

Format JSON:
{
  "title": "Judul (tambah emoji)",
  "scenario": "Deskripsi situasi (tambah emoji)",
  "emoji": "Emoji utama skenario", 
  "dialogue": [
    { "speaker": "A", "text": "私[わたし]は... (Kanji[hiragana] format)", "ro": "Romaji", "id": "Arti (tambah emoji)" }
  ],
  "quiz": {
    "question": "Pertanyaan pemahaman",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "answer": 0, 
    "explanation": "Penjelasan kenapa benar (tambah emoji)"
  }
}
Hanya kembalikan JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const rawText = response.text;
      
      // Robust JSON extraction
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      const cleanJson = jsonMatch[0].trim();
      const data = JSON.parse(cleanJson) as ChoukaiMaterial;
      
      if (!data.dialogue || !data.quiz) throw new Error("Incomplete material data");
      
      setMaterial(data);
    } catch (error) {
      console.error('Gemini generate choukai error:', error);
      // Fallback or empty state handled by material being null
    } finally {
      setIsLoading(false);
    }
  };

  return { material, isLoading, generateMaterial };
}

