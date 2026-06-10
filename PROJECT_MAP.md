# Thunder League — PROJECT_MAP

## TECH_STACK

| Layer       | Technology                   | Version  | Rationale                                      |
|-------------|------------------------------|----------|------------------------------------------------|
| Framework   | Next.js (App Router)         | 15.5.19  | SSR, SEO, file-based routing, Vercel-native    |
| UI Runtime  | React                        | 19.1.0   | Concurrent features, server components         |
| Language    | TypeScript                   | 5.x      | Strict typing                                  |
| Styling     | Tailwind CSS (v4)            | 4.3.0    | Utility-first, responsive, CSS-based config    |
| Animation   | Framer Motion                | 12.40.0  | Declarative animations                         |
| Tooling     | PostCSS + Autoprefixer       | —        | CSS processing pipeline for Tailwind           |
| Linting     | ESLint + eslint-config-next  | —        | Next.js recommended ruleset                    |
| Runtime     | Node.js                      | 24.12.0  | LTS, Vercel-compatible                         |
| Deploy      | Vercel                       | —        | Zero-config Next.js hosting                    |
| Database    | Supabase (Postgres)          | —        | Auth, storage, real-time                       |

---

## AUTH ROUTING

```
PUBLIC (not logged in):
  /              → Landing page (HeroBanner + features)
  /login         → AuthForm (login)
  /register      → AuthForm (register)
  /verify-email  → Verification prompt (after signup)

AUTHENTICATED (logged in):
  /              → Redirect → /tournaments
  /tournaments   → MAIN DEFAULT PAGE (tournament schedule + cards + brackets)
  /tournaments/[id] → Tournament details (banner, rules, players, join/leave)
  /dashboard     → Dashboard (tournament management)
  /account       → Profile editing + avatar upload
  /leaderboard   → Leaderboard (DB-driven)

ADMIN (role="admin" | "super_admin"):
  /admin         → Admin dashboard (stats, quick actions, activity)
  /admin/tournaments       → Tournament CRUD
  /admin/tournaments/create → Create tournament
  /admin/tournaments/:id/edit → Edit tournament
  /admin/leaderboard       → Leaderboard CRUD (add/edit/delete/reorder)
  /admin/users             → User management (promote/demote/suspend)
  /admin/logs              → Audit logs (all admin actions)

PROTECTION LAYERS:
  Layer 1 — Middleware (src/middleware.ts):
    Blocks unauthenticated users from /admin, /tournaments, /account, /dashboard
    Blocks unconfirmed emails from protected routes
  Layer 2 — Admin Layout (src/app/admin/layout.tsx — SERVER-SIDE):
    Fetches user role from DB every request
    Redirects non-admin users (role !== "admin" && !== "super_admin") to /dashboard
    Also checks suspended status
  Layer 3 — Server Actions (src/lib/actions/adminActions.ts):
    All sensitive admin ops use SERVICE ROLE KEY (bypasses RLS)
    verifyAdmin() checks admin role server-side before any mutation
    Every action logs to admin_logs table
  Layer 4 — RLS Policies (database):
    User-level RLS still restricts direct table access
  Root (/): redirect to /tournaments if logged in
```

---

## SYSTEM_FLOW

