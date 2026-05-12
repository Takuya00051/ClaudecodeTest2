import { useEffect } from 'react';

const NOTIF_DATE_KEY = 'tcal_notif_date';

export function useNotification() {
  useEffect(() => {
    if (!('Notification' in window)) return;

    const scheduleTimer = () => {
      const todayStr = new Date().toDateString();
      const lastFired = localStorage.getItem(NOTIF_DATE_KEY);

      const now = new Date();
      const target = new Date();
      target.setHours(8, 0, 0, 0);

      if (now >= target && lastFired === todayStr) return;
      if (now >= target) target.setDate(target.getDate() + 1);

      const delay = target.getTime() - now.getTime();

      const id = window.setTimeout(async () => {
        if (Notification.permission !== 'granted') return;
        new Notification('おはようございます！今日のタスク', {
          body: 'タップしてタスクカレンダーを確認',
          icon: '/icons/192.png',
          tag: 'daily-reminder',
          renotify: false,
        });
        localStorage.setItem(NOTIF_DATE_KEY, new Date().toDateString());
      }, delay);

      return () => window.clearTimeout(id);
    };

    if (Notification.permission === 'granted') {
      return scheduleTimer();
    }
  }, []);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}
