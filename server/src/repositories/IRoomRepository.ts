import { Room } from '../models/Room';

export interface IRoomRepository {
  save(room: Room): Promise<void>;
  findById(roomId: string): Promise<Room | null>;
  delete(roomId: string): Promise<boolean>;
  findAll(): Promise<Room[]>;
  findBySocketId(socketId: string): Promise<{ room: Room; participantId: string } | null>;
}
