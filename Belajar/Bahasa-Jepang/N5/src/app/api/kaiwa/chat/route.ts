import { NextRequest, NextResponse } from 'next/server';

interface KaiwaMessage {
  role: 'user' | 'model' | 'assistant';
  text: string;
}

interface KaiwaTopic {
  id?: string;
  label?: string;
  emoji?: string;
  prompt?: string;
}

interface KaiwaRequestBody {
  messages?: KaiwaMessage[];
  mode?: 'normal' | 'live';
  topic?: KaiwaTopic;
  endConversation?: boolean;
}

type ZaiRole = 'user' | 'assistant';

interface ZaiMessage {
  role: ZaiRole;
  content: string;
}

const MAX_CONTEXT_MESSAGES = 14;
const MAX_MESSAGE_LENGTH = 900;
const MAX_REVIEW_MESSAGES = 40;
const MAX_CONVERSATION_TURNS = 20;

const TOPIC_GUIDES: Record<string, string> = {
  free: 'Ngobrol bebas, tetapi tetap arahkan ke tema harian sederhana agar pemula tidak bingung.',
  restaurant: 'Perankan staf restoran Jepang. Latih ungkapan pesan makanan, minuman, jumlah, harga, dan rasa.',
  shopping: 'Perankan penjaga toko. Latih harga, warna, ukuran, pilihan barang, dan ungkapan membeli.',
  direction: 'Perankan orang lokal yang membantu arah. Latih kanan, kiri, lurus, dekat, jauh, stasiun, sekolah, dan toko.',
  introduction: 'Perankan teman baru. Latih nama, asal, umur seperlunya, pekerjaan/sekolah, hobi, dan salam.',
  hobby: 'Perankan teman santai. Latih hobi, frekuensi, suka/tidak suka, dan ajakan sederhana.',
  weather: 'Perankan teman yang membahas cuaca. Latih hari ini, panas, dingin, hujan, cerah, dan rencana aktivitas.',
  phone: 'Perankan teman yang menelepon. Latih membuka telepon, membuat janji, waktu, tempat, dan konfirmasi.',
  school: 'Perankan teman sekelas. Latih pelajaran, tugas, buku, guru, kelas, jadwal, dan pertanyaan sederhana.',
  travel: 'Perankan teman perjalanan. Latih tempat wisata, transportasi, waktu, tiket, hotel, dan rencana sederhana.',
};

