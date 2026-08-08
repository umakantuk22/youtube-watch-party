import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  RoomStateDTO,
  ParticipantDTO,
  ChatMessageDTO,
  ReactionDTO,
  SocketEvents,
  UserRole,
  hasPermission,
  RoomAction
} from '@watch-party/shared';
import { useSocketContext } from './SocketContext';

interface IRoomContext {
  room: RoomStateDTO | null;
  currentParticipant: ParticipantDTO | null;
  chatMessages: ChatMessageDTO[];
  floatingReactions: ReactionDTO[];
  createRoom: (roomName: string, userName: string, initialVideoId?: string) => Promise<boolean>;
  joinRoom: (roomId: string, userName: string) => Promise<boolean>;
  sendPlaybackAction: (type: 'PLAY' | 'PAUSE' | 'SEEK', currentTime: number) => void;
  changeVideo: (videoId: string) => void;
  sendChatMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;
  transferHost: (targetParticipantId: string) => void;
  setRole: (targetParticipantId: string, newRole: UserRole) => void;
  kickParticipant: (targetParticipantId: string) => void;
  canPerform: (action: RoomAction) => boolean;
}

const RoomContext = createContext<IRoomContext | null>(null);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocketContext();
  const [room, setRoom] = useState<RoomStateDTO | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantDTO | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageDTO[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<ReactionDTO[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Room Sync Event
    socket.on(SocketEvents.ROOM_STATE_SYNC, (updatedRoom: RoomStateDTO) => {
      setRoom(updatedRoom);
      // Update local participant state if role changed
      if (currentParticipant) {
        const updatedSelf = updatedRoom.participants.find(p => p.id === currentParticipant.id);
        if (updatedSelf) setCurrentParticipant(updatedSelf);
      }
    });

    // Participant joined
    socket.on(SocketEvents.PARTICIPANT_JOINED, (newParticipant: ParticipantDTO) => {
      setRoom(prev => prev ? { ...prev, participants: [...prev.participants, newParticipant] } : null);
    });

    // Participant left
    socket.on(SocketEvents.PARTICIPANT_LEFT, ({ participantId }) => {
      setRoom(prev => prev ? {
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantId)
      } : null);
    });

    // Chat Message
    socket.on(SocketEvents.CHAT_MESSAGE, (msg: ChatMessageDTO) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // Reaction
    socket.on(SocketEvents.REACTION_RECEIVE, (reaction: ReactionDTO) => {
      setFloatingReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    });

    return () => {
      socket.off(SocketEvents.ROOM_STATE_SYNC);
      socket.off(SocketEvents.PARTICIPANT_JOINED);
      socket.off(SocketEvents.PARTICIPANT_LEFT);
      socket.off(SocketEvents.CHAT_MESSAGE);
      socket.off(SocketEvents.REACTION_RECEIVE);
    };
  }, [socket, currentParticipant]);

  const createRoom = (roomName: string, userName: string, initialVideoId?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket) return resolve(false);
      socket.emit(SocketEvents.ROOM_CREATE, { roomName, userName, initialVideoId }, (res: any) => {
        if (res.success) {
          setRoom(res.data.room);
          setCurrentParticipant(res.data.participant);
          resolve(true);
        } else {
          alert(res.error || 'Error creating room');
          resolve(false);
        }
      });
    });
  };

  const joinRoom = (roomId: string, userName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket) return resolve(false);
      socket.emit(SocketEvents.ROOM_JOIN, { roomId, userName }, (res: any) => {
        if (res.success) {
          setRoom(res.data.room);
          setCurrentParticipant(res.data.participant);
          resolve(true);
        } else {
          alert(res.error || 'Error joining room');
          resolve(false);
        }
      });
    });
  };

  const sendPlaybackAction = (type: 'PLAY' | 'PAUSE' | 'SEEK', currentTime: number) => {
    if (!socket || !room) return;
    const eventName = type === 'PLAY' ? SocketEvents.ACTION_PLAY : type === 'PAUSE' ? SocketEvents.ACTION_PAUSE : SocketEvents.ACTION_SEEK;
    socket.emit(eventName, { roomId: room.id, currentTime });
  };

  const changeVideo = (videoId: string) => {
    if (!socket || !room) return;
    socket.emit(SocketEvents.ACTION_CHANGE_VIDEO, { roomId: room.id, videoId, currentTime: 0 });
  };

  const sendChatMessage = (text: string) => {
    if (!socket || !room) return;
    socket.emit(SocketEvents.CHAT_SEND, { roomId: room.id, text });
  };

  const sendReaction = (emoji: string) => {
    if (!socket || !room) return;
    socket.emit(SocketEvents.REACTION_SEND, { roomId: room.id, emoji });
  };

  const transferHost = (targetParticipantId: string) => {
    if (!socket || !room) return;
    socket.emit(SocketEvents.ADMIN_TRANSFER_HOST, { roomId: room.id, targetParticipantId });
  };

  const setRole = (targetParticipantId: string, newRole: UserRole) => {
    if (!socket || !room) return;
    socket.emit(SocketEvents.ADMIN_SET_ROLE, { roomId: room.id, targetParticipantId, newRole });
  };

  const kickParticipant = (targetParticipantId: string) => {
    if (!socket || !room) return;
    socket.emit(SocketEvents.ADMIN_KICK_PARTICIPANT, { roomId: room.id, targetParticipantId });
  };

  const canPerform = (action: RoomAction): boolean => {
    if (!currentParticipant) return false;
    return hasPermission(currentParticipant.role, action);
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        currentParticipant,
        chatMessages,
        floatingReactions,
        createRoom,
        joinRoom,
        sendPlaybackAction,
        changeVideo,
        sendChatMessage,
        sendReaction,
        transferHost,
        setRole,
        kickParticipant,
        canPerform
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within a RoomProvider');
  return ctx;
};
