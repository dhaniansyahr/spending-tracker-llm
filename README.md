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
bun prisma migrate dev
bun prisma generate
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

Manual expense apps have too much friction — you forget to log, or you log it wrong. Receipt-scanning apps exist but lock the good stuff behind a subscription. The
LLM removes the "fill in every field" chore while keeping you in control of your own data.

This came from a personal frustration: tracking spending was always the intention, but the habit never stuck. Not because the apps were bad, but because pulling out
your phone to manually type in every coffee and grab ride felt like homework. The logging step had more friction than the spending itself — so it just didn't happen.

## What's already out there

Mint, YNAB, Money Manager, and receipt-scanning apps (Expensify, Veryfi). They all require structured input or a mobile camera flow. None let you just type "grabbed lunch and a ride home, about 80k" and get a clean record with a category guess. That's the gap.

I built this anyway because it was also a chance to work with LLMs in a practical context — not just calling an API, but thinking through prompt design, handling unpredictable output, and building a flow where the AI does the tedious part without taking over. Less about reinventing expense tracking, more about learning what it actually takes to wire an LLM into a real product.

## Scope

**In:** log by typing, log by receipt URL, manual form fallback, filterable table, AI spending verdict for any date range.

**Out:** budgets, notifications, automatic re-categorization, and auth. All of these are buildable i was cut to keep the MVP scope honest. Time was short, so the filter was simple: does this need to exist for the core logging flow to work? If not, it ships later.

## My Assumptions

- Users have a desktop browser; mobile is untested.
- Receipt URLs are publicly accessible (no auth-gated images).
- Users doesnt input weird image or other image except receipt.
- "Amount" is always IDR; multi-currency was treated as out of scope.
- LLM output is trusted enough to pre-fill the form; users are expected to glance and correct before saving.

## Three questions for a real user

1. When you skip logging an expense, what made you skip it — forgetting, or the app being annoying to open?
2. Do you care more about knowing where your money went, or catching yourself before you overspend?
3. Would you trust an AI category guess and just hit save, or do you always want to review it?

## How i know it's working

- Median time from "I just paid" to "entry saved" is under 15 seconds.
- At least 70 % of LLM-extracted entries need no field edits before saving.
- Users open the verdict view at least once a week without being prompted.

## What's next

Auth so the app is actually personal, not just local. A mobile-friendly input flow (the table works poorly on a phone). Recurring entry detection so "morning coffee" stops needing to be typed every day. And a proper budget target per category so the verdict can say "you're on track" or "you're not."


## RUN Through

Before building this, I asked around — friends, seniors, anyone who'd give honest feedback on what was worth building for this test. The suggestion that stuck came
from a senior: make a spending tracker, because finance problems are real and plenty, but don't stop at the basics — layer in LLM analysis to make it actually useful.

From there I sat down and designed the system end to end refer `docs/system-design.png`: how the client and server should talk, where the LLM fits in the request flow, and what the data model
needed to look like to support multiple input modes. I also went back to that senior specifically to ask about LLM providers and architecture — how to call them safely, how to handle their output, and where to draw the boundary between AI and user control.

That conversation is what led to this build. The decisions weren't made in isolation — they were shaped by real input from people who've shipped production systems.

Next up: voice input via STT. The same idea, one more way to reduce friction — speak your spending instead of typing it.
