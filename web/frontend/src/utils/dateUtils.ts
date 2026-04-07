import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';

export const formatDate = (date: Date | string | undefined | null, pattern: string = 'yyyy-MM-dd'): string => {
  // Handle null, undefined, or empty string
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return '';
    return format(dateObj, pattern);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = [];
  
  // Add days from previous month to fill the first week
  const startWeek = startOfWeek(start, { weekStartsOn: 1 });
  const current = startWeek;
  
  while (current <= end || days.length % 7 !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return isWithinInterval(date, { start: startDate, end: endDate });
};

export const isSameDayAs = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high':
      return 'border-red-500';
    case 'medium':
      return 'border-yellow-500';
    case 'low':
      return 'border-green-500';
    default:
      return 'border-gray-300';
  }
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};