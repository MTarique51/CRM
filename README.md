# AcxiomCRM

A full-stack CRM starter built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB/Mongoose, HTTP-only JWT cookies, bcrypt, Recharts and Lucide icons.

## Requirements

- Node.js 20+
- MongoDB local instance or MongoDB Atlas database

## Setup

```bash
npm install
cp .env.example .env.local
```

Set `MONGODB_URI` to your MongoDB connection string and replace `JWT_SECRET` with a long random secret (32+ characters).

### Seed demo data (recommended)

```bash
npm run seed
```

Demo accounts (password for all: `Admin@123`):

| Role            | Email                 |
| --------------- | --------------------- |
| Admin           | admin@acxiomcrm.com   |
| Manager         | manager@acxiomcrm.com |
| Sales Executive | sales@acxiomcrm.com   |

The seed command clears existing CRM collections before inserting demo records. Do not run it against a production database.

### Run

```bash
npm run dev
```

Open http://localhost:3000.

## Included modules

- Authentication: register, login, logout, password hashing, HTTP-only session cookie, five-attempt lockout.
- Dashboard: role-scoped KPI counts, opportunity pipeline, lead-status chart, recent activities.
- Customers: CRUD, required/email/phone validation, unique email and phone, soft deactivation.
- Leads: CRUD, source, priority, statuses and expected value.
- Opportunities: CRUD, stages, positive amount, 0–100 probability, expected close date, weighted pipeline.
- Follow-ups: planned/completed/missed/cancelled, related records and date validation.
- Activities: calls, meetings, emails and tasks.
- Users: Admin-only user creation, roles and deactivation.
- Audit log: login and CRM create/update/delete events; append-oriented UI/API access.
- Reports: pipeline stage and lead conversion summaries.
- REST API: `/api/customers`, `/api/leads`, `/api/opportunities`, `/api/followups`, `/api/activities`, `/api/users`, `/api/audit`, `/api/reports`.

## Authorization

- Admin: full access and user/audit administration.
- Manager: CRM team-wide access and reports.
- Sales Executive: records assigned to their account.

Managers see records owned by active users in the same `team` value. Admins see all records; Sales Executives see records assigned to themselves.

## Security notes before production

- Use HTTPS and a strong unique `JWT_SECRET`.
- Restrict registration or replace public registration with Admin invitations.
- Configure rate limiting at the reverse proxy for login and other public endpoints.
- Add CSRF/origin checks to state-changing endpoints if deploying cross-site; same-site HTTP-only cookies are used by default.
- Configure MongoDB backups, indexes and least-privilege database credentials.
- Review retention and access policies for audit records.

## Project structure

```text
app/
  (auth)/login, register
  dashboard/                 Protected CRM workspace
  api/                       REST route handlers
components/                  Navigation and shared UI
lib/                         Database, auth and validation helpers
models/                       Mongoose models
scripts/seed.ts               Demo data seeder
```
