import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { NoteType } from '../../types';
import { NOTE_TYPE_ICONS } from '../../constants';
import { Plus, Search, Sparkles } from 'lucide-react';
import { askAiAboutNotes } from '../../services/geminiService';

export const NoteList: React.FC = () => {
  const { 
    notes, 
    activeFolderId, 
    activeNoteId, 
    setActiveNoteId, 
    createNote, 
    searchQuery, 
    setSearchQuery,
    isVaultLocked 
  } = useNotes();
  
  const [isAiSearching, setIsAiSearching] = React.useState(false);

  // Filter notes based on folder and search
  const filteredNotes = notes.filter(note => {
    // 1. Folder filter
    if (activeFolderId && note.folderId !== activeFolderId) return false;
    
    // 2. Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
    }
    
    return true;
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleCreate = (type: NoteType) => {
    createNote(activeFolderId, type);
  };

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setIsAiSearching(true);
    const answer = await askAiAboutNotes(searchQuery, notes);
    alert(`AI Answer:\n\n${answer}`);
    setIsAiSearching(false);
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-full flex flex-col flex-shrink-0">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400"
          />
        </div>
        {searchQuery && (
          <button 
            onClick={handleAiSearch}
            disabled={isAiSearching}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
          >
            <Sparkles size={12} />
            {isAiSearching ? 'Thinking...' : 'Ask AI'}
          </button>
        )}
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
            <p>No notes found.</p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const Icon = NOTE_TYPE_ICONS[note.type];
            // If locked and encrypted, show limited info
            const isLocked = note.isEncrypted && isVaultLocked;

            return (
              <div 
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`
                  p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50
                  ${activeNoteId === note.id ? 'bg-brand-50 border-brand-200' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-semibold text-sm truncate pr-2 ${activeNoteId === note.id ? 'text-brand-900' : 'text-slate-800'}`}>
                    {isLocked ? '• • • • • •' : (note.title || 'Untitled Note')}
                  </h3>
                  {note.isEncrypted && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLocked ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                      {isLocked ? 'LOCKED' : 'SECURE'}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                     <Icon size={12} />
                     {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  {!isLocked && (
                    <p className="truncate opacity-70 max-w-[120px]">
                      {note.content.substring(0, 30) || "No content"}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="p-3 border-t border-slate-200 grid grid-cols-4 gap-2">
        {(Object.keys(NOTE_TYPE_ICONS) as NoteType[]).map((type) => {
          const Icon = NOTE_TYPE_ICONS[type];
          return (
            <button
              key={type}
              onClick={() => handleCreate(type)}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-600 transition-colors"
              title={`Create ${type}`}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>
    </div>
  );
};
