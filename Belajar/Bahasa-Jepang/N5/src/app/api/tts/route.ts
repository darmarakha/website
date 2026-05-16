import { NextRequest, NextResponse } from 'next/server';

// Voice mapping for choukai/kaiwa speakers.
// Catatan: engine TTS dipanggil dari server supaya suara konsisten di semua device/browser.
const CHOUKAI_VOICES: Record<string, { voice: string; speed: number }> = {
  xiaochen: { voice: 'xiaochen', speed: 0.78 },
  tongtong: { voice: 'tongtong', speed: 0.8 },
  kazi: { voice: 'kazi', speed: 0.76 },
  douji: { voice: 'douji', speed: 0.78 },
  luodo: { voice: 'luodo', speed: 0.78 },
  jam: { voice: 'jam', speed: 0.78 },
};

// Default voice configs based on speaker type.
// Volume dibuat normal agar audio tidak pecah/terasa cempreng.
const SPEAKER_PRESETS: Record<string, { voice: string; speed: number; volume: number }> = {
  kaiwa: { voice: 'kazi', speed: 0.72, volume: 1.0 },
  kaiwa_live: { voice: 'kazi', speed: 0.82, volume: 1.0 },
  A: { voice: 'kazi', speed: 0.76, volume: 1.0 },
  B: { voice: 'kazi', speed: 0.72, volume: 1.0 },
  female: { voice: 'kazi', speed: 0.76, volume: 1.0 },
  male: { voice: 'kazi', speed: 0.72, volume: 1.0 },
  wanita: { voice: 'kazi', speed: 0.76, volume: 1.0 },
  pria: { voice: 'kazi', speed: 0.72, volume: 1.0 },
};

const MODE_SPEED: Record<string, number> = {
  normal: 0.72,
  live: 0.82,
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clampSpeed(value: unknown, fallback: number) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0.5, Math.min(1.25, numeric));
}

function stripForSpeech(text: string) {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

  return text
    .replace(emojiRegex, '')
    // Kanji[かな] -> かな supaya engine membaca Jepang, bukan menebak kanji.
    .replace(/([一-龯々]+)\[([ぁ-んァ-ンー]+)\]/g, '$2')
    .replace(/\[.*?\]/g, '')
    .replace(/[*#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate TTS with retry on rate limit (exponential backoff)
async function generateTTSWithRetry(
  zai: any,
  input: string,
  voice: string,
  speed: number,
  volume: number,
  maxRetries = 3,
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await zai.audio.tts.create({
        input,
        voice,
        speed,
        volume,
        response_format: 'wav',
        stream: false,
      });

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(new Uint8Array(arrayBuffer));
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || String(error);

      if (msg.includes('429') || msg.includes('Too many requests') || msg.includes('rate')) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 8000);
        console.warn(`TTS rate limited, retry ${attempt + 1}/${maxRetries}, waiting ${Math.round(waitTime)}ms...`);
        await sleep(waitTime);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('TTS failed after retries');
}

export async function POST(req: NextRequest) {
  try {
    const { text, speed, speaker, voice, mode = 'normal' } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = text.trim();
    if (cleanText.length > 1024) {
      return NextResponse.json({ error: 'Text exceeds maximum length of 1024 characters' }, { status: 400 });
    }

    const strippedText = stripForSpeech(cleanText);
    if (!strippedText) {
      return NextResponse.json({ error: 'No speakable text after cleaning' }, { status: 400 });
    }

    const modeSpeed = MODE_SPEED[String(mode)] ?? MODE_SPEED.normal;
    const presetKey = speaker === 'kaiwa' && mode === 'live' ? 'kaiwa_live' : speaker;
    const preset = presetKey ? SPEAKER_PRESETS[presetKey] : undefined;

    let finalVoice = 'kazi';
    let finalSpeed = modeSpeed;
    let finalVolume = 1.0;

    if (voice && CHOUKAI_VOICES[voice]) {
      const voicePreset = CHOUKAI_VOICES[voice];
      finalVoice = voicePreset.voice;
      finalSpeed = clampSpeed(speed, voicePreset.speed);
    } else if (preset) {
      finalVoice = preset.voice;
      finalSpeed = clampSpeed(speed, preset.speed);
      finalVolume = preset.volume;
    } else {
      finalSpeed = clampSpeed(speed, modeSpeed);
    }

    const zai = await (await import('@/lib/zai')).getZAI();
    const buffer = await generateTTSWithRetry(zai, strippedText, finalVoice, finalSpeed, finalVolume);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'X-Gemu-TTS-Voice': finalVoice,
        'X-Gemu-TTS-Speed': String(finalSpeed),
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate speech' },
      { status: 500 },
    );
  }
}
