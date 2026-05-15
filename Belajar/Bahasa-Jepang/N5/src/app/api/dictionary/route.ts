import { NextRequest, NextResponse } from 'next/server';
import { buildN5DictionaryPrompt, lookupN5Dictionary } from '@/lib/n5-dictionary';

type DictionaryMode = 'kaiwa' | 'choukai' | 'general';

function normalizeMode(value: unknown): DictionaryMode {
  return value === 'kaiwa' || value === 'choukai' || value === 'general' ? value : 'general';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const mode = normalizeMode(searchParams.get('mode'));
  const limit = Number(searchParams.get('limit') || 20);

  return NextResponse.json({
    ok: true,
    ...lookupN5Dictionary(query, mode, Number.isFinite(limit) ? limit : 20),
    prompt: buildN5DictionaryPrompt(query, mode),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query || body.topic || '');
    const mode = normalizeMode(body.mode);
    const limit = Number(body.limit || 20);

    return NextResponse.json({
      ok: true,
      ...lookupN5Dictionary(query, mode, Number.isFinite(limit) ? limit : 20),
      prompt: buildN5DictionaryPrompt(query, mode),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Dictionary request failed' },
      { status: 500 }
    );
  }
}
