/**
 * Generates human-friendly room code formatted as 'word-xyz-123'.
 */
export function generateRoomId(): string {
  const prefixes = ['party', 'sync', 'watch', 'room', 'stream', 'cinema', 'lounge'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomChars = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${randomChars}`;
}

export function generateParticipantId(): string {
  return `user_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function generateMessageId(): string {
  return `msg_${Math.random().toString(36).substring(2, 9)}`;
}
