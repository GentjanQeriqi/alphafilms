# AlphaFilms — Build Progress

> Last updated: June 7, 2026

---

## Project Overview

**AlphaFilms** is a photography session management platform where photographers create sessions, generate QR codes, and share live galleries with clients in real time.

**Stack:** Angular 20 (frontend) + NestJS (backend) + PostgreSQL + Socket.IO + Docker

---

## Architecture

```
Angular App (port 4200)
       |
       v
NestJS API (port 3000)
       |
       +------------------+
       |                  |
       v                  v
 PostgreSQL          /uploads (local)
 (port 5432)
```

**Docker containers:** `frontend` · `backend` · `postgres` · `nginx`

---

## What Has Been Built

### 1. Frontend — Angular 20

#### Design System
- **Font:** Plus Jakarta Sans (Google Fonts)
- **Palette:** Pure black/white minimalist (`#000000` / `#FFFFFF` / gray scale)
- **Tokens:** Full CSS custom property system (`--color-*`, `--text-*`, `--border-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--transition-*`, `--z-*`)
- **Animations:** `fadeIn`, `slideUp`, `scaleIn`, `spin` keyframes
- **Accessibility:** `prefers-reduced-motion` respected, visible `:focus-visible` rings, 44px min touch targets
- **Responsive:** Breakpoints at 375px · 768px · 1024px · 1440px

#### File Structure

```
alphafilms/src/app/
├── core/
│   ├── models/
│   │   ├── user.model.ts           User, UserRole
│   │   ├── session.model.ts        Session, SessionStatus, SessionType, DTOs
│   │   └── photo.model.ts          Photo, UploadProgress
│   ├── services/
│   │   ├── auth.service.ts         Signals-based auth (user, token, loading)
│   │   ├── session.service.ts      CRUD for sessions
│   │   ├── photo.service.ts        Upload with progress + HttpRequest
│   │   └── socket.service.ts       Socket.IO /session namespace
│   ├── guards/
│   │   └── auth.guard.ts           JWT token guard
│   └── interceptors/
│       └── auth.interceptor.ts     Auto-attach Bearer token
├── features/
│   ├── auth/login/
│   │   └── login.component.ts      Google OAuth login page, grid background
│   ├── dashboard/
│   │   ├── dashboard.component.ts  Session grid, filter tabs, delete modal
│   │   └── components/session-card/
│   │       └── session-card.component.ts  Status badge, expiry warning, actions
│   ├── session/
│   │   ├── create-session/
│   │   │   └── create-session.component.ts  Modal, session type picker, expiry
│   │   └── session-detail/
│   │       └── session-detail.component.ts  QR panel, photo grid, lightbox, copy link
│   ├── upload/photo-upload/
│   │   └── photo-upload.component.ts  Drag-and-drop, multi-file queue, progress bars
│   └── public/gallery/
│       └── gallery.component.ts    Masonry grid, live dot, lightbox with prev/next
├── layouts/
│   ├── main-layout/
│   │   └── main-layout.component.ts  Sticky navbar + router outlet
│   └── public-layout/
│       └── public-layout.component.ts  Minimal footer + router outlet
└── shared/
    └── components/navbar/
        └── navbar.component.ts     Logo, nav links, user avatar, logout
```

#### Routing

| Route | Component | Auth |
|-------|-----------|------|
| `/` | → `/login` | — |
| `/login` | `LoginComponent` | Public |
| `/dashboard` | `DashboardComponent` | Required |
| `/sessions/:id` | `SessionDetailComponent` | Required |
| `/s/:slug` | `GalleryComponent` | Public |

#### Dependencies Installed

```
@angular/material
@angular/cdk
@angular/animations
socket.io-client
angularx-qrcode
lucide-angular
```

#### Key Features Implemented

- Google OAuth login flow (redirect → callback → JWT store)
- Dashboard with `All / Active / Expired` filter tabs
- Session creation modal with type picker (Wedding, Birthday, Corporate, Graduation, Family, Other)
- QR code generation from `session.slug` using `angularx-qrcode`
- QR code download as PNG
- Copy gallery link to clipboard
- Photo upload with drag-and-drop, real-time progress bars, file validation (type + 25MB limit)
- Photo grid with hover overlay and delete
- Lightbox with previous/next navigation
- Public gallery with masonry layout and live "updating in real time" indicator
- Socket.IO real-time photo updates in both session detail and public gallery
- Auto-expiry warning on session cards (< 72h turns amber)
- Angular Signals throughout (`signal()`, `computed()`)
- SSR disabled (client-only rendering, `RenderMode.Client`)
- `localStorage` SSR-safe (`isPlatformBrowser` guard)

---

### 2. Backend — NestJS

#### File Structure

