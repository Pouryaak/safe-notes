export enum NoteType {
  GENERAL = 'GENERAL',
  SECURE = 'SECURE',
  TODO = 'TODO',
  REMINDER = 'REMINDER'
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export interface Note {
  id: string;
  folderId: string | null; // null means root
  title: string;
  content: string;
  type: NoteType;
  isEncrypted: boolean;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}

export interface VaultState {
  isLocked: boolean;
  lastActivity: number;
}
