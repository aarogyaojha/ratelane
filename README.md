# Cybership - Shipping Rate Comparison Platform

A modern, production-ready shipping rate comparison platform that integrates multiple carrier APIs to provide real-time shipping quotes. Built with NestJS, Next.js, PostgreSQL, and TypeScript.

## Features

- 🔐 **Secure Authentication** - JWT-based user authentication with bcrypt password hashing
- 👥 **Role-Based Access Control** - Admin dashboard with user and audit log management
- 📊 **Real-time Rate Quotes** - Compare shipping rates across multiple carriers (UPS, FedEx, USPS)
- 📈 **Rate History Tracking** - Track all shipping rate queries and historical data
- 🛡️ **Enterprise Security** - Helmet.js headers, CORS protection, rate limiting, audit logging
- 📱 **Responsive Design** - Mobile-friendly UI with Tailwind CSS and shadcn/ui components
- ⚡ **Rate Limiting** - 20 requests/minute per IP, 100 requests/hour per user

## Tech Stack

**Backend:**
- NestJS 11 (TypeScript)
- PostgreSQL with Prisma ORM
- JWT authentication (HS256)
- Express.js with Helmet.js

**Frontend:**
- Next.js 14 (React 19)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Context API for state management

## Architecture

### Capability-Based Carrier Engine

Each carrier is a self-contained plugin that declares what it can do. The core routing layer reads capabilities and dispatches accordingly.

```typescript
// Each carrier declares its own capabilities
const UPSCarrier: Carrier = {
  id: 'ups',
  capabilities: ['rate', 'shop_time_in_transit'],
  execute: (op, payload) => { ... }
}

// Core never checks carrier identity — only capabilities
const carrier = registry.findCapable('rate');
```

Adding a new carrier like FedEx or USPS: implement the `Carrier` interface, register it, done. No existing code changes required.

### Database Schema

**Users Table**
- Stores user accounts with email, hashed password, and role (user/admin)
- Timestamps for audit trail

**Audit Logs Table**
- Tracks all API requests with user ID, action, resource, IP address
- Enables compliance and debugging

**Rate Requests Table**
- Stores shipping rate queries with origin/dest ZIP, weight, dimensions
- Links to user for personalized rate history

## Getting Started

### Prerequisites

- Node.js 18+ (Windows 10/11)
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd cybership
```

2. **Install dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**

Backend (.env):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cybership"
JWT_SECRET="your-secure-secret-key-min-32-chars"
JWT_EXPIRATION="7d"
ALLOWED_ORIGINS="http://localhost:3001"
NODE_ENV="production"
UPS_CONSUMER_KEY="your-ups-key"
UPS_CONSUMER_SECRET="your-ups-secret"
```

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Start Docker for PostgreSQL**

```bash
cd cybership
docker-compose up -d
```

5. **Run migrations**

```bash
cd backend
npx prisma migrate deploy
```

6. **Start the application**

```bash
# Terminal 1: Backend (port 3000)
cd backend
npm run start:dev

# Terminal 2: Frontend (port 3001)
cd frontend
npm run dev
```

Visit http://localhost:3001 to access the application.

## API Endpoints

### Authentication

- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login with email/password (returns JWT)
- `GET /auth/me` - Get current user profile (requires JWT)

### Rates

- `POST /rates` - Get shipping rates (requires JWT)
- `GET /rates/history` - Get user's rate query history (requires JWT)

### Admin (requires admin role)

- `GET /admin/stats` - System statistics
- `GET /admin/users` - List all users with pagination
- `GET /admin/users/:id` - Get user details
- `POST /admin/users/:id/promote` - Promote user to admin
- `POST /admin/users/:id/demote` - Demote admin to user
- `GET /admin/audit-logs` - View audit logs with pagination
- `GET /admin/audit-logs/user/:id` - Get user-specific audit logs
- `GET /admin/rate-limit-stats` - Rate limiting statistics
- `GET /admin/rate-limit-status/:id` - User rate limit status

## Security Features

### Authentication & Authorization

- **JWT Tokens** - 7-day expiration, HS256 algorithm
- **Password Hashing** - bcryptjs with 10 salt rounds
- **Role-Based Access Control** - @UseGuards(JwtAuthGuard, RoleGuard)