const FALLBACK_BY_TOPIC: Record<string, { jp: string; ro: string; id: string }> = {
  restaurant: {
    jp: 'そうですね。水[みず]を一[ひと]つください。あなたは何[なに]を食[た]べますか？',
    ro: 'Sou desu ne. Mizu o hitotsu kudasai. Anata wa nani o tabemasu ka?',
    id: 'Baik. Tolong satu air. Kamu mau makan apa? 🍽️',
  },
  shopping: {
    jp: 'いいですね。これはいくらですか？あなたは何[なに]を買[か]いますか？',
    ro: 'Ii desu ne. Kore wa ikura desu ka? Anata wa nani o kaimasu ka?',
    id: 'Oke. Ini berapa harganya? Kamu mau beli apa? 🛒',
  },
  direction: {
    jp: '駅[えき]は近[ちか]いです。まっすぐ行[い]ってください。どこへ行[い]きますか？',
    ro: 'Eki wa chikai desu. Massugu itte kudasai. Doko e ikimasu ka?',
    id: 'Stasiunnya dekat. Silakan jalan lurus. Kamu mau pergi ke mana? 🗺️',
  },
  introduction: {
    jp: 'はじめまして。私[わたし]はゲムです。あなたの名前[なまえ]は何[なん]ですか？',
    ro: 'Hajimemashite. Watashi wa Gemu desu. Anata no namae wa nan desu ka?',
    id: 'Salam kenal. Aku Gemu. Nama kamu siapa? 👋',
  },
  hobby: {
    jp: 'いいですね。私[わたし]は音楽[おんがく]が好[す]きです。あなたの趣味[しゅみ]は何[なん]ですか？',
    ro: 'Ii desu ne. Watashi wa ongaku ga suki desu. Anata no shumi wa nan desu ka?',
    id: 'Bagus. Aku suka musik. Hobi kamu apa? ⚽',
  },
  weather: {
    jp: '今日[きょう]はいい天気[てんき]ですね。あなたの町[まち]は暑[あつ]いですか？',
    ro: 'Kyou wa ii tenki desu ne. Anata no machi wa atsui desu ka?',
    id: 'Hari ini cuacanya bagus ya. Di kotamu panas? ☀️',
  },
  phone: {
    jp: 'もしもし。今[いま]、大丈夫[だいじょうぶ]ですか？今日[きょう]会[あ]いますか？',
    ro: 'Moshi moshi. Ima, daijoubu desu ka? Kyou aimasu ka?',
    id: 'Halo. Sekarang bisa bicara? Hari ini kita bertemu? 📞',
  },
  school: {
    jp: '今日[きょう]の授業[じゅぎょう]は日本語[にほんご]です。宿題[しゅくだい]はありますか？',
    ro: 'Kyou no jugyou wa nihongo desu. Shukudai wa arimasu ka?',
    id: 'Pelajaran hari ini bahasa Jepang. Ada PR? 🏫',
  },
  travel: {
    jp: '旅行[りょこう]は楽[たの]しいですね。どこへ行[い]きたいですか？',
    ro: 'Ryokou wa tanoshii desu ne. Doko e ikitai desu ka?',
    id: 'Liburan itu seru ya. Kamu ingin pergi ke mana? ✈️',
  },
  free: {
    jp: 'そうですね。今日[きょう]は何[なに]をしましたか？ゆっくり話[はな]しましょう。',
    ro: 'Sou desu ne. Kyou wa nani o shimashita ka? Yukkuri hanashimashou.',
    id: 'Oke. Hari ini kamu melakukan apa? Kita ngobrol pelan-pelan ya 🌟',
  },
};

const BASE_KAIWA_PROMPT = `Kamu adalah GEMU AI, partner kaiwa bahasa Jepang untuk pemula sampai N5.
Tugas utama: membuat percakapan terasa natural, tidak kaku, tetapi tetap aman untuk level N5.

ATURAN LEVEL:
- Gunakan pola JLPT N5: です/ます, ますか, ませんか, たいです, があります/います, 好きです, から, そして, でも, で/に/へ/を/は/が.
- Jangan gunakan grammar N4 ke atas kecuali user memakainya dulu. Jika terpaksa, jelaskan singkat di ID.
- Kosakata harus harian: sapaan, keluarga, makanan, sekolah, toko, cuaca, hobi, arah, waktu, angka sederhana.

ATURAN NATURAL:
- Jangan seperti robot ujian. Jawab seperti teman belajar yang ramah.
- Jangan ulang pembuka yang sama terus.
- Tanggapi isi user dulu, lalu dorong percakapan dengan SATU pertanyaan balik.
- Kalau user menjawab pendek, bantu dengan pilihan contoh sederhana.
- Kalau user memakai bahasa Indonesia/romaji, tetap lanjutkan percakapan dan beri jembatan di ID.
- Gunakan filler Jepang secukupnya: そうですね, ええ, いいですね, なるほど. Jangan berlebihan.

FORMAT OUTPUT WAJIB PERSIS 3 BARIS:
JP: [1 sampai 2 kalimat Jepang. Kanji WAJIB diberi furigana dengan format Kanji[hiragana]. TANPA emoji.]
RO: [romaji dari baris JP]
ID: [terjemahan Indonesia natural + koreksi singkat bila perlu + emoji]

KOREKSI:
- Jangan memotong alur percakapan hanya untuk mengoreksi.
- Jika salah kecil, masukkan koreksi sangat singkat di baris ID.
- Jika salah besar, jawab dulu dalam JP, lalu di ID tulis: Catatan: ...
- Jika user benar, beri pujian singkat di ID.

LARANGAN:
- Jangan membuat evaluasi panjang saat belum diminta endConversation.
- Jangan keluar dari format JP/RO/ID.
- Jangan menulis emoji di JP atau RO.
- Jangan menulis markdown tabel.
- Jangan menyuruh user menunggu.`;

