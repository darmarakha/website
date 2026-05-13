import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const userMessages = messages
      .filter((m: { role: string }) => m.role === 'user')
      .map((m: { text: string }, i: number) => `${i + 1}. ${m.text}`)
      .join('\n');

    if (!userMessages.trim()) {
      return NextResponse.json({
        response: 'Belum ada percakapan untuk dievaluasi nih. Ngobrol dulu yuk! 🗣️✨'
      });
    }

    const zai = await (await import('@/lib/zai')).getZAI();

    const prompt = `Tolong evaluasi percakapan bahasa Jepang saya sejauh ini. Ini adalah kalimat-kalimat yang tadi saya ucapkan:
${userMessages}

Berikan feedback ringkas dan terstruktur dalam bahasa Indonesia: apa yang sudah bagus, letak kesalahan tata bahasa/diksi (jika ada) dan bagaimana kalimat yang benar (sertakan romaji), serta apa yang harus saya latih lagi di level N5. Sertakan pujian dan semangat juga!`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant' as const,
          content: 'Anda adalah instruktur bahasa Jepang (Yuki Sensei) yang memberikan ulasan belajar Kaiwa. Berikan respons dalam bahasa Indonesia yang ramah, konstruktif, dan memotivasi. Gunakan emoji yang banyak! 🌸',
        },
        {
          role: 'user' as const,
          content: prompt,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content || 'Maaf, gagal memuat evaluasi. Coba lagi nanti ya! 🥺';

    return NextResponse.json({ response: `📋 **EVALUASI KAIWA** 📋\n\n${response}` });
  } catch (error) {
    console.error('Kaiwa feedback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get feedback' },
      { status: 500 }
    );
  }
}
