# plan.md — PS Collectors Hub (PS Shelf) (React + FastAPI + MongoDB + IGDB)

## 1) Objectives
- ✅ **Prove IGDB integration** via Twitch OAuth (client credentials) works reliably: token fetch/refresh, PlayStation-only platform filtering, search + game detail (cover + screenshots).
- ✅ **Build full V1 app end-to-end** (all required pages + components) with strict **PlayStation dark/glass** design system, mobile-first navigation, and Framer Motion micro-interactions.
- ✅ Implement core product features:
  - Email/password **JWT auth**
  - **Collection** + **Wishlist** management
  - **Public profiles** by username with **privacy controls**
  - **Avatar upload** (local storage)
  - **Stats + charts** (Recharts)
  - **Explore collectors** + trending games
  - **Browse by platform**
- 🔄 **Phase 3 goal (current):** comprehensive end-to-end validation and hardening:
  - eliminate functional bugs
  - ensure privacy enforcement
  - polish loading/empty/error states
  - verify mobile/desktop navigation + performance
- Non-negotiable: **Library remains empty on signup** (no demo seeding) and empty states remain graceful.

## 2) Implementation Steps

### Phase 1 — Core POC: IGDB Integration (isolation; must pass before app build)
**User stories**
1. As a developer, I want to fetch a Twitch app token so backend can call IGDB.
2. As a user, I want to search PlayStation games so results are relevant to my collection.
3. As a user, I want game details (cover, release date, rating) so I can decide to add it.
4. As a user, I want screenshots so I can verify the game visually.
5. As a developer, I want graceful handling of expired tokens so the app stays usable.

