/**
 * Socket.IO Event Names definitions.
 * Using an explicit enum prevents typo-based bugs in real-time event routing.
 */
export enum SocketEvents {
  // Connection & Auth
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Room Management
  ROOM_CREATE = 'room:create',
  ROOM_JOIN = 'room:join',
  ROOM_LEAVE = 'room:leave',
  ROOM_STATE_SYNC = 'room:state_sync',
  PARTICIPANT_JOINED = 'participant:joined',
  PARTICIPANT_LEFT = 'participant:left',
  PARTICIPANT_UPDATED = 'participant:updated',

  // Playback Control Actions (Client -> Server)
  ACTION_PLAY = 'action:play',
  ACTION_PAUSE = 'action:pause',
  ACTION_SEEK = 'action:seek',
  ACTION_CHANGE_VIDEO = 'action:change_video',
  ACTION_SYNC_REQUEST = 'action:sync_request',

  // Playback Sync Events (Server -> Client)
  SYNC_PLAY = 'sync:play',
  SYNC_PAUSE = 'sync:pause',
  SYNC_SEEK = 'sync:seek',
  SYNC_CHANGE_VIDEO = 'sync:change_video',

  // RBAC & Room Admin Actions
  ADMIN_TRANSFER_HOST = 'admin:transfer_host',
  ADMIN_SET_ROLE = 'admin:set_role',
  ADMIN_KICK_PARTICIPANT = 'admin:kick_participant',

  // Chat & Interactions
  CHAT_SEND = 'chat:send',
  CHAT_MESSAGE = 'chat:message',
  REACTION_SEND = 'reaction:send',
  REACTION_RECEIVE = 'reaction:receive'
}
