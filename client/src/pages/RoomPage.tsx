import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { ControlBar } from '../components/ControlBar';
import { ParticipantList } from '../components/ParticipantList';
import { ChatPanel } from '../components/ChatPanel';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { Copy, LogOut, Tv, Users, MessageSquare, Check, Share2, X } from 'lucide-react';

export const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { room, currentParticipant } = useRoom();
  const [copied, setCopied] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants'>('chat');
  const [showShareModal, setShowShareModal] = useState(true); // Auto-show on first load

  if (!room || !currentParticipant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <h2>No active watch party session found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Lobby</button>
      </div>
    );
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px' }}>
      <ReactionOverlay />

      {/* ========== SHARE MODAL — pops up automatically when room is created ========== */}
      {showShareModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Your Watch Party is Live!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                Share this Room Code with your friends so they can join.
              </p>
            </div>

            {/* ROOM CODE — Big and Bold */}
            <div style={{
              background: 'rgba(255, 46, 99, 0.1)',
              border: '2px dashed var(--accent-red)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Room Code
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                letterSpacing: '0.05em',
                wordBreak: 'break-all'
              }}>
                {room.id}
              </div>
            </div>

            {/* Copy Button */}
            <button className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem' }} onClick={() => {
              copyRoomCode();
            }}>
              {copied ? <><Check size={18} /> Copied to Clipboard!</> : <><Copy size={18} /> Copy Room Code</>}
            </button>

            {/* How to join instructions */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>📋 How friends join:</strong>
              <ol style={{ marginTop: '8px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Open <strong>http://localhost:5173</strong> in their browser</li>
                <li>Click <strong>"Join Room"</strong> tab</li>
                <li>Enter their name & paste the code above</li>
                <li>Click <strong>"Enter Watch Party"</strong></li>
              </ol>
            </div>

            <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
              Start Watching →
            </button>
          </div>
        </div>
      )}

      {/* Header Navigation Bar */}
      <header className="glass-card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
            <Tv size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{room.name}</h2>
            {/* Room code always visible in header — clickable to open share modal */}
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                background: 'rgba(255, 46, 99, 0.12)',
                border: '1px solid rgba(255, 46, 99, 0.35)',
                borderRadius: '6px',
                padding: '2px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '3px'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-red)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {room.id}
              </span>
              <Share2 size={11} color="var(--accent-red)" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={copyRoomCode}>
            {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          <button className="btn btn-danger" onClick={() => navigate('/')}>
            <LogOut size={16} /> Leave Party
          </button>
        </div>
      </header>

      {/* Dashboard Main Content Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', flex: 1, height: 'calc(100vh - 110px)' }}>
        
        {/* Left Column: Video View & Playback Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>
          <VideoPlayer />
          <ControlBar />
        </div>

        {/* Right Column: Dynamic Sidebar (Chat & Participants) */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Sidebar Tab Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
            <button
              style={{ flex: 1, padding: '8px', border: 'none', background: sidebarTab === 'chat' ? 'var(--gradient-primary)' : 'transparent', color: '#fff', fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onClick={() => setSidebarTab('chat')}
            >
              <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px' }} /> Chat
            </button>
            <button
              style={{ flex: 1, padding: '8px', border: 'none', background: sidebarTab === 'participants' ? 'var(--gradient-primary)' : 'transparent', color: '#fff', fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onClick={() => setSidebarTab('participants')}
            >
              <Users size={14} style={{ display: 'inline', marginRight: '6px' }} /> People ({room.participants.length})
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {sidebarTab === 'chat' ? <ChatPanel /> : <ParticipantList />}
          </div>
        </div>
      </div>
    </div>
  );
};