```
User Browser
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  middleware.ts                                       │
  │  ├── refresh session cookie                          │
  │  ├── check protected routes → /login or /verify-email│
  │  └── redirect / → /tournaments if authenticated      │
  └──────────────────────────────────────────────────────┘
     │
     ▼
   ┌──────────────────────────────────────────────────────┐
   │  Next.js 15 App Router                               │
   │  ┌────────────────────────────────────────────────┐  │
   │  │ layout.tsx (root)                              │  │  ← SessionProvider + Header + Footer
   │  │   ├── page.tsx (/)                             │  │  ← Landing (public only)
   │  │   ├── /tournaments                             │  │  ← Main default (auth required)
   │  │   ├── /dashboard                               │  │  ← Dashboard (auth required)
   │  │   ├── /account                                 │  │  ← Profile + avatar (auth required)
   │  │   ├── /leaderboard                             │  │  ← Server → leaderboard_entries table
   │  │   ├── /admin                                   │  │  ← Admin dashboard (admin only)
   │  │   ├── /admin/tournaments                       │  │  ← Tournament CRUD
   │  │   ├── /admin/tournaments/create                │  │  ← Create tournament form
   │  │   ├── /admin/tournaments/:id/edit              │  │  ← Edit tournament form
   │  │   ├── /admin/leaderboard                       │  │  ← Leaderboard CRUD
   │  │   ├── /admin/users                             │  │  ← User management
   │  │   ├── /login                                   │  │  ← AuthForm (login)
   │  │   ├── /register                                │  │  ← AuthForm (register)
   │  │   ├── /verify-email                            │  │  ← Email verification prompt
   │  │   └── /api/tournaments/join                    │  │  ← Real engine → processJoinRequest
   │  └────────────────────────────────────────────────┘  │
  │        ▲                                             │
  │  ┌─────┴────────────────────────────────────┐       │
  │  │  Shared Components                       │       │
  │  │  Header, Footer, LeaderboardTable        │       │
  │  │  AuthForm, HeroBanner                    │       │
  │  │  TournamentCard, TournamentSchedule      │       │
  │  │  BracketView, DrawBotAnimation           │       │
  │  └──────────────────────────────────────────┘       │
  │        ▲                                             │
  │  ┌─────┴──────────────────────────┐                 │
  │  │  Smart Engine Layer           │                 │
  │  │  tournamentManager.ts ← orchestrator            │
  │  │    ├── schedulerEngine.ts     │ ← date rules    │
  │  │    ├── tournamentEngine.ts    │ ← bracket gen   │
  │  │    └── notificationService.ts │ ← events        │
  │  │  data/tournaments.ts          │ ← store         │
  │  └───────────────────────────────┘                 │
  │        ▲                                           │
  │  ┌─────┴─────────────────────┐                     │
  │  │  Services Layer           │                     │
  │  │  authService.ts           │ ← signUp, signIn    │
  │  │  profileService.ts        │ ← get/update/avatar │
  │  │  tournamentService.ts     │ ← CRUD tournaments  │
  │  │  bracketService.ts        │ ← matches CRUD      │
  │  └───────────────────────────┘                     │
  │        ▲                                           │
  │  ┌─────┴─────────────────────┐                     │
  │  │  Supabase Layer           │                     │
  │  │  client.ts (browser)      │ ← createBrowserClient│
  │  │  server.ts (SSR)          │ ← createServerClient │
  │  │  middleware.ts (cookies)  │ ← updateSession     │
  │  │  session-provider.tsx     │ ← React context     │
  │  └───────────────────────────┘                     │
  └──────────────────────────────────────────────────────┘
```

### Tournament Lifecycle (Smart Engine)
```
CREATED → (scheduler opens registration) → OPEN → (8 players joined) → FULL
→ (auto bracket generation) → ACTIVE → (all matches completed) → COMPLETED
```

### Smart Engine Flow
```
Scheduler (date-based) → auto-creates tournaments → players join via matchmaking
→ best tournament assigned (oldest first, most-filled first) → at 8 players:
  lock registration → Fisher-Yates shuffle → generate bracket (QF/SF/F)
→ activate tournament → lifecycle auto-transitions
```

---

## ARCHITECTURE

