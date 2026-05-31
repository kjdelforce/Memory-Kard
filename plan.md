# plan.md — PS Collectors Hub (React + FastAPI + MongoDB + IGDB)

## 1) Objectives
- Prove IGDB integration works reliably via Twitch OAuth (client credentials): token fetch/refresh, PS-platform filtered search, game detail (cover + screenshots).
- Build full V1 app (all listed pages) around the proven IGDB core with strict PS dark/glass design system.
- Implement JWT email/password auth, collection + wishlist CRUD, public profiles by username, privacy, avatar upload, stats charts, explore collectors, platform browsing.
- End-to-end test the complete user flows; ensure library is empty on signup (no demo seed).

## 2) Implementation Steps

### Phase 1 — Core POC: IGDB Integration (isolation; must pass before app build)
**User stories**
1. As a developer, I want to fetch a Twitch app token so backend can call IGDB.
2. As a user, I want to search PlayStation games so results are relevant to my collection.
3. As a user, I want game details (cover, release date, rating) so I can decide to add it.
4. As a user, I want screenshots so I can verify the game visually.
5. As a developer, I want graceful handling of rate limits/expired tokens so the app stays usable.

**Steps**
- Websearch best practices: Twitch client-credentials token caching/refresh + IGDB query examples (search, fields, where platforms).
- Backend-only POC (no auth, no DB):
  - `.env`: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`
  - Implement `IGDBClient`:
    - `get_token()` (cache in-memory with expiry buffer)
    - `igdb_post(endpoint, body)` auto-inject headers, retry once on 401
  - Implement minimal FastAPI routes:
    - `GET /api/igdb/search?q=&platform=&sort=&page=` (platform defaults to PS set)
    - `GET /api/igdb/games/{id}` (cover + screenshots + genres + platforms + summary)
    - `GET /api/igdb/platforms` (PS-only list)
- Python test script (standalone) to validate end-to-end:
  - Fetch token
  - Search a known PS title
  - Fetch details for first result
  - Verify cover URL composition and screenshot URLs
  - Verify PS platform filter IDs (7,8,9,48,167,38,46)
- Fix until stable: token refresh, null fields, missing covers, pagination.

**Deliverable**: POC endpoints + script passing locally with real IGDB responses.

---

### Phase 2 — V1 App Development (build all pages; integrate proven core)
**User stories**
1. As a new user, I want to sign up and land in an empty dashboard so I can start fresh.
2. As a user, I want to search IGDB and add a game to my collection with status/platform/rating/notes.
3. As a user, I want to manage my collection (filter/sort/tabs) so I can track progress.
4. As a user, I want a wishlist with priorities and one-tap move-to-collection.
5. As a user, I want a public profile link by username so I can share my collection (if privacy allows).

**Backend (FastAPI + MongoDB)**
- Mongo models/collections: `users`, `collection_entries`, `wishlist_entries` (+ indexes on `username`, `{user_id, igdb_game_id}` uniqueness).
- Auth:
  - Email/password signup + login (bcrypt hashing)
  - JWT access token; auth dependency for protected routes
- Core APIs:
  - IGDB proxy APIs (from Phase 1) used by frontend
  - Collection CRUD: create/update/delete/list; status transitions; favorite toggle
  - Wishlist CRUD: create/update/delete/list; move-to-collection
  - Profile: public by username; respect privacy settings
  - Explore: search users by username/display_name; trending (basic: most-added last 7/30 days)
  - Avatar upload: multipart upload → local storage path + served static route
- Validation + error handling: consistent JSON errors; 401/403/404; input constraints.

**Frontend (React CRA)**
- App shell:
  - Mobile-first layout; BottomTabBar on mobile; Sidebar (240px) desktop
  - Framer Motion page transitions + grid staggers + modal behaviors
- Design system enforcement:
  - Global theme variables for strict colors/fonts
  - Glass card component + skeletons + empty/error states
- Routing/pages (all required):
  - `/` Landing
  - `/auth/signup`, `/auth/login`
  - `/dashboard`
  - `/search` (sticky search, filters, infinite scroll)
  - `/game/:id` (hero, gallery, sticky action bar, similar games)
  - `/collection` (tabs, grid/list, sort, stats bar)
  - `/wishlist` (priority tabs, move to collection)
  - `/profile/:username` (tabs + Recharts stats)
  - `/settings` (profile/avatar, account/password, privacy, danger zone)
  - `/explore` (collector search + cards)
  - `/platforms` (platform cards → games list)
- Key components:
  - `GameCard`, `AddToCollectionModal` (sheet on mobile; scale-fade desktop)
  - `Sidebar`, `BottomTabBar`, `PlatformPills`, `StatusPills`
  - Charts (Recharts) hidden until data exists
- State + data:
  - Auth context + token storage
  - API client with auth header injection
  - Pagination/infinite scroll; cached recent searches

**Phase 2 checkpoint**
- One end-to-end run: signup → search → game detail → add to collection → view collection/dashboard → add wishlist → move to collection → profile view.

---

### Phase 3 — End-to-End Testing, Hardening, UX Polish
**User stories**
1. As a user, I want consistent loading states so the app feels fast.
2. As a user, I want clear error messages so I know what to do next.
3. As a user, I want privacy toggles to actually hide my data when enabled.
4. As a user, I want avatar upload to work on mobile and desktop.
5. As a user, I want my filters/sorts to behave predictably across pages.

**Steps**
- Automated/manual test matrix across pages (happy paths + empty states + errors).
- Auth/session tests: token expiry, logout, protected route guards.
- IGDB robustness: missing covers, missing screenshots, rate limit handling, retries.
- Data integrity tests: duplicates, concurrent updates, delete cascades (user deletion).
- Performance pass: minimize over-fetching; debounce search; image lazy loading.

## 3) Next Actions (immediate)
1. Add Twitch credentials to backend env and implement `IGDBClient` with token caching/refresh.
2. Build Phase-1 endpoints + Python POC script; run until it passes consistently.
3. Once POC is stable, scaffold Mongo models + JWT auth routes.
4. Implement frontend shell + `/search` + `/game/:id` + AddToCollectionModal first (core flow), then remaining pages.

## 4) Success Criteria
- Phase 1: POC script reliably returns PS-filtered search results and full game details (cover + screenshots) without manual token intervention.
- Phase 2: All listed pages exist, are navigable, and core flows work end-to-end with real IGDB data; signup produces an empty library.
- Phase 3: No broken routes; consistent loading/empty/error states; privacy settings enforced; avatar upload works; charts render correctly when data exists.
