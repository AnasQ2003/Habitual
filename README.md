<div align="center">

<br/>
   
# 🌟 Pulse — Habit Tracker

**A premium, full-stack habit tracking web application built with React, TypeScript, Node.js & Microsoft SQL Server.**


<br/>

> Build powerful daily routines. Visualise your progress. Celebrate every milestone.  
> Pulse is not just a habit tracker — it is your personal wellness command centre.

<br/>

[![Made With React](https://img.shields.io/badge/Made%20with-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-MSSQL-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-FF4D00?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Screenshots](#-screenshots)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Prerequisites](#-prerequisites)
7. [Getting Started](#-getting-started)
   - [Database Setup](#1-database-setup)
   - [Backend Setup](#2-backend-setup)
   - [Frontend Setup](#3-frontend-setup)
8. [Environment Variables](#-environment-variables)
9. [API Reference](#-api-reference)
10. [Application Screens](#-application-screens)
11. [Design System](#-design-system)
12. [Contributing](#-contributing)
13. [License](#-license)

---

## 🚀 Overview

**Pulse** is a beautifully designed, production-ready habit tracking application that empowers users to build consistent daily routines and track their personal wellness journey. It combines a glassy, aurora-inspired dark UI with a robust full-stack architecture to deliver a seamless experience across all devices.

The app is built as a **monorepo** with two separate services:

| Service | Technology | Port |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite + TanStack Router | `8080` |
| **Backend** | Node.js + Express + JWT Auth | `5000` |
| **Database** | Microsoft SQL Server (MSSQL) | `1433` |

Pulse gives users the ability to create, manage, and visualise habits across multiple time frequencies (daily, weekly, monthly), track streaks, earn achievement badges, view detailed analytics, engage with a social community, and manage their personal profile — all within a single, fluid application.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** — stateless, secure token sessions stored in `localStorage`
- **Bcrypt password hashing** — all passwords are hashed with salt rounds before storage
- **Protected routes** — every API endpoint is guarded by a JWT middleware
- **Remember Me** — users can opt to persist their session across browser restarts
- **Change Password** — secure in-app password update functionality
- **Email-based account recovery** (via Nodemailer SMTP integration)

### 📋 Habit Management
- **Create habits** with custom name, icon, colour, category, and target frequency
- **Frequency modes**: Daily, Weekly, Monthly habit tracking
- **Mark completion** — tap to check off habits for the day with animated feedback
- **Edit & Delete** — full CRUD operations on all personal habits
- **Habit categories**: Health, Fitness, Mindfulness, Learning, Productivity, and more
- **Real-time progress ring** — visual indicator showing daily completion percentage

### 📊 Statistics & Analytics
- **Overview dashboard** — total habits, active streaks, completion rate, perfect days
- **Year-over-year comparison** — toggle between years (2024, 2025, 2026…) for honest, real data
- **Monthly breakdown** — bar charts per month showing completion rate and frequency
- **Category distribution** — pie/donut breakdown of habits by category
- **Weekly heatmap** — GitHub-style contribution grid showing consistency patterns
- **Streak leaderboard** — top streaks across all habits ranked visually
- **Powered by Recharts** for smooth, responsive data visualisations

### 📅 Calendar View
- **Month-at-a-glance** — interactive monthly calendar with per-day completion dots
- **Day detail modal** — click any day to see exactly which habits were completed
- **Colour-coded days** — green for perfect days, amber for partial, empty for missed
- **Navigation** — step forward and backward through months without page reload

### 🏆 Achievements & Gamification
- **50+ achievement badges** across multiple categories:
  - 🔥 **Streak badges** — 7, 30, 100 consecutive days
  - ✅ **Completion badges** — 10, 50, 100, 500 check-ins
  - 🌅 **Early-bird & Night-owl** badges for timing consistency
  - 💪 **Habit diversity** badges for maintaining multiple categories
  - 🏅 **Milestone badges** for long-term goals
- **Progress tracking** — see how close you are to unlocking the next badge
- **Badge rarity system** — Common, Rare, Epic, Legendary tiers
- **Animated unlock** celebration modals

### 👥 Community & Social
- **Global leaderboard** — see top habit keepers ranked by total streaks and completions
- **Community feed** — view recent activity and motivational updates from peers
- **Social engagement** — like, comment, and share community posts
- **Weekly challenges** — community-wide shared goals with participation tracking

### 🔔 Smart Notifications
- **In-app notification centre** — collated view of all system and social notifications
- **Reminder alerts** — daily habit reminders surfaced in the notifications panel
- **Achievement unlocks** — instant notifications when a badge is earned
- **Social updates** — notified when someone likes or comments on your activity
- **Unread badge count** on the navigation icon

### 👤 User Profile
- **Full profile management** — name, username, bio, profile picture upload
- **Avatar upload** — upload and preview a custom profile photo
- **Account settings** — manage personal details
- **Stats overview** — total habits, streaks, achievements directly on profile
- **Navigation** — Account Settings, Language, Sound & Haptics, Change Password options
- **Secure logout**

### 🎨 Design & UX
- **Aurora / glassmorphism dark UI** — premium look with animated gradient backgrounds
- **Framer Motion animations** — every screen transition, modal, and element has fluid motion
- **Sidebar navigation drawer** — smooth slide-in/out with blur-overlay backdrop
- **Toast notifications** — professional non-blocking feedback messages
- **App-wide footer** — social links, legal pages, version number on every screen
- **Fully responsive** — adapts to all viewport widths
- **Custom scrollbars** — styled to match the dark aesthetic

---

## 📸 Screenshots

> All the screenshots below are taken directly from the live Pulse application.

---

### Authentication

| Login Screen | Register Screen |
|:---:|:---:|
| ![Login](./screenshots/Screenshot%202026-06-25%20105948.png) | ![Register](./screenshots/Screenshot%202026-06-25%20110852.png) |

---

### Home Dashboard

| Home — Overview | Home — Progress Ring |
|:---:|:---:|
| ![Home 1](./screenshots/Screenshot%202026-06-25%20121319.png) | ![Home 2](./screenshots/Screenshot%202026-06-25%20121415.png) |

| Home — Habit List | Home — Footer |
|:---:|:---:|
| ![Home 3](./screenshots/Screenshot%202026-06-25%20121423.png) | ![Home 4](./screenshots/Screenshot%202026-06-25%20121431.png) |

---

### Habits Screen

| Habits List | Add Habit Modal |
|:---:|:---:|
| ![Habits 1](./screenshots/Screenshot%202026-06-25%20121437.png) | ![Habits 2](./screenshots/Screenshot%202026-06-25%20121458.png) |

---

### Statistics & Analytics

| Stats Overview | Year Selector |
|:---:|:---:|
| ![Stats 1](./screenshots/Screenshot%202026-06-25%20122508.png) | ![Stats 2](./screenshots/Screenshot%202026-06-25%20122514.png) |

| Monthly Bar Chart | Category Breakdown |
|:---:|:---:|
| ![Stats 3](./screenshots/Screenshot%202026-06-25%20122520.png) | ![Stats 4](./screenshots/Screenshot%202026-06-25%20122534.png) |

| Weekly Heatmap | Streak Leaderboard |
|:---:|:---:|
| ![Stats 5](./screenshots/Screenshot%202026-06-25%20122539.png) | ![Stats 6](./screenshots/Screenshot%202026-06-25%20122545.png) |

---

### Calendar

| Calendar Month View | Day Detail Modal |
|:---:|:---:|
| ![Cal 1](./screenshots/Screenshot%202026-06-25%20122556.png) | ![Cal 2](./screenshots/Screenshot%202026-06-25%20122603.png) |

| Calendar Navigation | Calendar Footer |
|:---:|:---:|
| ![Cal 3](./screenshots/Screenshot%202026-06-25%20122618.png) | ![Cal 4](./screenshots/Screenshot%202026-06-25%20122627.png) |

---

### Achievements

| Achievement Badges | Badge Progress |
|:---:|:---:|
| ![Ach 1](./screenshots/Screenshot%202026-06-25%20122640.png) | ![Ach 2](./screenshots/Screenshot%202026-06-25%20122652.png) |

| Legendary Tier | Unlock Celebration |
|:---:|:---:|
| ![Ach 3](./screenshots/Screenshot%202026-06-25%20122707.png) | ![Ach 4](./screenshots/Screenshot%202026-06-25%20122712.png) |

| Achievement Footer | Full Badge Grid |
|:---:|:---:|
| ![Ach 5](./screenshots/Screenshot%202026-06-25%20122719.png) | ![Ach 6](./screenshots/Screenshot%202026-06-25%20122724.png) |

---

### Community

| Community Feed | Leaderboard |
|:---:|:---:|
| ![Com 1](./screenshots/Screenshot%202026-06-25%20122738.png) | ![Com 2](./screenshots/Screenshot%202026-06-25%20122744.png) |

---

### Notifications

| Notification Centre | Notification Types |
|:---:|:---:|
| ![Notif 1](./screenshots/Screenshot%202026-06-25%20122807.png) | ![Notif 2](./screenshots/Screenshot%202026-06-25%20122811.png) |

| Unread Alerts | Notification Footer |
|:---:|:---:|
| ![Notif 3](./screenshots/Screenshot%202026-06-25%20122816.png) | ![Notif 4](./screenshots/Screenshot%202026-06-25%20122825.png) |

---

### Profile

| Profile Overview | Edit Profile |
|:---:|:---:|
| ![Prof 1](./screenshots/Screenshot%202026-06-25%20122831.png) | ![Prof 2](./screenshots/Screenshot%202026-06-25%20122838.png) |

| Profile Settings | Account Options |
|:---:|:---:|
| ![Prof 3](./screenshots/Screenshot%202026-06-25%20122845.png) | ![Prof 4](./screenshots/Screenshot%202026-06-25%20122850.png) |

---

### Navigation Drawer

| Sidebar Drawer | Drawer Footer |
|:---:|:---:|
| ![Drawer 1](./screenshots/Screenshot%202026-06-25%20122901.png) | ![Drawer 2](./screenshots/Screenshot%202026-06-25%20122907.png) |

---

### Additional Screens

| Terms & Privacy | Toast Notification |
|:---:|:---:|
| ![Terms](./screenshots/Screenshot%202026-06-25%20122912.png) | ![Toast](./screenshots/Screenshot%202026-06-25%20122941.png) |

| Social Link Toast | Footer Social Buttons |
|:---:|:---:|
| ![Social 1](./screenshots/Screenshot%202026-06-25%20122949.png) | ![Social 2](./screenshots/Screenshot%202026-06-25%20122955.png) |

| App Footer | Footer Navigation |
|:---:|:---:|
| ![Footer 1](./screenshots/Screenshot%202026-06-25%20122959.png) | ![Footer 2](./screenshots/Screenshot%202026-06-25%20123008.png) |

| Habit Edit Modal | Delete Confirmation |
|:---:|:---:|
| ![Edit 1](./screenshots/Screenshot%202026-06-25%20123018.png) | ![Edit 2](./screenshots/Screenshot%202026-06-25%20123022.png) |

| Create Habit — Step 1 | Create Habit — Step 2 |
|:---:|:---:|
| ![Create 1](./screenshots/Screenshot%202026-06-25%20123057.png) | ![Create 2](./screenshots/Screenshot%202026-06-25%20123108.png) |

| Create Habit — Icons | Create Habit — Colors |
|:---:|:---:|
| ![Create 3](./screenshots/Screenshot%202026-06-25%20123113.png) | ![Create 4](./screenshots/Screenshot%202026-06-25%20123117.png) |

| Create Habit — Frequency | Habit Completion |
|:---:|:---:|
| ![Create 5](./screenshots/Screenshot%202026-06-25%20123123.png) | ![Completion](./screenshots/Screenshot%202026-06-25%20123219.png) |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI rendering & component model |
| **TypeScript** | 5.8 | Static typing & IDE support |
| **Vite** | 8.x | Blazing fast dev server & bundler |
| **TanStack Router** | 1.x | Type-safe file-based routing |
| **TanStack Query** | 5.x | Server state, caching & data fetching |
| **Framer Motion** | 12.x | Animations, transitions & gestures |
| **Recharts** | 2.x | Responsive SVG data visualisations |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Lucide React** | 0.575 | Consistent icon system |
| **Radix UI** | various | Accessible unstyled primitives |
| **React Hook Form** | 7.x | Performant form state management |
| **Zod** | 3.x | Schema validation & parsing |
| **date-fns** | 4.x | Date formatting & manipulation |
| **Sonner** | 2.x | Toast notification system |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Server runtime |
| **Express** | 4.18 | HTTP server & routing |
| **mssql** | 10.x | Microsoft SQL Server driver |
| **bcryptjs** | 2.4 | Password hashing |
| **jsonwebtoken** | 9.x | JWT creation & verification |
| **dotenv** | 16.x | Environment variable loading |
| **cors** | 2.8 | Cross-origin request handling |
| **multer** | 1.4 | File upload (avatar images) |
| **nodemailer** | 6.9 | Email delivery (password reset) |
| **nodemon** | 3.x | Dev auto-restart on file change |

### Database

| Technology | Purpose |
|---|---|
| **Microsoft SQL Server** | Primary relational database |
| **MSSQL Driver** | Node.js connection pooling |
| **HabitualDB_setup.sql** | Full schema & seed script |

---

## 📁 Project Structure

```
Habitual/                          ← Monorepo root
├── .gitignore                     ← Root-level ignore rules
├── .gitattributes                 ← LF normalisation for cross-platform
├── README.md                      ← This file
├── screenshots/                   ← 50 application screenshots
│
├── backend/                       ← Node.js + Express REST API
│   ├── .env                       ← Local environment secrets (git-ignored)
│   ├── .env.example               ← Template for environment setup
│   ├── .gitignore                 ← Backend-specific ignores
│   ├── package.json               ← Backend dependencies & scripts
│   ├── server.js                  ← Entry point — Express app, all routes
│   ├── config/
│   │   └── db.js                  ← MSSQL connection pool factory
│   └── database/
│       └── HabitualDB_setup.sql   ← Full DB schema + seed data
│
└── frontend/                      ← React + TypeScript + Vite SPA
    ├── .gitignore                 ← Frontend-specific ignores
    ├── .prettierrc                ← Code formatting rules
    ├── .prettierignore            ← Prettier exclusions
    ├── bunfig.toml                ← Bun package manager config
    ├── components.json            ← shadcn/ui component registry
    ├── eslint.config.js           ← Lint rules
    ├── package.json               ← Frontend dependencies & scripts
    ├── tsconfig.json              ← TypeScript compiler options
    ├── vite.config.ts             ← Vite build configuration
    └── src/
        ├── styles.css             ← Global CSS + Tailwind base
        ├── router.tsx             ← TanStack Router setup
        ├── routeTree.gen.ts       ← Auto-generated route tree
        ├── server.ts              ← SSR server entry (Nitro)
        ├── start.ts               ← Client hydration entry
        ├── routes/
        │   ├── __root.tsx         ← Root layout + error boundary
        │   ├── index.tsx          ← App entry route → PulseApp
        │   └── README.md          ← Route documentation
        ├── hooks/
        │   └── use-mobile.tsx     ← Responsive breakpoint hook
        ├── lib/
        │   ├── utils.ts           ← Tailwind class merger (cn)
        │   ├── api-client.ts      ← Typed fetch wrapper for backend API
        │   ├── config.server.ts   ← Server-side environment config
        │   ├── error-capture.ts   ← Error boundary utility
        │   ├── error-page.ts      ← Fallback error page renderer
        │   ├── lovable-error-reporting.ts ← Dev error reporting bridge
        │   └── api/               ← Typed API endpoint modules
        └── components/
            ├── ui/                ← shadcn/ui + Radix primitives (46 files)
            └── habit/
                └── PulseApp.tsx   ← Entire application UI (~3000 lines)
```

---

## 📋 Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Minimum Version | Download |
|---|---|---|
| **Node.js** | 18.x LTS | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x | Bundled with Node.js |
| **Microsoft SQL Server** | 2019 or 2022 | [microsoft.com](https://www.microsoft.com/sql-server/sql-server-downloads) |
| **SQL Server Management Studio** (optional) | any | [SSMS Download](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) |
| **Git** | 2.x | [git-scm.com](https://git-scm.com) |

> **Note:** The frontend uses **Bun** as a package manager. If Bun is not installed, `npm` also works — the `package-lock.json` is included for npm compatibility.

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/AnasQ2003/Habitual.git
cd Habitual
```

---

### 1. Database Setup

The database schema and initial seed data are all in a single SQL file.

1. **Open SQL Server Management Studio (SSMS)** and connect to your SQL Server instance.

2. **Open the setup script:**
   ```
   backend/database/HabitualDB_setup.sql
   ```

3. **Execute the script** (`F5` or click *Execute*). This will:
   - Create the `HabitualDB` database
   - Create all required tables (`Users`, `Habits`, `HabitLogs`, `Achievements`, `Notifications`, `Community`, etc.)
   - Insert default seed data for categories and achievements

4. **Verify** — you should see `HabitualDB` appear in the Object Explorer with all tables populated.

---

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Copy the environment template
copy .env.example .env
```

**Edit `.env`** with your SQL Server credentials:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=HabitualDB
DB_USER=sa
DB_PASSWORD=your_actual_password_here

JWT_SECRET=change_this_to_a_long_random_string_in_production
PORT=5000
```

```bash
# Start the development server (auto-restarts on changes)
npm run dev

# Or start in production mode
npm start
```

---

### 3. Frontend Setup

Open a **new terminal** and:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (using npm)
npm install

# Start the dev server
npm run dev
```

✅ The application will be available at:

```
http://localhost:8080
```

Open this URL in your browser and you will be greeted by the Pulse login screen.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_SERVER` | ✅ | `localhost` | SQL Server hostname or IP |
| `DB_PORT` | ✅ | `1433` | SQL Server port |
| `DB_NAME` | ✅ | `HabitualDB` | Database name |
| `DB_USER` | ✅ | `sa` | SQL Server login username |
| `DB_PASSWORD` | ✅ | *(empty)* | SQL Server login password |
| `JWT_SECRET` | ✅ | *(see example)* | Secret key for signing JWT tokens |
| `PORT` | ❌ | `5000` | HTTP port the API listens on |

---

## 📡 API Reference

All API endpoints are served from `http://localhost:5000/api`.  
Protected routes require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create a new user account |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `POST` | `/api/auth/change-password` | ✅ | Update user password |
| `POST` | `/api/auth/forgot-password` | ❌ | Send password reset email |

---

### Habits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/habits` | ✅ | Get all habits for the logged-in user |
| `POST` | `/api/habits` | ✅ | Create a new habit |
| `PUT` | `/api/habits/:id` | ✅ | Update an existing habit |
| `DELETE` | `/api/habits/:id` | ✅ | Delete a habit |
| `POST` | `/api/habits/:id/complete` | ✅ | Mark habit as completed for today |

---

### Habit Logs & Statistics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/logs` | ✅ | All habit completion logs for the user |
| `GET` | `/api/logs/calendar` | ✅ | Logs grouped by date for calendar view |
| `GET` | `/api/stats/summary` | ✅ | Global stats: streaks, completions, perfect days |
| `GET` | `/api/stats/monthly?year=2026` | ✅ | Monthly breakdown for a given year |
| `GET` | `/api/stats/heatmap` | ✅ | Weekly heatmap data (last 52 weeks) |

---

### Achievements

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/achievements` | ✅ | All achievements with locked/unlocked status |
| `GET` | `/api/achievements/unlocked` | ✅ | Only unlocked achievements for the user |

---

### Community

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/community/feed` | ✅ | Community activity feed |
| `GET` | `/api/community/leaderboard` | ✅ | Top users ranked by streaks |
| `POST` | `/api/community/posts` | ✅ | Create a new community post |
| `POST` | `/api/community/posts/:id/like` | ✅ | Like/unlike a post |

---

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | ✅ | All notifications for the user |
| `PUT` | `/api/notifications/:id/read` | ✅ | Mark a notification as read |
| `PUT` | `/api/notifications/read-all` | ✅ | Mark all notifications as read |
| `DELETE` | `/api/notifications/:id` | ✅ | Delete a specific notification |

---

### User Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile` | ✅ | Get the current user's full profile |
| `PUT` | `/api/profile` | ✅ | Update profile details |
| `POST` | `/api/profile/avatar` | ✅ | Upload profile avatar image |

---

## 📱 Application Screens

Pulse contains the following main screens, all accessible via the sidebar navigation drawer:

| Screen | Route / State | Description |
|---|---|---|
| **Login** | `auth → login` | Email + password login with Remember Me |
| **Register** | `auth → register` | New account creation form |
| **Home** | `home` | Daily overview, progress ring, today's habits |
| **Habits** | `habits` | Full habit list with create, edit, delete |
| **Statistics** | `stats` | Analytics dashboard with charts and heatmaps |
| **Calendar** | `calendar` | Monthly calendar with per-day completion view |
| **Achievements** | `achievements` | Badge gallery with progress indicators |
| **Community** | `community` | Social feed and user leaderboard |
| **Notifications** | `notifications` | Notification centre with read/unread states |
| **Profile** | `profile` | User profile with settings menu |
| **Terms** | `terms` | Privacy Policy & Terms of Service |

Navigation is managed by a client-side `screen` state in `PulseApp.tsx`. The sidebar drawer provides the primary navigation surface.

---

## 🎨 Design System

Pulse uses a bespoke design language built on top of Tailwind CSS v4:

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--pulse-purple` | `#7C3AED` | Primary brand colour |
| `--pulse-violet` | `#8B5CF6` | Interactive elements |
| `--pulse-pink` | `#EC4899` | Accents, streaks |
| `--pulse-aurora-1` | `#0F0F1A` | Background base |
| `--pulse-aurora-2` | `#1A0A2E` | Card backgrounds |
| `--pulse-glass` | `rgba(255,255,255,0.05)` | Glassmorphism surfaces |

### Typography

- **Primary font**: `Inter` (Google Fonts) — used for all body text
- **Display font**: `Outfit` (Google Fonts) — used for headings and branding
- **Monospace**: System monospace — used for streak numbers and stats

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Anas Qamar
```

---

<div align="center">

**Built with ❤️ by [Anas Qamar](https://github.com/AnasQ2003)**

</div>
