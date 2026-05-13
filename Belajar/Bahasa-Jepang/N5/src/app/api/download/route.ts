import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { readFile, unlink, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  const projectRoot = process.cwd();

  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const zipFileName = `gemu-nihongo-${dateStr}.zip`;
    const zipPath = join('/tmp', zipFileName);

    // Remove existing zip if any (avoid "updating" leftover)
    await unlink(zipPath).catch(() => {});

    // Only exclude truly unnecessary items:
    // - node_modules: can regenerate with bun install
    // - .next: build cache, can regenerate
    // - .git: version control metadata
    // - .zscripts: internal dev scripts
    // - *.db / *.db-journal: runtime database files
    // - dev.log: dev server log (changes constantly)
    await new Promise<void>((resolve, reject) => {
      exec(
        `cd "${projectRoot}" && zip -r -9 "${zipPath}" . -x "node_modules/*" ".next/*" ".git/*" ".zscripts/*" "*.db" "*.db-journal" "dev.log"`,
        { maxBuffer: 100 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            console.error('[Download API] zip error:', stderr);
            reject(error);
          } else {
            // stdout contains the zip output listing, log last few lines
            const lines = stdout.trim().split('\n');
            console.log(`[Download API] ZIP created: ${zipFileName}`);
            console.log(`[Download API] ${lines[lines.length - 1]}`);
            resolve();
          }
        }
      );
    });

    // Verify zip file exists and get size
    const zipStat = await stat(zipPath);
    const zipSizeBytes = zipStat.size;
    const zipSizeMB = (zipSizeBytes / (1024 * 1024)).toFixed(1);
    console.log(`[Download API] ZIP size: ${zipSizeMB} MB`);

    const zipBuffer = await readFile(zipPath);

    // Clean up temp file
    unlink(zipPath).catch(() => {});

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Content-Length': String(zipBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Download API] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat file ZIP' },
      { status: 500 }
    );
  }
}