```
alphafilms-be/src/
├── database/
│   ├── entities/
│   │   ├── user.entity.ts      UUID PK, email, name, avatar, role
│   │   ├── session.entity.ts   UUID PK, name, slug (UNIQUE), status, expiresAt, userId FK
│   │   └── photo.entity.ts     UUID PK, sessionId FK, paths, size, dimensions
│   └── database.module.ts      TypeORM async config from .env
├── auth/
│   ├── strategies/
│   │   ├── google.strategy.ts  passport-google-oauth20, upserts user on login
│   │   └── jwt.strategy.ts     Bearer token extraction + user lookup
│   ├── auth.controller.ts      GET /auth/google · GET /auth/google/callback · GET /auth/profile
│   ├── auth.service.ts         generateToken(user) → JWT
│   └── auth.module.ts
├── users/
│   ├── users.service.ts        findByEmail, findById, upsertFromGoogle
│   └── users.module.ts
├── sessions/
│   ├── sessions.service.ts     CRUD, slug generation, cleanup expired
│   ├── sessions.controller.ts  GET/POST/PATCH/DELETE /sessions
│   └── sessions.module.ts
├── photos/
│   ├── photos.service.ts       Sharp resize → 1920px 80% JPEG + save original
│   ├── photos.controller.ts    POST /sessions/:id/photos · DELETE /photos/:id
│   └── photos.module.ts
├── sockets/
│   ├── session.gateway.ts      /session namespace, join/leave rooms, emitPhotoAdded
│   └── sockets.module.ts
├── cleanup/
│   ├── cleanup.service.ts      @Cron(EVERY_DAY_AT_MIDNIGHT) → delete expired sessions + files
│   └── cleanup.module.ts
├── common/
│   └── public.controller.ts   GET /public/session/:slug · GET /public/session/:slug/photos
├── app.module.ts               Assembles all modules + ServeStaticModule for /uploads
└── main.ts                     Bootstrap, CORS, ValidationPipe, global prefix /api/v1
```

#### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/auth/google` | — | Redirect to Google OAuth |
| `GET` | `/api/v1/auth/google/callback` | — | OAuth callback → JWT redirect |
| `GET` | `/api/v1/auth/profile` | JWT | Current user profile |
| `GET` | `/api/v1/sessions` | JWT | All sessions for current user |
| `GET` | `/api/v1/sessions/:id` | JWT | Single session |
| `POST` | `/api/v1/sessions` | JWT | Create session |
| `PATCH` | `/api/v1/sessions/:id` | JWT | Update session |
| `DELETE` | `/api/v1/sessions/:id` | JWT | Delete session + files |
| `GET` | `/api/v1/sessions/:id/photos` | JWT | Session photos |
| `POST` | `/api/v1/sessions/:id/photos` | JWT | Upload photo (multipart) |
| `DELETE` | `/api/v1/photos/:id` | JWT | Delete photo |
| `GET` | `/api/v1/public/session/:slug` | — | Public session info |
| `GET` | `/api/v1/public/session/:slug/photos` | — | Public photos list |

#### Database Schema

```sql
users
  id          UUID PK
  email       VARCHAR UNIQUE
  name        VARCHAR
  avatar      VARCHAR NULL
  role        VARCHAR DEFAULT 'photographer'
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ

sessions
  id          UUID PK
  name        VARCHAR
  slug        VARCHAR UNIQUE   -- INDEX
  status      VARCHAR DEFAULT 'active'
  expires_at  TIMESTAMPTZ NULL
  user_id     UUID FK → users  -- INDEX
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ

photos
  id            UUID PK
  session_id    UUID FK → sessions CASCADE  -- INDEX
  filename      VARCHAR
  original_path VARCHAR
  web_path      VARCHAR
  size          BIGINT
  width         INT NULL
  height        INT NULL
  uploaded_at   TIMESTAMPTZ
```

#### File Storage

```
/uploads/
  session-{slug}/
    original/   full resolution (camera quality)
    web/        1920px wide, 80% JPEG quality
```

#### Security
- Max upload: 25MB
- Allowed types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- JWT expiry: 30 days
- CORS restricted to `FRONTEND_URL`

---

### 3. Infrastructure — Docker

```
docker-compose.yml
├── postgres       postgres:16-alpine, persistent volume
├── backend        Node 20 Alpine, 2-stage build
├── frontend       Node 20 → nginx:alpine, static files
└── nginx          Reverse proxy + WebSocket upgrade + /uploads passthrough
```

#### Nginx Config
- `/api/` → backend (HTTP 1.1)
- `/socket.io/` → backend (WebSocket upgrade, 3600s timeout)
- `/uploads/` → backend (7-day cache)
- `/` → frontend (Angular HTML5 routing)

---

## Environment Variables (Backend)

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=alphafilms
DB_PASS=alphafilms
DB_NAME=alphafilms
JWT_SECRET=<long-random-string>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:4200
```

---

## Build Status

| Item | Status |
|------|--------|
| Angular build (`ng build`) | ✅ Passes |
| Design system (CSS tokens, fonts) | ✅ Done |
| All UI components | ✅ Done |
| Routing & guards | ✅ Done |
| NestJS module structure | ✅ Done |
| TypeORM entities | ✅ Done |
| Docker Compose | ✅ Done |
| Nginx config | ✅ Done |
| Google OAuth (requires credentials) | ⏳ Needs .env |
| PostgreSQL running | ⏳ Needs Docker |
| End-to-end test | ⏳ Pending |

---

## What's Next (Phase 2)

- [ ] Watermarks on downloaded photos
- [ ] Download full session as ZIP
- [ ] Favorite photos
- [ ] Password-protected sessions
- [ ] Shareable links with expiry tokens

## What's Next (Phase 3)

- [ ] Lightroom plugin integration
- [ ] AI face detection tagging
- [ ] AI photo search
- [ ] Photographer teams
- [ ] Multi-tenant SaaS

---

## Quick Start (Local Dev)

```bash
# 1. Start database
docker run -d \
  --name alphafilms-pg \
  -e POSTGRES_USER=alphafilms \
  -e POSTGRES_PASSWORD=alphafilms \
  -e POSTGRES_DB=alphafilms \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Backend
cd alphafilms-be
cp .env.example .env    # fill in Google OAuth credentials + JWT_SECRET
npm run start:dev

# 3. Frontend
cd alphafilms
npm start
```

```bash
# Production (Docker Compose)
docker compose up -d
```
