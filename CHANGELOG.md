# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- AWS S3 Integration for image uploads.
- PostGIS integration for geospatial radius searching.

## [0.1.0] - 2026-07-10

### Added
- **Core:** Next.js 16 App Router implementation.
- **Database:** Prisma ORM setup with PostgreSQL.
- **Auth:** Next-Auth v5 integrated with custom Credentials provider and bcrypt hashing.
- **Security:** Brute force protection (`failedLogin` lockout logic).
- **Features:** Property CRUD, Soft Deletes (`deletedAt`), Audit Logging.
- **UI:** Premium interface with GSAP, Lenis Smooth Scroll, and Framer Motion.
- **Tools:** Automated PDF brochure generation using `jspdf` and `html2canvas`.