```
src/
├── app/
│   ├── globals.css              ← Tailwind v4 theme
│   ├── layout.tsx               ← Root layout: SessionProvider + Header + Footer
│   ├── page.tsx                 ← Landing page (public only)
│   ├── tournaments/
│   │   ├── page.tsx             ← Main default (auth: schedules + cards + brackets)
│   │   └── [id]/page.tsx        ← Tournament details (banner, rules, join/leave, countdown)
│   ├── dashboard/
│   │   └── page.tsx             ← Dashboard (auth: tournament management)
│   ├── account/
│   │   └── page.tsx             ← Profile editing + avatar upload (auth)
│   ├── leaderboard/
│   │   └── page.tsx             ← Leaderboard (Server, DB-driven via leaderboard_entries)
│   ├── admin/
│   │   ├── layout.tsx           ← SERVER-SIDE admin role gate + shared nav
│   │   ├── page.tsx             ← Admin dashboard (stats + quick actions + activity)
│   │   ├── tournaments/
│   │   │   ├── page.tsx         ← Tournament CRUD list
│   │   │   ├── create/page.tsx  ← Create tournament form
│   │   │   └── [id]/edit/page.tsx ← Edit tournament form
│   │   ├── leaderboard/
│   │   │   └── page.tsx         ← Leaderboard CRUD (add/edit/delete/reorder)
│   │   ├── users/
│   │   │   └── page.tsx         ← User management (promote/demote/suspend)
│   │   └── logs/
│   │       └── page.tsx         ← Audit logs viewer (server component, service role key)
│   ├── login/
│   │   └── page.tsx             ← Login page
│   ├── register/
│   │   └── page.tsx             ← Register page
│   ├── verify-email/
│   │   └── page.tsx             ← Email verification prompt
│   ├── middleware.ts             ← Session refresh + route protection (+ /admin)
│   └── api/
│       └── tournaments/
│           └── join/route.ts    ← POST endpoint stub
├── components/
│   ├── Header.tsx               ← Fixed top nav, auth-aware (dynamic links + admin link)
│   ├── Footer.tsx               ← Simple footer with branding
│   ├── HeroBanner.tsx           ← Full-width image + overlay + CTAs
│   ├── LeaderboardTable.tsx     ← Rankings with gold/silver/bronze (DB-driven)
│   ├── AuthForm.tsx             ← Reusable login/register with validation
│   ├── TournamentCard.tsx       ← Tournament card with tier colors + join
│   ├── TournamentSchedule.tsx   ← Premium 4-tier cards
│   ├── BracketView.tsx          ← Visual bracket tree (CSS Grid + SVG connectors)
│   └── DrawBotAnimation.tsx     ← Step-by-step draw animation
├── data/
│   └── tournaments.ts           ← Tournament seed data + schedule slots
├── types/
│   └── index.ts                 ← All shared TypeScript interfaces (+ admin types)
└── lib/
    ├── logger.ts                ← Async 3-level logger
    ├── auth-route-guard.ts      ← Client-side auth routing helper
    ├── tournamentEngine.ts      ← Join logic, bracket gen, Fisher-Yates, DrawBot, lifecycle
    ├── schedulerEngine.ts       ← Date-based tier rules, auto-creation decisions
    ├── tournamentManager.ts     ← Central orchestrator: store, matchmaking, decision logic
    ├── notificationService.ts   ← Event-based notifications
    ├── actions/
    │   └── adminActions.ts      ← All admin Server Actions (SERVICE ROLE KEY, verifyAdmin(), audit logging)
    ├── services/
    │   ├── authService.ts       ← signUp, signIn, signOut, resendVerification
    │   ├── profileService.ts    ← getProfile, updateProfile, uploadAvatar
    │   ├── tournamentService.ts ← fetchTournaments, fetchTournamentById, createTournament, updateStatus, deleteTournament
    │   ├── bracketService.ts    ← fetchMatches, saveMatches, updateMatchWinner
    │   ├── adminService.ts      ← isAdmin, getAdminStats, fetchAllUsers, updateUserRole, toggleSuspension
    │   ├── leaderboardService.ts← fetchLeaderboard, add/update/delete/reorder entries
    │   ├── auditService.ts      ← logAdminAction, fetchAdminLogs
    │   ├── registrationService.ts ← registerForTournament, fetchMyRegistrations, updateRegistrationStatus
    │   ├── bannerService.ts     ← uploadTournamentBanner (Storage)
    │   ├── discordService.ts    ← sendDiscordNotification, notifyTournamentPublished
    │   ├── tournamentServer.ts  ← fetchTournamentsServer (server-only, uses next/headers)
    │   ├── leaderboardServer.ts ← fetchLeaderboardServer (server-only, uses next/headers)
    │   └── adminServer.ts       ← isAdminServer (server-only, uses next/headers)
    └── supabase/
        ├── client.ts            ← Browser Supabase client (singleton)
        ├── server.ts            ← Server Supabase client (cookies, next/headers for SSR)
        ├── admin.ts             ← Admin Supabase client (SERVICE_ROLE_KEY, bypasses RLS)
        ├── middleware.ts        ← Session refresh cookie handler
        ├── session-provider.tsx ← Auth React context (user, loading, signOut)
        └── types.ts             ← Database type definitions (profiles, tournaments, leaderboard_entries, admin_logs, tournament_registrations)
```

### Color Palette
- Primary: `#0F172A`  |  Secondary: `#2563EB`  |  Accent: `#F59E0B`
- Background: `#FFFFFF`  |  Text: `#111827`  |  Surface: `#F8FAFC`

---

## ORPHANS & PENDING

| Item                    | Status       | Action                          |
|-------------------------|--------------|---------------------------------|
| Tournament DB layer     | PENDING      | Replace in-memory store with Supabase queries |
| Bracket auto-advance    | DEFERRED     | Add match winner → next round logic |
| WebSocket real-time     | DEFERRED     | Live bracket updates, match notifications |
| Discord bot integration | DEFERRED     | Webhook for bracket generated / winner events |
| Favicon / OG images     | DEFERRED     | Add `/public/favicon.ico` and OG images |
| Account avatar upload   | DONE         | Supabase Storage bucket + profile update |
| Auth routing            | DONE         | Middleware guards + conditional redirect |
| Email verification gate | DONE         | Block protected routes until confirmed |
| Admin RBAC system       | DONE         | profiles.role + RLS + /admin pages + Header link |
| Admin Layout (SSR)      | DONE         | Server-side role gate + shared nav |
| Server Actions + SVC Key| DONE         | All admin ops via service role key + audit |
| Admin Dashboard         | DONE         | /admin with stats, quick actions, recent activity |
| Tournament CRUD         | DONE         | Create/edit/delete tournaments (admin only, logged) |
| Tournament Details Page | DONE         | /tournaments/[id] with banner, rules, join/leave, countdown |
| Leaderboard Management  | DONE         | DB-driven leaderboard_entries, admin CRUD, reorder (logged) |
| User Management         | DONE         | Promote/demote/suspend/reactive (admin only, logged) |
| Audit Logs              | DONE         | admin_logs table + /admin/logs viewer |
| Static leaderboard data | REMOVED      | Replaced with leaderboard_entries table |
| SUPABASE_SERVICE_ROLE_KEY| PENDING     | Must be set in .env.local and Vercel env |
