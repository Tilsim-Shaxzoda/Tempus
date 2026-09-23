'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

let sharedSocket: Socket | null = null;

export function useSocket(): Socket {
  const ref = useRef<Socket>();

  if (!ref.current) {
    if (!sharedSocket) {
      sharedSocket = io({ path: '/socket.io', autoConnect: true });
    }
    ref.current = sharedSocket;
  }

  useEffect(() => {
    const socket = ref.current!;
    if (!socket.connected) socket.connect();
    return () => {
      // Keep the shared socket alive across page navigations within the app;
      // it's only torn down when the tab closes.
    };
  }, []);

  return ref.current;
}
