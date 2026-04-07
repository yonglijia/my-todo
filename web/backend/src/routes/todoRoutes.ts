import { Router } from 'express';
import { TodoController } from '../controllers/todoController';

const router = Router();

// GET /api/todos - Get all todos
router.get('/', TodoController.getTodos);

// GET /api/todos/range - Get todos by date range (must be before /:id)
router.get('/range', TodoController.getTodosByDateRange);

// GET /api/todos/:id - Get a specific todo
router.get('/:id', TodoController.getTodo);

// POST /api/todos - Create a new todo
router.post('/', TodoController.createTodo);

// PUT /api/todos/:id - Update a todo
router.put('/:id', TodoController.updateTodo);

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', TodoController.deleteTodo);

export default router;