require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getPool, sql } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'habitual_secret';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Auth middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorised' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ app: 'Habitual API', status: 'running' }));
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', app: 'Habitual API', timestamp: new Date() }));

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email, and password are required' });
  try {
    const pool = await getPool();
    const exists = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM dbo.Users WHERE email = @email');
    if (exists.recordset.length)
      return res.status(409).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('name',  sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('hash',  sql.NVarChar, hash)
      .query(`INSERT INTO dbo.Users (name, email, password_hash)
              OUTPUT INSERTED.id, INSERTED.name, INSERTED.email,
                     INSERTED.avatar, INSERTED.bio, INSERTED.xp, INSERTED.streak,
                     INSERTED.theme, INSERTED.dark_mode, INSERTED.language
              VALUES (@name, @email, @hash)`);
    const user = result.recordset[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT id, name, email, password_hash, avatar, bio,
                     xp, streak, theme, dark_mode, language
              FROM dbo.Users WHERE email = @email`);
    if (!result.recordset.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    delete user.password_hash;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query(`SELECT id, name, email, avatar, bio, xp, streak, theme, dark_mode, language
              FROM dbo.Users WHERE id = @id`);
    if (!result.recordset.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/profile
app.put('/api/profile', auth, async (req, res) => {
  const { name, avatar, bio, theme, dark_mode, language } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',        sql.Int,      req.user.id)
      .input('name',      sql.NVarChar, name      ?? null)
      .input('avatar',    sql.NVarChar, avatar    ?? null)
      .input('bio',       sql.NVarChar, bio       ?? null)
      .input('theme',     sql.NVarChar, theme     ?? null)
      .input('dark_mode', sql.Bit,      dark_mode ?? null)
      .input('language',  sql.NVarChar, language  ?? null)
      .query(`UPDATE dbo.Users SET
                name      = COALESCE(@name,      name),
                avatar    = COALESCE(@avatar,    avatar),
                bio       = COALESCE(@bio,       bio),
                theme     = COALESCE(@theme,     theme),
                dark_mode = COALESCE(@dark_mode, dark_mode),
                language  = COALESCE(@language,  language),
                updated_at = GETDATE()
              WHERE id = @id`);
    const updated = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, name, email, avatar, bio, xp, streak, theme, dark_mode, language FROM dbo.Users WHERE id = @id');
    res.json(updated.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  HABITS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/habits?date=YYYY-MM-DD   — returns habits with today's log value
app.get('/api/habits', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('uid',  sql.Int,      req.user.id)
      .input('date', sql.NVarChar, date)
      .query(`SELECT h.id, h.name, h.icon, h.color, h.goal, h.unit, h.streak, h.sort_order,
                     ISNULL(l.value, 0) AS done
              FROM dbo.Habits h
              LEFT JOIN dbo.HabitLogs l ON l.habit_id = h.id AND l.log_date = @date
              WHERE h.user_id = @uid AND h.is_active = 1
              ORDER BY h.sort_order`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/habits   — create a new habit
app.post('/api/habits', auth, async (req, res) => {
  const { name, icon, color, goal, unit } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const pool = await getPool();
    // get next sort_order
    const ord = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query('SELECT ISNULL(MAX(sort_order)+1, 0) AS n FROM dbo.Habits WHERE user_id = @uid');
    const id = uuidv4();
    await pool.request()
      .input('id',   sql.NVarChar, id)
      .input('uid',  sql.Int,      req.user.id)
      .input('name', sql.NVarChar, name)
      .input('icon', sql.NVarChar, icon  || 'Droplets')
      .input('color',sql.NVarChar, color || 'from-sky-400 to-cyan-300')
      .input('goal', sql.Int,      goal  || 1)
      .input('unit', sql.NVarChar, unit  || 'times')
      .input('ord',  sql.Int,      ord.recordset[0].n)
      .query(`INSERT INTO dbo.Habits (id, user_id, name, icon, color, goal, unit, sort_order)
              VALUES (@id, @uid, @name, @icon, @color, @goal, @unit, @ord)`);
    const created = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT *, 0 AS done FROM dbo.Habits WHERE id = @id');
    res.status(201).json(created.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/habits/:id
app.delete('/api/habits/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',  sql.NVarChar, req.params.id)
      .input('uid', sql.Int,      req.user.id)
      .query('UPDATE dbo.Habits SET is_active = 0 WHERE id = @id AND user_id = @uid');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/habits/:id/log   — log a completion value for today
app.post('/api/habits/:id/log', auth, async (req, res) => {
  const { value, date } = req.body;
  const logDate = date || new Date().toISOString().slice(0, 10);
  const logId   = uuidv4();
  try {
    const pool = await getPool();
    // upsert log
    await pool.request()
      .input('id',       sql.NVarChar, logId)
      .input('habit_id', sql.NVarChar, req.params.id)
      .input('date',     sql.NVarChar, logDate)
      .input('value',    sql.Int,      value ?? 0)
      .query(`MERGE dbo.HabitLogs AS target
              USING (SELECT @habit_id AS habit_id, @date AS log_date) AS src
              ON target.habit_id = src.habit_id AND target.log_date = src.log_date
              WHEN MATCHED THEN UPDATE SET value = @value
              WHEN NOT MATCHED THEN INSERT (id, habit_id, log_date, value)
                VALUES (@id, @habit_id, @date, @value);`);

    // recalculate streak: count consecutive days ending today where value >= goal
    const habit = await pool.request()
      .input('habit_id', sql.NVarChar, req.params.id)
      .query('SELECT goal FROM dbo.Habits WHERE id = @habit_id');
    const goal = habit.recordset[0]?.goal ?? 1;

    const logs = await pool.request()
      .input('habit_id', sql.NVarChar, req.params.id)
      .query(`SELECT log_date, value FROM dbo.HabitLogs
              WHERE habit_id = @habit_id ORDER BY log_date DESC`);

    let streak = 0;
    let checkDate = new Date(logDate);
    for (const log of logs.recordset) {
      const d = new Date(log.log_date);
      const diff = Math.round((checkDate - d) / 86400000);
      if (diff > 1) break;
      if (log.value >= goal) { streak++; checkDate = d; }
      else break;
    }

    await pool.request()
      .input('streak',   sql.Int,      streak)
      .input('habit_id', sql.NVarChar, req.params.id)
      .query('UPDATE dbo.Habits SET streak = @streak WHERE id = @habit_id');

    // update user XP (+5 per log)
    await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query('UPDATE dbo.Users SET xp = xp + 5 WHERE id = @uid');

    res.json({ ok: true, streak, value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/habits/stats?range=W|M|Y&year=2026
app.get('/api/habits/stats', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query(`SELECT l.log_date, h.goal, l.value,
                     CASE WHEN l.value >= h.goal THEN 1 ELSE 0 END AS completed
              FROM dbo.HabitLogs l
              JOIN dbo.Habits h ON h.id = l.habit_id
              WHERE h.user_id = @uid AND h.is_active = 1
              ORDER BY l.log_date DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  REMINDERS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/reminders
app.get('/api/reminders', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query('SELECT * FROM dbo.Reminders WHERE user_id = @uid ORDER BY created_at');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reminders
app.post('/api/reminders', auth, async (req, res) => {
  const { title, reminder_time, days, icon, color } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const id = uuidv4();
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',    sql.NVarChar, id)
      .input('uid',   sql.Int,      req.user.id)
      .input('title', sql.NVarChar, title)
      .input('time',  sql.NVarChar, reminder_time || '08:00')
      .input('days',  sql.NVarChar, days  || 'Daily')
      .input('icon',  sql.NVarChar, icon  || 'Bell')
      .input('color', sql.NVarChar, color || 'from-sky-400 to-cyan-300')
      .query(`INSERT INTO dbo.Reminders (id, user_id, title, reminder_time, days, icon, color)
              VALUES (@id, @uid, @title, @time, @days, @icon, @color)`);
    const created = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM dbo.Reminders WHERE id = @id');
    res.status(201).json(created.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reminders/:id  — toggle is_on or update fields
app.put('/api/reminders/:id', auth, async (req, res) => {
  const { is_on, title, reminder_time, days } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',    sql.NVarChar, req.params.id)
      .input('uid',   sql.Int,      req.user.id)
      .input('is_on', sql.Bit,      is_on   ?? null)
      .input('title', sql.NVarChar, title   ?? null)
      .input('time',  sql.NVarChar, reminder_time ?? null)
      .input('days',  sql.NVarChar, days    ?? null)
      .query(`UPDATE dbo.Reminders SET
                is_on         = COALESCE(@is_on, is_on),
                title         = COALESCE(@title, title),
                reminder_time = COALESCE(@time,  reminder_time),
                days          = COALESCE(@days,  days)
              WHERE id = @id AND user_id = @uid`);
    const updated = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT * FROM dbo.Reminders WHERE id = @id');
    res.json(updated.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reminders/:id
app.delete('/api/reminders/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',  sql.NVarChar, req.params.id)
      .input('uid', sql.Int,      req.user.id)
      .query('DELETE FROM dbo.Reminders WHERE id = @id AND user_id = @uid');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/notifications
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query('SELECT * FROM dbo.Notifications WHERE user_id = @uid ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/notifications/:id/read
app.put('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',  sql.NVarChar, req.params.id)
      .input('uid', sql.Int,      req.user.id)
      .query('UPDATE dbo.Notifications SET is_read = 1 WHERE id = @id AND user_id = @uid');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/notifications/read-all
app.put('/api/notifications/read-all', auth, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query('UPDATE dbo.Notifications SET is_read = 1 WHERE user_id = @uid');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  COMMUNITY
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/community/feed
app.get('/api/community/feed', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`SELECT cp.id, cp.body, cp.likes, cp.created_at,
                     u.name, u.avatar,
                     DATEDIFF(MINUTE, cp.created_at, GETDATE()) AS mins_ago
              FROM dbo.CommunityPosts cp
              JOIN dbo.Users u ON u.id = cp.user_id
              ORDER BY cp.created_at DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/community/posts  — publish a new post
app.post('/api/community/posts', auth, async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'body is required' });
  const id = uuidv4();
  try {
    const pool = await getPool();
    await pool.request()
      .input('id',   sql.NVarChar, id)
      .input('uid',  sql.Int,      req.user.id)
      .input('body', sql.NVarChar, body)
      .query('INSERT INTO dbo.CommunityPosts (id, user_id, body) VALUES (@id, @uid, @body)');
    const created = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`SELECT cp.*, u.name, u.avatar FROM dbo.CommunityPosts cp
              JOIN dbo.Users u ON u.id = cp.user_id WHERE cp.id = @id`);
    res.status(201).json(created.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/community/posts/:id/like
app.post('/api/community/posts/:id/like', auth, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('UPDATE dbo.CommunityPosts SET likes = likes + 1 WHERE id = @id');
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT likes FROM dbo.CommunityPosts WHERE id = @id');
    res.json({ likes: result.recordset[0]?.likes ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/community/leaderboard
app.get('/api/community/leaderboard', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`SELECT TOP 10 id, name, avatar, xp, streak
              FROM dbo.Users ORDER BY xp DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 404 & Error handlers ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`🟢 Habitual API running on http://localhost:${PORT}`)
);
