export type UserRole = 'HOST' | 'MODERATOR' | 'PARTICIPANT';

export type PlaybackState = 'PLAYING' | 'PAUSED' | 'BUFFERING';

export interface ParticipantDTO {
  id: string;
  socketId: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  joinedAt: number;
  isOnline: boolean;
}

export interface RoomStateDTO {
  id: string;
  name: string;
  hostId: string;
  currentVideoId: string;
  playbackState: PlaybackState;
  lastCalculatedTime: number; // in seconds
  lastStateTimestamp: number; // Unix timestamp in ms when state changed
  participants: ParticipantDTO[];
  createdAt: number;
}

export interface ChatMessageDTO {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
  isSystemMessage?: boolean;
}

export interface ReactionDTO {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  timestamp: number;
}

export interface PlaybackActionPayload {
  roomId: string;
  currentTime: number;
  videoId?: string;
}

export interface JoinRoomPayload {
  roomId: string;
  userName: string;
  avatarUrl?: string;
}

export interface CreateRoomPayload {
  roomName: string;
  userName: string;
  initialVideoId?: string;
  avatarUrl?: string;
}

export interface TransferHostPayload {
  roomId: string;
  targetParticipantId: string;
}

export interface SetRolePayload {
  roomId: string;
  targetParticipantId: string;
  newRole: UserRole;
}

export interface KickParticipantPayload {
  roomId: string;
  targetParticipantId: string;
}

export interface ServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
