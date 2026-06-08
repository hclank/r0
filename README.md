# Secure Task Management API & Supportive UI

A scalable, production-ready full-stack application built for the Backend Developer Intern assignment. This project implements a unified Monorepo architecture featuring robust RESTful APIs with manual JWT authentication, custom Role-Based Access Control (RBAC), compile-time input validation, and an interactive supportive dashboard UI.

---

## 🛠️ Tech Stack & Rationale

- **Framework:** **Next.js 15 (App Router)** - Chosen to unify both production-grade Node.js/Express-equivalent edge API routes (`/api/v1/...`) and a responsive frontend view within a single TypeScript codebase, eliminating CORS friction and complex deployment configurations.
- **Database:** **PostgreSQL** - A reliable, relational enterprise-grade database engine to enforce clean relational integrity and transaction compliance.
- **ORM:** **Drizzle ORM** - Selected over heavier ORMs for its ultra-fast, headless, type-safe data access layer and automatic migration schema-generation capabilities.
- **Security:** **`jsonwebtoken` + `bcryptjs`** - Pure backend implementations for secure password hashing and stateless token issuance, demonstrating core security design competency without relying on abstracted third-party auth vendors.
- **Validation & Sanitization:** **Zod** - End-to-end type safety mapping client request payloads seamlessly to database inputs, preventing injection vectors and dirty data writes.

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites

Ensure you have **Node.js (v18+)** and a running **PostgreSQL** instance (e.g., via Neon.tech, Supabase, or Docker).

### 2. Clone and Install Dependencies

```bash
git clone <your-github-repo-url>
cd backend-assignment
npm install
```

3. Environment Variables
   Create a .env.local file in the root directory and configure the following variables:

```
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
JWT_SECRET="your_fallback_super_secure_cryptographic_random_string"
```

4. Database Schema Sync
   Push the Drizzle architectural model definitions straight into your remote PostgreSQL instance:

```bash
npx drizzle-kit push
```

5. Run the Local Server

```bash
npm run dev
```

📄 API Documentation
The complete, active workspace configuration is saved directly inside this repository to make evaluating request formatting effortless.

File Path: /docs/insomnia_collection.yaml (or .json)

Workspace Flow Setup:
Open Insomnia or Postman and choose Import -> File, selecting the path above.

Fire the POST /auth/register to inject an encrypted user record into the database.

Fire POST /auth/login to obtain your secure JWT stateless payload token.

Update the global environment string parameter token with this new string; all subsequent protected CRUD task endpoints are configured with reactive headers (Authorization: Bearer {{ token }}) and will unlock automatically.

🔒 Security & Scalability Note (Architectural Evolution)
To scale this foundational prototype safely to handle hundreds of thousands of concurrent requests in a live production environment, the following system design evolutions should be made:

1. Enhanced Token Management
   XSS Mitigation: Currently, for rapid client-side integration prototyping, tokens are cached in localStorage. In production, this should be transitioned to a secure HttpOnly, SameSite=Strict, Secure Cookie transaction mechanism to completely block Cross-Site Scripting extraction vectors.

Token Rotation: Transition from single long-lived access tokens to short-lived Access Tokens (e.g., 15 minutes) paired with cryptographic sliding-window Refresh Tokens tracked via a secure state table in a distributed data cache.

2. Caching Layer & Horizontal Scaling
   Redis Integration: Introduce a Redis cache layer in front of PostgreSQL. High-frequency queries (such as checking user profiles, fetching active task lists, or performing RBAC authorization assertions) can be cached in-memory with a short Time-To-Live (TTL), reducing database load by up to 80%.

Stateless Architecture: Since the Next.js API routes use stateless JWT verification, the backend servers can be scaled horizontally across multiple availability zones using an AWS Application Load Balancer (ALB) or NGINX to distribute heavy traffic incoming workloads uniformly.

3. Database Resilience & Connection Pooling
   Connection Optimization: To mitigate connection exhaust common in serverless or highly concurrent Node environments, integrate a lightweight connection pooler like PgBouncer or use a managed database proxy layer.

Read/Write Segregation: Evolve the Drizzle database client to direct write transactions (INSERT, PATCH, DELETE) to a primary PostgreSQL master instance, while distributing heavy read operations (GET tasks dashboard queries) across synchronized Read Replicas.
