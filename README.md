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
- Capability-Based Carrier Engine: Every carrier implements a `capabilities` map. Adding **FedEx** or new operations like **Tracking** never touches existing UPS rating code.
- OAuth 2.0 Persistence & Refresh: Full token lifecycle management (Acquire -> Store -> Refresh) is handled transparently in the background.
- UPS v2409 Compliance: Strictly follows the latest UPS Rating API docs, including mandatory `ShopTimeInTransit` implementation.
- Error Handling: Structured, machine-readable `CarrierError` responses with global HTTP status mapping.
- Integration Testing: High-fidelity end-to-end tests using stubbed HTTP responses based on realistic carrier payloads.
- Cookies: Anonymous session tracking via signed HttpOnly cookies for a frictionless user experience.

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
