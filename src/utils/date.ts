import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export { dayjs };

export const formatDate = (date: string | Date, format = 'DD MMM YYYY'): string =>
  dayjs(date).format(format);

export const formatDateTime = (date: string | Date, format = 'DD MMM YYYY, hh:mm A'): string =>
  dayjs(date).format(format);

export const formatRelativeTime = (date: string | Date): string => dayjs(date).fromNow();

export const isToday = (date: string | Date): boolean => dayjs(date).isSame(dayjs(), 'day');

export const isPast = (date: string | Date): boolean => dayjs(date).isBefore(dayjs());

export const addDays = (date: string | Date, days: number): Date =>
  dayjs(date).add(days, 'day').toDate();

export const parseDate = (date: string, format: string): Date | null => {
  const parsed = dayjs(date, format, true);
  return parsed.isValid() ? parsed.toDate() : null;
};

export const getStartOfDay = (date: string | Date = new Date()): Date =>
  dayjs(date).startOf('day').toDate();

export const getEndOfDay = (date: string | Date = new Date()): Date =>
  dayjs(date).endOf('day').toDate();
