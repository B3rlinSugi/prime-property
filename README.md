<div align="center">
  <br />
  <h1>🏢 Prime Property</h1>
  <p>
    <strong>A Premium Full-Stack Real Estate Management Platform</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </p>
</div>

---

## 📌 Overview

**Prime Property** is a production-ready, enterprise-grade real estate listing and internal management system built with the latest React and Next.js ecosystems. Designed to provide a seamless property search experience, the platform features a highly interactive UI with advanced filtering, secure admin dashboards, and automated PDF brochure generation.

The backend architecture focuses on strict data integrity using **Prisma ORM** mapped to **PostgreSQL**, reinforced by **Next-Auth (v5)** for secure, session-based authentication with advanced Role-Based Access Control (RBAC). The project strictly adheres to robust security practices, including IP rate limiting and comprehensive audit logging.

## ✨ Key Features & Business Value

- **Advanced Property Management**: Full CRUD capabilities for real estate listings, including detailed specifications (dimensions, facing direction, carports, unit types).
- **Enterprise-Grade Security (Next-Auth v5)**: Encrypted password storage using `bcryptjs` (Cost Factor 10), complete with brute-force protection (failed login lockouts) and API-level authorization blocks (`403 Forbidden`).
- **Role-Based Access Control (RBAC)**: Distinct permissions separating `ADMIN` (Read-only & Filtering) and `SUPERADMIN` (Full CRUD & User Management) roles.
- **Comprehensive Audit Logging**: System tracking (`AuditLog`) that monitors every data mutation (create, update, delete) for maximum accountability and transparency.
- **Soft Deletion & Recovery**: Properties are never permanently deleted from the database (`deletedAt`), preserving historical data relationships and allowing for easy data recovery via the Archives menu.
- **Premium UI / UX Design**: An immersive, luxury-branded interface utilizing Vanilla CSS Modules (preventing CSS scope clashes) alongside smooth scroll animations powered by **Lenis**, **GSAP**, and **Framer Motion**.
- **Automated PDF Engine**: Built-in functionality to dynamically generate downloadable property brochures using `jspdf` and `html2canvas`.

---

## 🛠️ Detailed Tech Stack Architecture

Our technology stack was carefully selected to ensure maximum performance, clean architecture, and long-term scalability.

### Frontend Layer
- **Core Framework**: **Next.js 16 (App Router)** - Leveraging React Server Components (RSC) for lightning-fast initial page loads, optimal SEO, and Server Actions for secure, seamless form mutations without traditional API endpoints.
- **UI Library**: **React 19** - The latest React ecosystem, utilizing optimized compilers and advanced concurrent rendering features.
- **Styling Methodology**: **Vanilla CSS Modules** - Ensures strictly scoped styling, preventing global CSS collisions while allowing for highly customized, luxury-branded designs that utility-first frameworks often struggle to achieve cleanly.
- **Animation Orchestration**: 
  - **GSAP (v3.15.0)** & **Framer Motion**: Delivering complex, buttery-smooth micro-interactions and scroll-triggered animations.
  - **Lenis**: Providing hardware-accelerated smooth scrolling at the browser level.
- **Document Generation**: **JSPDF & HTML2Canvas** for client-side PDF rendering.

### Backend & Database Layer
- **Authentication**: **Auth.js (Next-Auth v5 Beta)** - Implementing stateless session management via JSON Web Tokens (JWT) using a custom Credentials Provider.
- **Cryptography**: **bcryptjs** - Hashing passwords securely before database persistence.
- **ORM**: **Prisma Client (v5.22.0)** - A next-generation Node.js and TypeScript ORM bridging the application with the database seamlessly, offering unparalleled type safety and auto-completion.
- **Database Engine**: **PostgreSQL** - Chosen for its ACID compliance, robust relational integrity, and scalability (Can be easily swapped with Supabase/Neon).
- **Language**: **TypeScript (Strict Mode)** - Enforcing end-to-end type safety, minimizing runtime errors, and providing an exceptional developer experience.

---

## 🗄️ Database Schema Highlight

The system utilizes a highly relational PostgreSQL schema designed for integrity and accountability. Here is a brief look at the core entities:

```prisma
model User {
  id          String     @id @default(cuid())
  email       String     @unique
  role        String     @default("ADMIN") // ADMIN or SUPERADMIN
  failedLogin Int        @default(0) // Brute-force protection
  lockedUntil DateTime?
  // ...relations to Properties and AuditLogs
}

model Property {
  id           String    @id @default(cuid())
  namaProperty String
  price        BigInt    // Handles large currency values safely
  status       String    @default("IN_STOCK") // IN_STOCK or SOLD_OUT
  deletedAt    DateTime? // Soft-delete capability
  // ...property details (dimensions, type, maps link, etc.)
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String   // CREATE, UPDATE, DELETE
  entity    String   // Target table
  changes   String?  // JSON snapshot of the mutation
  // ...relations to User
}
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** Database (or SQLite for quick local testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/B3rlinSugi/prime-property.git
   cd prime-property
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and configure your database and Auth.js secret:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/prime_property?schema=public"
   AUTH_SECRET="generate-a-secure-random-string-here"
   ```

4. **Initialize Database & Seed Data:**
   Push the Prisma schema to your database and execute the seed script to populate demo users and properties:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be available at [http://localhost:3000](http://localhost:3000).*

---

## 👨‍💻 Author

**Berlin Sugiyanto**  
Backend Developer & System Architect  
- Portfolio: [berlinsugi.vercel.app](https://berlinsugi.vercel.app/)
- LinkedIn: [linkedin.com/in/berlinsugi](https://linkedin.com/in/berlinsugi)

---

<div align="center">
  <i>"Clean architecture, uncompromising security, and strict data integrity are the true foundations of premium, scalable applications."</i>
</div>
