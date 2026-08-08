import React from 'react';
import { useRoom } from '../context/RoomContext';
import { Crown, Shield, User, UserX, ArrowUpRight } from 'lucide-react';
import { UserRole } from '@watch-party/shared';

export const ParticipantList: React.FC = () => {
  const { room, currentParticipant, transferHost, setRole, kickParticipant, canPerform } = useRoom();

  if (!room) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'HOST':
        return <span className="badge badge-host"><Crown size={12} /> Host</span>;
      case 'MODERATOR':
        return <span className="badge badge-moderator"><Shield size={12} /> Mod</span>;
      default:
        return <span className="badge badge-participant"><User size={12} /> Viewer</span>;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Participants ({room.participants.length})</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
        {room.participants.map((p) => {
          const isSelf = p.id === currentParticipant?.id;
          const isTargetHost = p.role === 'HOST';

          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-sm)',
                border: isSelf ? '1px solid var(--border-glow)' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={p.avatarUrl}
                  alt={p.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.name} {isSelf && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(You)</span>}
                  </div>
                  {getRoleBadge(p.role)}
                </div>
              </div>

              {/* Admin Action Buttons */}
              {!isSelf && !isTargetHost && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {canPerform('TRANSFER_HOST') && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => transferHost(p.id)}
                      title="Make Host"
                    >
                      <Crown size={12} color="var(--accent-red)" />
                    </button>
                  )}

                  {canPerform('PROMOTE_MODERATOR') && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setRole(p.id, p.role === 'MODERATOR' ? 'PARTICIPANT' : 'MODERATOR')}
                      title={p.role === 'MODERATOR' ? 'Demote to Viewer' : 'Promote to Mod'}
                    >
                      <Shield size={12} color="#a855f7" />
                    </button>
                  )}

                  {canPerform('KICK_PARTICIPANT') && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => kickParticipant(p.id)}
                      title="Kick Participant"
                    >
                      <UserX size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
