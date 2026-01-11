import { Note, Folder, NoteType } from '../types';

const NOTES_KEY = 'fortress_notes';
const FOLDERS_KEY = 'fortress_folders';

// Initial Mock Data
const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Personal', parentId: null, createdAt: Date.now() },
  { id: 'f2', name: 'Work', parentId: null, createdAt: Date.now() },
  { id: 'f3', name: 'Projects', parentId: 'f2', createdAt: Date.now() },
];

const INITIAL_NOTES: Note[] = [
  { 
    id: 'n1', 
    folderId: 'f1', 
    title: 'Grocery List', 
    content: '- Milk\n- Eggs\n- Bread', 
    type: NoteType.TODO, 
    isEncrypted: false, 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  },
  { 
    id: 'n2', 
    folderId: 'f3', 
    title: 'Project Alpha Secrets', 
    content: 'The launch codes are 888-999.', 
    type: NoteType.SECURE, 
    isEncrypted: true, 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  },
  { 
    id: 'n3', 
    folderId: null, 
    title: 'Welcome to Fortress', 
    content: 'This is a secure note taking app. Try creating a Secure note!', 
    type: NoteType.GENERAL, 
    isEncrypted: false, 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  },
];

export const getFolders = (): Folder[] => {
  const data = localStorage.getItem(FOLDERS_KEY);
  return data ? JSON.parse(data) : INITIAL_FOLDERS;
};

export const saveFolders = (folders: Folder[]) => {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
};

export const getNotes = (): Note[] => {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : INITIAL_NOTES;
};

export const saveNotes = (notes: Note[]) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};
