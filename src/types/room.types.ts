export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  isPermanent: boolean;
  ownerId: string;
  courseId?: string;
  lessonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MyRoom extends Room {
  userRole: RoomParticipant['role'];
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'participant';
  joinedAt: Date;
}

export interface RoomParticipantDetails extends RoomParticipant {
  user: {
    id: string;
    email: string;
    profile: {
      displayName: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  type: 'public' | 'private';
  isPermanent?: boolean;
}
