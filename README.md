# ⚡ Spark-Hire — Automated Recruitment Orchestration Engine (AROE)

A backend-heavy Next.js application that automates candidate screening and ranking via two sequential evaluation services, a weighted scoring algorithm, and a protected recruiter dashboard.

---

## Architecture Overview

```
Candidate applies → PDF stored on disk → DB record created (APPLIED)
  → Queue Pipeline starts (fire-and-forget)
    → Service 1: Questionnaire score (PENDING_Q1 → score saved)
    → Service 2: Automated Call score (PENDING_Q2 → score saved)
    → Scoring Engine: Total = (Q1 × 0.4) + (Q2 × 0.6)
    → Score ≥ 75 → PRIORITY_QUEUE  |  Score < 75 → REJECTED
  → Recruiter reviews Priority Queue → HUMAN_REVIEWED
```

### Scoring Formula

$$Score_{total} = (Score_{Q1} \times 0.4) + (Score_{Q2} \times 0.6)$$

Candidates with $Score_{total} \ge 75$ are surfaced in the **Priority Queue**.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via **Prisma 7** + `@prisma/adapter-better-sqlite3` |
| Auth | **NextAuth v5** — credentials (email + password) |
| Validation | **Zod** |
| Logging | **Pino** (structured, pretty-printed in dev) |
| API Docs | **Swagger UI** (`swagger-ui-react`) |
| Styling | Tailwind CSS v4 |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set an **absolute** path for the database:

```bash
cp .env.example .env
```

```env
# .env
DATABASE_URL="file:/absolute/path/to/spark-hire/dev.db"
AUTH_SECRET="your-secret-min-32-chars"

# Mock service scores (0–100). Leave blank for random.
MOCK_Q1_SCORE=80
MOCK_Q2_SCORE=85

# Set to "true" to simulate Service 1 being down (tests retry logic)
MOCK_Q1_FAIL=false
```

### 3. Run database migration

```bash
npm run db:migrate
```

### 4. Seed the recruiter account

```bash
npm run db:seed
```

Default credentials: `recruiter@sparkhire.com` / `recruiter123`

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — links to all sections |
| `/apply` | Candidate application form (name, email, PDF resume) |
| `/login` | Recruiter login |
| `/recruiter` | **Priority Queue** — candidates with score ≥ 75, sorted by score desc |
| `/recruiter/all` | All candidates with status and scores |
| `/api-docs` | Swagger UI — interactive API documentation |

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/candidates` | — | Submit application (multipart/form-data) |
| `GET` | `/api/candidates` | — | List all candidates (debug) |
| `GET` | `/api/recruiter/queue` | ✅ | Priority queue (score ≥ 75) |
| `PATCH` | `/api/recruiter/review/:id` | ✅ | Record HIRE / REJECT decision |
| `GET` | `/api/swagger` | — | OpenAPI 3.0 JSON spec |

---

## Candidate Status Flow

```
APPLIED → PENDING_Q1 → PENDING_Q2 → PRIORITY_QUEUE → HUMAN_REVIEWED
                                  ↘ REJECTED (score < 75 or service failure)
```

---

## Resilience

- Each external service call is retried up to **3 times** with exponential back-off.
- If Service 1 fails all retries, the candidate is marked `REJECTED` and the pipeline exits gracefully.
- Set `MOCK_Q1_FAIL=true` in `.env` to test this path.

---

## NPM Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed default recruiter user
npm run db:generate  # Regenerate Prisma client after schema changes
```
