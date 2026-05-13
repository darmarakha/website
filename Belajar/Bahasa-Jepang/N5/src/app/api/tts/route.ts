import { NextRequest, NextResponse } from 'next/server';

// Voice mapping for choukai speakers
const CHOUKAI_VOICES: Record<string, { voice: string; speed: number }> = {
  'xiaochen': { voice: 'xiaochen', speed: 0.85 },     // 沉稳专业 (calm, professional) - BEST for female Japanese
  'tongtong': { voice: 'tongtong', speed: 0.9 },        // 温暖亲切 (warm, friendly)
  'kazi': { voice: 'kazi', speed: 0.85 },              // 清晰标准 (clear, standard) - BEST for male Japanese
  'douji': { voice: 'douji', speed: 0.85 },            // 自然流畅 (natural, fluent)
  'luodo': { voice: 'luodo', speed: 0.85 },            // 富有感染力 (expressive)
  'jam': { voice: 'jam', speed: 0.85 },                // 英音绅士 (British gentleman)
};

// Default voice configs based on speaker type
const SPEAKER_PRESETS: Record<string, { voice: string; speed: number; volume: number }> = {
  'A': { voice: 'kazi', speed: 0.9, volume: 3.0 },      // Speaker A = female = clear standard, higher volume
  'B': { voice: 'kazi', speed: 0.85, volume: 3.0 },     // Speaker B = male = clear standard, deeper pitch via speed
  'female': { voice: 'kazi', speed: 0.9, volume: 3.0 },
  'male': { voice: 'kazi', speed: 0.85, volume: 3.0 },
  'wanita': { voice: 'kazi', speed: 0.9, volume: 3.0 },
  'pria': { voice: 'kazi', speed: 0.85, volume: 3.0 },
};

// Sleep utility
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate TTS with retry on rate limit (exponential backoff)
async function generateTTSWithRetry(zai: any, input: string, voice: string, speed: number, volume: number, maxRetries = 3): Promise<Buffer> {
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

      // Only retry on rate limit (429) or network errors
      if (msg.includes('429') || msg.includes('Too many requests') || msg.includes('rate')) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 8000);
        console.warn(`TTS rate limited, retry ${attempt + 1}/${maxRetries}, waiting ${Math.round(waitTime)}ms...`);
        await sleep(waitTime);
        continue;
      }

      // Non-retryable error - throw immediately
      throw error;
    }
  }

  throw lastError || new Error('TTS failed after retries');
}

export async function POST(req: NextRequest) {
  try {
    const { text, speed = 0.9, speaker, voice } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = text.trim();
    if (cleanText.length > 1024) {
      return NextResponse.json({ error: 'Text exceeds maximum length of 1024 characters' }, { status: 400 });
    }

    const zai = await (await import('@/lib/zai')).getZAI();

    // Strip emoji/emoticons from text before TTS
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;
    let strippedText = cleanText.replace(emojiRegex, '');

    // CRITICAL: Convert Kanji[furigana] to furigana reading only
    // Chinese TTS voices would read kanji with Chinese pronunciation, so we must
    // convert to hiragana/katakana readings for correct Japanese pronunciation
    strippedText = strippedText.replace(/([一-龯々]+)\[([ぁ-んァ-ンー]+)\]/g, '$2');

    // Remove any remaining brackets and markdown
    strippedText = strippedText.replace(/\[.*?\]/g, '').replace(/[*#]/g, '').trim();

    if (!strippedText) {
      return NextResponse.json({ error: 'No speakable text after cleaning' }, { status: 400 });
    }

    // Default voice: kazi (清晰标准) - clear and standard, works best for Japanese hiragana
    let finalVoice = 'kazi';
    let finalSpeed = Math.max(0.5, Math.min(2.0, speed));
    let finalVolume = 1.0;

    if (voice && CHOUKAI_VOICES[voice]) {
      finalVoice = CHOUKAI_VOICES[voice].voice;
      finalSpeed = Math.max(0.5, Math.min(2.0, speed || CHOUKAI_VOICES[voice].speed));
    } else if (speaker && SPEAKER_PRESETS[speaker]) {
      const preset = SPEAKER_PRESETS[speaker];
      finalVoice = preset.voice;
      finalSpeed = Math.max(0.5, Math.min(2.0, speed || preset.speed));
      finalVolume = preset.volume;
    }

    const buffer = await generateTTSWithRetry(zai, strippedText, finalVoice, finalSpeed, finalVolume);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
