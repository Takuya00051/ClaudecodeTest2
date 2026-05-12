import { Task, Project, DEFAULT_PROJECTS } from '../types';

const TASKS_KEY = 'tcal_tasks';
const PROJECTS_KEY = 'tcal_projects';

export function loadTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}
