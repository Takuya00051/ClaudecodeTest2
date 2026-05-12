import { useState } from 'react';
import { useStore } from '../store/TaskContext';
import type { Project } from '../types';

const PRESET_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16',
  '#14b8a6', '#71717a',
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProjectSettings({ open, onClose }: Props) {
  const { projects, tasks, dispatch } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  function startEdit(p: Project) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditColor(p.color);
    setAddingNew(false);
  }

  function saveEdit() {
    if (!editName.trim() || !editingId) return;
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: { id: editingId, name: editName.trim(), color: editColor },
    });
    setEditingId(null);
  }

  function handleDelete(id: string) {
    const count = tasks.filter(t => t.projectId === id).length;
    if (count > 0) {
      setConfirmDeleteId(id);
    } else {
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    }
  }

  function confirmDelete() {
    if (!confirmDeleteId) return;
    dispatch({ type: 'DELETE_PROJECT', payload: confirmDeleteId });
    setConfirmDeleteId(null);
  }

  function saveNew() {
    if (!newName.trim()) return;
    dispatch({
      type: 'ADD_PROJECT',
      payload: { id: crypto.randomUUID(), name: newName.trim(), color: newColor },
    });
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setAddingNew(false);
  }

  return (
    <div
      className={`fixed inset-0 bg-white z-20 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
        <button onClick={onClose} className="text-zinc-500 p-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-base text-zinc-800 font-light">プロジェクト</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {projects.map(p => (
          <div key={p.id}>
            {editingId === p.id ? (
              <div className="px-4 py-3 border-b border-zinc-100 space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  className="w-full text-sm text-zinc-800 font-light outline-none border-b border-zinc-200 pb-1"
                />
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: editColor === c ? 'scale(1.2)' : 'scale(1)',
                        outline: editColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-2 bg-zinc-800 text-white text-xs font-light rounded-lg">保存</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 text-zinc-500 text-xs font-light">キャンセル</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="flex-1 text-sm text-zinc-800 font-light">{p.name}</span>
                <span className="text-xs text-zinc-400 font-light mr-2">
                  {tasks.filter(t => t.projectId === p.id).length}件
                </span>
                <button onClick={() => startEdit(p)} className="text-zinc-400 p-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-zinc-400 p-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4M4 5l1 8h6l1-8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add new */}
        {addingNew ? (
          <div className="px-4 py-3 border-b border-zinc-100 space-y-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="プロジェクト名"
              autoFocus
              className="w-full text-sm text-zinc-800 font-light outline-none border-b border-zinc-200 pb-1 placeholder-zinc-300"
            />
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    transform: newColor === c ? 'scale(1.2)' : 'scale(1)',
                    outline: newColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={saveNew} className="flex-1 py-2 bg-zinc-800 text-white text-xs font-light rounded-lg">追加</button>
              <button onClick={() => setAddingNew(false)} className="flex-1 py-2 text-zinc-500 text-xs font-light">キャンセル</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-zinc-400 font-light text-sm"
          >
            <span className="w-3 h-3 rounded-full border border-zinc-300 flex items-center justify-center text-xs">+</span>
            プロジェクトを追加
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="bg-white mx-6 p-6 rounded-2xl">
            <p className="text-sm text-zinc-800 font-light mb-1">このプロジェクトを削除しますか？</p>
            <p className="text-xs text-zinc-400 font-light mb-5">
              {tasks.filter(t => t.projectId === confirmDeleteId).length}件のタスクは別のプロジェクトに移動されます
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-light rounded-xl">削除</button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 text-zinc-500 text-sm font-light">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
