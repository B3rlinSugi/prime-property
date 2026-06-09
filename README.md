<div align="center">
  <br />
  <h1>🏢 Prime Property</h1>
  <p>
    <strong>A Premium Full-Stack Real Estate Management Platform</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </p>
  <p>
    <a href="https://prime-property-sigma.vercel.app/" target="_blank">View Live Demo</a>
  </p>
</div>

---

## 📌 Overview

**Prime Property** is a production-ready, full-stack real estate listing and management system built with the latest React and Next.js ecosystems. Designed to provide a seamless property search experience, the platform features a highly interactive UI with advanced filtering, secure admin dashboards, and automated PDF brochure generation.

The backend architecture focuses on strict data integrity using **Prisma ORM** mapped to **PostgreSQL**, reinforced by **Next-Auth (v5)** for secure, session-based authentication with Role-Based Access Control (RBAC).

## ✨ Key Features

- **Advanced Property Management**: Full CRUD capabilities for real estate listings, including detailed specifications (dimensions, facing direction, carports, unit types).
- **Secure Authentication (Next-Auth v5)**: Encrypted password storage using `bcryptjs`, complete with brute-force protection (failed login lockouts).
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN` and `SUPERADMIN` roles.
- **Audit Logging**: Comprehensive system tracking (`AuditLog`) that monitors every data mutation (create, update, delete) for accountability.
- **Soft Deletion Mechanism**: Properties are never permanently deleted from the database (`deletedAt`), preserving historical data relationships.
- **Premium UI / UX**: Smooth scroll animations powered by **Lenis**, **GSAP**, and **Framer Motion**.
- **PDF Generation Engine**: Automated generation of property brochures using `jspdf` and `html2canvas`.

---

## 🛠️ Tech Stack Architecture

### Frontend Layer
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS
- **Animations**: GSAP, Framer Motion, Lenis (Smooth Scrolling)

### Backend & Database Layer
- **Authentication**: Auth.js (Next-Auth v5 Beta)
- **Security**: bcryptjs (Password Hashing)
- **ORM**: Prisma Client v5
- **Database**: PostgreSQL
- **Language**: TypeScript (Strict Mode)

---

## 🗄️ Database Schema Highlight

The system utilizes a highly relational PostgreSQL schema. Here is a brief look at the core entities:

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
- **PostgreSQL** Database

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

4. **Initialize Database:**
   Push the Prisma schema to your database and generate the Prisma Client:
   ```bash
   npx prisma db push
   npx prisma generate
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
  <i>"Clean architecture and strict data integrity are the foundations of scalable applications."</i>
</div>
