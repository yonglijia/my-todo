import { Router, Request, Response } from 'express';
import { db } from '../models/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all tags
router.get('/', async (req: Request, res: Response) => {
  try {
    const tags = await db.all<any>('SELECT * FROM tags ORDER BY createdAt ASC');
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tags' });
  }
});

// Get a single tag
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tag = await db.get<any>('SELECT * FROM tags WHERE id = ?', [id]);

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    res.json({ success: true, data: tag });
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tag' });
  }
});

// Create a new tag
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color = '#EF4444' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }

    const id = uuidv4();
    await db.run(
      `INSERT INTO tags (id, name, color, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [id, name.trim(), color]
    );

    const tag = await db.get<any>('SELECT * FROM tags WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ success: false, error: 'Failed to create tag' });
  }
});

// Update a tag
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const existingTag = await db.get<any>('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existingTag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
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

    if (updates.length > 0) {
      updates.push("updatedAt = datetime('now')");
      values.push(id);
      await db.run(
        `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const tag = await db.get<any>('SELECT * FROM tags WHERE id = ?', [id]);
    res.json({ success: true, data: tag });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ success: false, error: 'Failed to update tag' });
  }
});

// Delete a tag
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if it's a default tag (id 1-2)
    if (['1', '2'].includes(id)) {
      return res.status(400).json({ success: false, error: 'Cannot delete default tag' });
    }

    const existingTag = await db.get<any>('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existingTag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    // Delete todo_tags associations
    await db.run('DELETE FROM todo_tags WHERE tagId = ?', [id]);

    // Delete the tag
    await db.run('DELETE FROM tags WHERE id = ?', [id]);

    res.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tag' });
  }
});

export default router;
