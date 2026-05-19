import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Message } from '../types';
import { encodePCM16 } from '../lib/audioUtils';
import { createWavBlob } from './useChoukai';

export function useKaiwa() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'JP: おはようございます！今日[きょう]はどんな話[はなし]をしますか？\nRO: Ohayou gozaimasu! Kyou wa donna hanashi o shimasu ka?\nID: Selamat pagi! Hari ini kita mau ngobrol apa? 🌅';
    } else if (hour >= 12 && hour < 18) {
      return 'JP: こんにちは！今日[きょう]は何[なに]について話[はな]しましょうか？\nRO: Konnichiwa! Kyou wa nani ni tsuite hanashimashou ka?\nID: Halo! Hari ini kita mau ngobrol tentang apa? ✨';
    } else {
      return 'JP: こんばんは！今日[きょう]はどんな一日[いちにち]でしたか？\nRO: Konbanwa! Kyou wa donna ichinichi deshita ka?\nID: Selamat malam! Gimana hari ini? 🌙';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: getGreeting() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // Real-time audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); // The live session
  const currentSourcesRef = useRef<AudioBufferSourceNode[]>([]); // Track active buffers

  // Audio playback queue
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const nextPlayTimeRef = useRef<number>(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const sysInstruction = `Anda adalah AI partner Kaiwa (Latihan Percakapan Bahasa Jepang level N5-N4) yang SANGAT NATURAL, asik, ramah, santai, dan seperti teman ngobrol. PENTING: Untuk Mode Live, HARAP SELALU MULAI KALIMAT DENGAN BAHASA JEPANG, lalu di ikuti terjemahannya (Format 3 baris: JP, RO, ID tetap diutamakan atau langsung berbicara secara natural bahasa Jepang diselingi bahasa Indonesia jika ditanya). Usahakan selalu membalas suara pengguna dengan ramah. PENTING: Sertakan tag 'JP: ... RO: ... ID: ...' pada text keluaran agar bisa dirender dengan benar.`;

  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    setAiSpeaking(true);
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    while (audioQueueRef.current.length > 0) {
      const base64Audio = audioQueueRef.current.shift();
      if (!base64Audio) continue;
      
      try {
        const audioData = atob(base64Audio);
        const bytes = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
           bytes[i] = audioData.charCodeAt(i);
        }
        
        // 16-bit PCM to Float32
        const dataArray = new Int16Array(bytes.buffer);
        const floatArray = new Float32Array(dataArray.length);
        for (let i = 0; i < dataArray.length; i++) {
           floatArray[i] = dataArray[i] / 32768.0;
        }

        const buffer = ctx.createBuffer(1, floatArray.length, 24000);
        buffer.getChannelData(0).set(floatArray);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        currentSourcesRef.current.push(source);

        if (nextPlayTimeRef.current < ctx.currentTime) {
           nextPlayTimeRef.current = ctx.currentTime + 0.05; // add tiny buffer
        }

        source.start(nextPlayTimeRef.current);
        const duration = buffer.duration;
        nextPlayTimeRef.current += duration;
        
        // We await the chunk duration to avoid exhausting the event loop
        // But we want to keep processing rapidly if queue is long
        // So we yield just a tick to pull more data
        await new Promise(resolve => setTimeout(resolve, 5));
        
        // Keep tracking until the last chunk ends
        source.onended = () => {
           currentSourcesRef.current = currentSourcesRef.current.filter(s => s !== source);
           if (audioQueueRef.current.length === 0 && ctx.currentTime >= nextPlayTimeRef.current - 0.1) {
              setAiSpeaking(false);
              isPlayingRef.current = false;
           }
        };
      } catch (err) {
        console.error("Playback error:", err);
      }
    }
  }, []);

  const connectLive = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      if (audioContext.state === 'suspended') {
          await audioContext.resume();
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      audioInputRef.current = source;
      
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction: sysInstruction,
        },
        callbacks: {
           onopen: () => {
             setIsLiveActive(true);
             setIsLoading(false);
             
             processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const base64Pcm = encodePCM16(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                     audio: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
             };
             source.connect(processor);
             processor.connect(audioContext.destination);
           },
           onmessage: (msg: LiveServerMessage) => {
             // Handle transcription (model + user). The transcription is automatically part of standard models turn text
             // We can extract text if it exists
             
             const textPart = msg.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
             if (textPart) {
                // If there's text streaming, we could update messages if desired
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.role === 'model' && last.text !== getGreeting()) {
                       // Update last message
                       const newMsg = { ...last, text: last.text + textPart };
                       return [...prev.slice(0, -1), newMsg];
                    } else {
                       return [...prev, { role: 'model', text: textPart }];
                    }
                });
             }

             // Handle audio out
             const base64Audio = msg.serverContent?.modelTurn?.parts?.find(p => p.inlineData?.mimeType?.startsWith('audio/'))?.inlineData?.data;
             if (base64Audio) {
                audioQueueRef.current.push(base64Audio);
                processAudioQueue();
             }
             
             if (msg.serverContent?.interrupted) {
                // User interrupted: clear queue and stop current audio
                audioQueueRef.current = [];
                currentSourcesRef.current.forEach(s => {
                   try { s.stop(); } catch(e) {}
                });
                currentSourcesRef.current = [];
                nextPlayTimeRef.current = 0;
                
                if (currentAudioRef.current) {
                  currentAudioRef.current.pause();
                  currentAudioRef.current.currentTime = 0;
                }
                isPlayingRef.current = false;
                setAiSpeaking(false);
             }
           },
           onclose: () => {
             disconnectLive();
           },
           onerror: (err) => {
             console.error("Live API Error:", err);
             disconnectLive();
           }
        }
      });
      sessionRef.current = sessionPromise;
      
    } catch(err) {
      console.error("Error setting up live api:", err);
      setIsLoading(false);
    }
  };

  const disconnectLive = () => {
    setIsLiveActive(false);
    if (processorRef.current) {
       processorRef.current.disconnect();
       processorRef.current = null;
    }
    if (audioInputRef.current) {
       audioInputRef.current.disconnect();
       audioInputRef.current = null;
    }
    if (streamRef.current) {
       streamRef.current.getTracks().forEach(t => t.stop());
       streamRef.current = null;
    }
    if (audioContextRef.current) {
       audioContextRef.current.close().catch(console.error);
       audioContextRef.current = null;
    }
    if (sessionRef.current) {
       sessionRef.current.then((session: any) => session.close()).catch(console.error);
       sessionRef.current = null;
    }
    audioQueueRef.current = [];
    currentSourcesRef.current.forEach(s => {
       try { s.stop(); } catch(e) {}
    });
    currentSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    
    if (currentAudioRef.current) {
        currentAudioRef.current.pause();
    }
    isPlayingRef.current = false;
    setAiSpeaking(false);
    setIsLoading(false);
  };

  // Fallback / standard send text with streaming and chunked TTS
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

      const sysInst = sysInstruction + `
=== MODE 1: PERCAKAPAN JEPANG ===
Gunakan mode ini untuk ngobrol biasa (pengguna merespons dengan tata bahasa yang benar/minor kesalahannya).
WAJIB membalas dengan format 3 baris dengan awalan (prefix) yang sama persis seperti ini:
JP: [Teks Bahasa Jepang MURNI. Untuk setiap Kanji, WAJIB beri cara bacanya dalam kurung siku dengan format Kanji[hiragana], contoh: 私[わたし]は 日本語[にほんご]を 勉強[べんきょう]します。]
RO: [Teks Romaji / Latin dari kalimat Jepang di atas]
ID: [Terjemahan Bahasa Indonesia + Emoji]

=== MODE 2: KOREKSI SINGKAT & PENJELASAN SANTAI (INDONESIA) ===
Gunakan mode ini JIKA DAN HANYA JIKA pengguna melakukan KESALAHAN FATAL dalam tata bahasa, salah partikel krusial, atau konteksnya aneh.
- LANGSUNG HENTIKAN percakapan Jepang. Balas dengan FULL Bahasa Indonesia yang santai.
- JANGAN PANJANG-PANJANG! Maksimal 2-3 kalimat santai.
- JANGAN gunakan format JP/RO/ID di mode ini.`;

      const chat = ai.chats.create({
         model: "gemini-2.5-flash",
         config: {
           systemInstruction: sysInst,
         },
         history: history
      });

      const responseStream = await chat.sendMessageStream({ message: text });
      
      let fullBotText = '';
      let sentencesBuffer = '';
      let isFirstSentence = true;

      // Add a placeholder message for the bot
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      setIsLoading(false); // Can unset loading since we are streaming now
      
      const playSentenceTTS = async (sentence: string) => {
         try {
             // Clean up sentence for speech (remove romaji, ID, and furigana brackets)
             if (sentence.includes('RO:') || sentence.includes('ID:')) return;
             const cleanJp = sentence.replace(/JP:\s*/, '').replace(/\[.*?\]/g, '').replace(/[*#]/g, '').trim();
             if (!cleanJp) return;

             // Try ElevenLabs backend route
             let base64Audio = null;
             
             try {
                 const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: cleanJp })
                 });
                 if (res.ok) {
                     const data = await res.json();
                     base64Audio = data.base64; // We should make api/tts return base64 for ease of queuing!
                 }
             } catch(err) {
                 // Ignore standard fetch failures to safely fallthrough
                 console.warn("ElevenLabs backend failed or is not available, falling back to Gemini TTS");
             }

             if (!base64Audio) {
                 // Fallback to Gemini TTS
                 const audioRes = await ai.models.generateContent({
                     model: "gemini-3.1-flash-tts-preview",
                     contents: [{ parts: [{ text: cleanJp }] }],
                     config: {
                         responseModalities: ["AUDIO"],
                         speechConfig: {
                             voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
                         }
                     }
                 });
                 const audioPart = audioRes.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
                 if (audioPart) {
                     base64Audio = audioPart.inlineData.data;
                 }
             }

             if (base64Audio) {
                 audioQueueRef.current.push(base64Audio);
                 processAudioQueue();
             }
         } catch(e) {
             console.error("Audio trigger error", e);
         }
      };

      for await (const chunk of responseStream) {
         if (chunk.text) {
             fullBotText += chunk.text;
             sentencesBuffer += chunk.text;
             
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = fullBotText;
                return newMessages;
             });

             // Simple sentence boundary detection (split on Japanese punctuation or newline)
             // We want to extract and speak 'JP: ...' line specifically
             const jpMatch = sentencesBuffer.match(/JP:\s*(.*?[。！？\n])/);
             const endIdx = sentencesBuffer.search(/[。！？\n]/);
             
             if (jpMatch && jpMatch[1]) {
                 const sentenceToSpeak = jpMatch[0];
                 sentencesBuffer = sentencesBuffer.substring(jpMatch.index! + jpMatch[0].length);
                 playSentenceTTS(sentenceToSpeak);
             } else if (sentencesBuffer.includes('\n') && !sentencesBuffer.includes('JP:')) {
                 // Clear out non-JP text lines from buffer
                 const nextNewline = sentencesBuffer.indexOf('\n');
                 sentencesBuffer = sentencesBuffer.substring(nextNewline + 1);
             }
         }
      }
      
      // If any lingering JP text doesn't end in punctuation
      if (sentencesBuffer.includes('JP:')) {
          const jpMatch = sentencesBuffer.match(/JP:\s*(.*)/);
          if (jpMatch && jpMatch[1].trim()) {
              playSentenceTTS(jpMatch[0]);
          }
      }

    } catch (error) {
      console.error('Gemini error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'エラーが発生しました。(Terjadi kesalahan jaringan.)' }]);
      setIsLoading(false);
    }
  };

  const getFeedback = async () => {
    setIsLoading(true);
    try {
       const userMessages = messages.filter(m => m.role === 'user').map((m, i) => `${i + 1}. ${m.text}`).join('\n');
       if (!userMessages.trim()) {
           setMessages(prev => [...prev, { role: 'model', text: 'Belum ada percakapan untuk dievaluasi nih. Ngobrol dulu yuk!' }]);
           setIsLoading(false);
           return;
       }
       
       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
       const prompt = `Tolong evaluasi percakapan bahasa Jepang saya sejauh ini. Ini adalah kalimat-kalimat yang tadi saya ucapkan:\n${userMessages}\n\nBerikan feedback ringkas dan terstruktur dalam bahasa Indonesia: apa yang sudah bagus, letak kesalahan tata bahasa/diksi (jika ada) dan bagaimana kalimat yang benar (sertakan romaji), serta apa yang harus saya latih lagi di level N5. Sertakan pujian dan semangat juga!`;

       const chat = ai.chats.create({
         model: "gemini-2.5-flash",
         config: {
           systemInstruction: "Anda adalah instruktur bahasa Jepang (Yuki Sensei) yang memberikan ulasan belajar Kaiwa. Berikan respons dalam bahasa Indonesia yang ramah, konstruktif, dan memotivasi."
         }
       });
       const response = await chat.sendMessage({ message: prompt });
       setMessages(prev => [...prev, { role: 'model', text: '📋 **EVALUASI KAIWA** 📋\n\n' + response.text }]);
    } catch (error) {
       console.error('Gemini error:', error);
       setMessages(prev => [...prev, { role: 'model', text: 'Maaf, gagal memuat evaluasi. Coba lagi nanti ya!' }]);
    } finally {
       setIsLoading(false);
    }
  };

  return { messages, sendMessage, getFeedback, isLoading, isLiveActive, connectLive, disconnectLive, aiSpeaking, currentAudioRef };
}
