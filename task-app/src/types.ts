export interface Task {
  id: string;
  title: string;
  date: string;
  projectId: string;
  memo?: string;
  photo?: string;
  completed: boolean;
  completedAt?: string;
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly';
    weekDays?: number[];
  };
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'seisaku', name: '制作', color: '#6366f1' },
  { id: 'tosho',   name: '投稿', color: '#f59e0b' },
  { id: 'hassou',  name: '発送', color: '#10b981' },
  { id: 'keiri',   name: '経理', color: '#3b82f6' },
  { id: 'event',   name: 'イベント', color: '#ef4444' },
];
