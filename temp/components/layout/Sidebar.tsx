import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { Folder as FolderIcon, ChevronRight, ChevronDown, Plus, Shield, Lock, Unlock, Search } from 'lucide-react';
import { Folder } from '../../types';

const FolderItem: React.FC<{ folder: Folder; depth: number }> = ({ folder, depth }) => {
  const { folders, activeFolderId, setActiveFolderId, createFolder } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  
  const childFolders = folders.filter(f => f.parentId === folder.id);
  const isActive = activeFolderId === folder.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = () => {
    setActiveFolderId(folder.id);
  };

  const handleAddSubFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt("New sub-folder name:");
    if (name) createFolder(name, folder.id);
    setIsOpen(true);
  };

  return (
    <div className="select-none">
      <div 
        className={`
          flex items-center px-2 py-1.5 cursor-pointer rounded-md transition-colors text-sm
          ${isActive ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleSelect}
      >
        <button 
          onClick={handleToggle}
          className={`mr-1 p-0.5 rounded hover:bg-slate-300 ${childFolders.length === 0 ? 'opacity-0' : ''}`}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <FolderIcon size={16} className="mr-2 text-slate-400" />
        <span className="truncate flex-1">{folder.name}</span>
        <button 
          onClick={handleAddSubFolder}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-300 rounded text-slate-500"
          title="Add Subfolder"
        >
          <Plus size={12} />
        </button>
      </div>
      {isOpen && (
        <div>
          {childFolders.map(child => (
            <FolderItem key={child.id} folder={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { 
    folders, 
    activeFolderId, 
    setActiveFolderId, 
    createFolder, 
    isVaultLocked, 
    lockVault, 
    unlockVault 
  } = useNotes();

  const rootFolders = folders.filter(f => f.parentId === null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') { // Mock check
      unlockVault();
      setShowPasswordInput(false);
      setPassword('');
    } else {
      alert("Incorrect password (Hint: 1234)");
    }
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-full flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-slate-800 text-lg tracking-tight">Fortress</h1>
          <div className="text-xs px-2 py-0.5 bg-slate-200 rounded-full text-slate-500">v1.0</div>
        </div>
        
        {/* Vault Status */}
        <div className={`
          rounded-lg p-3 text-sm flex flex-col gap-2 transition-colors
          ${isVaultLocked ? 'bg-orange-50 border border-orange-100' : 'bg-emerald-50 border border-emerald-100'}
        `}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${isVaultLocked ? 'text-orange-700' : 'text-emerald-700'}`}>
              {isVaultLocked ? 'Vault Locked' : 'Vault Unlocked'}
            </span>
            {isVaultLocked ? <Lock size={14} className="text-orange-500"/> : <Unlock size={14} className="text-emerald-500"/>}
          </div>
          
          {isVaultLocked ? (
            !showPasswordInput ? (
              <button 
                onClick={() => setShowPasswordInput(true)}
                className="w-full text-center py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-xs font-medium transition-colors"
              >
                Unlock Notes
              </button>
            ) : (
              <form onSubmit={handleUnlock} className="flex gap-1">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Pin"
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-orange-500 outline-none"
                  autoFocus
                />
                <button type="submit" className="bg-orange-500 text-white px-2 rounded text-xs">→</button>
              </form>
            )
          ) : (
            <button 
              onClick={lockVault}
              className="w-full text-center py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-xs font-medium transition-colors"
            >
              Lock Now
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 no-scrollbar">
        <div 
          className={`
            flex items-center px-2 py-1.5 cursor-pointer rounded-md text-sm mb-2
            ${activeFolderId === null ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'}
          `}
          onClick={() => setActiveFolderId(null)}
        >
          <Search size={16} className="mr-2 text-slate-400" />
          <span>All Notes</span>
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mt-4 mb-1">Folders</div>
        {rootFolders.map(folder => (
          <FolderItem key={folder.id} folder={folder} depth={0} />
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button 
          onClick={() => {
            const name = prompt("New Folder Name:");
            if (name) createFolder(name, null);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-white hover:shadow-sm transition-all"
        >
          <Plus size={16} /> New Folder
        </button>
      </div>
    </aside>
  );
};
