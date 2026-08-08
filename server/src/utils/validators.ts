import { z } from 'zod';

export const createRoomSchema = z.object({
  roomName: z.string().min(2).max(50),
  userName: z.string().min(2).max(30),
  initialVideoId: z.string().optional(),
  avatarUrl: z.string().optional()
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(3),
  userName: z.string().min(2).max(30),
  avatarUrl: z.string().optional()
});

export const playbackActionSchema = z.object({
  roomId: z.string(),
  currentTime: z.number().min(0),
  videoId: z.string().optional()
});

export const transferHostSchema = z.object({
  roomId: z.string(),
  targetParticipantId: z.string()
});

export const setRoleSchema = z.object({
  roomId: z.string(),
  targetParticipantId: z.string(),
  newRole: z.enum(['HOST', 'MODERATOR', 'PARTICIPANT'])
});

export const kickParticipantSchema = z.object({
  roomId: z.string(),
  targetParticipantId: z.string()
});

export const chatMessageSchema = z.object({
  roomId: z.string(),
  text: z.string().min(1).max(500)
});
