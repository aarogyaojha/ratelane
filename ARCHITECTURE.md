# Cybership Architecture Overview

Our platform is designed to seamlessly integrate with multiple shipping carriers (UPS, FedEx, DHL, etc.) to provide our customers with real-time rates, label generation, and package tracking.

This document serves as a high-level overview of the system architecture for new engineers joining the team.

## System Components

The project is structured as a modern full-stack JavaScript monorepo:

### 1. Frontend (Next.js Application)
Located in the `frontend/` directory, this layer acts as the primary user interface.
- **Framework:** Next.js 14 utilizing the App Router.
- **Styling:** Tailwind CSS combined with heavily customized Radix UI components (shadcn/ui layout).
- **Communication:** Speaks directly to the Backend API via REST.

### 2. Backend API (NestJS Application)
Located in the `backend/` directory, this is the core engine of Cybership.
- **Framework:** NestJS, chosen for its strong dependency injection constraints and modular architecture.
- **Database:** PostgreSQL accessed via Prisma ORM for type-safe database queries.
- **Extensibility:** Implements an Open/Closed capability-driven extension system for carriers.

---

## Backend Subsystems in Detail

### The Carrier Integration Layer (`src/carriers/`)
To preserve sanity when dealing with 15+ different shipping carriers, our system relies heavily on the **Adapter Pattern**. 

#### Interface Contracts
We abstract features through capability interfaces (`IRateProvider`, `ITrackingProvider`, etc.) inside `carrier.interface.ts`.

#### Individual Implementations (e.g., `src/carriers/ups/`)
A carrier module is responsible natively for its own domain:
1. **Auth Service (`ups-auth.service.ts`):** Manages the entire OAuth handshake, caching, and background token refresh logic without polluting the rest of the application.
2. **Rates Service (`ups-rates.service.ts`):** Handles raw JSON/XML transformation. It maps our clean internal domain models into whatever nightmare XML/JSON payload the specific carrier expects, makes the HTTP call, and normalizes the response back.
3. **Adapter (`ups.adapter.ts`):** Exposes only the implemented capabilities (e.g. `capabilities.rates`) to the global system. This makes it impossible for the system to accidentally request tracking information from a carrier module that only supports quoting.

### The Aggregation Layer (`src/rates/`)
The `RatesService` handles the fan-out logic. When the frontend requests a shipping quote:
1. A single `RateRequest` record is safely persisted into PostgreSQL.
2. The service iterates through all registered adapters in the DI container.
3. If an adapter flags that it implements the `rates` capability, the request is shipped off to that carrier module.
4. Results are gathered, filtered locally if a specific service tier was requested, saved to the database as `RateQuote` records, and served to the client.

### Error Handling & Reliability
We use a unified `CarrierError` class to prevent exposing HTTP 500 stack traces directly to the client. The carrier integration modules swallow raw network/HTTP errors and translate them into domain events (e.g., mapping a 429 into a `CarrierError` of type `RATE_LIMITED`).

### Persistence (Prisma ORM)
Database interactions are isolated within standard NestJS services interacting with `PrismaService`. We track:
- **RateRequest**: The parameters the customer punched into the UI.
- **RateQuote**: The specific prices quoted by each carrier.
- **AuthToken**: OAuth credential persistence. 

---

## Adding a New Carrier

By design, adding a new carrier (e.g., FedEx) requires exactly zero modifications to existing carrier code or request pipelines. 
1. Build `fedex-auth.service.ts` and `fedex-rates.service.ts`.
2. Map your internal services to the `ICarrier` interface in `fedex.adapter.ts`.
3. Provide the FedEx adapter into the core `CARRIERS` token inside `rates.module.ts`.

The Aggregation Layer will automatically pick it up on the next server reboot!
