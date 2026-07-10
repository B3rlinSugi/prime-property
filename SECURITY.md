# Security Policy

## Supported Versions

Currently, only the latest `main` branch is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

If you discover a vulnerability, **please do not open a public issue.**

Please email the maintainer at `berlin.sugiyanto@example.com` or reach out via direct message on GitHub.

### Security Architecture Highlights
- **Brute Force Protection:** Failed logins increment a counter in the database. Exceeding the threshold automatically locks the account via the `lockedUntil` field.
- **Password Security:** All passwords are mathematically hashed using `bcryptjs` (Cost Factor 10) prior to database insertion.
- **Stateless Sessions:** Auth.js v5 utilizes highly secure, HttpOnly, encrypted cookies for JWT storage, immune to XSS theft.
- **SQL Injection Prevention:** The Prisma ORM layer utilizes parameterized queries natively, entirely preventing SQL injection attacks.
