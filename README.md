# HabitFlow · 30-Day Habit & Consistency Tracker

HabitFlow is a modern, responsive, production-ready habit tracking web application designed to help individuals build positive routines, eliminate unwanted behaviors, and visualize their adherence percentage over the previous 30 calendar days.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, RLS)**.

---

## Features

- **Dual Habit Types**:
  - **Good Habits**: Track actions you want to complete daily (e.g., *Workout*, *Read 20 pages*, *Drink 3L water*).
  - **Bad Habits (Avoidance)**: Track behaviors you want to avoid (e.g., *No junk food*, *No late sleeping*). In HabitFlow, `✓` always signifies success (successfully avoided) and `✗` signifies a slip.
- **30-Day Adherence Timeline**:
  - Chronological 30-day horizontal tick bar: Left is the oldest calendar day (29 days ago), Right is today.
  - Interactive tooltips with exact calendar date, weekday, and completion status.
  - Dynamic adherence percentage (`successful_days / recorded_days * 100`) calculated exclusively from days since habit creation.
- **Fast 1-Click Interaction & Optimistic UI**:
  - Check in directly from the dashboard with instant visual response and rollbacks on error.
  - Secondary options to mark failure/slip or undo status.
- **Calm, Productivity-Focused Analytics**:
  - Overall 30-day consistency score.
  - Best active streak and all-time longest streak calculations.
  - Total successful days across all habits.
  - Habit-by-habit adherence breakdown.
- **Habit Management & Soft Deletion**:
  - Create new habits with curated icons and color themes.
  - Edit habit details without modifying historical logs.
  - Archive habits (soft deletion `active = false`) so historical consistency data is preserved, with one-click restoration.
- **Theme Modes**:
  - Full support for **Light**, **Dark**, and **System** themes with persistent preferences.
- **Dual Storage Support**:
  - **Cloud Mode**: Supabase PostgreSQL database with Row Level Security (RLS) and Supabase Authentication.
  - **Local/Demo Mode**: Built-in localStorage persistence that lets you explore and test all functionality without immediate API setup.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router 7, Lucide Icons, Canvas Confetti
- **Backend & Database**: Supabase, PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Deployment**: Vercel ready (`vercel.json` SPA configuration included)

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn / pnpm

### 2. Installation

Clone or open the project directory and install dependencies:

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note**: If you run the app without `.env` variables or before connecting to Supabase, HabitFlow automatically operates in **Local Demo Mode** with persistent browser storage so you can test all features immediately.

---

## Supabase Database Setup

HabitFlow includes a complete SQL migration script in `supabase/migrations/001_initial_schema.sql`.

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings -> API**, copy your **Project URL** and **anon public** API key into your `.env` file.

### 2. Apply Migration
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Copy and paste the contents of [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).
3. Click **Run**.

This script sets up:
- `profiles` table with automatic signup trigger from `auth.users`.
- `habits` table with `active` flag for soft deletion.
- `habit_logs` table with unique constraint `UNIQUE(habit_id, date)`.
- Performance indexes on `(habit_id, date)`, `(user_id, date)`, and `(user_id, active)`.
- Strict **Row Level Security (RLS)** policies guaranteeing users can only read and write their own data.

---

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Building for Production

Compile TypeScript and build the optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Vercel Deployment

HabitFlow is pre-configured for seamless deployment to [Vercel](https://vercel.com):

1. Push your repository to GitHub or GitLab.
2. In the Vercel dashboard, click **Add New Project** and import your repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy! The included `vercel.json` ensures all client-side routes (`/dashboard`, `/analytics`, `/profile`, `/login`, `/signup`) route properly through `index.html`.

---

## Architecture & Code Structure

```
src/
├── components/
│   ├── dashboard/       # DailyProgress, HabitSection
│   ├── habits/          # HabitCard, HabitHistory (30-day ticks), HabitForm
│   ├── layout/          # Sidebar, Header, MobileNav, AppLayout
│   └── ui/              # Button, Card, Modal, ProgressBar, Tooltip, Toast, Skeleton
├── context/
│   ├── AuthContext.tsx  # Supabase Auth + Local Fallback provider
│   ├── ThemeContext.tsx # Light, Dark, System theme provider
│   └── ToastContext.tsx # Animated notifications provider
├── hooks/
│   └── useHabits.ts     # Data loading, optimistic UI, adherence stats
├── lib/
│   ├── analytics.ts     # 30-day stats, adherence %, streak calculations
│   ├── dates.ts         # Timezone-safe local calendar date utilities
│   ├── habits.ts        # Database service (Supabase + LocalStorage)
│   ├── icons.tsx        # Curated icon registry & color palettes
│   └── supabase.ts      # Supabase client initialization
├── pages/
│   ├── Dashboard.tsx    # Daily habit tracking and progress
│   ├── Analytics.tsx    # Consistency score, streaks, breakdowns
│   ├── Profile.tsx      # User profile, theme settings, habit management
│   ├── Login.tsx        # Authentication sign-in
│   └── Signup.tsx       # New account registration
├── types/
│   ├── habit.ts         # Habit, HabitLog, and DayHistory types
│   └── user.ts          # UserSession and Profile types
├── App.tsx              # Router and route guards
└── main.tsx             # React entry point
```

---

## Date Handling & Consistency Calculation

- **Local Calendar Integrity**: All daily dates are stored as PostgreSQL `DATE` format (`YYYY-MM-DD`) based on the user's local device calendar, preventing timezone conversion shifts.
- **30-Day Window**: Always represents the previous 29 calendar days plus today (chronological left-to-right order).
- **Adherence Formula**: `successful_days / recorded_days * 100`. If a habit was created 5 days ago, adherence only considers active days since creation and does not penalize for days before the habit existed. If no records exist, `--%` is displayed.
- **Streaks**: A current streak counts consecutive successes ending today (or ending yesterday if today has not been checked in yet).
