import { useState } from 'react';
import { useStore } from '../store/TaskContext';
import { formatDayLabel } from '../utils/dateUtils';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import type { Task } from '../types';

interface Props {
  date: string | null;
  onClose: () => void;
}

export default function DayPanel({ date, onClose }: Props) {
  const { tasks } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const open = date !== null;
  const dayTasks = date
    ? tasks
        .filter(t => t.date === date)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];

  function handleClose() {
    setFormOpen(false);
    setEditingTask(null);
    onClose();
  }

  return (
    <>
      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/10"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-20 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <button onClick={handleClose} className="text-zinc-500 p-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-base text-zinc-800 font-light">
            {date ? formatDayLabel(date) : ''}
          </h2>
          <span className="ml-auto text-xs text-zinc-400 font-light">
            {dayTasks.filter(t => !t.completed).length}件
          </span>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {dayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-300">
              <p className="text-sm font-light">タスクなし</p>
            </div>
          ) : (
            dayTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTap={() => { setEditingTask(task); setFormOpen(true); }}
              />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => { setEditingTask(null); setFormOpen(true); }}
          className="fixed bottom-8 right-6 w-14 h-14 bg-zinc-800 text-white rounded-full flex items-center justify-center text-2xl z-30 active:bg-zinc-700 transition-colors"
          style={{ boxShadow: 'none' }}
        >
          +
        </button>
      </div>

      {/* Task form */}
      {formOpen && date && (
        <TaskForm
          initialDate={date}
          task={editingTask}
          onClose={() => { setFormOpen(false); setEditingTask(null); }}
        />
      )}
    </>
  );
}
