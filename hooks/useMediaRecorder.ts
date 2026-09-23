'use client';

import { useCallback, useRef, useState } from 'react';

interface Options {
  kind: 'voice' | 'video';
  maxDurationSec: number;
  onStop: (blob: Blob, durationSec: number) => void;
}

const MIME_CANDIDATES: Record<'voice' | 'video', string[]> = {
  voice: ['audio/webm', 'audio/mp4', 'audio/ogg'],
  video: ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
};

function pickMimeType(kind: 'voice' | 'video') {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return MIME_CANDIDATES[kind].find((type) => MediaRecorder.isTypeSupported(type));
}

export function useMediaRecorder({ kind, maxDurationSec, onStop }: Options) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startedAtRef = useRef(0);
  const cancelledRef = useRef(false);

  const cleanup = useCallback((activeStream: MediaStream | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    activeStream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setRecording(false);
    setElapsed(0);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new Error('Brauzeringiz audio/video yozishni qo\'llab-quvvatlamaydi');
    }

    const constraints: MediaStreamConstraints =
      kind === 'video' ? { video: { width: 480, height: 480, facingMode: 'user' }, audio: true } : { audio: true };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    cancelledRef.current = false;
    chunksRef.current = [];
    setStream(mediaStream);

    const mimeType = pickMimeType(kind);
    const recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const activeStream = mediaStream;
      const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
      cleanup(activeStream);
      const chunks = chunksRef.current;
      if (!cancelledRef.current && chunks.length > 0) {
        const blob = new Blob(chunks, { type: mimeType ?? chunks[0]!.type });
        onStop(blob, durationSec);
      }
    };

    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    recorder.start();
    setRecording(true);
    setElapsed(0);

    timerRef.current = setInterval(() => {
      const secs = Math.round((Date.now() - startedAtRef.current) / 1000);
      setElapsed(secs);
      if (secs >= maxDurationSec) {
        recorderRef.current?.stop();
      }
    }, 250);
  }, [kind, maxDurationSec, onStop, cleanup]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    recorderRef.current?.stop();
  }, []);

  return { recording, elapsed, stream, start, stop, cancel };
}
