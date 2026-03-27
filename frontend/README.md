# Cybership Frontend Dashboard

This is the user-facing dashboard for Cybership, built to demonstrate a premium integration with the backend capability engine.

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Data Fetching**: Axios

## 🏃 Getting Started

First, ensure you have set up your environment variables by copying the template:
```bash
cp .env.example .env.local
```
*(Make sure to update `BACKEND_URL` and `NEXT_PUBLIC_APP_URL` if you are running on custom ports).*

Then, run the development server:
```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or your configured port) with your browser to see the application.

## 🏗️ Architecture Highlights
The frontend is designed to be completely decoupled from the backend. 
- It speaks exclusively to the backend's normalized REST API for shipping rates.
- It natively handles the HttpOnly session validation cookies.
- It transforms the normalized backend Data Transfer Objects (DTOs) into smooth, accessible UI table components without ever knowing the difference between a UPS or FedEx payload.
