import { useEffect, useRef } from 'react';
import { socketService } from '@lib/socket/socket.service';
import { useVideoStore } from '@stores/video.store';
import { roomsApi } from '@lib/api/rooms.api';
import { Button } from '@components/ui/button';

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  getPlayerState: () => number;
}

interface YouTubePlayerStateChangeEvent {
  data: number;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars: {
    autoplay: number;
    controls: number;
  };
  events: {
    onStateChange: (event: YouTubePlayerStateChangeEvent) => void;
  };
}

interface YouTubeApi {
  Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface VideoPlayerProps {
  roomId: string;
  videoId: string;
  source: 'youtube' | 'vimeo' | 'rutube' | 'archive';
  isAdmin: boolean;
}

export default function VideoPlayer({ roomId, videoId, source, isAdmin }: VideoPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const {
    isSynchronized,
    setCurrentTime,
    setPlaying,
    updateState,
  } = useVideoStore();
  const isSynchronizedRef = useRef(isSynchronized);
  const isAdminRef = useRef(isAdmin);
  const saveProgressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isSynchronizedRef.current = isSynchronized;
    isAdminRef.current = isAdmin;
  }, [isAdmin, isSynchronized]);

  // Load saved video progress on mount
  useEffect(() => {
    if (!videoId || !roomId) return;

    const loadProgress = async () => {
      try {
        const progress = await roomsApi.getVideoProgress(roomId, videoId);
        if (progress && progress.currentTime > 0 && playerRef.current) {
          console.log('Restoring video position:', progress.currentTime);
          playerRef.current.seekTo(progress.currentTime, true);
        }
      } catch (error) {
        console.log('No saved progress found or error loading:', error);
      }
    };

    // Wait a bit for player to be ready
    const timer = setTimeout(loadProgress, 1500);
    return () => clearTimeout(timer);
  }, [roomId, videoId]);

  // Auto-save progress every 5 seconds
  useEffect(() => {
    if (!playerRef.current || !videoId || !roomId) return;

    const saveProgress = async () => {
      if (!playerRef.current) return;

      const currentTime = typeof playerRef.current.getCurrentTime === 'function'
        ? playerRef.current.getCurrentTime()
        : 0;
      const duration = typeof playerRef.current.getDuration === 'function'
        ? playerRef.current.getDuration()
        : undefined;

      if (currentTime > 0) {
        try {
          await roomsApi.saveVideoProgress(roomId, videoId, currentTime, duration);
          console.log('Progress saved:', currentTime);
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    };

    // Save immediately
    saveProgress();

    // Then save every 5 seconds
    saveProgressTimerRef.current = setInterval(saveProgress, 5000);

    return () => {
      if (saveProgressTimerRef.current) {
        clearInterval(saveProgressTimerRef.current);
      }
      // Final save on unmount
      saveProgress();
    };
  }, [roomId, videoId]);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('video:state-changed', ({ isPlaying, currentTime, isSynchronized }) => {
      updateState({ isPlaying, currentTime });

      if (isSynchronized && playerRef.current) {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    });

    socket.on('video:seek-to', ({ time }) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, true);
        setCurrentTime(time);
      }
    });

    socket.on('video:sync-enabled', ({ currentTime, isPlaying }) => {
      updateState({ mode: 'synchronized', currentTime, isPlaying });
      if (playerRef.current) {
        playerRef.current.seekTo(currentTime, true);
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    });

    socket.on('video:sync-disabled', () => {
      updateState({ mode: 'independent' });
    });

    return () => {
      socket.off('video:state-changed');
      socket.off('video:seek-to');
      socket.off('video:sync-enabled');
      socket.off('video:sync-disabled');
    };
  }, [updateState, setCurrentTime]);

  useEffect(() => {
    if (source !== 'youtube') return;

    const createYouTubePlayer = () => {
      if (!window.YT) return;

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: isSynchronizedRef.current && !isAdminRef.current ? 0 : 1,
        },
        events: {
          onStateChange: ({ data }) => {
            const socket = socketService.getSocket();
            if (!socket || !playerRef.current) return;

            // Проверяем, что метод getCurrentTime существует и плеер готов
            const time = typeof playerRef.current.getCurrentTime === 'function'
              ? playerRef.current.getCurrentTime()
              : 0;

            if (data === 1) {
              setPlaying(true);
              if (isSynchronizedRef.current && isAdminRef.current) {
                socket.emit('video:play', { roomId, time });
              }
            } else if (data === 2) {
              setPlaying(false);
              if (isSynchronizedRef.current && isAdminRef.current) {
                socket.emit('video:pause', { roomId, time });
              }
            }
          },
        },
      });
    };

    if (window.YT) {
      createYouTubePlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      window.onYouTubeIframeAPIReady = createYouTubePlayer;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (window.onYouTubeIframeAPIReady === createYouTubePlayer) {
        window.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, [roomId, setPlaying, source, videoId]);

  const handleGatherAll = () => {
    if (!playerRef.current) return;

    const time = typeof playerRef.current.getCurrentTime === 'function'
      ? playerRef.current.getCurrentTime()
      : 0;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('video:gather-all', { roomId, time });
    }
  };

  const handlePauseAll = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('video:pause-all', { roomId });
    }
  };

  const handleDisableSync = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('video:sync-disable', { roomId });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-video w-full bg-black">
        {source === 'youtube' && <div id="youtube-player" className="h-full w-full" />}
      </div>

      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-accent p-4 text-accent-foreground">
          <span className="text-sm font-medium">Admin controls</span>
          <Button
            onClick={handleGatherAll}
            size="sm"
            className="rounded-lg"
          >
            Gather All
          </Button>
          <Button
            onClick={handlePauseAll}
            size="sm"
            variant="secondary"
            className="rounded-lg"
          >
            Pause All
          </Button>
          {isSynchronized && (
            <Button
              onClick={handleDisableSync}
              size="sm"
              variant="outline"
              className="rounded-lg"
            >
              Disable Sync
            </Button>
          )}
        </div>
      )}

      {isSynchronized && (
        <div className="rounded-lg bg-accent p-2 text-center text-sm text-accent-foreground">
          🔄 Synchronized mode active
        </div>
      )}
    </div>
  );
}