const END_CONVERSATION_PROMPT = `Kamu adalah GEMU AI, tutor kaiwa JLPT N5. Percakapan sudah selesai.

Buat evaluasi berdasarkan percakapan yang benar-benar terjadi. Jangan mengarang kesalahan yang tidak ada.

FORMAT WAJIB:
**📝 EVALUASI PERCAKAPAN**

**✅ Yang Bagus:**
- [2 sampai 3 poin spesifik dari jawaban user]

**🛠️ Yang Perlu Diperbaiki:**
- Salah: [kutip singkat kalimat user]
  Benar: [versi Jepang yang benar + romaji]
  Karena: [alasan singkat dalam bahasa Indonesia]

**💬 Frasa Natural yang Bisa Dipakai:**
- [3 frasa N5 yang cocok dengan topik percakapan, sertakan romaji dan arti]

**🎯 Latihan Berikutnya:**
- [1 sampai 2 latihan kecil yang konkret]

**⭐ Nilai Keseluruhan:** [A/B/C/D] - [alasan singkat]

Gunakan bahasa Indonesia yang santai, jelas, dan mendukung.`;

function sanitizeText(value: unknown, maxLength = MAX_MESSAGE_LENGTH): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\u0000/g, '')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, maxLength);
}

function normalizeMessages(input: unknown): KaiwaMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((message): KaiwaMessage | null => {
      if (!message || typeof message !== 'object') return null;
      const raw = message as Partial<KaiwaMessage>;
      const role = raw.role === 'user' ? 'user' : raw.role === 'model' || raw.role === 'assistant' ? 'model' : null;
      const text = sanitizeText(raw.text);
      if (!role || !text) return null;
      return { role, text };
    })
    .filter((message): message is KaiwaMessage => Boolean(message));
}

function normalizeTopic(topic: unknown): KaiwaTopic {
  if (!topic || typeof topic !== 'object') return { id: 'free', label: 'Bebas', prompt: TOPIC_GUIDES.free };
  const raw = topic as KaiwaTopic;
  const id = sanitizeText(raw.id, 40) || 'free';
  const label = sanitizeText(raw.label, 60) || 'Bebas';
  const prompt = sanitizeText(raw.prompt, 180) || TOPIC_GUIDES[id] || TOPIC_GUIDES.free;
  const emoji = sanitizeText(raw.emoji, 8);
  return { id, label, prompt, emoji };
}

function getUserMessageCount(messages: KaiwaMessage[]): number {
  return messages.filter(message => message.role === 'user').length;
}

function getConversationPhase(userMessageCount: number): string {
  if (userMessageCount <= 2) {
    return 'FASE AWAL: buat user nyaman. Gunakan pertanyaan pendek dan konkret.';
  }
  if (userMessageCount <= 8) {
    return 'FASE PENGEMBANGAN: lanjutkan dari jawaban user, tambahkan satu detail baru, lalu tanya satu hal.';
  }
  if (userMessageCount <= 14) {
    return 'FASE LANJUT: mulai variasikan respons, ajak user membuat kalimat sedikit lebih lengkap.';
  }
  return 'FASE PENUTUP: arahkan percakapan menuju penutup natural, tetapi jangan beri evaluasi sebelum diminta.';
}

