export interface Session {
  id: string;
  name: string;
  slug: string;
  status: SessionStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  photoCount?: number;
  coverPhoto?: string;
}

export type SessionStatus = 'active' | 'expired' | 'deleted';

export type SessionType =
  | 'Wedding'
  | 'Birthday'
  | 'Corporate Event'
  | 'Graduation'
  | 'Family Session'
  | 'Other';

export interface CreateSessionDto {
  name: string;
  type: SessionType;
  expiresAt?: string | null;
}

export interface UpdateSessionDto {
  name?: string;
  status?: SessionStatus;
  expiresAt?: string | null;
}
