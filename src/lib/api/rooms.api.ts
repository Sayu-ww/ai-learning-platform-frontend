import apiClient from './client';
import type {
  MyRoom,
  Room,
  RoomParticipantDetails,
  CreateRoomRequest,
} from '@app-types/room.types';

export const roomsApi = {
  create: async (data: CreateRoomRequest): Promise<Room> => {
    const response = await apiClient.post('/rooms', data);
    return response.data;
  },

  getPublicRooms: async (limit?: number): Promise<Room[]> => {
    const response = await apiClient.get('/rooms/public', { params: { limit } });
    return response.data;
  },

  getMyRooms: async (): Promise<MyRoom[]> => {
    const response = await apiClient.get('/rooms/my');
    return response.data;
  },

  getRoom: async (roomId: string): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${roomId}`);
    return response.data;
  },

  joinRoom: async (roomId: string): Promise<Room> => {
    const response = await apiClient.post(`/rooms/${roomId}/join`);
    return response.data;
  },

  updateRoom: async (
    roomId: string,
    data: Partial<CreateRoomRequest>,
  ): Promise<Room> => {
    const response = await apiClient.put(`/rooms/${roomId}`, data);
    return response.data;
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}`);
  },

  getParticipants: async (roomId: string): Promise<RoomParticipantDetails[]> => {
    const response = await apiClient.get(`/rooms/${roomId}/participants`);
    return response.data;
  },

  addParticipant: async (roomId: string, userId: string) => {
    const response = await apiClient.post(`/rooms/${roomId}/participants/${userId}`);
    return response.data;
  },

  removeParticipant: async (roomId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}/participants/${userId}`);
  },

  setCurrentVideo: async (roomId: string, videoUrl: string) => {
    const response = await apiClient.post(`/rooms/${roomId}/video`, { videoUrl });
    return response.data;
  },

  getCurrentVideo: async (roomId: string) => {
    const response = await apiClient.get(`/rooms/${roomId}/video`);
    return response.data;
  },

  saveVideoProgress: async (roomId: string, videoId: string, currentTime: number, duration?: number) => {
    const response = await apiClient.post(`/rooms/${roomId}/video/progress`, {
      videoId,
      currentTime,
      duration,
    });
    return response.data;
  },

  getVideoProgress: async (roomId: string, videoId: string) => {
    const response = await apiClient.get(`/rooms/${roomId}/video/${videoId}/progress`);
    return response.data;
  },

  inviteUser: async (roomId: string, userId: string) => {
    const response = await apiClient.post(`/rooms/${roomId}/invites/${userId}`);
    return response.data;
  },

  getMyInvites: async () => {
    const response = await apiClient.get('/rooms/invites/my');
    return response.data;
  },

  acceptInvite: async (inviteId: string): Promise<Room> => {
    const response = await apiClient.post(`/rooms/invites/${inviteId}/accept`);
    return response.data;
  },

  rejectInvite: async (inviteId: string): Promise<void> => {
    await apiClient.delete(`/rooms/invites/${inviteId}`);
  },
};
