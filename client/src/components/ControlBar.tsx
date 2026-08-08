import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { Play, Pause, RotateCcw, Link2, ShieldAlert } from 'lucide-react';

export const ControlBar: React.FC = () => {
  const { room, changeVideo, sendPlaybackAction, canPerform } = useRoom();
  const [videoUrl, setVideoUrl] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);

  // Helper to extract YouTube Video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(videoUrl) || videoUrl.trim();
    if (videoId) {
      changeVideo(videoId);
      setVideoUrl('');
      setShowUrlModal(false);
    } else {
      alert('Invalid YouTube URL or Video ID');
    }
  };

  const isAuthorized = canPerform('PLAY_PAUSE');

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Playback Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isAuthorized ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => sendPlaybackAction('PLAY', room?.lastCalculatedTime || 0)}
              >
                <Play size={16} /> Play
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => sendPlaybackAction('PAUSE', room?.lastCalculatedTime || 0)}
              >
                <Pause size={16} /> Pause
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <ShieldAlert size={16} color="var(--accent-red)" /> Participant Mode (Read Only)
            </div>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => sendPlaybackAction('SEEK', room?.lastCalculatedTime || 0)}
            title="Force Sync State"
          >
            <RotateCcw size={16} /> Sync
          </button>
        </div>

        {/* Change Video Button */}
        {canPerform('CHANGE_VIDEO') && (
          <button className="btn btn-secondary" onClick={() => setShowUrlModal(!showUrlModal)}>
            <Link2 size={16} /> Change Video
          </button>
        )}
      </div>

      {/* Video URL Input Modal */}
      {showUrlModal && (
        <form onSubmit={handleVideoSubmit} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Paste YouTube URL or Video ID (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Load</button>
        </form>
      )}
    </div>
  );
};
