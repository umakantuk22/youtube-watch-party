import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { SocketEvents } from '@watch-party/shared';
import { useSocketContext } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import { Radio, RefreshCw } from 'lucide-react';

export const VideoPlayer: React.FC = () => {
  const { socket } = useSocketContext();
  const { room, sendPlaybackAction, canPerform } = useRoom();
  const playerRef = useRef<any>(null);
  
  // Guard flag to prevent infinite loops (Programmatic Lock)
  const isProgrammaticChange = useRef<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'drift'>('synced');

  // Handle player ready
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (room) {
      // Late join sync
      syncToRoomState(room.playbackState, room.lastCalculatedTime, room.lastStateTimestamp);
    }
  };

  // Synchronize local player with server room state
  const syncToRoomState = (state: string, baseTime: number, timestamp: number) => {
    if (!playerRef.current) return;

    isProgrammaticChange.current = true;

    // Calculate current expected server time for active playback
    let expectedTime = baseTime;
    if (state === 'PLAYING') {
      const elapsed = (Date.now() - timestamp) / 1000;
      expectedTime += elapsed;
    }

    const currentTime = playerRef.current.getCurrentTime() || 0;
    const timeDiff = Math.abs(currentTime - expectedTime);

    // Hard seek if drift > 1.5 seconds
    if (timeDiff > 1.5) {
      setSyncStatus('drift');
      playerRef.current.seekTo(expectedTime, true);
    }

    if (state === 'PLAYING') {
      playerRef.current.playVideo();
    } else if (state === 'PAUSED') {
      playerRef.current.pauseVideo();
    }

    setTimeout(() => {
      isProgrammaticChange.current = false;
      setSyncStatus('synced');
    }, 400);
  };

  // Socket sync event listeners
  useEffect(() => {
    if (!socket) return;

    const handleSyncPlay = ({ currentTime, lastStateTimestamp }: any) => {
      syncToRoomState('PLAYING', currentTime, lastStateTimestamp);
    };

    const handleSyncPause = ({ currentTime, lastStateTimestamp }: any) => {
      syncToRoomState('PAUSED', currentTime, lastStateTimestamp);
    };

    const handleSyncSeek = ({ currentTime, lastStateTimestamp }: any) => {
      syncToRoomState('PAUSED', currentTime, lastStateTimestamp);
    };

    socket.on(SocketEvents.SYNC_PLAY, handleSyncPlay);
    socket.on(SocketEvents.SYNC_PAUSE, handleSyncPause);
    socket.on(SocketEvents.SYNC_SEEK, handleSyncSeek);

    return () => {
      socket.off(SocketEvents.SYNC_PLAY, handleSyncPlay);
      socket.off(SocketEvents.SYNC_PAUSE, handleSyncPause);
      socket.off(SocketEvents.SYNC_SEEK, handleSyncSeek);
    };
  }, [socket]);

  // YouTube IFrame State Change Listener (User-Initiated)
  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (isProgrammaticChange.current) return;
    if (!canPerform('PLAY_PAUSE')) return;

    const playerState = event.data;
    const currentTime = playerRef.current?.getCurrentTime() || 0;

    // 1 = PLAYING, 2 = PAUSED
    if (playerState === 1) {
      sendPlaybackAction('PLAY', currentTime);
    } else if (playerState === 2) {
      sendPlaybackAction('PAUSE', currentTime);
    }
  };

  const youtubeOptions: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: canPerform('PLAY_PAUSE') ? 1 : 0, // Disable controls for viewers without permissions
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {room?.currentVideoId ? (
          <YouTube
            videoId={room.currentVideoId}
            opts={youtubeOptions}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No video loaded
          </div>
        )}
      </div>

      {/* Sync Status Badge Overlay */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: syncStatus === 'synced' ? 'var(--accent-green)' : 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {syncStatus === 'synced' ? <Radio size={14} className="animate-pulse" /> : <RefreshCw size={14} className="animate-spin" />}
          {syncStatus === 'synced' ? 'In Sync' : 'Re-syncing...'}
        </div>
      </div>
    </div>
  );
};
