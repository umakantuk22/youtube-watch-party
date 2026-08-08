import { UserRole } from './types.js';

export type RoomAction = 
  | 'PLAY_PAUSE'
  | 'SEEK'
  | 'CHANGE_VIDEO'
  | 'SEND_CHAT'
  | 'SEND_REACTION'
  | 'TRANSFER_HOST'
  | 'PROMOTE_MODERATOR'
  | 'DEMOTE_MODERATOR'
  | 'KICK_PARTICIPANT';

export const ROLE_PERMISSIONS: Record<UserRole, Set<RoomAction>> = {
  HOST: new Set([
    'PLAY_PAUSE',
    'SEEK',
    'CHANGE_VIDEO',
    'SEND_CHAT',
    'SEND_REACTION',
    'TRANSFER_HOST',
    'PROMOTE_MODERATOR',
    'DEMOTE_MODERATOR',
    'KICK_PARTICIPANT'
  ]),
  MODERATOR: new Set([
    'PLAY_PAUSE',
    'SEEK',
    'CHANGE_VIDEO',
    'SEND_CHAT',
    'SEND_REACTION',
    'KICK_PARTICIPANT'
  ]),
  PARTICIPANT: new Set([
    'SEND_CHAT',
    'SEND_REACTION'
  ])
};

export function hasPermission(role: UserRole, action: RoomAction): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}
