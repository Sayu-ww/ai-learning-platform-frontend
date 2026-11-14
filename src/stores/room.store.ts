import { create } from 'zustand';
import type { RoomParticipantDetails } from '@app-types/room.types';

interface RoomState {
  currentRoomId: string | null;
  participants: RoomParticipantDetails[];

  setCurrentRoom: (roomId: string | null) => void;
  setParticipants: (participants: RoomParticipantDetails[]) => void;
  addParticipant: (participant: RoomParticipantDetails) => void;
  removeParticipant: (userId: string) => void;
  clear: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoomId: null,
  participants: [],

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  setParticipants: (participants) => set({ participants }),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),

  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.userId !== userId),
    })),

  clear: () => set({ currentRoomId: null, participants: [] }),
}));
