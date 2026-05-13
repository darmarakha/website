import { NextRequest, NextResponse } from 'next/server';

const KAIWA_SYSTEM_PROMPT = `Kamu GEMU AI, partner ngobrol bahasa Jepang level N5. HANYA gunakan grammar & kosakata JLPT N5. Topik: kehidupan sehari-hari (sapaan, makanan, belanja, cuaca, hobi, keluarga, sekolah, kerja).

Gaya: Natural, ramah, santai kayak teman. Pakai filler ("ano...", "ee...", "sou desu ne..."). Dorong user bicara lebih banyak.

FORMAT WAJIB (3 baris):
JP: [Bahasa Jepang. WAJIB Furigana: Kanji[hiragana]. TANPA emoji.]
RO: [Romaji]
ID: [Terjemahan Indonesia + Emoji. Emoji HANYA di baris ID.]

Contoh:
JP: 私[わたし]はコーヒーを飲[の]みます。
RO: Watashi wa koohii o nomimasu.
ID: Aku mau minum kopi nih! ☕️✨

KOREKSI:
- Minor: Koreksi singkat di ID, lanjut ngobrol.
- Major: Jawab normal dulu, catatan koreksi di ID.
- Sempurna: Pujian singkat di ID, lanjut.`;

// System prompt for ending conversation and giving feedback
const END_CONVERSATION_PROMPT = `Kamu GEMU AI, partner ngobrol bahasa Jepang level N5. Percakapan sudah berakhir.

SEKARANG tugasmu adalah MEMBERIKAN EVALUASI percakapan yang baru saja terjadi.

FORMAT EVALUASI (wajib):
**📝 EVALUASI PERCAKAPAN**

**✅ Yang Bagus:**
- [sebutkan 2-3 hal yang user lakukan dengan baik, misalnya penggunaan grammar yang benar, kosakata tepat, dll]

**❌ Yang Perlu Diperbaiki:**
- [sebutkan 2-3 kesalahan yang user buat. Untuk setiap kesalahan:
  - Tulis kalimat yang salah: "Salah: [kalimat user]"
  - Tulis yang benar: "Benar: [kalimat yang benar]"
  - Jelaskan singkat kenapa: "Karena: [penjelasan dalam bahasa Indonesia]"]

**💡 Tips:**
- [berikan 1-2 tips untuk meningkatkan bahasa Jepang user]

**⭐ Nilai Keseluruhan:** [A/B/C/D] ([penjelasan singkat])

Gunakan bahasa Indonesia yang santai dan ramah. Evaluasi harus spesifik berdasarkan percakapan yang terjadi.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, topic, endConversation } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const zai = await (await import('@/lib/zai')).getZAI();

    // Check if this is an end-of-conversation feedback request
    if (endConversation) {
      const feedbackMessages = [
        {
          role: 'assistant' as const,
          content: END_CONVERSATION_PROMPT,
        },
        {
          role: 'user' as const,
          content: `Berikut percakapan yang terjadi:\n\n${messages.map((m: { role: string; text: string }) => 
            `[${m.role === 'user' ? 'User' : 'AI'}]: ${m.text}`
          ).join('\n\n')}`,
        },
      ];

      const completion = await zai.chat.completions.create({
        messages: feedbackMessages,
        thinking: { type: 'disabled' },
      });

      const responseText = completion.choices?.[0]?.message?.content || '';

      if (!responseText) {
        return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
      }

      return NextResponse.json({ response: responseText, ended: true });
    }

    const topicContext = topic?.prompt
      ? `\nSKENARIO: ${topic.prompt} Mulai percakapan natural berdasarkan skenario ini.`
      : '';

    const liveModeContext = mode === 'live'
      ? '\nLIVE MODE: Balas cepat, singkat, 1-2 kalimat saja. Natural kayak ngobrol sungguhan.'
      : '';

    // Send last 10 messages for better context
    const recentMessages = messages.slice(-10);
    
    // Count user messages to determine conversation progress
    const userMsgCount = messages.filter((m: { role: string }) => m.role === 'user').length;
    
    // Add conversation progress context
    let progressContext = '';
    if (userMsgCount >= 15) {
      progressContext = `\nPENTING: Percakapan sudah ${userMsgCount} giliran user. Kamu HARUS mengakhiri percakapan ini dengan natural dalam 1-2 balasan berikutnya. Katakan perpisahan yang sopan (seperti "Ja, mata ne!" atau "Sayounara!"). JANGAN tambahkan EVALUASI, cukup akhiri percakapan saja.`;
    } else if (userMsgCount >= 10) {
      progressContext = `\nINFO: Percakapan sudah ${userMsgCount} giliran user. Mulai persiapkan untuk mengakhiri percakapan dalam beberapa balasan lagi.`;
    }

    const chatMessages = [
      {
        role: 'assistant' as const,
        content: KAIWA_SYSTEM_PROMPT + topicContext + liveModeContext + progressContext,
      },
      ...recentMessages.map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      })),
    ];

    // Use non-streaming for reliable response
    const completion = await zai.chat.completions.create({
      messages: chatMessages,
      thinking: { type: 'disabled' },
    });

    const responseText = completion.choices?.[0]?.message?.content || '';

    if (!responseText) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    // Check if AI is ending the conversation (goodbye phrases)
    const goodbyePhrases = ['じゃあ', 'さようなら', 'またね', 'じゃあね', 'また会いましょう', 'バイバイ', 'また明日', 'おやすみ', 'お疲れ様'];
    const isEnding = goodbyePhrases.some(phrase => responseText.toLowerCase().includes(phrase));

    return NextResponse.json({ 
      response: responseText,
      ended: isEnding,
      userMsgCount,
    });
  } catch (error) {
    console.error('Kaiwa chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response' },
      { status: 500 }
    );
  }
}
