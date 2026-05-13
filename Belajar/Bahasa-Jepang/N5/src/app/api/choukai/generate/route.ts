import { NextRequest, NextResponse } from 'next/server';
import { N5_CHOUKAI_MATERIALS, getRandomChoukai } from '@/lib/n5-data';

export async function POST(req: NextRequest) {
  try {
    const { action, topic, materialId } = await req.json();

    if (action === 'list') {
      return NextResponse.json({ materials: N5_CHOUKAI_MATERIALS });
    }

    if (action === 'get' && materialId) {
      const material = N5_CHOUKAI_MATERIALS.find(m => m.id === materialId);
      if (!material) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
      }
      return NextResponse.json({ material });
    }

    if (action === 'random') {
      const material = getRandomChoukai();
      return NextResponse.json({ material });
    }

    // Generate new material using AI
    if (action === 'generate' || !action) {
      const zai = await (await import('@/lib/zai')).getZAI();

      const prompt = `Buatkan materi Choukai (Listening) bahasa Jepang JLPT N5. 
Topik: ${topic || 'Acak (perkenalan, belanja, di restoran, atau menanyakan jalan)'}.

PENTING: 
1. Dialog harus LUWES dan NATURAL (gunakan ekspresi seperti 'ano...', 'ee...', 'sou desu ne').
2. Gunakan format Kanji[hiragana] untuk SEMUA kanji pada bagian "text".
3. Buat 2 tokoh pembicara yang JELAS dengan nama, peran, dan jenis kelamin yang berbeda.
4. Pastikan speaker A dan B memiliki jenis kelamin yang JELAS (satu pria, satu wanita) untuk memudahkan pengguna membedakan suara.

Format JSON:
{
  "title": "Judul dalam bahasa Indonesia",
  "scenario": "Deskripsi situasi dalam bahasa Indonesia",
  "emoji": "Emoji utama",
  "topic": "Topik dalam bahasa Jepang (romaji)",
  "difficulty": "easy atau medium",
  "context": "Penjelasan situasi yang membantu pengguna memahami konteks percakapan",
  "speakers": [
    { "id": "A", "name": "Nama Jepang (huruf hiragana)", "nameRo": "Nama romaji", "gender": "pria atau wanita", "role": "Peran dalam dialog", "emoji": "Emoji wajah", "colorClass": "blue" },
    { "id": "B", "name": "Nama Jepang (huruf hiragana)", "nameRo": "Nama romaji", "gender": "wanita atau pria", "role": "Peran dalam dialog", "emoji": "Emoji wajah", "colorClass": "rose" }
  ],
  "dialogue": [
    { "speaker": "A", "text": "私[わたし]は... (format Kanji[hiragana])", "ro": "Romaji", "id": "Arti bahasa Indonesia" }
  ],
  "quiz": {
    "question": "Pertanyaan pemahaman dalam bahasa Indonesia",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "answer": 0,
    "explanation": "Penjelasan kenapa benar"
  }
}
Hanya kembalikan JSON valid tanpa markdown.`;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant' as const,
            content: 'Anda adalah pembuat materi pendengaran bahasa Jepang JLPT N5. Buat materi yang menarik, natural, dan sesuai level N5. Selalu kembalikan JSON yang valid. Pastikan setiap materi memiliki 2 tokoh dengan nama dan peran yang jelas.',
          },
          {
            role: 'user' as const,
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const responseText = completion.choices[0]?.message?.content || '';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const fallback = getRandomChoukai();
        return NextResponse.json({ material: fallback });
      }

      try {
        const material = JSON.parse(jsonMatch[0]);
        // Ensure speakers field exists for AI-generated materials
        if (!material.speakers || material.speakers.length < 2) {
          material.speakers = [
            { id: 'A', name: 'Aさん', nameRo: 'A-san', gender: 'wanita', role: 'Pembicara A', emoji: '👩', colorClass: 'rose' },
            { id: 'B', name: 'Bさん', nameRo: 'B-san', gender: 'pria', role: 'Pembicara B', emoji: '👨', colorClass: 'blue' },
          ];
        }
        if (!material.context) {
          material.context = material.scenario;
        }
        material.id = `ai-${Date.now()}`;
        return NextResponse.json({ material });
      } catch {
        const fallback = getRandomChoukai();
        return NextResponse.json({ material: fallback });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Choukai generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate material' },
      { status: 500 }
    );
  }
}
