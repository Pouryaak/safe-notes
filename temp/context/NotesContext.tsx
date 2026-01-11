import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Note, Folder, NoteType } from '../types';
import { getNotes, saveNotes, getFolders, saveFolders } from '../services/storageService';
import { AUTO_LOCK_TIMEOUT_MS } from '../constants';

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  searchQuery: string;
  isVaultLocked: boolean;
  setActiveNoteId: (id: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  createNote: (folderId: string | null, type: NoteType) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  createFolder: (name: string, parentId: string | null) => void;
  deleteFolder: (id: string) => void;
  unlockVault: () => void;
  lockVault: () => void;
  refreshActivity: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Load initial data
  useEffect(() => {
    setNotes(getNotes());
    setFolders(getFolders());
  }, []);

  // Persistence
  useEffect(() => {
    if (notes.length > 0) saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (folders.length > 0) saveFolders(folders);
  }, [folders]);

  // Auto-lock timer
  useEffect(() => {
    const checkLock = () => {
      if (!isVaultLocked && Date.now() - lastActivity > AUTO_LOCK_TIMEOUT_MS) {
        setIsVaultLocked(true);
        setActiveNoteId(null); // Close active note on lock for security
      }
    };
    
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [isVaultLocked, lastActivity]);

  const refreshActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  const createNote = (folderId: string | null, type: NoteType) => {
    refreshActivity();
    const newNote: Note = {
      id: crypto.randomUUID(),
      folderId,
      title: 'Untitled Note',
      content: '',
      type,
      isEncrypted: type === NoteType.SECURE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    refreshActivity();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    refreshActivity();
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const createFolder = (name: string, parentId: string | null) => {
    refreshActivity();
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      parentId,
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const deleteFolder = (id: string) => {
    refreshActivity();
    // Recursive deletion logic could go here, for now simple delete
    setFolders(prev => prev.filter(f => f.id !== id));
    // Reset active folder if deleted
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const unlockVault = () => {
    setIsVaultLocked(false);
    refreshActivity();
  };

  const lockVault = () => {
    setIsVaultLocked(true);
    setActiveNoteId(null);
  };

  return (
    <NotesContext.Provider value={{
      notes,
      folders,
      activeNoteId,
      activeFolderId,
      searchQuery,
      isVaultLocked,
      setActiveNoteId,
      setActiveFolderId,
      setSearchQuery,
      createNote,
      updateNote,
      deleteNote,
      createFolder,
      deleteFolder,
      unlockVault,
      lockVault,
      refreshActivity
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
};
