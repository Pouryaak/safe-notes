import { NoteType } from './types';
import { FileText, Lock, CheckSquare, Bell } from 'lucide-react';

export const APP_NAME = "Fortress Notes";
export const AUTO_LOCK_TIMEOUT_MS = 60000 * 5; // 5 minutes
export const VAULT_PASSWORD_MOCK = "1234"; // For demo purposes

export const NOTE_TYPE_ICONS = {
  [NoteType.GENERAL]: FileText,
  [NoteType.SECURE]: Lock,
  [NoteType.TODO]: CheckSquare,
  [NoteType.REMINDER]: Bell,
};

export const NOTE_TYPE_LABELS = {
  [NoteType.GENERAL]: "General",
  [NoteType.SECURE]: "Secure Note",
  [NoteType.TODO]: "To-Do List",
  [NoteType.REMINDER]: "Reminder",
};
