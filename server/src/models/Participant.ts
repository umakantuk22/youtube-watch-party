import { UserRole, ParticipantDTO } from '@watch-party/shared';

export class Participant {
  public readonly id: string;
  public socketId: string;
  public name: string;
  public role: UserRole;
  public avatarUrl: string;
  public readonly joinedAt: number;
  public isOnline: boolean;

  constructor(id: string, socketId: string, name: string, role: UserRole, avatarUrl?: string) {
    this.id = id;
    this.socketId = socketId;
    this.name = name;
    this.role = role;
    this.avatarUrl = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    this.joinedAt = Date.now();
    this.isOnline = true;
  }

  public updateRole(newRole: UserRole): void {
    this.role = newRole;
  }

  public setOnlineStatus(isOnline: boolean, newSocketId?: string): void {
    this.isOnline = isOnline;
    if (newSocketId) {
      this.socketId = newSocketId;
    }
  }

  public toDTO(): ParticipantDTO {
    return {
      id: this.id,
      socketId: this.socketId,
      name: this.name,
      role: this.role,
      avatarUrl: this.avatarUrl,
      joinedAt: this.joinedAt,
      isOnline: this.isOnline
    };
  }
}
