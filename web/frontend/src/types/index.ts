export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  reminder?: string;
  listId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CalendarView {
  type: 'day' | 'week' | 'month';
  date: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