function buildSystemPrompt(mode: 'normal' | 'live', topic: KaiwaTopic, userMessageCount: number): string {
  const topicId = topic.id || 'free';
  const topicGuide = TOPIC_GUIDES[topicId] || topic.prompt || TOPIC_GUIDES.free;
  const modeGuide = mode === 'live'
    ? 'MODE LIVE: balas sangat singkat. JP maksimal 1 kalimat utama + 1 pertanyaan pendek. Jangan memberi penjelasan panjang.'
    : 'MODE NORMAL: boleh 1-2 kalimat JP. Tetap ringkas dan natural.';

  const limitGuide = userMessageCount >= MAX_CONVERSATION_TURNS - 4
    ? `BATAS PERCAKAPAN: user sudah ${userMessageCount} giliran. Mulai tutup natural dengan frasa seperti また話[はな]しましょう atau では、また. Jangan pakai じゃあ saja sebagai penutup.`
    : `JUMLAH GILIRAN USER: ${userMessageCount}/${MAX_CONVERSATION_TURNS}.`;

  return `${BASE_KAIWA_PROMPT}

TOPIK TERPILIH: ${topic.emoji ? `${topic.emoji} ` : ''}${topic.label || 'Bebas'}
ARAH SKENARIO: ${topicGuide}
${modeGuide}
${getConversationPhase(userMessageCount)}
${limitGuide}`;
}

function toZaiMessages(messages: KaiwaMessage[], systemPrompt: string): ZaiMessage[] {
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
  return [
    { role: 'assistant', content: systemPrompt },
    ...recentMessages.map((message): ZaiMessage => ({
      role: message.role === 'user' ? 'user' : 'assistant',
      content: message.text,
    })),
  ];
}

function buildTranscript(messages: KaiwaMessage[]): string {
  return messages
    .slice(-MAX_REVIEW_MESSAGES)
    .map((message, index) => {
      const speaker = message.role === 'user' ? 'User' : 'GEMU AI';
      return `${index + 1}. [${speaker}] ${message.text}`;
    })
    .join('\n\n');
}

function parseLine(text: string, label: 'JP' | 'RO' | 'ID'): string {
  const nextLabels = label === 'JP' ? '(?=\nRO:|$)' : label === 'RO' ? '(?=\nID:|$)' : '$';
  const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)${nextLabels}`);
  return text.match(regex)?.[1]?.trim() || '';
}

function hasKaiwaFormat(text: string): boolean {
  return Boolean(parseLine(text, 'JP') && parseLine(text, 'RO') && parseLine(text, 'ID'));
}

function removeEmoji(value: string): string {
  return value.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim();
}

function normalizeKaiwaResponse(text: string, topic: KaiwaTopic): string {
  const cleaned = sanitizeText(text, 1800);
  if (!hasKaiwaFormat(cleaned)) return buildFallbackResponse(topic);

  const jp = removeEmoji(parseLine(cleaned, 'JP')).replace(/\s+/g, ' ').trim();
  const ro = removeEmoji(parseLine(cleaned, 'RO')).replace(/\s+/g, ' ').trim();
  const id = parseLine(cleaned, 'ID').replace(/\s+/g, ' ').trim();

  if (!jp || !ro || !id) return buildFallbackResponse(topic);

  return `JP: ${jp}\nRO: ${ro}\nID: ${id}`;
}

function buildFallbackResponse(topic: KaiwaTopic): string {
  const fallback = FALLBACK_BY_TOPIC[topic.id || 'free'] || FALLBACK_BY_TOPIC.free;
  return `JP: ${fallback.jp}\nRO: ${fallback.ro}\nID: ${fallback.id}`;
}

function isNaturalEnding(responseText: string): boolean {
  const jp = parseLine(responseText, 'JP') || responseText;
  const id = parseLine(responseText, 'ID');

  const hasQuestion = /[？?]|ですか|ますか|ませんか/.test(jp);
  if (hasQuestion) return false;

  const endingPatterns = [
    /またね/,
    /また話\[はな\]しましょう/,
    /また話しましょう/,
    /また会\[あ\]いましょう/,
    /また会いましょう/,
    /さようなら/,
    /おやすみなさい/,
    /失礼\[しつれい\]します/,
    /では、また/,
    /じゃあ、また/,
  ];

  const idEnding = /percakapan selesai|sampai jumpa|sampai ketemu|kita lanjut lain kali/i.test(id);
  return endingPatterns.some(pattern => pattern.test(jp)) || idEnding;
}

function buildFallbackReview(messages: KaiwaMessage[]): string {
  const userCount = getUserMessageCount(messages);
  const sample = messages.find(message => message.role === 'user')?.text || 'Belum ada contoh kalimat user yang jelas.';

  return `**📝 EVALUASI PERCAKAPAN**

