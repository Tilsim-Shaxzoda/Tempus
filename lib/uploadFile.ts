export type UploadKind = 'image' | 'voice' | 'video' | 'file';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
}

export async function uploadFile(file: File | Blob, kind: UploadKind, filename?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file, filename ?? (file instanceof File ? file.name : `${kind}`));
  formData.append('kind', kind);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Yuklashda xatolik yuz berdi');
  }
  return res.json();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
