import { useState } from 'react';
import { TaskProvider } from './store/TaskContext';
import { useNotification } from './hooks/useNotification';
import MonthCalendar from './components/MonthCalendar';
import DayPanel from './components/DayPanel';
import SearchView from './components/SearchView';
import ProjectSettings from './components/ProjectSettings';

type View = 'home' | 'search' | 'projects';

function AppInner() {
  useNotification();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-zinc-800">
      {/* Main calendar */}
      <MonthCalendar
        onDateSelect={setSelectedDate}
        onSearch={() => setView('search')}
        onSettings={() => setView('projects')}
      />

      {/* Day panel */}
      <DayPanel
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />

      {/* Search overlay */}
      <SearchView
        open={view === 'search'}
        onClose={() => setView('home')}
      />

      {/* Project settings overlay */}
      <ProjectSettings
        open={view === 'projects'}
        onClose={() => setView('home')}
      />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppInner />
    </TaskProvider>
  );
}
