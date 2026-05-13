import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const zai = await (await import('@/lib/zai')).getZAI();

    const systemPrompt = `Kamu adalah "GEMU AI", asisten belajar bahasa Jepang tingkat JLPT N5 dalam platform "Gemu Nihongo". 
Kamu bisa menjelaskan grammar, kosakata, kanji, budaya Jepang, dan tips belajar.

ATURAN:
1. Gunakan Bahasa Indonesia sebagai bahasa utama.
2. Jelaskan dengan jelas, ringkas, dan mudah dipahami.
3. Untuk contoh kalimat Jepang, berikan furigana: Kanji[hiragana].
4. Berikan romaji untuk setiap kalimat Jepang.
5. Gunakan emoji sesekali agar lebih ramah.
6. Jika ditanya di luar bahasa Jepang, jawab singkat dan arahkan kembali ke topik Jepang.
7. Berikan format rapi dengan markdown.`;

    const chatMessages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: chatMessages,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return NextResponse.json({ error: 'Empty response' }, { status: 500 });
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
