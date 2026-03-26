# Cybership — Carrier Integration Service

## Overview
A shipping carrier integration service that wraps the UPS Rating API
to fetch real-time shipping rates. Built as a take-home assessment
demonstrating production-grade architecture, extensibility, and testing.

## Repo Structure
cybership/
  frontend/    # Next.js 14 App Router + shadcn/ui
  backend/     # NestJS + Prisma + PostgreSQL

## Architecture Decisions
- NestJS for the API: modules, DI, pipes, and guards make carrier
  abstraction clean and testable
- Next.js App Router: API routes act as a secure proxy to NestJS,
  keeping cookies HttpOnly end-to-end
- shadcn/ui: unstyled accessible components, no bloated CSS framework
- Prisma + PostgreSQL: type-safe queries, migration history, easy to
  extend with new models
- ICarrier interface: every carrier implements the same contract —
  adding FedEx never touches UPS code
- Cookies: anonymous session tracking via signed HttpOnly cookies,
  no login required

## Prerequisites
- Node.js >= 18
- Docker (for PostgreSQL)

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/cybership.git
cd cybership
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables
`cp .env.example .env`
# Fill in values

### 3. Start PostgreSQL
`docker-compose up -d`

### 4. Run Prisma Migrations
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Backend
`cd backend && npm run start:dev`

### 6. Start Frontend
`cd frontend && npm run dev`

## Environment Variables
| Variable            | Description                        | Required |
|---------------------|------------------------------------|----------|
| UPS_CLIENT_ID       | UPS OAuth client ID                | Yes      |
| UPS_CLIENT_SECRET   | UPS OAuth client secret            | Yes      |
| UPS_BASE_URL        | UPS API base URL                   | Yes      |
| UPS_ACCOUNT_NUMBER  | UPS shipper account number         | Yes      |
| DATABASE_URL        | PostgreSQL connection string       | Yes      |
| COOKIE_SECRET       | Secret for signing cookies         | Yes      |
| PORT                | NestJS port (default 3000)         | No       |
| NODE_ENV            | development / production / test    | No       |

## API Endpoints
- `POST /rates`         — submit a rate request
- `GET  /rates/history` — get past requests for current session

## Running Tests
`cd backend && npm run test`

## What I Would Improve Given More Time
- FedEx and USPS carrier adapters
- Redis for token caching instead of PostgreSQL
- Rate result caching with TTL
- Tracking webhook events
- CI/CD with GitHub Actions
