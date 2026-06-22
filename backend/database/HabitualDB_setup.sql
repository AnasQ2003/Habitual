-- ============================================================
--  Habitual — SQL Server Database Setup Script
--  Run this in SSMS or sqlcmd against your SQL Server instance
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HabitualDB')
BEGIN
    CREATE DATABASE HabitualDB;
    PRINT '✅ HabitualDB created.';
END
GO

USE HabitualDB;
GO

-- ============================================================
--  TABLE: Users
-- ============================================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        id             INT IDENTITY(1,1) PRIMARY KEY,
        name           NVARCHAR(100)   NOT NULL,
        email          NVARCHAR(255)   NOT NULL UNIQUE,
        password_hash  NVARCHAR(255)   NOT NULL,
        avatar         NVARCHAR(10)    NOT NULL DEFAULT '🌟',
        bio            NVARCHAR(300)   NOT NULL DEFAULT '',
        xp             INT             NOT NULL DEFAULT 0,
        streak         INT             NOT NULL DEFAULT 0,
        theme          NVARCHAR(20)    NOT NULL DEFAULT 'candy',
        dark_mode      BIT             NOT NULL DEFAULT 0,
        language       NVARCHAR(20)    NOT NULL DEFAULT 'English',
        created_at     DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at     DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Users created.';
END
GO

