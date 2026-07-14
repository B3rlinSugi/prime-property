<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=250&section=header&text=Prime%20Property&fontSize=70&fontAlignY=35&desc=Enterprise%20Real%20Estate%20Management%20Platform&descAlignY=55&descAlign=50" />
</div>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-DB-336791?logo=postgresql" alt="PostgreSQL" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Auth.js-v5-purple?logo=next.js" alt="Auth.js" /></a>
</p>

## 🎯 About This Project

### Why This Project Exists
In the competitive real estate market, agencies often struggle with fragmented property management, poor data history, and a lack of accountability when team members manipulate listings. **Prime Property** solves these operational bottlenecks by providing a centralized, highly secure platform that combines a luxurious public-facing catalog with a rigid, audit-trailed internal management dashboard.

### The Problem Being Solved
Standard real estate websites lack proper data governance. This system introduces **Enterprise Resource Planning (ERP)** concepts into real estate: Soft Deletions (never truly destroying data), strict Role-Based Access Control (Admin vs. Superadmin), and Immutable Audit Logging for every single property mutation.

### Business Value
- **Maximized Accountability**: Every CRUD operation is logged via `AuditLog`, providing absolute transparency on who edited which property and when.
- **Data Preservation**: Accidental deletions are a thing of the past. The Soft Delete architecture ensures data is only hidden (`deletedAt`), preserving historical foreign key relationships.
- **Premium Client Experience**: Advanced motion design (GSAP + Lenis) creates a premium brand feel that increases customer retention and perceived property value.

---

## ✨ Key Features

### Security & Authentication
- **Next-Auth v5 (Auth.js)**: Stateless, edge-compatible JWT session management.
- **Brute-Force Mitigation**: Integrated `failedLogin` tracking and `lockedUntil` database fields to automatically lock out attackers.
- **Role-Based Access Control (RBAC)**: Distinct `ADMIN` (View only) and `SUPERADMIN` (Full CRUD + User Management) roles enforced at the middleware layer.

### Core Data Operations
- **Property Lifecycle Management**: Full CRUD handling for complex property specifications (dimensions, facing direction, status).
- **Automated Audit Trails**: A dedicated logging schema tracking the exact `action`, `entity`, and JSON `changes` of every mutation.
- **Soft Deletion Architecture**: Implementation of logical deletions rather than physical SQL `DELETE` commands.

### Enterprise UX & Tooling
- **Dynamic PDF Brochure Engine**: Client-side generation of high-quality property brochures using `jspdf` and `html2canvas`.
- **Immersive Motion Design**: Hardware-accelerated smooth scrolling (`Lenis`) orchestrated with complex layout animations (`Framer Motion` & `GSAP`).

---

## 🏗 Software Architecture

This project employs a **Serverless Monolithic** pattern using the Next.js App Router, heavily utilizing **React Server Components (RSC)** and **Server Actions**.

```mermaid
flowchart TD
    Browser[Web Browser]
    
    Browser -->|Middleware Auth Check| RSC[React Server Components]
    Browser -->|Form Submits| SA[Server Actions]
    
    RSC -->|Read Data| Prisma[Prisma ORM]
    SA -->|Write Data & Audit| Prisma
    
    subgraph Data Access Layer
        Prisma
        Prisma -->|SQL Commands| DB[(PostgreSQL DB)]
    end
```

### Why this architecture?
1. **Type Safety from DB to UI**: Prisma generates fully typed models. Passing these directly to Server Components eliminates the need for intermediate API typing (like Swagger/OpenAPI) and prevents runtime data structure errors.
2. **No Client-Side API Keys**: Server Actions execute on the server. Database credentials and Auth secrets are completely isolated from the browser.

---

## 🗄 Database Design

The schema is built on **PostgreSQL**, utilizing **Prisma** for schema definitions, migrations, and relationship enforcement.

```mermaid
erDiagram
    User ||--o{ Property : "creates"
    User ||--o{ AuditLog : "triggers"
    
    User {
        String id PK
        String email UK
        String password
        String role "ADMIN | SUPERADMIN"
        Int failedLogin
        DateTime lockedUntil
    }
    
    Property {
        String id PK
        String namaProperty
        BigInt price
        String status "IN_STOCK | SOLD_OUT"
        DateTime deletedAt "Soft Delete Flag"
        String createdById FK
    }
    
    AuditLog {
        String id PK
        String action "CREATE | UPDATE | DELETE"
        String entity "Property | User"
        String entityId
        String changes "JSON Snapshot"
        String userId FK
    }
    
    ContactMessage {
        String id PK
        String nama
        String email
        String pesan
        String ip
    }
```

### Normalization & Business Logic
- **BigInt for Currency**: The `price` field utilizes PostgreSQL `BigInt` to safely handle massive Indonesian Rupiah (IDR) property values without JavaScript floating-point precision loss.
- **Foreign Key Constraints**: Prisma enforces strict referential integrity between Users, Properties, and Audit Logs.

---

## 💻 Tech Stack

### Frontend Application
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **UI Library**: [React 19](https://react.dev/) (Concurrent Features)
- **Styling**: Vanilla CSS Modules (Strict Scope Isolation)
- **Animations**: GSAP, Framer Motion, and Lenis Scroll.
- **PDF Generation**: `jspdf` & `html2canvas`

### Backend & Database
- **Architecture**: Database-Centric Serverless Architecture.
- **ORM**: [Prisma v5](https://www.prisma.io/) (Type-Safe Database Client)
- **Database Engine**: PostgreSQL (Relational Integrity)
- **Authentication**: Auth.js (Next-Auth Beta) with `bcryptjs` hashing.
- **Language**: TypeScript (Strict Mode)

### DevOps & Tooling
- **Package Manager**: npm
- **Code Quality**: ESLint
- **Runtime Utilities**: `tsx` for seeding scripts.

---

## 🚀 Getting Started

*(Run these commands to start the project locally)*

```bash
# 1. Clone the repository
git clone https://github.com/B3rlinSugi/prime-property.git

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# (Fill in your DATABASE_URL and AUTH_SECRET)

# 4. Run database migrations
npx prisma db push

# 5. Start the development server
npm run dev
```
