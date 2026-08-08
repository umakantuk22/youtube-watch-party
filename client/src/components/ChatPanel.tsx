import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { Send, Smile } from 'lucide-react';

const EMOJI_PALETTE = ['🔥', '❤️', '😂', '😮', '👏', '🎉', '💩', '💯'];

export const ChatPanel: React.FC = () => {
  const { chatMessages, sendChatMessage, sendReaction } = useRoom();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Party Chat</h3>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: msg.isSystemMessage ? '6px 10px' : '8px 12px',
              background: msg.isSystemMessage ? 'rgba(255, 255, 255, 0.02)' : 'rgba(18, 22, 31, 0.6)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: msg.isSystemMessage ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            {!msg.isSystemMessage ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: msg.senderRole === 'HOST' ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  {msg.senderName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                {msg.text}
              </span>
            )}
            {!msg.isSystemMessage && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emoji Palette Selector */}
      {showEmojiPicker && (
        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-sm)', justifyContent: 'space-around' }}>
          {EMOJI_PALETTE.map((emoji) => (
            <button
              key={emoji}
              style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
              onClick={() => {
                sendReaction(emoji);
                setShowEmojiPicker(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '8px' }}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={18} />
        </button>

        <input
          type="text"
          className="input-field"
          placeholder="Send message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
