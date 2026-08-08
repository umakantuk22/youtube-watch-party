import { Server, Socket } from 'socket.io';
import { SocketEvents, ChatMessageDTO, ReactionDTO } from '@watch-party/shared';
import { RoomService } from '../services/RoomService.js';
import { generateMessageId } from '../utils/idGenerator.js';
import {
  createRoomSchema,
  joinRoomSchema,
  playbackActionSchema,
  transferHostSchema,
  setRoleSchema,
  kickParticipantSchema,
  chatMessageSchema
} from '../utils/validators.js';

export class SocketManager {
  private io: Server;
  private roomService: RoomService;

  constructor(io: Server) {
    this.io = io;
    this.roomService = RoomService.getInstance();
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[SocketManager] Client connected: ${socket.id}`);

      // 1. Create Room
      socket.on(SocketEvents.ROOM_CREATE, async (payload, callback) => {
        try {
          const validated = createRoomSchema.parse(payload);
          const { room, participant } = await this.roomService.createRoom(
            validated.roomName,
            validated.userName,
            validated.initialVideoId,
            validated.avatarUrl
          );

          // Update participant socketId
          participant.socketId = socket.id;
          socket.join(room.id);

          console.log(`[Room Created] Room ID: ${room.id}, Host: ${participant.name}`);

          if (typeof callback === 'function') {
            callback({ success: true, data: { room: room.toDTO(), participant: participant.toDTO() } });
          }
        } catch (error: any) {
          if (typeof callback === 'function') {
            callback({ success: false, error: error.message || 'Failed to create room' });
          }
        }
      });

      // 2. Join Room
      socket.on(SocketEvents.ROOM_JOIN, async (payload, callback) => {
        try {
          const validated = joinRoomSchema.parse(payload);
          const { room, participant } = await this.roomService.joinRoom(
            validated.roomId,
            validated.userName,
            socket.id,
            validated.avatarUrl
          );

          socket.join(room.id);

          // Broadcast to room that a new participant joined
          socket.to(room.id).emit(SocketEvents.PARTICIPANT_JOINED, participant.toDTO());

          // Send system chat message
          const sysMessage: ChatMessageDTO = {
            id: generateMessageId(),
            roomId: room.id,
            senderId: 'system',
            senderName: 'System',
            senderRole: 'HOST',
            text: `${participant.name} joined the watch party!`,
            timestamp: Date.now(),
            isSystemMessage: true
          };
          this.io.to(room.id).emit(SocketEvents.CHAT_MESSAGE, sysMessage);

          if (typeof callback === 'function') {
            callback({ success: true, data: { room: room.toDTO(), participant: participant.toDTO() } });
          }
        } catch (error: any) {
          if (typeof callback === 'function') {
            callback({ success: false, error: error.message || 'Failed to join room' });
          }
        }
      });

      // 3. Play Action
      socket.on(SocketEvents.ACTION_PLAY, async (payload) => {
        try {
          const validated = playbackActionSchema.parse(payload);
          const room = await this.roomService.updatePlaybackAction(
            validated.roomId,
            socket.id,
            'PLAYING',
            validated.currentTime,
            validated.videoId
          );

          // Broadcast sync event to all participants in room
          this.io.to(room.id).emit(SocketEvents.SYNC_PLAY, {
            roomId: room.id,
            currentTime: room.getCalculatedTime(),
            lastStateTimestamp: room.lastStateTimestamp
          });
        } catch (error: any) {
          socket.emit(SocketEvents.ERROR, { message: error.message });
        }
      });

      // 4. Pause Action
      socket.on(SocketEvents.ACTION_PAUSE, async (payload) => {
        try {
          const validated = playbackActionSchema.parse(payload);
          const room = await this.roomService.updatePlaybackAction(
            validated.roomId,
            socket.id,
            'PAUSED',
            validated.currentTime,
            validated.videoId
          );

          this.io.to(room.id).emit(SocketEvents.SYNC_PAUSE, {
            roomId: room.id,
            currentTime: room.getCalculatedTime(),
            lastStateTimestamp: room.lastStateTimestamp
          });
        } catch (error: any) {
          socket.emit(SocketEvents.ERROR, { message: error.message });
        }
      });

      // 5. Seek Action
      socket.on(SocketEvents.ACTION_SEEK, async (payload) => {
        try {
          const validated = playbackActionSchema.parse(payload);
          const room = await this.roomService.updatePlaybackAction(
            validated.roomId,
            socket.id,
            'PAUSED',
            validated.currentTime,
            validated.videoId
          );

          this.io.to(room.id).emit(SocketEvents.SYNC_SEEK, {
            roomId: room.id,
            currentTime: room.getCalculatedTime(),
            lastStateTimestamp: room.lastStateTimestamp
          });
        } catch (error: any) {
          socket.emit(SocketEvents.ERROR, { message: error.message });
        }
      });

      // 6. Change Video Action
      socket.on(SocketEvents.ACTION_CHANGE_VIDEO, async (payload) => {
        try {
          const validated = playbackActionSchema.parse(payload);
          if (!validated.videoId) return;

          const room = await this.roomService.changeVideo(
            validated.roomId,
            socket.id,
            validated.videoId,
            validated.currentTime
          );

          this.io.to(room.id).emit(SocketEvents.SYNC_CHANGE_VIDEO, {
            roomId: room.id,
            videoId: room.currentVideoId,
            currentTime: 0
          });
        } catch (error: any) {
          socket.emit(SocketEvents.ERROR, { message: error.message });
        }
      });

      // 7. Request Full Room Sync State (Late Joiners / Resync)
      socket.on(SocketEvents.ACTION_SYNC_REQUEST, async ({ roomId }, callback) => {
        try {
          const room = await this.roomService.getRoom(roomId);
          if (room && typeof callback === 'function') {
            callback({ success: true, data: room.toDTO() });
          }
        } catch (error: any) {
          if (typeof callback === 'function') {
            callback({ success: false, error: error.message });
          }
        }
      });

      // 8. Admin Host Transfer
      socket.on(SocketEvents.ADMIN_TRANSFER_HOST, async (payload, callback) => {
        try {
          const validated = transferHostSchema.parse(payload);
          const room = await this.roomService.transferHost(
            validated.roomId,
            socket.id,
            validated.targetParticipantId
          );

          this.io.to(room.id).emit(SocketEvents.ROOM_STATE_SYNC, room.toDTO());
          if (typeof callback === 'function') callback({ success: true });
        } catch (error: any) {
          if (typeof callback === 'function') callback({ success: false, error: error.message });
        }
      });

      // 9. Admin Set Role
      socket.on(SocketEvents.ADMIN_SET_ROLE, async (payload, callback) => {
        try {
          const validated = setRoleSchema.parse(payload);
          const room = await this.roomService.setParticipantRole(
            validated.roomId,
            socket.id,
            validated.targetParticipantId,
            validated.newRole
          );

          this.io.to(room.id).emit(SocketEvents.ROOM_STATE_SYNC, room.toDTO());
          if (typeof callback === 'function') callback({ success: true });
        } catch (error: any) {
          if (typeof callback === 'function') callback({ success: false, error: error.message });
        }
      });

      // 10. Admin Kick Participant
      socket.on(SocketEvents.ADMIN_KICK_PARTICIPANT, async (payload, callback) => {
        try {
          const validated = kickParticipantSchema.parse(payload);
          const { room, kickedParticipant } = await this.roomService.kickParticipant(
            validated.roomId,
            socket.id,
            validated.targetParticipantId
          );

          // Disconnect target socket
          if (kickedParticipant.socketId) {
            const targetSocket = this.io.sockets.sockets.get(kickedParticipant.socketId);
            if (targetSocket) {
              targetSocket.emit(SocketEvents.ERROR, { message: 'You have been kicked from the room by the host.' });
              targetSocket.leave(room.id);
            }
          }

          this.io.to(room.id).emit(SocketEvents.ROOM_STATE_SYNC, room.toDTO());
          if (typeof callback === 'function') callback({ success: true });
        } catch (error: any) {
          if (typeof callback === 'function') callback({ success: false, error: error.message });
        }
      });

      // 11. Chat Messaging
      socket.on(SocketEvents.CHAT_SEND, async (payload) => {
        try {
          const validated = chatMessageSchema.parse(payload);
          const room = await this.roomService.getRoom(validated.roomId);
          if (!room) return;

          const participant = room.getParticipantBySocketId(socket.id);
          if (!participant) return;

          const message: ChatMessageDTO = {
            id: generateMessageId(),
            roomId: room.id,
            senderId: participant.id,
            senderName: participant.name,
            senderRole: participant.role,
            text: validated.text,
            timestamp: Date.now()
          };

          this.io.to(room.id).emit(SocketEvents.CHAT_MESSAGE, message);
        } catch (error: any) {
          socket.emit(SocketEvents.ERROR, { message: error.message });
        }
      });

      // 12. Emoji Micro-Reactions
      socket.on(SocketEvents.REACTION_SEND, async ({ roomId, emoji }) => {
        try {
          const room = await this.roomService.getRoom(roomId);
          if (!room) return;

          const participant = room.getParticipantBySocketId(socket.id);
          if (!participant) return;

          const reaction: ReactionDTO = {
            id: generateMessageId(),
            senderId: participant.id,
            senderName: participant.name,
            emoji,
            timestamp: Date.now()
          };

          this.io.to(room.id).emit(SocketEvents.REACTION_RECEIVE, reaction);
        } catch (error: any) {
          socket.emit(SocketEvents.ERROR, { message: error.message });
        }
      });

      // 13. Socket Disconnect
      socket.on('disconnect', async () => {
        console.log(`[SocketManager] Client disconnected: ${socket.id}`);
        const result = await this.roomService.handleDisconnect(socket.id);
        if (result) {
          const { room, participant } = result;
          socket.to(room.id).emit(SocketEvents.PARTICIPANT_LEFT, { participantId: participant.id });
          this.io.to(room.id).emit(SocketEvents.ROOM_STATE_SYNC, room.toDTO());
        }
      });
    });
  }
}

