# Repository Guidelines

## Project Structure & Module Organization
- Backend (Node + TypeScript): `src/` → `controllers/`, `services/`, `routes/`, `middleware/`, `config/`, `utils/`, `types/`, `templates/` (reports).
- Frontend (React + Vite + TS): `client/` → `src/components`, `src/pages`, `src/services`, `src/types`, `src/utils`.
- Builds: backend outputs to `dist/`; frontend outputs to `client/dist/`.
- Configuration: `.env` (runtime) and `config.ini` (Firebird DBs). Do not commit secrets.

## Build, Test, and Development Commands
- Run full dev (API + client): `npm run dev`.
- API only (watch, TS): `npm run server:dev` (uses `nodemon` + `tsx`).
- Client only: `cd client && npm run dev`.
- Build all: `npm run build` → `server:build` (tsc) + `client:build` (Vite).
- Start production API: `npm start` (runs `dist/server.js`).
- Client lint: `cd client && npm run lint`.
- Ad‑hoc DB tests (require build): `npm run server:build` then `node test-lookup.js` or `node test-recepcao.js`.

## Coding Style & Naming Conventions
- TypeScript strict mode enabled (see `tsconfig.json`). Use 2‑space indentation.
- Filenames: lowerCamelCase for modules (e.g., `userService.ts`, `recepcao.ts`).
- Prefer explicit types and narrow return shapes for services/controllers.
- Client uses ESLint (see `client/eslint.config.js`). Fix warnings before PR.

## Testing Guidelines
- Backend (Jest): see `jest.config.ts`. Place tests in `src/**/__tests__` and run `npm test` or `npm run test:watch`.
- Client (Vitest): see `client/vitest.config.ts` and `client/src/test/setup.ts`. Place tests in `client/src/**/*.test.ts(x)` and run `cd client && npm test`.
- Prefer small, focused tests. Keep DB‑dependent tests opt‑in (read `config.ini`/`.env`).

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat(api): add recepcao filters`, `fix(client): debounce lookup`).
- PRs must include: scope/impact, steps to test, screenshots for UI, and linked issues.
- CI expectation: build passes (`npm run build`) and client lint is clean.

## Security & Configuration Tips
- Never commit real credentials. Use `.env.example` and sanitize `config.ini` in PRs.
- Default API port: `3001`. CORS is permissive in dev; review before production.

## Agent‑Specific Instructions
- Keep changes minimal and aligned with existing structure; avoid renames.
- Touch only relevant files; don’t edit generated `dist/`.
- Before adding dependencies, prefer built‑ins or existing libs.