### API Security

- **Helmet.js** - HTTP security headers (CSP, HSTS, X-Frame-Options)
- **CORS** - Whitelist-based origin validation
- **Rate Limiting** - Per-IP and per-user limits via @nestjs/throttler
- **Input Validation** - Zod schemas on frontend, class-validator on backend

### Audit & Compliance

- **Audit Logging** - All API requests logged with user, action, IP
- **Data Isolation** - Users only see their own rate history
- **Admin Oversight** - Admins can view all logs and user activity

## Development

### Project Structure

```
cybership/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── admin/         # Admin dashboard backend
│   │   ├── rates/         # Rate fetching logic
│   │   ├── carriers/      # Carrier integrations (UPS, FedEx, etc)
│   │   ├── common/        # Guards, decorators, utilities
│   │   ├── prisma/        # Database service
│   │   └── main.ts        # App entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Schema migration history
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages and API routes
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and contexts
│   └── package.json
└── docker-compose.yml
```

### Running Tests

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests (when configured)
cd ../frontend
npm run test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Deployment

### Using Docker

```bash
# Build images
docker-compose build

# Start production stack
docker-compose up -d
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (min 32 characters)
- Configure `DATABASE_URL` with production PostgreSQL
- Set `ALLOWED_ORIGINS` to your domain
- Update carrier API keys (UPS, FedEx, etc.)

## Performance Considerations

- **Database Indexing** - Audit logs indexed on userId and createdAt
- **JWT Caching** - User tokens cached in localStorage
- **Rate Limiting** - Prevents API abuse and reduces server load
- **Pagination** - Admin endpoints support ?page and ?limit parameters

## Error Handling

- **400 Bad Request** - Invalid input or validation failure
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Insufficient permissions (admin required)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server-side error (logged with request ID)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and branch strategy.

## License

[INSERT LICENSE HERE]

## Support

For issues, questions, or feature requests, please open a GitHub issue.

---

**Built with ❤️ for shipping logistics**

**Structured error responses** — carrier errors return a typed `CarrierError` shape with machine-readable codes and HTTP status mapping. No raw carrier error strings leaking to the client.

**Strict input validation** — `class-validator` on the backend, `zod` on the frontend. Invalid payloads are rejected before they ever hit a carrier network.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL (Dockerized) |
| Auth | OAuth 2.0 (UPS), HttpOnly session cookies |
| Frontend | Next.js 15, Shadcn/UI, Tailwind CSS |
| Docs | Swagger / OpenAPI at `/api/docs` |
| Carrier | UPS Rating API v2409 |

---

## Getting started

**Prerequisites:** Node.js 18+, Docker, UPS developer credentials ([register here](https://developer.ups.com))

```bash
git clone https://github.com/aarogyaojha/cybership.git
cd cybership

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Environment variables
cp .env.example .env
```

| Variable | Description |
|---|---|
| `UPS_CLIENT_ID` | UPS OAuth client ID |
| `UPS_CLIENT_SECRET` | UPS OAuth client secret |
| `UPS_BASE_URL` | UPS API base URL |
| `UPS_ACCOUNT_NUMBER` | UPS shipper account number |
| `DATABASE_URL` | PostgreSQL connection string |
| `COOKIE_SECRET` | Secret for signing session cookies |

```bash
# Start database
docker-compose up -d

# Run migrations
cd backend
npx prisma migrate dev --name init
npx prisma generate

# Start services
cd backend && npm run start:dev
cd ../frontend && npm run dev
```

---

## API

```
POST /rates          — submit a rate request
GET  /rates/history  — session rate history
GET  /api/docs       — Swagger UI
```

---

## Tests

```bash
cd backend && npm run test
```

Integration tests use stubbed HTTP responses based on realistic UPS carrier payloads — no live API calls required for the test suite.

---

## What I'd add given more time

- FedEx and USPS carrier adapters (the architecture already supports them)
- Redis for OAuth token caching instead of PostgreSQL
- Rate result caching with TTL
- Tracking webhook events
- GitHub Actions CI/CD pipeline

---

## License

MIT © Aarogya Ojha
