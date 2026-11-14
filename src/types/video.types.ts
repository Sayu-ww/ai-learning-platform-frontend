export interface Video {
  id: string;
  source: 'youtube' | 'vimeo' | 'rutube' | 'archive';
  externalId: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  addedBy: string;
  createdAt: Date;
}

export interface VideoSyncState {
  id: string;
  roomId: string;
  mode: 'independent' | 'synchronized';
  currentTime: number;
  isPlaying: boolean;
  lastUpdatedBy?: string;
  updatedAt: Date;
}

export interface VideoSyncEvent {
  roomId: string;
  time?: number;
  isPlaying?: boolean;
}
