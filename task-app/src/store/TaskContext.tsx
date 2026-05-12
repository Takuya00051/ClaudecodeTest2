import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Task, Project } from '../types';
import type { Action } from './actions';
import { loadTasks, saveTasks, loadProjects, saveProjects } from '../utils/storage';
import { generateRepeatDates, toDateStr } from '../utils/dateUtils';

interface State {
  tasks: Task[];
  projects: Project[];
}

interface Store extends State {
  dispatch: React.Dispatch<Action>;
}

const TaskContext = createContext<Store | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TASK': {
      const base = action.payload;
      const extra: Task[] = [];
      if (base.repeat) {
        const dates = generateRepeatDates(new Date(base.date), base.repeat);
        dates.forEach(d => {
          extra.push({
            ...base,
            id: crypto.randomUUID(),
            date: toDateStr(d),
            createdAt: new Date().toISOString(),
          });
        });
      }
      return { ...state, tasks: [...state.tasks, base, ...extra] };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id !== action.payload
            ? t
            : {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed
                  ? new Date().toISOString()
                  : undefined,
              }
        ),
      };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'DELETE_PROJECT': {
      const fallbackId = state.projects.find(p => p.id !== action.payload)?.id ?? 'seisaku';
      const tasks = state.tasks.map(t =>
        t.projectId === action.payload ? { ...t, projectId: fallbackId } : t
      );
      return {
        ...state,
        tasks,
        projects: state.projects.filter(p => p.id !== action.payload),
      };
    }

    default:
      return state;
  }
}

function init(): State {
  return {
    tasks: loadTasks(),
    projects: loadProjects(),
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => { saveTasks(state.tasks); }, [state.tasks]);
  useEffect(() => { saveProjects(state.projects); }, [state.projects]);

  return (
    <TaskContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useStore must be used inside TaskProvider');
  return ctx;
}
