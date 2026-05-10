# WH CRM Monorepo

API-first starter for WhatsApp + Instagram CRM SaaS.

## Stack
- `apps/api`: Node.js + Express + MongoDB + Socket.IO
- `apps/web`: React + Tailwind placeholder app shell
- `apps/worker`: background worker placeholder

## Implemented API capabilities
- Email/password auth: signup, login, rotating refresh sessions, logout
- Tenant-scoped contacts with pagination
- Workflow CRUD baseline (list/create/update)
- JWT-protected routes and centralized error handling

## Quick start
1. Copy env: `cp apps/api/.env.example apps/api/.env`
2. Install dependencies: `npm install` in repo root and each app as needed.
3. Start API: `npm run dev --workspace=apps/api`

## Next planned modules
- Campaign and drip queue execution in `apps/worker`
- Template compliance rules package
- Unified inbox and webhook handlers
