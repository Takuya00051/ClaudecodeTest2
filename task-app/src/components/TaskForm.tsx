import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/TaskContext';
import type { Task } from '../types';

interface Props {
  initialDate: string;
  task?: Task | null;
  onClose: () => void;
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function TaskForm({ initialDate, task, onClose }: Props) {
  const { projects, dispatch } = useStore();
  const [title, setTitle] = useState(task?.title ?? '');
  const [date, setDate] = useState(task?.date ?? initialDate);
  const [projectId, setProjectId] = useState(task?.projectId ?? projects[0]?.id ?? '');
  const [memo, setMemo] = useState(task?.memo ?? '');
  const [photo, setPhoto] = useState<string | undefined>(task?.photo);
  const [repeatType, setRepeatType] = useState<Task['repeat']>(task?.repeat);
  const [showMore, setShowMore] = useState(false);
  const [weekDays, setWeekDays] = useState<number[]>(task?.repeat?.weekDays ?? []);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const storageUsed = JSON.stringify(localStorage).length;
      if (storageUsed + result.length > 4 * 1024 * 1024) {
        alert('ストレージ容量が不足しているため写真を保存できません');
        return;
      }
      setPhoto(result);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!title.trim()) return;
    const repeat = repeatType
      ? { ...repeatType, weekDays: repeatType.type === 'weekly' ? weekDays : undefined }
      : undefined;

    if (task) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { ...task, title: title.trim(), date, projectId, memo, photo, repeat },
      });
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: crypto.randomUUID(),
          title: title.trim(),
          date,
          projectId,
          memo,
          photo,
          repeat,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      });
    }
    onClose();
  }

  function toggleWeekDay(d: number) {
    setWeekDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-6">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タスク名"
            className="w-full text-xl text-zinc-800 font-light outline-none placeholder-zinc-300 py-3 border-b border-zinc-100"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />

          {/* Date */}
          <div className="flex items-center py-3 border-b border-zinc-100">
            <span className="text-xs text-zinc-400 font-light w-12">日付</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-sm text-zinc-800 font-light outline-none"
            />
          </div>

          {/* Project */}
          <div className="py-3 border-b border-zinc-100">
            <span className="text-xs text-zinc-400 font-light">プロジェクト</span>
            <div className="flex gap-2 mt-2 flex-wrap">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProjectId(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light transition-colors"
                  style={
                    projectId === p.id
                      ? { backgroundColor: p.color, color: 'white' }
                      : { backgroundColor: '#f4f4f5', color: '#3f3f46' }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: projectId === p.id ? 'white' : p.color }}
                  />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle more */}
          <button
            onClick={() => setShowMore(v => !v)}
            className="w-full py-3 text-xs text-zinc-400 font-light text-left flex items-center gap-1 border-b border-zinc-100"
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform ${showMore ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {showMore ? '閉じる' : 'メモ・写真・繰り返し'}
          </button>

          {showMore && (
            <div className="space-y-0">
              {/* Memo */}
              <div className="py-3 border-b border-zinc-100">
                <span className="text-xs text-zinc-400 font-light">メモ</span>
                <textarea
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="メモを追加..."
                  rows={3}
                  className="w-full mt-2 text-sm text-zinc-800 font-light outline-none placeholder-zinc-300 resize-none"
                />
              </div>

              {/* Photo */}
              <div className="py-3 border-b border-zinc-100">
                <span className="text-xs text-zinc-400 font-light">写真</span>
                {photo ? (
                  <div className="mt-2 relative inline-block">
                    <img src={photo} alt="添付写真" className="h-24 w-auto rounded object-cover" />
                    <button
                      onClick={() => setPhoto(undefined)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 text-white rounded-full text-xs flex items-center justify-center"
                    >×</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 mt-2 text-sm text-zinc-500 font-light cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1" />
                      <circle cx="6" cy="8" r="2" stroke="currentColor" strokeWidth="1" />
                      <path d="M1 11l4-3 2 2 3-2.5 5 3.5" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    写真を選択
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Repeat */}
              <div className="py-3">
                <span className="text-xs text-zinc-400 font-light">繰り返し</span>
                <div className="flex gap-2 mt-2">
                  {(['none', 'daily', 'weekly', 'monthly'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        if (t === 'none') { setRepeatType(undefined); return; }
                        setRepeatType({ type: t });
                      }}
                      className="px-3 py-1.5 text-xs font-light rounded-full transition-colors"
                      style={
                        (t === 'none' && !repeatType) || repeatType?.type === t
                          ? { backgroundColor: '#27272a', color: 'white' }
                          : { backgroundColor: '#f4f4f5', color: '#3f3f46' }
                      }
                    >
                      {t === 'none' ? 'なし' : t === 'daily' ? '毎日' : t === 'weekly' ? '毎週' : '毎月'}
                    </button>
                  ))}
                </div>
                {repeatType?.type === 'weekly' && (
                  <div className="flex gap-1.5 mt-3">
                    {WEEKDAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => toggleWeekDay(i)}
                        className="w-8 h-8 rounded-full text-xs font-light transition-colors"
                        style={
                          weekDays.includes(i)
                            ? { backgroundColor: '#27272a', color: 'white' }
                            : { backgroundColor: '#f4f4f5', color: '#3f3f46' }
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="px-5 pb-8 pt-2 border-t border-zinc-100">
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full py-4 bg-zinc-800 text-white text-sm font-light rounded-xl disabled:opacity-30 transition-opacity"
          >
            {task ? '更新する' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