-- ============================================================
--  TABLE: Habits
-- ============================================================
IF OBJECT_ID('dbo.Habits', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Habits (
        id          NVARCHAR(50)    PRIMARY KEY,
        user_id     INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        name        NVARCHAR(100)   NOT NULL,
        icon        NVARCHAR(50)    NOT NULL DEFAULT 'Droplets',
        color       NVARCHAR(100)   NOT NULL DEFAULT 'from-sky-400 to-cyan-300',
        goal        INT             NOT NULL DEFAULT 1,
        unit        NVARCHAR(50)    NOT NULL DEFAULT 'times',
        streak      INT             NOT NULL DEFAULT 0,
        is_active   BIT             NOT NULL DEFAULT 1,
        sort_order  INT             NOT NULL DEFAULT 0,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Habits created.';
END
GO

-- ============================================================
--  TABLE: HabitLogs  (one row per habit per day)
-- ============================================================
IF OBJECT_ID('dbo.HabitLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HabitLogs (
        id          NVARCHAR(50)    PRIMARY KEY,
        habit_id    NVARCHAR(50)    NOT NULL REFERENCES dbo.Habits(id) ON DELETE CASCADE,
        log_date    NVARCHAR(20)    NOT NULL,   -- 'YYYY-MM-DD'
        value       INT             NOT NULL DEFAULT 0,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table HabitLogs created.';
END
GO

-- ============================================================
--  TABLE: Reminders
-- ============================================================
IF OBJECT_ID('dbo.Reminders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reminders (
        id          NVARCHAR(50)    PRIMARY KEY,
        user_id     INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        title       NVARCHAR(100)   NOT NULL,
        reminder_time NVARCHAR(10)  NOT NULL DEFAULT '08:00',
        days        NVARCHAR(50)    NOT NULL DEFAULT 'Daily',
        icon        NVARCHAR(50)    NOT NULL DEFAULT 'Bell',
        color       NVARCHAR(100)   NOT NULL DEFAULT 'from-sky-400 to-cyan-300',
        is_on       BIT             NOT NULL DEFAULT 1,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Reminders created.';
END
GO

-- ============================================================
--  TABLE: Notifications
-- ============================================================
IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        id          NVARCHAR(50)    PRIMARY KEY,
        user_id     INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        title       NVARCHAR(200)   NOT NULL,
        body        NVARCHAR(500)   NOT NULL,
        kind        NVARCHAR(50)    NOT NULL DEFAULT 'reminder',  -- 'streak'|'reminder'|'badge'|'social'|'tip'
        route       NVARCHAR(200)   NOT NULL DEFAULT 'home',
        icon        NVARCHAR(50)    NOT NULL DEFAULT 'Bell',
        color_class NVARCHAR(100)   NOT NULL DEFAULT 'bg-aurora',
        is_read     BIT             NOT NULL DEFAULT 0,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Notifications created.';
END
GO

-- ============================================================
--  TABLE: CommunityPosts
-- ============================================================
IF OBJECT_ID('dbo.CommunityPosts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CommunityPosts (
        id          NVARCHAR(50)    PRIMARY KEY,
        user_id     INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        body        NVARCHAR(500)   NOT NULL,
        likes       INT             NOT NULL DEFAULT 0,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table CommunityPosts created.';
END
GO

-- ============================================================
--  SEED: Default user — Anas (password: anas123)
--  bcrypt hash of 'anas123' (10 rounds):
--    $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'anas@example.com')
BEGIN
    INSERT INTO dbo.Users (name, email, password_hash, avatar, bio, xp, streak, theme, dark_mode, language)
    VALUES (
        'Anas',
        'anas@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
        '🌟',
        'Building better habits, one day at a time.',
        2400,
        14,
        'candy',
        0,
        'English'
    );
    PRINT '✅ Seed user Anas inserted (anas@example.com / anas123).';
END
GO

-- ============================================================
--  SEED: Default habits for Anas
-- ============================================================
DECLARE @uid INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Habits WHERE user_id = @uid)
BEGIN
    INSERT INTO dbo.Habits (id, user_id, name, icon, color, goal, unit, streak, sort_order) VALUES
    ('h1', @uid, 'Drink water',   'Droplets', 'from-sky-400 to-cyan-300',       8, 'glasses', 12, 0),
    ('h2', @uid, 'Read 20 pages', 'BookOpen', 'from-amber-400 to-orange-400',   20, 'pages',   8, 1),
    ('h3', @uid, 'Workout',       'Dumbbell', 'from-pink-500 to-rose-400',       1, 'session', 21, 2),
    ('h4', @uid, 'Meditate',      'Brain',    'from-violet-500 to-fuchsia-400',  1, 'session',  5, 3),
    ('h5', @uid, 'Sleep by 11',   'Moon',     'from-indigo-500 to-blue-400',     1, 'night',    3, 4),
    ('h6', @uid, 'Gratitude',     'Heart',    'from-rose-400 to-pink-300',       1, 'entry',   14, 5);
    PRINT '✅ Seed habits inserted.';
END
GO

-- ============================================================
--  SEED: Habit logs for today and past days
-- ============================================================
DECLARE @uid2 INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @uid2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.HabitLogs WHERE habit_id = 'h1')
BEGIN
    DECLARE @today NVARCHAR(20) = CONVERT(NVARCHAR, GETDATE(), 23);
    DECLARE @yday  NVARCHAR(20) = CONVERT(NVARCHAR, DATEADD(day, -1, GETDATE()), 23);
    INSERT INTO dbo.HabitLogs (id, habit_id, log_date, value) VALUES
    ('l1', 'h1', @today, 6),
    ('l2', 'h2', @today, 15),
    ('l3', 'h3', @today, 1),
    ('l4', 'h4', @today, 0),
    ('l5', 'h5', @today, 0),
    ('l6', 'h6', @today, 1),
    ('l7', 'h1', @yday, 8),
    ('l8', 'h2', @yday, 20),
    ('l9', 'h3', @yday, 1);
    PRINT '✅ Seed habit logs inserted.';
END
GO

-- ============================================================
--  SEED: Reminders for Anas
-- ============================================================
DECLARE @uid3 INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @uid3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Reminders WHERE user_id = @uid3)
BEGIN
    INSERT INTO dbo.Reminders (id, user_id, title, reminder_time, days, icon, color, is_on) VALUES
    ('r1', @uid3, 'Drink water',   '10:00', 'Mon–Sun', 'Droplets', 'from-sky-400 to-cyan-300',      1),
    ('r2', @uid3, 'Meditate',      '07:30', 'Mon–Fri', 'Brain',    'from-violet-500 to-fuchsia-400', 1),
    ('r3', @uid3, 'Read 20 pages', '21:00', 'Daily',   'BookOpen', 'from-amber-400 to-orange-400',   0);
    PRINT '✅ Seed reminders inserted.';
END
GO

-- ============================================================
--  SEED: Notifications for Anas
-- ============================================================
DECLARE @uid4 INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @uid4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Notifications WHERE user_id = @uid4)
BEGIN
    INSERT INTO dbo.Notifications (id, user_id, title, body, kind, route, icon, color_class, is_read) VALUES
    ('n1', @uid4, '14-day streak!',       'Keep the fire going — tap to see your progress.',      'streak',   'stats',        'Flame',    'bg-sunset',   0),
    ('n2', @uid4, 'Time to meditate',     'Your evening session is due in 10 minutes.',           'reminder', 'habits',       'Bell',     'bg-aurora',   0),
    ('n3', @uid4, 'New badge unlocked',   'You earned Rising Star. View all achievements.',       'badge',    'achievements', 'Trophy',   'bg-mint-grad',0),
    ('n4', @uid4, 'Weekly summary ready', 'You completed 82% this week — up 12% from last week.','tip',       'stats',        'TrendingUp','bg-aurora',  1),
    ('n5', @uid4, 'Plan tomorrow',        'Set up tomorrow''s habits in the calendar.',           'reminder', 'calendar',     'Calendar', 'bg-mint-grad',1);
    PRINT '✅ Seed notifications inserted.';
END
GO

-- ============================================================
--  SEED: Community posts
-- ============================================================
DECLARE @uid5 INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @uid5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.CommunityPosts WHERE user_id = @uid5)
BEGIN
    INSERT INTO dbo.CommunityPosts (id, user_id, body, likes) VALUES
    ('cp1', @uid5, 'Just hit a 14-day streak! Feeling great about my habits this month 🔥', 12);
    PRINT '✅ Seed community posts inserted.';
END
GO

-- ============================================================
--  VERIFY
-- ============================================================
SELECT 'Users'          AS [Table], COUNT(*) AS [Rows] FROM dbo.Users          UNION ALL
SELECT 'Habits',                    COUNT(*)            FROM dbo.Habits         UNION ALL
SELECT 'HabitLogs',                 COUNT(*)            FROM dbo.HabitLogs      UNION ALL
SELECT 'Reminders',                 COUNT(*)            FROM dbo.Reminders      UNION ALL
SELECT 'Notifications',             COUNT(*)            FROM dbo.Notifications  UNION ALL
SELECT 'CommunityPosts',            COUNT(*)            FROM dbo.CommunityPosts;
GO

PRINT '🎉 HabitualDB setup complete!';
GO
