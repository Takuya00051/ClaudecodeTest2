import {
  format,
  addDays,
  addMonths,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isSameDay,
  isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Task } from '../types';

export { isSameDay, isToday, parseISO };

export function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function formatMonthLabel(year: number, month: number): string {
  return format(new Date(year, month), 'yyyy年M月', { locale: ja });
}

export function formatDayLabel(dateStr: string): string {
  return format(parseISO(dateStr), 'M月d日(E)', { locale: ja });
}

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = startOfMonth(new Date(year, month));
  const last = endOfMonth(first);
  const days = eachDayOfInterval({ start: first, end: last });
  const leadingBlanks: null[] = Array(getDay(first)).fill(null);
  const total = leadingBlanks.length + days.length;
  const trailingBlanks: null[] = Array((Math.ceil(total / 7) * 7) - total).fill(null);
  return [...leadingBlanks, ...days, ...trailingBlanks];
}

export function generateRepeatDates(
  base: Date,
  repeat: Task['repeat'],
  count = 16
): Date[] {
  if (!repeat) return [];
  const dates: Date[] = [];
  let cursor = base;
  let iterations = 0;
  const maxIterations = count * 14;

  while (dates.length < count && iterations < maxIterations) {
    iterations++;
    cursor =
      repeat.type === 'daily'
        ? addDays(cursor, 1)
        : repeat.type === 'weekly'
        ? addDays(cursor, 1)
        : addMonths(cursor, 1);

    if (repeat.type === 'weekly') {
      if (repeat.weekDays && repeat.weekDays.length > 0) {
        if (!repeat.weekDays.includes(getDay(cursor))) continue;
      } else {
        if (getDay(cursor) !== getDay(base)) continue;
      }
    }

    dates.push(new Date(cursor));
  }

  return dates;
}