**✅ Yang Bagus:**
- Kamu sudah mencoba aktif menjawab dalam percakapan.
- Total giliran user: ${userCount}. Ini bagus untuk latihan kaiwa karena kebiasaan merespons lebih penting daripada menunggu sempurna.

**🛠️ Yang Perlu Diperbaiki:**
- Salah: ${sample}
  Benar: 私[わたし]は日本語[にほんご]を勉強[べんきょう]しています。/ Watashi wa nihongo o benkyou shiteimasu.
  Karena: Untuk latihan N5, biasakan memakai pola sederhana Subjek + objek + kata kerja bentuk ます.

**💬 Frasa Natural yang Bisa Dipakai:**
- そうですね。/ Sou desu ne. / Hmm, iya ya.
- いいですね。/ Ii desu ne. / Bagus ya.
- もう一度[いちど]お願[ねが]いします。/ Mou ichido onegai shimasu. / Tolong sekali lagi.

**🎯 Latihan Berikutnya:**
- Latih 5 kalimat tentang kegiatan hari ini memakai ます.
- Jawab setiap pertanyaan dengan minimal satu detail tambahan.

**⭐ Nilai Keseluruhan:** B - Sudah bagus untuk latihan, tinggal dibuat lebih lengkap dan natural.`;
}

async function createCompletion(messages: ZaiMessage[]): Promise<string> {
  const zai = await (await import('@/lib/zai')).getZAI();
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });

  return completion.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as KaiwaRequestBody;
    const messages = normalizeMessages(body.messages);
    const mode = body.mode === 'live' ? 'live' : 'normal';
    const topic = normalizeTopic(body.topic);
    const userMessageCount = getUserMessageCount(messages);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (body.endConversation) {
      const completionMessages: ZaiMessage[] = [
        { role: 'assistant', content: END_CONVERSATION_PROMPT },
        { role: 'user', content: `Topik: ${topic.label || 'Bebas'}\nMode: ${mode}\n\nTranskrip percakapan:\n${buildTranscript(messages)}` },
      ];

      try {
        const responseText = sanitizeText(await createCompletion(completionMessages), 4000);
        return NextResponse.json({ response: responseText || buildFallbackReview(messages), ended: true });
      } catch (error) {
        console.error('Kaiwa review AI fallback:', error);
        return NextResponse.json({ response: buildFallbackReview(messages), ended: true, fallback: true });
      }
    }

    const systemPrompt = buildSystemPrompt(mode, topic, userMessageCount);
    const chatMessages = toZaiMessages(messages, systemPrompt);

    try {
      const rawResponse = await createCompletion(chatMessages);
      const response = normalizeKaiwaResponse(rawResponse, topic);

      return NextResponse.json({
        response,
        ended: isNaturalEnding(response),
        userMsgCount: userMessageCount,
      });
    } catch (error) {
      console.error('Kaiwa chat AI fallback:', error);
      const response = buildFallbackResponse(topic);
      return NextResponse.json({
        response,
        ended: false,
        userMsgCount: userMessageCount,
        fallback: true,
      });
    }
  } catch (error) {
    console.error('Kaiwa chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process kaiwa request' },
      { status: 500 }
    );
  }
}
