import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const LIMITS: Record<string, { maxBytes: number; mimePrefixes: string[] }> = {
  image: { maxBytes: 8 * 1024 * 1024, mimePrefixes: ['image/'] },
  voice: { maxBytes: 15 * 1024 * 1024, mimePrefixes: ['audio/'] },
  video: { maxBytes: 25 * 1024 * 1024, mimePrefixes: ['video/'] },
  file: { maxBytes: 25 * 1024 * 1024, mimePrefixes: [] }
};

// Extensions we refuse to store as a generic "file" attachment, even though
// their declared mime type might look harmless — serving these back from
// public/uploads would let them run as HTML/script in our own origin.
const BLOCKED_EXTENSIONS = new Set([
  '.html', '.htm', '.svg', '.js', '.mjs', '.php', '.exe', '.sh', '.bat', '.cmd', '.jar'
]);

function extensionFor(filename: string, mimeType: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext) return ext;
  const guessed = mimeType.split('/')[1];
  return guessed ? `.${guessed.split(';')[0]}` : '';
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const kind = formData.get('kind');

  if (!(file instanceof File) || typeof kind !== 'string' || !LIMITS[kind]) {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const limit = LIMITS[kind];
  if (file.size === 0 || file.size > limit.maxBytes) {
    return NextResponse.json({ error: 'Fayl hajmi ruxsat etilgan chegaradan katta' }, { status: 413 });
  }

  if (limit.mimePrefixes.length > 0 && !limit.mimePrefixes.some((p) => file.type.startsWith(p))) {
    return NextResponse.json({ error: 'Fayl turi mos kelmadi' }, { status: 400 });
  }

  const ext = extensionFor(file.name, file.type);
  if (kind === 'file' && BLOCKED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: 'Bu fayl turi ruxsat etilmagan' }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = `${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), bytes);

  return NextResponse.json({
    url: `/uploads/${storedName}`,
    name: file.name,
    size: file.size
  });
}
