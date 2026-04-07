import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const DB_PATH = './todos.db';

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.init();
  }

  private async init() {
    const run = promisify(this.db.run.bind(this.db));

    // Create todos table
    await run(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority TEXT DEFAULT 'medium',
        dueDate TEXT,
        startTime TEXT,
        endTime TEXT,
        reminder TEXT,
        listId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (listId) REFERENCES lists(id)
      )
    `);

    // Create lists table with icon field
    await run(`
      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#1677ff',
        icon TEXT DEFAULT 'BriefcaseOutlined',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create tags table
    await run(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#f5222d',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create todo_tags junction table
    await run(`
      CREATE TABLE IF NOT EXISTS todo_tags (
        todoId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        PRIMARY KEY (todoId, tagId),
        FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await run('CREATE INDEX IF NOT EXISTS idx_todos_dueDate ON todos(dueDate)');
    await run('CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)');
    await run('CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority)');
    await run('CREATE INDEX IF NOT EXISTS idx_todos_listId ON todos(listId)');

    // Try to add icon column if not exists (for existing databases)
    try {
      await run('ALTER TABLE lists ADD COLUMN icon TEXT DEFAULT \'BriefcaseOutlined\'');
    } catch (e) {
      // Column already exists, ignore
    }

    // Insert default lists if not exist
    const defaultLists = [
      { id: '1', name: '工作', color: '#1677ff', icon: 'BriefcaseOutlined' },
      { id: '2', name: '个人', color: '#52c41a', icon: 'HomeOutlined' },
      { id: '3', name: '学习', color: '#faad14', icon: 'BookOutlined' },
    ];

    for (const list of defaultLists) {
      await run(
        `INSERT OR IGNORE INTO lists (id, name, color, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [list.id, list.name, list.color, list.icon]
      );
    }

    // Insert default tags if not exist
    const defaultTags = [
      { id: '1', name: '重要', color: '#f5222d' },
      { id: '2', name: '紧急', color: '#f5222d' },
    ];

    for (const tag of defaultTags) {
      await run(
        `INSERT OR IGNORE INTO tags (id, name, color, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        [tag.id, tag.name, tag.color]
      );
    }
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    const all = promisify(this.db.all.bind(this.db));
    return await all(sql, params);
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    const get = promisify(this.db.get.bind(this.db));
    return await get(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    const run = promisify(this.db.run.bind(this.db));
    return await run(sql, params);
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const db = new Database();
export default db;
