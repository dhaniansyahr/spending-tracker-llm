# Spending Tracker LLM

A personal spending tracker where you can log expenses by typing naturally or uploading a receipt — the LLM extracts the details for you, and an AI verdict summarizes your spending patterns over any date range.

## Stack

- **Backend** — Hono + Bun + PostgreSQL + Prisma, OpenRouter for LLM inference
- **Frontend** — React + TanStack Router/Query + Tailwind CSS v4

## Before you run

**1. PostgreSQL**

You need a running PostgreSQL instance. Locally, the quickest way:

```bash
# with Docker
docker run --name spending-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=spending -p 5432:5432 -d postgres
```

Then set `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spending"
```

**2. OpenRouter API key**

Sign up at [openrouter.ai](https://openrouter.ai) and grab an API key. Set it in `backend/.env`:

```
OPENROUTER_API_KEY="sk-or-..."
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

**3. Model** *(optional)*

The app defaults to `minimax/minimax-m3` if `OPENROUTER_MODEL` is not set. To use a different model, add it explicitly:

```
OPENROUTER_MODEL="minimax/minimax-m3"   # default — omit to use this
```

Any model available on OpenRouter works; the prompts expect JSON output so pick one that follows instructions reliably.

## Running locally

```bash
# Backend
cd backend
cp .example.env .env   # fill in the values above
bun install
bun run db:migrate
bun run dev            # :3001

# Frontend (new terminal)
cd frontend
cp .example.env .env
bun install
bun run dev            # :3000
```

---

## Who it's for

Anyone who already knows they overspend but doesn't want to open a spreadsheet every time they buy coffee. The one job: make logging a purchase take less than 10 seconds, and make the end-of-month picture readable at a glance.

## Why this problem

Manual expense apps have too much friction — you forget to log, or you log wrong. Receipt-scanning apps exist but lock data behind a subscription. The LLM removes the "fill in every field" chore while keeping you in control of the record.

## What's already out there

Mint, YNAB, Money Manager, and receipt-scanning apps (Expensify, Veryfi). They all require structured input or a mobile camera flow. None let you just type "grabbed lunch and a ride home, about 80k" and get a clean record with a category guess. That's the gap.

## Scope

**In:** log by typing, log by receipt URL, manual form fallback, filterable table, AI spending verdict for any date range.

**Out:** budgets, alerts, recurring entries, multi-currency, mobile app, shared household accounts. None of these were cut because they're bad ideas — they were cut because the core logging flow needed to work first.

## Assumptions

- Users have a desktop browser; mobile is untested.
- Receipt URLs are publicly accessible (no auth-gated images).
- "Amount" is always IDR; multi-currency was treated as out of scope.
- LLM output is trusted enough to pre-fill the form; users are expected to glance and correct before saving.
- A single user per deployment — there's no auth layer yet.

## Three questions for a real user

1. When you skip logging an expense, what made you skip it — forgetting, or the app being annoying to open?
2. Do you care more about knowing where your money went, or catching yourself before you overspend?
3. Would you trust an AI category guess and just hit save, or do you always want to review it?

## How you'd know it's working

- Median time from "I just paid" to "entry saved" is under 15 seconds.
- At least 70 % of LLM-extracted entries need no field edits before saving.
- Users open the verdict view at least once a week without being prompted.

## What's next

Auth so the app is actually personal, not just local. A mobile-friendly input flow (the table works poorly on a phone). Recurring entry detection so "morning coffee" stops needing to be typed every day. And a proper budget target per category so the verdict can say "you're on track" or "you're not."
