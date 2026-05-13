import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'materials-db.json');

function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function saveDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const db = getDB();
    return NextResponse.json(db);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Basic Owner Auth check (assuming owner session or simple secret for now)
    // In a real app, use next-auth session check
    const material = await req.json();
    
    if (!material.title || !material.dialogue) {
      return NextResponse.json({ error: 'Invalid material data' }, { status: 400 });
    }

    const db = getDB();
    const newId = material.id || `n5-${Date.now()}`;
    
    const existingIdx = db.findIndex((m: any) => m.id === newId);
    if (existingIdx >= 0) {
      db[existingIdx] = { ...material, id: newId, updatedAt: new Date().toISOString() };
    } else {
      db.push({ ...material, id: newId, createdAt: new Date().toISOString() });
    }
    
    saveDB(db);
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save material' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDB();
    const filtered = db.filter((m: any) => m.id !== id);
    
    if (db.length === filtered.length) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    saveDB(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
