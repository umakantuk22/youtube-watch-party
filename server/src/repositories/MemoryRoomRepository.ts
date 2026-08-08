import { IRoomRepository } from './IRoomRepository';
import { Room } from '../models/Room';

export class MemoryRoomRepository implements IRoomRepository {
  private static instance: MemoryRoomRepository;
  private rooms: Map<string, Room>;

  private constructor() {
    this.rooms = new Map<string, Room>();
  }

  public static getInstance(): MemoryRoomRepository {
    if (!MemoryRoomRepository.instance) {
      MemoryRoomRepository.instance = new MemoryRoomRepository();
    }
    return MemoryRoomRepository.instance;
  }

  public async save(room: Room): Promise<void> {
    this.rooms.set(room.id, room);
  }

  public async findById(roomId: string): Promise<Room | null> {
    return this.rooms.get(roomId) || null;
  }

  public async delete(roomId: string): Promise<boolean> {
    return this.rooms.delete(roomId);
  }

  public async findAll(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  public async findBySocketId(socketId: string): Promise<{ room: Room; participantId: string } | null> {
    for (const room of this.rooms.values()) {
      const participant = room.getParticipantBySocketId(socketId);
      if (participant) {
        return { room, participantId: participant.id };
      }
    }
    return null;
  }
}
