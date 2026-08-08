import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { Tv, Sparkles, Users, PlayCircle } from 'lucide-react';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoom();
  const [tab, setTab] = useState<'join' | 'create'>('create');

  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [initialVideoUrl, setInitialVideoUrl] = useState('');

  const extractVideoId = (url: string): string => {
    if (!url.trim()) return 'dQw4w9WgXcQ';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    return (match && match[2].length === 11) ? match[2] : url.trim();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !userName.trim()) return;
    const videoId = extractVideoId(initialVideoUrl);
    const success = await createRoom(roomName.trim(), userName.trim(), videoId);
    if (success) {
      navigate('/room');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim() || !userName.trim()) return;
    const success = await joinRoom(roomIdInput.trim(), userName.trim());
    if (success) {
      navigate('/room');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
            <Tv size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SyncWatch Party
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Watch YouTube in synchronized harmony with friends worldwide.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            style={{ flex: 1, padding: '8px', border: 'none', background: tab === 'create' ? 'var(--gradient-primary)' : 'transparent', color: '#fff', fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => setTab('create')}
          >
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} /> Create Room
          </button>
          <button
            style={{ flex: 1, padding: '8px', border: 'none', background: tab === 'join' ? 'var(--gradient-primary)' : 'transparent', color: '#fff', fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => setTab('join')}
          >
            <Users size={14} style={{ display: 'inline', marginRight: '6px' }} /> Join Room
          </button>
        </div>

        {/* Form Container */}
        {tab === 'create' ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Alex Mercer"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Party Room Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Friday Movie Night"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Initial YouTube URL (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={initialVideoUrl}
                onChange={(e) => setInitialVideoUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%', padding: '12px' }}>
              <PlayCircle size={18} /> Launch Watch Party
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Sarah Connor"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Room Code ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="watch-xyz-123"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%', padding: '12px' }}>
              <Users size={18} /> Enter Watch Party
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
