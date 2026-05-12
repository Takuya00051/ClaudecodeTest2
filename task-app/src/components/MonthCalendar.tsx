import { useState, useMemo } from 'react';
import { useStore } from '../store/TaskContext';
import { getCalendarDays, toDateStr, formatMonthLabel, isToday } from '../utils/dateUtils';
import type { Task } from '../types';

interface Props {
  onDateSelect: (date: string) => void;
  onSearch: () => void;
  onSettings: () => void;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function MonthCalendar({ onDateSelect, onSearch, onSettings }: Props) {
  const { tasks, projects } = useStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(t => {
      const existing = map.get(t.date) ?? [];
      map.set(t.date, [...existing, t]);
    });
    return map;
  }, [tasks]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const rows = Math.ceil(calendarDays.length / 7);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-zinc-100">
        <h1 className="flex-1 text-base text-zinc-800 font-light">
          {formatMonthLabel(year, month)}
        </h1>
        <div className="flex items-center gap-1 mr-3">
          <button onClick={prevMonth} className="p-2 text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2 text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <button onClick={onSearch} className="p-2 text-zinc-500 mr-1">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
        <button onClick={onSettings} className="p-2 text-zinc-500">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className={`text-center py-1.5 text-xs font-light ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="flex-1 grid grid-cols-7 min-h-0"
        style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`blank-${idx}`} className="border-b border-r border-zinc-50" />;
          }
          const dateStr = toDateStr(day);
          const dayTasks = tasksByDate.get(dateStr) ?? [];
          const incompleteTasks = dayTasks.filter(t => !t.completed);
          const today = isToday(day);
          const col = idx % 7;
          const isSun = col === 0;
          const isSat = col === 6;

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className="flex flex-col p-1 border-b border-r border-zinc-50 text-left overflow-hidden active:bg-zinc-50 transition-colors"
            >
              {/* Date number */}
              <div className="flex items-center justify-center mb-0.5">
                <span
                  className={`
                    text-xs font-light w-6 h-6 flex items-center justify-center rounded-full
                    ${today ? 'bg-zinc-800 text-white' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-zinc-600'}
                  `}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-0.5 w-full min-h-0 overflow-hidden">
                {incompleteTasks.slice(0, 3).map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="flex items-center gap-0.5 min-w-0">
                      <span
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: project?.color ?? '#71717a' }}
                      />
                      <span className="text-zinc-700 font-light truncate" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                        {task.title}
                      </span>
                    </div>
                  );
                })}
                {incompleteTasks.length > 3 && (
                  <span className="text-zinc-400 font-light" style={{ fontSize: '8px' }}>
                    +{incompleteTasks.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
