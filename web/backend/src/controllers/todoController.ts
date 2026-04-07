import { Request, Response } from 'express';
import { TodoModel } from '../models/Todo';
import { ApiResponse } from '../types';
import Joi from 'joi';

const createTodoSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.string().optional().allow(''),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(''),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(''),
  reminder: Joi.string().max(255).optional(),
  listId: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateTodoSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.string().optional().allow(null, ''),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null, ''),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null, ''),
  reminder: Joi.string().max(255).optional().allow(null),
  completed: Joi.boolean().optional(),
  listId: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
});

export class TodoController {
  static async getTodos(req: Request, res: Response<ApiResponse<any[]>>) {
    try {
      const todos = await TodoModel.findAll();
      res.json({
        success: true,
        data: todos,
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch todos',
      });
    }
  }

  static async getTodo(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const todo = await TodoModel.findById(id);

      if (!todo) {
        return res.status(404).json({
          success: false,
          error: 'Todo not found',
        });
      }

      res.json({
        success: true,
        data: todo,
      });
    } catch (error) {
      console.error('Error fetching todo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch todo',
      });
    }
  }

  static async createTodo(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { error, value } = createTodoSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const todo = await TodoModel.create(value);
      res.status(201).json({
        success: true,
        data: todo,
        message: 'Todo created successfully',
      });
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create todo',
      });
    }
  }

  static async updateTodo(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const { error, value } = updateTodoSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const todo = await TodoModel.update(id, value);
      if (!todo) {
        return res.status(404).json({
          success: false,
          error: 'Todo not found',
        });
      }

      res.json({
        success: true,
        data: todo,
        message: 'Todo updated successfully',
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update todo',
      });
    }
  }

  static async deleteTodo(req: Request, res: Response<ApiResponse<void>>) {
    try {
      const { id } = req.params;
      const deleted = await TodoModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Todo not found',
        });
      }

      res.json({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete todo',
      });
    }
  }

  static async getTodosByDateRange(req: Request, res: Response<ApiResponse<any[]>>) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        });
      }

      const todos = await TodoModel.findByDateRange(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: todos,
      });
    } catch (error) {
      console.error('Error fetching todos by date range:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch todos by date range',
      });
    }
  }
}
