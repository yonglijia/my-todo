import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';

interface TodoWithTags extends Todo {
  tags?: string[];
}

export class TodoModel {
  static async findAll(): Promise<TodoWithTags[]> {
    const sql = 'SELECT * FROM todos ORDER BY createdAt DESC';
    const todos = await db.all<Todo>(sql);
    return Promise.all(todos.map(todo => this.getTodoWithTags(todo)));
  }

  static async findById(id: string): Promise<TodoWithTags | null> {
    const sql = 'SELECT * FROM todos WHERE id = ?';
    const result = await db.get<Todo>(sql, [id]);
    if (!result) return null;
    return this.getTodoWithTags(result);
  }

  static async findByDateRange(startDate: string, endDate: string): Promise<TodoWithTags[]> {
    const sql = 'SELECT * FROM todos WHERE dueDate BETWEEN ? AND ? ORDER BY dueDate, startTime';
    const todos = await db.all<Todo>(sql, [startDate, endDate]);
    return Promise.all(todos.map(todo => this.getTodoWithTags(todo)));
  }

  static async findByListId(listId: string): Promise<TodoWithTags[]> {
    const sql = 'SELECT * FROM todos WHERE listId = ? ORDER BY createdAt DESC';
    const todos = await db.all<Todo>(sql, [listId]);
    return Promise.all(todos.map(todo => this.getTodoWithTags(todo)));
  }

  static async findByTagId(tagId: string): Promise<TodoWithTags[]> {
    const sql = `
      SELECT t.* FROM todos t
      JOIN todo_tags tt ON t.id = tt.todoId
      WHERE tt.tagId = ?
      ORDER BY t.createdAt DESC
    `;
    const todos = await db.all<Todo>(sql, [tagId]);
    return Promise.all(todos.map(todo => this.getTodoWithTags(todo)));
  }

  private static async getTodoWithTags(todo: Todo): Promise<TodoWithTags> {
    const sql = 'SELECT tagId FROM todo_tags WHERE todoId = ?';
    const rows = await db.all<{ tagId: string }>(sql, [todo.id]);
    const tags = rows.map(row => row.tagId);
    return { ...todo, tags };
  }

  static async create(todoData: CreateTodoRequest): Promise<TodoWithTags> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const todo: Todo = {
      id,
      title: todoData.title,
      description: todoData.description,
      completed: false,
      priority: todoData.priority || 'medium',
      dueDate: todoData.dueDate,
      startTime: todoData.startTime,
      endTime: todoData.endTime,
      reminder: todoData.reminder,
      listId: todoData.listId,
      createdAt: now,
      updatedAt: now,
    };

    const sql = `
      INSERT INTO todos (
        id, title, description, completed, priority,
        dueDate, startTime, endTime, reminder, listId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      todo.id, todo.title, todo.description, todo.completed, todo.priority,
      todo.dueDate, todo.startTime, todo.endTime, todo.reminder, todo.listId,
      todo.createdAt, todo.updatedAt
    ]);

    // Handle tags
    if (todoData.tags && todoData.tags.length > 0) {
      for (const tagId of todoData.tags) {
        await db.run(
          'INSERT INTO todo_tags (todoId, tagId) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }

    return this.getTodoWithTags(todo);
  }

  static async update(id: string, updateData: UpdateTodoRequest): Promise<TodoWithTags | null> {
    const existingTodo = await this.findById(id);
    if (!existingTodo) return null;

    const updatedTodo: Todo = {
      ...existingTodo,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const sql = `
      UPDATE todos SET
        title = ?, description = ?, completed = ?, priority = ?,
        dueDate = ?, startTime = ?, endTime = ?, reminder = ?, listId = ?, updatedAt = ?
      WHERE id = ?
    `;

    await db.run(sql, [
      updatedTodo.title, updatedTodo.description, updatedTodo.completed,
      updatedTodo.priority, updatedTodo.dueDate, updatedTodo.startTime,
      updatedTodo.endTime, updatedTodo.reminder, updatedTodo.listId, updatedTodo.updatedAt, id
    ]);

    // Handle tags update
    if (updateData.tags !== undefined) {
      // Remove existing tags
      await db.run('DELETE FROM todo_tags WHERE todoId = ?', [id]);

      // Add new tags
      if (updateData.tags.length > 0) {
        for (const tagId of updateData.tags) {
          await db.run(
            'INSERT INTO todo_tags (todoId, tagId) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }

    return this.getTodoWithTags(updatedTodo);
  }

  static async delete(id: string): Promise<boolean> {
    // Delete todo_tags first
    await db.run('DELETE FROM todo_tags WHERE todoId = ?', [id]);

    const sql = 'DELETE FROM todos WHERE id = ?';
    const result = await db.run(sql, [id]);
    return (result.changes || 0) > 0;
  }

  static async findCompleted(): Promise<TodoWithTags[]> {
    const sql = 'SELECT * FROM todos WHERE completed = TRUE ORDER BY updatedAt DESC';
    const todos = await db.all<Todo>(sql);
    return Promise.all(todos.map(todo => this.getTodoWithTags(todo)));
  }

  static async findByPriority(priority: 'low' | 'medium' | 'high'): Promise<TodoWithTags[]> {
    const sql = 'SELECT * FROM todos WHERE priority = ? AND completed = FALSE ORDER BY dueDate ASC';
    const todos = await db.all<Todo>(sql, [priority]);
    return Promise.all(todos.map(todo => this.getTodoWithTags(todo)));
  }
}
