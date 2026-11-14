import { create } from 'zustand';

type SyncMode = 'independent' | 'synchronized';

interface VideoState {
  currentVideoId: string | null;
  syncMode: SyncMode;
  currentTime: number;
  isPlaying: boolean;
  isSynchronized: boolean;

  setCurrentVideo: (videoId: string | null) => void;
  setSyncMode: (mode: SyncMode) => void;
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setSynchronized: (synced: boolean) => void;
  updateState: (state: { mode?: SyncMode; currentTime?: number; isPlaying?: boolean }) => void;
  clear: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  syncMode: 'independent',
  currentTime: 0,
  isPlaying: false,
  isSynchronized: false,

  setCurrentVideo: (videoId) => set({ currentVideoId: videoId }),

  setSyncMode: (mode) => set({ syncMode: mode, isSynchronized: mode === 'synchronized' }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setSynchronized: (synced) => set({ isSynchronized: synced }),

  updateState: (state) =>
    set((prev) => ({
      ...prev,
      ...(state.mode && { syncMode: state.mode, isSynchronized: state.mode === 'synchronized' }),
      ...(state.currentTime !== undefined && { currentTime: state.currentTime }),
      ...(state.isPlaying !== undefined && { isPlaying: state.isPlaying }),
    })),

  clear: () =>
    set({
      currentVideoId: null,
      syncMode: 'independent',
      currentTime: 0,
      isPlaying: false,
      isSynchronized: false,
    }),
}));
