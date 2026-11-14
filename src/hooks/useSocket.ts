import { useEffect, useState } from 'react';
import { socketService } from '@lib/socket/socket.service';
import { useAuthStore } from '@stores/auth.store';

export const useSocket = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  return socketService;
};

export const useRoomSocket = (roomId: string | undefined) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setIsConnected(false);
      return;
    }

    const socket = socketService.getSocket();
    if (!socket || !socket.connected) {
      console.warn('Cannot join room: socket not connected', { roomId });
      setIsConnected(false);
      return;
    }

    setIsConnected(false);

    // Подписываемся на ответ от сервера
    socket.emit('room:join', { roomId }, (response: any) => {
      if (response?.error) {
        console.error('Failed to join room via socket:', response.error);
        setIsConnected(false);
      } else if (response?.success) {
        console.log('Successfully joined room via socket:', roomId);
        setIsConnected(true);
      }
    });

    return () => {
      if (socket.connected) {
        socket.emit('room:leave', { roomId }, (response: any) => {
          if (response?.success) {
            console.log('Left room via socket:', roomId);
          }
        });
      }
      setIsConnected(false);
    };
  }, [roomId]);

  return { isConnected };
};
