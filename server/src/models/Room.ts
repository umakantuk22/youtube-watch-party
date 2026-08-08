import { PlaybackState, RoomStateDTO, UserRole } from '@watch-party/shared';
import { Participant } from './Participant';

export class Room {
  public readonly id: string;
  public name: string;
  public hostId: string;
  public currentVideoId: string;
  public playbackState: PlaybackState;
  public lastCalculatedTime: number; // In seconds
  public lastStateTimestamp: number; // Unix timestamp in ms
  public readonly createdAt: number;
  private participants: Map<string, Participant>;

  constructor(id: string, name: string, hostId: string, initialVideoId: string = 'dQw4w9WgXcQ') {
    this.id = id;
    this.name = name;
    this.hostId = hostId;
    this.currentVideoId = initialVideoId;
    this.playbackState = 'PAUSED';
    this.lastCalculatedTime = 0;
    this.lastStateTimestamp = Date.now();
    this.createdAt = Date.now();
    this.participants = new Map<string, Participant>();
  }

  /**
   * Dynamically calculates current expected video timestamp in seconds.
   * If the video is PLAYING, elapsed real-time since lastStateTimestamp is added.
   */
  public getCalculatedTime(): number {
    if (this.playbackState !== 'PLAYING') {
      return this.lastCalculatedTime;
    }
    const elapsedSeconds = (Date.now() - this.lastStateTimestamp) / 1000;
    return this.lastCalculatedTime + elapsedSeconds;
  }

  /**
   * Updates playback state, re-anchoring lastCalculatedTime and lastStateTimestamp.
   */
  public updatePlaybackState(state: PlaybackState, newTime?: number, videoId?: string): void {
    const currentExpectedTime = newTime !== undefined ? newTime : this.getCalculatedTime();
    
    this.playbackState = state;
    this.lastCalculatedTime = Math.max(0, currentExpectedTime);
    this.lastStateTimestamp = Date.now();

    if (videoId && videoId !== this.currentVideoId) {
      this.currentVideoId = videoId;
      this.lastCalculatedTime = 0;
    }
  }

  public addParticipant(participant: Participant): void {
    this.participants.set(participant.id, participant);
  }

  public removeParticipant(participantId: string): Participant | undefined {
    const participant = this.participants.get(participantId);
    if (participant) {
      this.participants.delete(participantId);
      // Auto-transfer host if the leaving participant was host
      if (this.hostId === participantId && this.participants.size > 0) {
        const nextHost = Array.from(this.participants.values())[0];
        this.hostId = nextHost.id;
        nextHost.updateRole('HOST');
      }
    }
    return participant;
  }

  public getParticipant(participantId: string): Participant | undefined {
    return this.participants.get(participantId);
  }

  public getParticipantBySocketId(socketId: string): Participant | undefined {
    return Array.from(this.participants.values()).find(p => p.socketId === socketId);
  }

  public getAllParticipants(): Participant[] {
    return Array.from(this.participants.values());
  }

  public isEmpty(): boolean {
    return this.participants.size === 0;
  }

  public toDTO(): RoomStateDTO {
    return {
      id: this.id,
      name: this.name,
      hostId: this.hostId,
      currentVideoId: this.currentVideoId,
      playbackState: this.playbackState,
      lastCalculatedTime: this.getCalculatedTime(),
      lastStateTimestamp: this.lastStateTimestamp,
      participants: this.getAllParticipants().map(p => p.toDTO()),
      createdAt: this.createdAt
    };
  }
}
