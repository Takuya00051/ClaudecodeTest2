import { useState, useCallback, useRef } from 'react';
import { useStore } from '../store/TaskContext';
import { formatDayLabel } from '../utils/dateUtils';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import type { Task } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export default function SearchView({ open, onClose }: Props) {
  const { tasks } = useStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateDebounced = useCallback(
    debounce((q: string) => setDebouncedQuery(q), 150),
    []
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    updateDebounced(e.target.value);
  }

  const results = debouncedQuery.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : [];

  const grouped = results.reduce<Map<string, Task[]>>((acc, task) => {
    const existing = acc.get(task.date) ?? [];
    acc.set(task.date, [...existing, task]);
    return acc;
  }, new Map());

  const sortedDates = Array.from(grouped.keys()).sort();

  return (
    <>
      <div
        className={`fixed inset-0 bg-white z-20 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <button onClick={onClose} className="text-zinc-500 p-1 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="タスクを検索..."
            autoFocus={open}
            className="flex-1 text-sm text-zinc-800 font-light outline-none placeholder-zinc-300"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setDebouncedQuery(''); }}
              className="text-zinc-400 p-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!debouncedQuery.trim() ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-zinc-300 font-light">タスク名を入力</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-zinc-300 font-light">見つかりません</p>
            </div>
          ) : (
            sortedDates.map(dateStr => (
              <div key={dateStr}>
                <div className="px-4 py-2 bg-zinc-50">
                  <p className="text-xs text-zinc-400 font-light">{formatDayLabel(dateStr)}</p>
                </div>
                {(grouped.get(dateStr) ?? []).map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onTap={() => setEditingTask(task)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {editingTask && (
        <TaskForm
          initialDate={editingTask.date}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
