# Contributing to Cybership

First off, thank you for considering contributing to Cybership! It's people like you that make Cybership such a great platform.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) tab first to see if someone else has already created it. If not, go ahead and [make one](../../issues/new).

## 2. Setting up your environment

This project is a monorepo consisting of:
- A `frontend` directory using Next.js
- A `backend` directory using NestJS

### Prerequisites
- Node.js 18+
- PostgreSQL
- Npm or Yarn

### Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/aarogyaojha/cybership.git
   cd cybership
   ```
2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Make sure your Postgres instance is running and update DATABASE_URL in .env
   npx prisma migrate dev
   npm run start:dev
   ```
3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## 3. Making Changes

- Create a new branch for your feature or bug fix: `git checkout -b feature/my-new-feature`
- Write tests for your changes, especially if it touches core integration logic in `backend/src/carriers`.
- Ensure all tests pass by running `npm run test` and `npm run test:e2e` in the backend directory.
- Commit your changes with clear, descriptive commit messages.

## 4. Submitting a Pull Request

- Push your branch to GitHub.
- Open a Pull Request against the `main` branch.
- Describe your changes in the PR body. Include the issue number if applicable.
- Wait for reviews and be prepared to make changes based on feedback.

Thank you for contributing!
