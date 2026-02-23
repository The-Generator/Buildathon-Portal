# Babson Generator Build-a-thon 2026

Hackathon platform for the Generator Build-a-thon at Babson College. Handles registration, team matchmaking, check-in, and admin management for a 500-person event.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Email**: Resend + React Email
- **Icons**: Lucide React

## Getting Started

### 1. Environment Variables

Copy `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PASSWORD=your_shared_admin_password
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run migrations in order in the SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_spring26_schema.sql`
   - `supabase/migrations/003_team_audit_log.sql`
3. Enable Realtime on the `participants` and `teams` tables
4. Add admin users to the `admins` table manually

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    register/             # 4-step registration wizard
    checkin/              # Public check-in page (QR target)
    participants/           # Public participant directory (networking)
    admin/
      login/              # Admin login (shared password)
      page.tsx            # Overview dashboard
      participants/       # Participant management
      teams/              # Team management + matching + realtime
      checkin/            # Real-time check-in dashboard
      export/             # CSV export
    api/
      register/           # POST - registration submission
      checkin/            # POST - check-in + GET - lookup
      matching/           # Preview + confirm matching
      teams/[id]/         # Team CRUD + members + move
      admin/teams/        # Admin team creation
      admin/auth/         # Admin login
      admin/export/       # CSV download
  components/
    ui/                   # Shared UI components
    landing/              # Landing page sections
    registration/         # Registration wizard steps
    admin/                # Admin dashboard components
    checkin/              # Check-in form
  lib/
    supabase/             # Client, server, admin clients
    email/                # Resend + templates + ICS
    matching/             # Team matching algorithm
    constants.ts          # Event config, roles, skills
    validations.ts        # Zod schemas
    utils.ts              # Utilities
  types/
    index.ts              # TypeScript interfaces
supabase/
  migrations/             # SQL schema
```

## Key Features

- **Registration**: 4-step wizard with personal info, team formation, skill tagging, review. Optional public profile with LinkedIn/portfolio for networking.
- **Participant Directory**: Public "Meet the Builders" page where opted-in participants can discover each other before the event.
- **Team Matching**: Greedy construction + swap optimization algorithm (role diversity, skill coverage, experience balance, school mix)
- **Check-In**: Mobile-friendly self-service + admin real-time dashboard with Supabase Realtime
- **Admin Dashboard**: Participant management, CSV export, team CRUD (create/dissolve/add/remove members), matching controls, audit log, real-time sync across stations
- **Event-Day Ops**: Unassigned participant queue, quick-assign with lightweight scoring, walk-in intake
- **Email**: Registration confirmation + team assignment emails with ICS calendar attachments

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Set environment variables in your Vercel project settings, then deploy.
