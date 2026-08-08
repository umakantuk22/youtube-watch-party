import React from 'react';
import { useRoom } from '../context/RoomContext';

export const ReactionOverlay: React.FC = () => {
  const { floatingReactions } = useRoom();

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '40px', width: '200px', height: '300px', pointerEvents: 'none', zIndex: 999 }}>
      {floatingReactions.map((reaction, idx) => {
        const randomLeft = Math.floor(Math.sin(idx) * 60) + 70;
        return (
          <div
            key={reaction.id}
            className="floating-reaction"
            style={{ left: `${randomLeft}px` }}
          >
            {reaction.emoji}
          </div>
        );
      })}
    </div>
  );
};
