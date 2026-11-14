import apiClient from './client';
import type { RoomMessage } from '@app-types/chat.types';

export const chatApi = {
  getRoomMessages: async (roomId: string): Promise<RoomMessage[]> => {
    const response = await apiClient.get(`/rooms/${roomId}/messages`);
    return response.data;
  },

  sendRoomMessage: async (roomId: string, content: string): Promise<RoomMessage> => {
    const response = await apiClient.post(`/rooms/${roomId}/messages`, { content });
    return response.data;
  },
};