**Steps**
- Backend-only POC (no auth, no DB):
  - `.env`: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`
  - Implement `IGDBClient`:
    - `get_token()` (cache in-memory with expiry buffer)
    - `post(endpoint, body)` auto-inject headers, retry once on 401
  - Implement minimal FastAPI routes:
    - `GET /api/igdb/search?q=&platform=&sort=&page=` (platform defaults to PS set)
    - `GET /api/igdb/games/{id}` (cover + screenshots + genres + platforms + summary)
    - `GET /api/igdb/platforms` (PS-only list)
- Python test script (standalone) to validate:
  - Fetch token
  - Search a known PS title
  - Fetch details for first result
  - Verify cover URL composition and screenshot URLs
  - Verify PS platform filter IDs (PS1=7, PS2=8, PS3=9, PS4=48, PS5=167, PSP=38, PS Vita=46)

**Deliverable**: POC endpoints + script passing locally with real IGDB responses.

**Status**: ✅ **COMPLETED**
- Twitch OAuth working + token cached
- IGDB search + details + screenshots validated with real data
- Platform filtering verified for all PS platforms

---

### Phase 2 — V1 App Development (build all pages; integrate proven core)
**User stories**
1. As a new user, I want to sign up and land in an empty dashboard so I can start fresh.
2. As a user, I want to search IGDB and add a game to my collection with status/platform/rating/notes.
3. As a user, I want to manage my collection (filter/sort/tabs) so I can track progress.
4. As a user, I want a wishlist with priorities and one-tap move-to-collection.
5. As a user, I want a public profile link by username so I can share my collection (if privacy allows).

**Backend (FastAPI + MongoDB)**
- ✅ Mongo collections + indexes:
  - `users`
  - `collection_entries` (unique per `{user_id, igdb_game_id, platform}`)
  - `wishlist_entries` (unique per `{user_id, igdb_game_id, platform}`)
- ✅ Auth:
  - Email/password signup + login (bcrypt)
  - JWT access tokens
  - `/api/auth/me` current-user
  - username availability check
- ✅ IGDB proxy APIs:
  - `/api/igdb/search`
  - `/api/igdb/games/{id}`
  - `/api/igdb/platforms`
  - `/api/igdb/platform/{platform_name}`
- ✅ Collection:
  - CRUD: `POST /api/collection`, `GET /api/collection`, `PATCH /api/collection/{id}`, `DELETE /api/collection/{id}`
  - stats: `GET /api/collection/stats`
- ✅ Wishlist:
  - CRUD: `POST /api/wishlist`, `GET /api/wishlist`, `PATCH /api/wishlist/{id}`, `DELETE /api/wishlist/{id}`
  - move-to-collection: `POST /api/wishlist/{id}/move-to-collection`
- ✅ Profile/Settings:
  - update profile: `PATCH /api/profile`
  - privacy: `PATCH /api/profile/privacy`
  - password change: `POST /api/profile/password`
  - avatar upload: `POST /api/profile/avatar` + file serving `/api/uploads/avatars/{fname}`
  - delete data/account: `DELETE /api/profile/data`, `DELETE /api/profile`
- ✅ Public profile + explore:
  - `GET /api/users/{username}` (privacy-aware)
  - `GET /api/explore` (collector search + trending)

**Frontend (React CRA)**
- ✅ App shell:
  - Mobile-first layout
  - BottomTabBar on mobile + fixed left Sidebar (240px) on desktop
  - Framer Motion page transitions and card hover lift+scale
- ✅ Design system enforcement:
  - Global PS color tokens + fonts (Rajdhani/Inter/Orbitron)
  - Glass card styling, skeleton shimmer, empty/error states
- ✅ All required routes/pages implemented:
  - `/` Landing (floating PS symbols, hero, shelf mockup, feature cards, platform pills)
  - `/auth/signup` + `/auth/login` (split-screen, strength meter, username availability)
  - `/dashboard` (welcome header, stat pills w/ count-up, currently playing, recent additions, status pie chart, genre pills, quick links)
  - `/search` (sticky glass bar, platform filter, sort, load more, game cards)
  - `/game/:id` (blurred hero, action buttons, read-more, screenshots lightbox, similar games)
  - `/collection` (empty state w/ controller SVG, status tabs, grid/list, sort, client search, stats bar, inline status change)
  - `/wishlist` (priority tabs, move-to-collection, delete, sort)
  - `/profile/:username` (avatar PS ring, stat tiles, tabs, Recharts pie/bar/line)
  - `/settings` (Profile/Account/Privacy/Danger Zone tabs; avatar upload, password, privacy, delete data/account)
  - `/explore` (collector search, cards grid, Trending sidebar)
  - `/platforms` (platform cards with era glow, top games grid)
- ✅ Key components delivered:
  - `GameCard` (hover overlay Add/Wishlist)
  - `AddToCollectionModal` (collection + wishlist modes; platform selector, status pills, rating slider, hours, notes, priority)
  - `FloatingPSSymbols`, `EmptyState`, `ErrorState`, skeletons

**Phase 2 checkpoint**
- ✅ Verified visually and functionally (at least): Landing, Sign In, Dashboard (empty state), Search (real IGDB results).
- ✅ Auth flow + core navigation confirmed.

**Status**: ✅ **COMPLETED**

---

### Phase 3 — End-to-End Testing, Hardening, UX Polish
**User stories**
1. As a user, I want consistent loading states so the app feels fast.
2. As a user, I want clear error messages so I know what to do next.
3. As a user, I want privacy toggles to actually hide my data when enabled.
4. As a user, I want avatar upload to work on mobile and desktop.
5. As a user, I want my filters/sorts to behave predictably across pages.

**Steps**
- 🔄 Run automated/manual test matrix across all pages:
  - signup/login/logout
  - search → game detail → add to collection
  - add to wishlist → move to collection
  - collection status changes + delete
  - profile view as self vs public viewer (privacy)
  - settings updates + avatar upload + password change
  - explore search + trending
  - platforms browse + add
- 🔄 Hardening:
  - auth/session edge cases (invalid token, expired token, missing auth)
  - IGDB edge cases (missing covers/screenshots/summary)
  - Mongo uniqueness conflicts surfaced as friendly UI messages
  - ensure empty states everywhere (no broken charts/layout)
- 🔄 UX polish:
  - verify tap targets (>=44px)
  - verify sticky bars don’t overlap content on mobile (safe area)
  - verify skeleton layouts match final layouts
  - remove/resolve ESLint warnings where practical
- 🔄 Performance pass:
  - debounce search
  - lazy load images
  - minimize refetching on navigation

**Status**: 🔄 **IN PROGRESS** (testing_agent_v3 running)

## 3) Next Actions (immediate)
1. Run **testing_agent_v3** full end-to-end suite and capture failures.
2. Fix bugs found (prioritize auth breaks, data integrity, privacy enforcement).
3. Validate mobile navigation (BottomTabBar + safe-area) and desktop sidebar states.
4. Resolve minor lint warnings (missing dependencies) if they indicate real issues.
5. Re-run tests until green.

## 4) Success Criteria
- Phase 1: ✅ POC script reliably returns PS-filtered search results and full game details (cover + screenshots) without manual token intervention.
- Phase 2: ✅ All listed pages exist, are navigable, and core flows work end-to-end with real IGDB data; signup produces an empty library.
- Phase 3: ⬜ No broken routes; consistent loading/empty/error states; privacy settings enforced; avatar upload works; charts render correctly when data exists; all critical end-to-end tests pass.
