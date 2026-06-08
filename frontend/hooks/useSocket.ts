import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/apiConfig';
import { getAuthToken } from '../utils/sessionAuth';

type TokenGetter = () => string | null | Promise<string | null>;

let sharedSocket: Socket | null = null;

type SocketListener = (socket: Socket) => void;
const socketListeners = new Set<SocketListener>();

function notifySocketListeners(socket: Socket) {
  socketListeners.forEach((listener) => listener(socket));
}

export function onSocketAvailable(listener: SocketListener): () => void {
  socketListeners.add(listener);
  if (sharedSocket) {
    listener(sharedSocket);
  }
  return () => {
    socketListeners.delete(listener);
  };
}

async function resolveToken(getToken: TokenGetter): Promise<string | null> {
  const token = getToken();
  return token instanceof Promise ? token : token;
}

export function getSocket(): Socket | null {
  return sharedSocket;
}

export function disconnectSocket(): void {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
}

export async function connectSocket(getToken: TokenGetter = getAuthToken): Promise<Socket | null> {
  const token = await resolveToken(getToken);
  if (!token) {
    return null;
  }

  if (sharedSocket?.connected) {
    return sharedSocket;
  }

  disconnectSocket();

  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect_error', (error) => {
    console.warn('Socket connect error:', error.message);
  });

  sharedSocket = socket;
  notifySocketListeners(socket);
  return socket;
}

export function useSocket(getToken: TokenGetter = getAuthToken): Socket | null {
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const [socket, setSocket] = useState<Socket | null>(sharedSocket);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const nextSocket = await connectSocket(getTokenRef.current);
      if (cancelled) {
        return;
      }
      setSocket(nextSocket);
    })();

    return () => {
      cancelled = true;
      disconnectSocket();
      setSocket(null);
    };
  }, []);

  return socket;
}
