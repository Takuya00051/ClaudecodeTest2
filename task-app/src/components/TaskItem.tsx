import { useSwipeDelete } from '../hooks/useSwipeDelete';
import { useStore } from '../store/TaskContext';
import type { Task } from '../types';

interface Props {
  task: Task;
  onTap: () => void;
}

export default function TaskItem({ task, onTap }: Props) {
  const { projects, dispatch } = useStore();
  const project = projects.find(p => p.id === task.projectId);

  const { ref, onTouchStart, onTouchMove, onTouchEnd } = useSwipeDelete({
    onDelete: () => dispatch({ type: 'DELETE_TASK', payload: task.id }),
  });

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-5 z-0">
        <span className="text-white text-sm font-light">削除</span>
      </div>

      {/* Task row */}
      <div
        ref={ref}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onTap}
        className="relative z-10 bg-white flex items-center gap-3 px-4 py-3 border-b border-zinc-100 active:bg-zinc-50"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center transition-colors"
          style={task.completed ? { backgroundColor: '#27272a', borderColor: '#27272a' } : {}}
        >
          {task.completed && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${task.completed ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            {project && (
              <span
                className="flex-shrink-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
            )}
            <span className={`text-sm text-zinc-800 font-light truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </span>
          </div>
          {project && (
            <p className="text-xs text-zinc-400 font-light mt-0.5 ml-3.5">{project.name}</p>
          )}
        </div>

        {/* Photo indicator */}
        {task.photo && (
          <span className="flex-shrink-0 text-zinc-300">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" />
              <circle cx="5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" />
              <path d="M1 9.5l3-2.5 2 2 2.5-2 3.5 3" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
