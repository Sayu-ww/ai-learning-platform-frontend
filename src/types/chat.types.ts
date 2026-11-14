export interface Message {
  id: string;
  roomId?: string;
  chatId?: string;
  senderId: string;
  content: string;
  videoTimestamp?: number;
  replyTo?: string;
  createdAt: Date | string;
}

export interface RoomMessage extends Message {
  roomId: string;
  sender: {
    id: string;
    email: string;
    profile: {
      displayName: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  createdAt: Date;
}

export interface SendMessageRequest {
  content: string;
  videoTimestamp?: number;
  replyTo?: string;
}
