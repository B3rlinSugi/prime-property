# Contributing to Prime Property

First off, thank you for considering contributing to this project!

## 🧠 Philosophy

This project strictly adheres to **Type Safety** and **Data Integrity**. All database mutations must happen via Prisma and must be properly logged in the `AuditLog` table.

## 🛠️ Development Setup

1. **Fork the repo** and clone it locally.
2. **Install dependencies:** `npm install`
3. **Set up Environment Variables:** Copy `.env.example` to `.env` and fill in your PostgreSQL URL.
4. **Database Setup:** 
   - Push the schema: `npx prisma db push`
   - Generate client: `npx prisma generate`
   - Seed data: `npx tsx prisma/seed.ts`
5. **Start server:** `npm run dev`

## 🌿 Git Workflow

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
   - `feat(...)`, `fix(...)`, `docs(...)`, `chore(...)`

## 💻 Coding Standards

*   **TypeScript:** Strict mode is enforced. Avoid `any`.
*   **Next.js:** Favor React Server Components (RSC). Only use `"use client"` for interactivity (like GSAP animations or form states).
*   **Database:** Never use raw SQL unless absolutely necessary for performance. Always use Prisma Client.

## 🔄 Pull Request Process

1. Ensure your code passes linting: `npm run lint`.
2. Ensure you have run `npx prisma format` if you modified `schema.prisma`.
3. Submit the PR against the `main` branch.
