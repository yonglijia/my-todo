import { Router, Request, Response } from 'express';
import { db } from '../models/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all lists
router.get('/', async (req: Request, res: Response) => {
  try {
    const lists = await db.all<any>('SELECT * FROM lists ORDER BY createdAt ASC');
    res.json({ success: true, data: lists });
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lists' });
  }
});

// Get a single list
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = await db.get<any>('SELECT * FROM lists WHERE id = ?', [id]);

    if (!list) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch list' });
  }
});

// Create a new list
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color = '#1677ff', icon = 'BriefcaseOutlined' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'List name is required' });
    }

    const id = uuidv4();
    await db.run(
      `INSERT INTO lists (id, name, color, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, name.trim(), color, icon]
    );

    const list = await db.get<any>('SELECT * FROM lists WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: list });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ success: false, error: 'Failed to create list' });
  }
});

// Update a list
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const existingList = await db.get<any>('SELECT * FROM lists WHERE id = ?', [id]);
    if (!existingList) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (updates.length > 0) {
      updates.push("updatedAt = datetime('now')");
      values.push(id);
      await db.run(
        `UPDATE lists SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const list = await db.get<any>('SELECT * FROM lists WHERE id = ?', [id]);
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ success: false, error: 'Failed to update list' });
  }
});

// Delete a list
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if it's a default list (id 1-3)
    if (['1', '2', '3'].includes(id)) {
      return res.status(400).json({ success: false, error: 'Cannot delete default list' });
    }

    const existingList = await db.get<any>('SELECT * FROM lists WHERE id = ?', [id]);
    if (!existingList) {
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    // Set listId to null for todos in this list
    await db.run('UPDATE todos SET listId = NULL WHERE listId = ?', [id]);

    // Delete the list
    await db.run('DELETE FROM lists WHERE id = ?', [id]);

    res.json({ success: true, message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ success: false, error: 'Failed to delete list' });
  }
});

export default router;
