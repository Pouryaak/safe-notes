import React, { useEffect, useState, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { NoteType } from '../../types';
import { NOTE_TYPE_LABELS, NOTE_TYPE_ICONS } from '../../constants';
import { Trash2, Lock, Sparkles, Folder, Clock } from 'lucide-react';
import { generateNoteSummary } from '../../services/geminiService';

export const NoteEditor: React.FC = () => {
  const { notes, activeNoteId, updateNote, deleteNote, isVaultLocked, folders } = useNotes();
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const note = notes.find(n => n.id === activeNoteId);
  const folder = folders.find(f => f.id === note?.folderId);

  // Reset summary when note changes
  useEffect(() => {
    setSummary(null);
  }, [activeNoteId]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Sparkles size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a note to view details</p>
        <p className="text-sm">or create a new one from the list</p>
      </div>
    );
  }

  const isLocked = note.isEncrypted && isVaultLocked;

  if (isLocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 text-slate-500">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <Lock size={32} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Note is Locked</h2>
        <p className="max-w-md text-center mb-8">
          This content is encrypted securely. Please unlock the vault via the sidebar to access this information.
        </p>
      </div>
    );
  }

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const res = await generateNoteSummary(note.content);
    setSummary(res);
    setIsGeneratingSummary(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Simple tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      target.value = target.value.substring(0, start) + "\t" + target.value.substring(end);
      target.selectionStart = target.selectionEnd = start + 1;
      updateNote(note.id, { content: target.value });
    }
  };

  const NoteIcon = NOTE_TYPE_ICONS[note.type];

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Editor Toolbar/Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 text-slate-500">
           <span className="p-2 bg-slate-100 rounded-lg">
             <NoteIcon size={20} className={note.isEncrypted ? 'text-orange-500' : 'text-slate-500'} />
           </span>
           <div className="flex flex-col">
             <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {NOTE_TYPE_LABELS[note.type]}
             </span>
             <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={10} />
                {new Date(note.updatedAt).toLocaleString()}
                {folder && (
                  <>
                    <span>•</span>
                    <Folder size={10} />
                    {folder.name}
                  </>
                )}
             </div>
           </div>
        </div>

        <div className="flex items-center gap-2">
           {note.content.length > 50 && (
             <button 
                onClick={handleGenerateSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors mr-2"
                disabled={isGeneratingSummary}
             >
               <Sparkles size={14} />
               {isGeneratingSummary ? 'Summarizing...' : 'Summarize'}
             </button>
           )}
           <button 
             onClick={() => {
                if(confirm("Are you sure you want to delete this note?")) {
                  deleteNote(note.id);
                }
             }}
             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
             title="Delete Note"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {summary && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-800 flex gap-3 animate-fade-in">
              <Sparkles size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-1 font-semibold text-purple-900">AI Summary</strong>
                {summary}
              </div>
              <button onClick={() => setSummary(null)} className="ml-auto text-purple-400 hover:text-purple-700">×</button>
            </div>
          )}

          <input 
            type="text" 
            value={note.title}
            onChange={(e) => updateNote(note.id, { title: e.target.value })}
            placeholder="Note Title"
            className="w-full text-4xl font-bold text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent mb-6"
          />

          <textarea
            ref={textAreaRef}
            value={note.content}
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Start typing..."
            className="w-full h-[calc(100vh-300px)] resize-none text-lg leading-relaxed text-slate-700 placeholder-slate-300 border-none outline-none bg-transparent font-sans"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
