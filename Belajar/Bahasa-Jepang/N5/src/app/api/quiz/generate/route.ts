import { NextRequest, NextResponse } from 'next/server';
import { KANJI, VOCABULARY, GRAMMAR } from '@/lib/n5-constants';

export async function POST(req: NextRequest) {
  try {
    const { type, count = 5 } = await req.json();
    const num = Math.min(Math.max(count, 1), 10);

    let questions: Array<{
      type: string;
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }> = [];

    const zai = await (await import('@/lib/zai')).getZAI();

    if (type === 'vocabulary') {
      const shuffled = [...VOCABULARY].sort(() => Math.random() - 0.5).slice(0, num);
      questions = shuffled.map(v => {
        const wrongOptions = VOCABULARY.filter(x => x.word !== v.word).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.meaning);
        const options = [...wrongOptions, v.meaning].sort(() => Math.random() - 0.5);
        return {
          type: 'vocab',
          question: `Apa arti dari "${v.word}" (${v.reading})?`,
          options,
          correct: options.indexOf(v.meaning),
          explanation: `"${v.word}" artinya "${v.meaning}" (${v.reading}). ${v.explanation || ''}`,
        };
      });
    } else if (type === 'kanji') {
      const shuffled = [...KANJI].sort(() => Math.random() - 0.5).slice(0, num);
      questions = shuffled.map(k => {
        const wrongOptions = KANJI.filter(x => x.character !== k.character).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.meaning);
        const options = [...wrongOptions, k.meaning].sort(() => Math.random() - 0.5);
        return {
          type: 'kanji',
          question: `Apa arti dari kanji "${k.character}"?`,
          options,
          correct: options.indexOf(k.meaning),
          explanation: `Kanji "${k.character}" artinya "${k.meaning}". Onyomi: ${k.onyomi}, Kunyomi: ${k.kunyomi}`,
        };
      });
    } else {
      const prompt = `Generate ${num} multiple choice questions for JLPT N5 Japanese language test (topic: ${type || 'mixed'}). 
For each question, provide:
- question: the question text in Indonesian
- options: array of exactly 4 answer options (all strings)
- correct: index of correct answer (0-3)
- explanation: brief explanation in Indonesian

Format as JSON array only, no other text. Example:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'You are a Japanese language quiz generator. Output ONLY valid JSON arrays.' },
          { role: 'user', content: prompt },
        ],
        thinking: { type: 'disabled' },
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          questions = parsed.map((q: Record<string, unknown>) => ({
            type,
            question: String(q.question),
            options: q.options as string[],
            correct: Number(q.correct),
            explanation: String(q.explanation),
          }));
        }
      }

      if (questions.length === 0) {
        // Fallback with grammar
        const shuffled = [...GRAMMAR].sort(() => Math.random() - 0.5).slice(0, num);
        questions = shuffled.map(g => {
          const wrongOptions = GRAMMAR.filter(x => x.title !== g.title).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.title);
          const options = [...wrongOptions, g.title].sort(() => Math.random() - 0.5);
          return {
            type: 'grammar',
            question: `Partikel/manakah yang digunakan: ${g.structure}?`,
            options,
            correct: options.indexOf(g.title),
            explanation: g.explanation,
          };
        });
      }
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generate error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate quiz' }, { status: 500 });
  }
}
