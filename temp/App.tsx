import React, { useEffect } from 'react';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Sidebar } from './components/layout/Sidebar';
import { NoteList } from './components/notes/NoteList';
import { NoteEditor } from './components/notes/NoteEditor';

const AppLayout: React.FC = () => {
  const { refreshActivity } = useNotes();

  // Track global user activity for auto-lock
  useEffect(() => {
    const handleActivity = () => refreshActivity();
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [refreshActivity]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      <Sidebar />
      <NoteList />
      <NoteEditor />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotesProvider>
      <AppLayout />
    </NotesProvider>
  );
};

export default App;
