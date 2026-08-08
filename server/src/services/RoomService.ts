import { PlaybackState, UserRole } from '@watch-party/shared';
import { IRoomRepository } from '../repositories/IRoomRepository.js';
import { MemoryRoomRepository } from '../repositories/MemoryRoomRepository.js';
import { Room } from '../models/Room.js';
import { Participant } from '../models/Participant.js';
import { PermissionService } from './PermissionService.js';
import { generateRoomId, generateParticipantId } from '../utils/idGenerator.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../errors/index.js';

export class RoomService {
  private static instance: RoomService;
  private roomRepository: IRoomRepository;
  private permissionService: PermissionService;

  private constructor() {
    this.roomRepository = MemoryRoomRepository.getInstance();
    this.permissionService = PermissionService.getInstance();
  }

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  /**
   * Creates a new watch party room with creator as HOST.
   */
  public async createRoom(roomName: string, userName: string, initialVideoId?: string, avatarUrl?: string): Promise<{ room: Room; participant: Participant }> {
    const roomId = generateRoomId();
    const participantId = generateParticipantId();
    
    // Creator is assigned HOST role
    const hostParticipant = new Participant(participantId, '', userName, 'HOST', avatarUrl);
    const room = new Room(roomId, roomName, participantId, initialVideoId || 'dQw4w9WgXcQ');
    
    room.addParticipant(hostParticipant);
    await this.roomRepository.save(room);

    return { room, participant: hostParticipant };
  }

  /**
   * Adds a user to an existing room as a PARTICIPANT.
   */
  public async joinRoom(roomId: string, userName: string, socketId: string, avatarUrl?: string): Promise<{ room: Room; participant: Participant }> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError(`Room with ID '${roomId}' does not exist.`);
    }

    const participantId = generateParticipantId();
    const role: UserRole = room.isEmpty() ? 'HOST' : 'PARTICIPANT';
    const participant = new Participant(participantId, socketId, userName, role, avatarUrl);

    if (role === 'HOST') {
      room.hostId = participantId;
    }

    room.addParticipant(participant);
    await this.roomRepository.save(room);

    return { room, participant };
  }

  /**
   * Updates playback state (PLAYING, PAUSED, SEEK) if participant has permission.
   */
  public async updatePlaybackAction(
    roomId: string,
    socketId: string,
    state: PlaybackState,
    currentTime: number,
    videoId?: string
  ): Promise<Room> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError(`Room '${roomId}' not found`);
    }

    const participant = room.getParticipantBySocketId(socketId);
    if (!participant) {
      throw new UnauthorizedError('Participant not found in room');
    }

    // Verify RBAC permission
    const actionType = state === 'PLAYING' || state === 'PAUSED' ? 'PLAY_PAUSE' : 'SEEK';
    this.permissionService.checkPermission(participant.role, actionType);

    room.updatePlaybackState(state, currentTime, videoId);
    await this.roomRepository.save(room);

    return room;
  }

  /**
   * Change current room video ID.
   */
  public async changeVideo(roomId: string, socketId: string, videoId: string, currentTime: number = 0): Promise<Room> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError(`Room '${roomId}' not found`);
    }

    const participant = room.getParticipantBySocketId(socketId);
    if (!participant) {
      throw new UnauthorizedError('Participant not found in room');
    }

    this.permissionService.checkPermission(participant.role, 'CHANGE_VIDEO');

    room.updatePlaybackState('PAUSED', currentTime, videoId);
    await this.roomRepository.save(room);

    return room;
  }

  /**
   * Transfer HOST privileges to another participant.
   */
  public async transferHost(roomId: string, requesterSocketId: string, targetParticipantId: string): Promise<Room> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Room not found');

    const requester = room.getParticipantBySocketId(requesterSocketId);
    if (!requester) throw new UnauthorizedError('Requester not in room');

    this.permissionService.checkPermission(requester.role, 'TRANSFER_HOST');

    const target = room.getParticipant(targetParticipantId);
    if (!target) throw new NotFoundError('Target participant not found in room');

    // Demote current host to MODERATOR or PARTICIPANT
    requester.updateRole('MODERATOR');
    target.updateRole('HOST');
    room.hostId = target.id;

    await this.roomRepository.save(room);
    return room;
  }

  /**
   * Promote/Demote participant role.
   */
  public async setParticipantRole(roomId: string, requesterSocketId: string, targetParticipantId: string, newRole: UserRole): Promise<Room> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Room not found');

    const requester = room.getParticipantBySocketId(requesterSocketId);
    if (!requester) throw new UnauthorizedError('Requester not in room');

    const action = newRole === 'MODERATOR' ? 'PROMOTE_MODERATOR' : 'DEMOTE_MODERATOR';
    this.permissionService.checkPermission(requester.role, action);

    const target = room.getParticipant(targetParticipantId);
    if (!target) throw new NotFoundError('Target participant not found in room');

    target.updateRole(newRole);
    await this.roomRepository.save(room);

    return room;
  }

  /**
   * Kick a participant out of the room.
   */
  public async kickParticipant(roomId: string, requesterSocketId: string, targetParticipantId: string): Promise<{ room: Room; kickedParticipant: Participant }> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Room not found');

    const requester = room.getParticipantBySocketId(requesterSocketId);
    if (!requester) throw new UnauthorizedError('Requester not in room');

    this.permissionService.checkPermission(requester.role, 'KICK_PARTICIPANT');

    const kicked = room.removeParticipant(targetParticipantId);
    if (!kicked) throw new NotFoundError('Target participant not in room');

    await this.roomRepository.save(room);
    return { room, kickedParticipant: kicked };
  }

  /**
   * Handle user socket disconnect.
   */
  public async handleDisconnect(socketId: string): Promise<{ room: Room; participant: Participant } | null> {
    const result = await this.roomRepository.findBySocketId(socketId);
    if (!result) return null;

    const { room, participantId } = result;
    const participant = room.getParticipant(participantId);

    if (participant) {
      participant.setOnlineStatus(false);
      // If room is empty, remove room after delay
      if (room.getAllParticipants().every(p => !p.isOnline)) {
        await this.roomRepository.delete(room.id);
      } else {
        await this.roomRepository.save(room);
      }
    }

    return participant ? { room, participant } : null;
  }

  public async getRoom(roomId: string): Promise<Room | null> {
    return this.roomRepository.findById(roomId);
  }
}

