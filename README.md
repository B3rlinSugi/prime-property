<div align="center">
  <br />
  <h1>🏢 Prime Property</h1>
  <p>
    <strong>Enterprise-Grade Real Estate Management Platform</strong>
  </p>
  <p>
    A high-performance, full-stack real estate listing and internal management system engineered with strict data integrity, role-based access control, and dynamic PDF brochure generation capabilities.<br><br>
    <strong>🚀 Tech Stack:</strong> TypeScript, Next.js 16, React 19, Prisma ORM, Auth.js, PostgreSQL
  </p>

  <p>
    <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Framework-Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/UI-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active_Development-success?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/Version-v0.1.0-blue?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/github/last-commit/B3rlinSugi/prime-property?style=flat-square" alt="Last Updated" />
    <img src="https://img.shields.io/github/stars/B3rlinSugi/prime-property?style=flat-square" alt="Stars" />
    <img src="https://img.shields.io/github/issues/B3rlinSugi/prime-property?style=flat-square" alt="Issues" />
    <img src="https://img.shields.io/github/license/B3rlinSugi/prime-property?style=flat-square" alt="License" />
  </p>
</div>

---

## 📑 Table of Contents

- [About This Project](#-about-this-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Software Architecture](#-software-architecture)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Authentication & Authorization](#-authentication--authorization)
- [Security](#-security)
- [Validation & Error Handling](#-validation--error-handling)
- [Performance Optimization & Scalability](#-performance-optimization--scalability)
- [Development Workflow & Deployment](#-development-workflow--deployment)
- [Roadmap & Known Limitations](#-roadmap--known-limitations)
- [Lessons Learned](#-lessons-learned)
- [Contributing](#-contributing)
- [Why This Project Demonstrates Software Engineering Skills](#-why-this-project-demonstrates-software-engineering-skills)

---

## 🎯 About This Project

### Why This Project Exists
In the competitive real estate market, agencies often struggle with fragmented property management, poor data history, and a lack of accountability when team members manipulate listings. **Prime Property** solves these operational bottlenecks by providing a centralized, highly secure platform that combines a luxurious public-facing catalog with a rigid, audit-trailed internal management dashboard.

### The Problem Being Solved
Standard real estate websites lack proper data governance. This system introduces **Enterprise Resource Planning (ERP)** concepts into real estate: Soft Deletions (never truly destroying data), strict Role-Based Access Control (Admin vs. Superadmin), and Immutable Audit Logging for every single property mutation.

### Business Value
- **Maximized Accountability:** Every CRUD operation is logged via `AuditLog`, providing absolute transparency on who edited which property and when.
- **Data Preservation:** Accidental deletions are a thing of the past. The Soft Delete architecture ensures data is only hidden (`deletedAt`), preserving historical foreign key relationships.
- **Premium Client Experience:** Advanced motion design (GSAP + Lenis) creates a premium brand feel that increases customer retention and perceived property value.

---

## ✨ Key Features

### Security & Authentication
*   **Next-Auth v5 (Auth.js):** Stateless, edge-compatible JWT session management.
*   **Brute-Force Mitigation:** Integrated `failedLogin` tracking and `lockedUntil` database fields to automatically lock out attackers.
*   **Role-Based Access Control (RBAC):** Distinct `ADMIN` (View only) and `SUPERADMIN` (Full CRUD + User Management) roles enforced at the middleware layer.

### Core Data Operations
*   **Property Lifecycle Management:** Full CRUD handling for complex property specifications (dimensions, facing direction, status).
*   **Automated Audit Trails:** A dedicated logging schema tracking the exact `action`, `entity`, and JSON `changes` of every mutation.
*   **Soft Deletion Architecture:** Implementation of logical deletions rather than physical SQL `DELETE` commands.

### Enterprise UX & Tooling
*   **Dynamic PDF Brochure Engine:** Client-side generation of high-quality property brochures using `jspdf` and `html2canvas`.
*   **Immersive Motion Design:** Hardware-accelerated smooth scrolling (`Lenis`) orchestrated with complex layout animations (`Framer Motion` & `GSAP`).

---

## 💻 Tech Stack

### Frontend Application
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
*   **UI Library:** [React 19](https://react.dev/) (Concurrent Features)
*   **Styling:** Vanilla CSS Modules (Strict Scope Isolation)
*   **Animations:** [GSAP](https://gsap.com/), [Framer Motion](https://www.framer.com/motion/), and [Lenis](https://lenis.studiofreight.com/) Scroll.
*   **PDF Generation:** `jspdf` & `html2canvas`

### Backend & Database
*   **Architecture:** Database-Centric Serverless Architecture.
*   **ORM:** [Prisma v5](https://www.prisma.io/) (Type-Safe Database Client)
*   **Database Engine:** PostgreSQL (Relational Integrity)
*   **Authentication:** Auth.js (Next-Auth Beta) with `bcryptjs` hashing.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)

### DevOps & Tooling
*   **Package Manager:** npm
*   **Code Quality:** ESLint
*   **Runtime Utilities:** `tsx` for seeding scripts.

---

## 🏗️ Software Architecture

This project employs a **Serverless Monolithic** pattern using the Next.js App Router, heavily utilizing **React Server Components (RSC)** and **Server Actions**.

```mermaid
flowchart TD
    Client[Web Browser] -->|Middleware Auth Check| RSC[React Server Components]
    Client -->|Form Submits| Actions[Server Actions]
    
    RSC -->|Read Data| Prisma[Prisma ORM]
    Actions -->|Write Data & Audit| Prisma
    
    subgraph Data Access Layer
        Prisma -->|SQL Commands| Postgres[(PostgreSQL DB)]
    end
```

### Why this architecture?
1.  **Type Safety from DB to UI:** Prisma generates fully typed models. Passing these directly to Server Components eliminates the need for intermediate API typing (like Swagger/OpenAPI) and prevents runtime data structure errors.
2.  **No Client-Side API Keys:** Server Actions execute on the server. Database credentials and Auth secrets are completely isolated from the browser.

---

## 🗄️ Database Design

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
*   **BigInt for Currency:** The `price` field utilizes PostgreSQL `BigInt` to safely handle massive Indonesian Rupiah (IDR) property values without JavaScript floating-point precision loss.
*   **Foreign Key Constraints:** Prisma enforces strict referential integrity between Users, Properties, and Audit Logs.

---

## 📁 Project Structure

```text
├── .github/                 # CI workflows and PR/Issue templates
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   ├── seed.ts              # Database seeding script (Superadmin init)
│   └── dev.db               # Local SQLite fallback (if not using Postgres)
├── public/                  # Static assets (fonts, images)
├── src/
│   ├── app/                 # Next.js 16 App Router (RSC & Pages)
│   ├── components/          # Reusable React UI Components
│   ├── lib/                 # Core utilities (Prisma Client, Auth.js config)
│   ├── types/               # TypeScript type definitions
│   └── middleware.ts        # Next.js Edge Middleware for RBAC & Routing
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 🚀 Installation Guide

### 1. Requirements
*   Node.js 18+
*   PostgreSQL Database (Local or Cloud, e.g., Supabase/Neon)

### 2. Clone & Install
```bash
git clone https://github.com/B3rlinSugi/prime-property.git
cd prime-property
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/prime_property"

# Auth.js Secret (Run `npx auth secret` to generate)
AUTH_SECRET="your-secure-random-string"
```

### 4. Database Setup & Seeding
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial Superadmin and demo properties
npm run postinstall 
# (Or run `npx tsx prisma/seed.ts` directly)
```

### 5. Run Development Server
```bash
npm run dev
```

---

## 🔐 Authentication & Authorization

### The Auth Flow
1.  **Credentials Provider:** Custom Auth.js implementation validating email and bcrypt-hashed passwords.
2.  **Stateless JWT:** Upon success, a JWT containing the user's ID and `role` is minted.
3.  **Edge Middleware:** `src/middleware.ts` intercepts requests. If an unauthenticated user attempts to access `/dashboard/*`, they are instantly redirected before the server even renders the page.

### Authorization (RBAC)
*   **`ADMIN`:** Can view dashboards, filter properties, and generate PDFs.
*   **`SUPERADMIN`:** Has full CRUD authority over properties and can manage other user accounts. The middleware explicitly checks the JWT `role` claim to grant access to restricted routes.

---

## 🚨 Validation & Security

### Security Hardening
*   **Password Hashing:** `bcryptjs` with Cost Factor 10 ensures passwords are computationally expensive to crack.
*   **Brute-Force Lockout:** The `User` schema tracks `failedLogin`. After a threshold, `lockedUntil` is populated, temporarily banning the account.
*   **SQL Injection:** Impossible by design; Prisma uses parameterized queries for all database interactions.
*   **Cross-Site Scripting (XSS):** React 19 inherently escapes all string variables in JSX.

### Validation Strategy
All form submissions routed through Next.js Server Actions undergo strict type-checking and sanitation before interacting with the Prisma Client.

---

## ⚡ Performance Optimization & Scalability

### Optimizations Implemented
*   **React Server Components (RSC):** The majority of the application renders on the server. The client only downloads JavaScript for highly interactive components (like GSAP animations).
*   **CSS Modules:** Zero runtime CSS-in-JS overhead. Styles are compiled into highly optimized, chunked CSS files.
*   **Prisma Connection Pooling:** Prepared for serverless environments where database connections must be managed efficiently.

### Scalability Readiness
The system is entirely stateless. Sessions are managed via JWT, meaning the Node.js application can be horizontally scaled infinitely across Kubernetes pods or Vercel Edge functions without sticky sessions.

---

## 🔄 Development Workflow & Deployment

### Git Workflow
We enforce a standard Feature Branch workflow:
1.  Create a feature branch: `git checkout -b feat/your-feature`.
2.  Commit using Conventional Commits.
3.  Open a PR using the provided `.github/PULL_REQUEST_TEMPLATE.md`.
4.  Code Review and Merge.

### CI/CD Pipeline
Deployment is intended for Vercel or any Dockerized environment.
1.  GitHub Actions automatically runs `npm run lint` and `npx prisma generate` on every PR.
2.  Upon merging to `main`, the build compiles statically where possible and deploys seamlessly.

---

## 🗺️ Roadmap & Known Limitations

### Current Limitations
- **Image Hosting:** Currently relies on external URL links or local storage. A robust S3/Cloudinary integration is needed for scalable image uploads.

### Future Roadmap
- [ ] Implement AWS S3 or Cloudinary for property image gallery management.
- [ ] Add geospatial querying (PostGIS) to search properties by radius.
- [ ] Implement Redis for caching high-traffic public listing queries.

---

## 🧠 Lessons Learned

*   **Prisma is a Game Changer:** The developer experience and type safety provided by Prisma significantly reduced debugging time for complex relational queries compared to raw SQL or older ORMs.
*   **Next-Auth v5 Complexity:** Upgrading to Auth.js v5 (Beta) required deep understanding of Edge compatibility and JWT manipulation, but resulted in a vastly more secure middleware implementation.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on setting up Prisma, our coding standards, and how to submit a Pull Request.

Please also review our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Berlin Sugiyanto**
*   Backend Developer | System Architect
*   [LinkedIn](https://linkedin.com/in/berlinsugi)

---

<br>

# 👔 Why This Project Demonstrates Software Engineering Skills

*A note for Technical Recruiters, Engineering Managers, and Tech Leads reviewing this repository.*

This project goes far beyond a typical "CRUD tutorial app." It demonstrates senior-level engineering competencies:

1.  **Enterprise Architectural Patterns:** Implementing **Soft Deletions** and **Audit Logging** proves an understanding of enterprise data governance, where data is a financial asset that must never be irretrievably destroyed.
2.  **Advanced ORM & Relational DBs:** Expert utilization of Prisma and PostgreSQL, including handling complex types like `BigInt` for financial accuracy and enforcing strict referential integrity.
3.  **Proactive Security Mindset:** Building custom brute-force lockout logic (`failedLogin` / `lockedUntil`) on top of Next-Auth demonstrates a defense-in-depth approach to security, not just relying on library defaults.
4.  **Modern Full-Stack Proficiency:** Mastering Next.js 16 Server Components and Server Actions to build a secure, highly performant, stateless monolithic architecture.
5.  **Attention to UI/UX Detail:** Integrating GSAP, Lenis, and client-side PDF generation shows the ability to deliver not just backend stability, but premium frontend user experiences.
