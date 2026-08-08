import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  pingLatency: number;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
  pingLatency: 0
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [pingLatency, setPingLatency] = useState<number>(0);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('[SocketContext] Connected to server with ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[SocketContext] Disconnected from server');
      setIsConnected(false);
    });

    // Latency Ping
    const interval = setInterval(() => {
      const start = Date.now();
      newSocket.emit('ping', () => {
        setPingLatency(Date.now() - start);
      });
    }, 10000);

    setSocket(newSocket);

    return () => {
      clearInterval(interval);
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, pingLatency }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
