import { Todo, TodoList, Tag, ApiResponse } from '../types';

const API_BASE_URL = '/api';

export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  // Todo APIs
  async getTodos(): Promise<ApiResponse<Todo[]>> {
    return this.request<Todo[]>('/todos');
  },

  async getTodo(id: string): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/todos/${id}`);
  },

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Todo>> {
    return this.request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  },

  async updateTodo(id: string, todo: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  },

  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  async getTodosByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Todo[]>> {
    return this.request<Todo[]>(`/todos/range?startDate=${startDate}&endDate=${endDate}`);
  },

  // List APIs
  async getLists(): Promise<ApiResponse<TodoList[]>> {
    return this.request<TodoList[]>('/lists');
  },

  async getList(id: string): Promise<ApiResponse<TodoList>> {
    return this.request<TodoList>(`/lists/${id}`);
  },

  async createList(name: string, color?: string): Promise<ApiResponse<TodoList>> {
    return this.request<TodoList>('/lists', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  async updateList(id: string, data: Partial<TodoList>): Promise<ApiResponse<TodoList>> {
    return this.request<TodoList>(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteList(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/lists/${id}`, {
      method: 'DELETE',
    });
  },

  // Tag APIs
  async getTags(): Promise<ApiResponse<Tag[]>> {
    return this.request<Tag[]>('/tags');
  },

  async getTag(id: string): Promise<ApiResponse<Tag>> {
    return this.request<Tag>(`/tags/${id}`);
  },

  async createTag(name: string, color?: string): Promise<ApiResponse<Tag>> {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  async updateTag(id: string, data: Partial<Tag>): Promise<ApiResponse<Tag>> {
    return this.request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTag(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};
