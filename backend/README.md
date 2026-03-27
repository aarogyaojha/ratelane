# Cybership — Carrier Integration Service

A production-grade shipping carrier integration service built with NestJS and TypeScript. This service provides a normalized interface for fetching shipping rates from multiple carriers (starting with UPS).

## 🚀 Overview

This project was built to demonstrate a modular and extensible architecture for multi-carrier shipping integrations. It includes:
- **Normalized Domain Models**: A clean abstraction that hides the complexity of carrier-specific APIs (JSON/XML).
- **Secure Authentication**: UPS OAuth 2.0 implementation with token caching, reuse, and automatic refresh.
- **Pluggable Architecture**: Easy to add new carriers or operations (FedEx, USPS, Label Generation) without modifying core logic.
- **Robust Error Handling**: Structured, domain-specific errors for common carrier failure modes (Auth, Rate Limiting, Timeouts).
- **History Tracking**: All rate requests and quotes are persisted for audit and performance analysis.

---

## 🏗️ Architecture Design

### 1. Extensibility (The "Open/Closed" Principle)
The service uses a **Provider Registration pattern**. Any carrier (e.g., UPS, FedEx, DHL) implements a common `ICarrier` interface and is registered in the `RatesModule`.
- The `RatesService` iterates over all registered carriers to aggregate quotes.
- Adding a new carrier is as simple as creating a new module and adding its adapter to the `CARRIERS` provider array in `RatesModule`.

### 2. Normalized Domain vs. Carrier Raw Models
The service strictly separates internal domain types from external carrier formats.
- **Request Building**: Carriers-specific logic is encapsulated in adapters (e.g., `UpsRatesService.buildPayload`).
- **Response Mapping**: Raw JSON responses are parsed into normalized `RateQuote` objects, ensuring the frontend never sees UPS's internal naming conventions.

### 3. Authentication Management
Auth tokens are treated as a shared resource.
- `UpsAuthService` manages the OAuth 2.0 lifecycle.
- Tokens are stored in the database with an expiration timestamp.
- The service only makes a network call to UPS for a new token if the current one is missing or expired.

### 4. Error Handling
Uses a custom `CarrierError` class that maps carrier-specific HTTP statuses (429, 401, etc.) into a consistent format. This allows the frontend to provide meaningful feedback (e.g., "Rate limit exceeded" vs "General Error").

---

## 🛠️ Tech Stack
- **Backend**: [NestJS](https://nestjs.com/) (Node.js framework)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router) + [Tailwind CSS](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/) & [class-validator](https://github.com/typestack/class-validator)
- **Testing**: [Jest](https://jestjs.io/) for unit and integration tests

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL instance running

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/aarogyaojha/cybership.git
cd cybership

# Install dependencies for both folders
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup
Copy the example environment file and fill in your values (dummy values work for testing the logic):
```bash
cp backend/.env.example backend/.env
```

### 4. Database Setup
```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Running the Application
```bash
# In the backend directory
npm run start:dev

# In a new terminal, in the frontend directory
npm run dev
```

### 6. Running Tests
The project includes integration tests with stubbed API responses to verify the request/response logic without a live UPS key.
```bash
cd backend
npm run test
```

---

## ✨ Future Improvements (Next Steps)
Given more time, I would:
1. **Implement Job Queues**: For large batches of quotes across many carriers.
2. **Webhooks Integration**: Support carrier tracking updates via incoming hooks.
3. **Advanced Caching**: Cache identical rate requests (same origin/dest/weight) for a short duration to save API costs.
4. **Performance Monitoring**: Add instrumentation to track carrier latency and error rates.
5. **Circuit Breaker**: Implement circuit breakers for carriers that are intermittently failing to prevent cascading failures.
