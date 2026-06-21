# Spending Tracker + LLM Analysis — Technical Reference Document

**Goal:** Full-stack personal spending tracker with three input modes (manual, free-text, receipt) and LLM-powered categorization + spending verdict via OpenRouter.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Bun |
| Backend framework | Hono |
| ORM | Prisma + PostgreSQL |
| LLM | OpenRouter (default model: `minimax/minimax-m3`) |
| Frontend framework | React 19 + TanStack Router (SPA, file-based routing) |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 + Radix UI primitives |
| Validation | Zod (backend + frontend) |

---

## System Architecture

```
Browser
  │
  ├── Frontend (React SPA :3000)
  │     └── TanStack Router (file-based, single page with dialogs)
  │
  └── Backend (Bun/Hono :3001)
        ├── Prisma → PostgreSQL :5432
        ├── storage/receipts/ (local disk)
        └── OpenRouter API → minimax/minimax-m3 (default)
```

Frontend talks directly to backend (`VITE_API_URL`). No nginx in development.

---

## Constraints

- 5 hardcoded spending categories: `FOOD_DINING`, `TRANSPORTATION`, `ENTERTAINMENT`, `SHOPPING`, `OTHERS`
- 3 hardcoded sources: `MANUAL`, `FREE_TEXT`, `RECEIPT`
- All operations synchronous — no background jobs or queues
- Currency: IDR, single-currency only
- No auth — single-user deployment

---

## Data Model

```prisma
enum Category {
  FOOD_DINING
  TRANSPORTATION
  ENTERTAINMENT
  SHOPPING
  OTHERS
}

enum Source {
  MANUAL
  FREE_TEXT
  RECEIPT
}

model Spending {
  id         String   @id @default(uuid())
  title      String
  amount     Decimal  @db.Decimal(12, 2)
  category   Category
  source     Source   @default(MANUAL)
  note       String?
  receiptUrl String?
  rawText    String?
  date       DateTime @default(now())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("spendings")
}
```

---

## API Reference

All routes prefixed `/api`. Responses: `{ success, message, content?, errors? }`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/spendings` | List with pagination, search, filters |
| `GET` | `/api/spendings/:id` | Get single spending |
| `POST` | `/api/spendings` | Create spending |
| `PUT` | `/api/spendings/:id` | Update spending |
| `DELETE` | `/api/spendings/:id` | Delete spending |
| `POST` | `/api/spendings/analyze-text` | Extract spending from free text (LLM, no DB save) |
| `POST` | `/api/spendings/analyze-receipt` | Extract spending from receipt URL (LLM, no DB save) |
| `POST` | `/api/analysis/verdict` | Generate LLM verdict for a date range |

### GET /api/spendings — Query Parameters

Serialized via `serializeQueryParams` on the frontend. The backend receives flat query params:

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (1-indexed) |
| `rows` | number | Page size |
| `searchFilters` | JSON string | `{ title: "..." }` — triggers ILIKE search |
| `filters` | JSON string | `{ category: "FOOD_DINING", source: "MANUAL" }` — exact match |
| `orderKey` | string | Field to sort by |
| `orderRule` | `asc\|desc` | Sort direction |

### POST /api/analysis/verdict — Request/Response

```ts
// Request
{ dateFrom: string; dateTo: string }

// Response content
{
  verdict: string;                    // 2-3 sentence assessment
  insights: [string, string, string]; // 3 key insights
  recommendations: [string, string, string]; // 3 actionable recommendations
  totalAmount: number;
  byCategory: Record<string, number>; // category → total amount
}
```

---

## Backend File Structure

```
backend/
├── src/
│   ├── index.ts                        # Entry point
│   ├── routes/
│   │   ├── index.ts                    # Mounts all routes
│   │   ├── Spending.ts                 # /api/spendings routes
│   │   ├── Analysis.ts                 # /api/analysis routes
│   │   └── Storage.ts                  # /storage/* static files
│   ├── controllers/
│   │   ├── Spending.ts
│   │   ├── Analysis.ts
│   │   └── Storage.ts
│   ├── services/
│   │   ├── Spending.ts
│   │   ├── Analysis.ts
│   │   └── Storage.ts
│   ├── repository/
│   │   ├── Spending.ts
│   │   └── Analysis.ts
│   ├── entity/
│   │   ├── Spending.ts                 # SpendingDAO, CreateSpendingDTO, UpdateSpendingDTO
│   │   └── Llm.ts                      # LLM output types
│   ├── validation/
│   │   ├── spending/
│   │   │   ├── schema.ts               # Zod schemas
│   │   │   └── validation.ts           # Hono middleware
│   │   └── analysis/
│   │       ├── schema.ts
│   │       └── validation.ts
│   ├── pkg/
│   │   ├── openrouter/index.ts         # OpenRouter HTTP client
│   │   ├── prisma/index.ts             # Prisma singleton
│   │   ├── logger/                     # Structured logging
│   │   └── graceful/                   # Graceful shutdown
│   ├── shared/
│   │   ├── entities/service.entity.ts  # Shared service response types
│   │   ├── middlewares/http.middleware.ts
│   │   └── utils/
│   │       ├── filter.utils.ts
│   │       └── response.utils.ts
│   ├── app/
│   │   ├── instance.ts                 # Hono app setup
│   │   └── rest.ts
│   └── server/
│       ├── instance.ts                 # Server bootstrap
│       └── rest.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── storage/
│   └── receipts/
├── .example.env
└── prisma.config.ts
```

**Naming convention:** PascalCase for route/controller/service/repository files. Import alias: `@/` → `src/`.

---

## Frontend File Structure

```
frontend/
├── src/
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout (AppBar, QueryClient, Toaster)
│   │   ├── index.tsx                   # Single dashboard page (table + dialogs)
│   │   └── -components/
│   │       ├── container.tsx           # Page container wrapper
│   │       ├── tables/
│   │       │   ├── index.tsx           # TableSpending — filters, action buttons, DataTable
│   │       │   └── columns.tsx         # TanStack Table column definitions
│   │       └── dialogs/
│   │           ├── index.tsx           # SpendingDialogs orchestrator (forwardRef)
│   │           ├── spending-form.tsx   # Shared form state, SpendingFormFields, IdDialogHandle
│   │           ├── manual.tsx          # DialogCreateManual
│   │           ├── text.tsx            # DialogCreateText (2-step: input → confirm)
│   │           ├── receipt.tsx         # DialogCreateReceipt (2-step: URL → confirm)
│   │           ├── edit.tsx            # DialogEdit
│   │           ├── detail.tsx          # DialogDetail (read-only)
│   │           └── dialog-analysis-verdict.tsx  # Date range → LLM verdict
│   ├── components/
│   │   ├── ui/                         # Radix-based primitives (Button, Badge, Input, etc.)
│   │   └── shared/
│   │       ├── app-bar.tsx
│   │       ├── data-table.tsx          # Paginated table with TanStack Table
│   │       ├── date-picker.tsx         # DatePicker (value: Date | undefined)
│   │       ├── modal.tsx               # Modal + ModalHandle (ref-based open/close)
│   │       └── single-select.tsx
│   ├── hooks/
│   │   └── use-query-builder.ts        # URL-driven query param management
│   ├── integrations/
│   │   ├── http/index.ts               # fetch wrapper (http.get/post/put/delete/getAll)
│   │   ├── env/index.ts                # Typed env vars
│   │   └── tanstack-query/
│   │       ├── root-provider.tsx
│   │       └── devtools.tsx
│   ├── services/
│   │   ├── index.ts                    # Re-exports services object
│   │   ├── spendings/
│   │   │   ├── type.ts                 # TSpending, TSpendingRequest, etc.
│   │   │   └── index.ts                # Query/mutation option factories
│   │   └── analysis/
│   │       ├── type.ts                 # TVerdictRequest, TVerdictResponse
│   │       └── index.ts                # getVerdict mutation factory
│   └── utils/
│       ├── classname.ts                # cn() utility
│       ├── format.ts                   # formatCurrency, formatDate
│       └── request.ts                  # TQueryParams, serializeQueryParams, buildQueryString
├── .example.env
└── vite.config.ts / app.config.ts
```

**Import alias:** `#/` → `src/`.

---

## Frontend Architecture

### Query Parameter System

`TQueryParams` is the canonical shape for all list queries:

```ts
type TQueryParams = {
  page?: number;
  rows?: number;
  orderKey?: string;
  orderRule?: "asc" | "desc";
  searchFilters?: Record<string, string>;   // ILIKE search per field
  filters?: Record<string, string>;         // exact match filters
  rangedFilters?: Array<{ key: string; start: string; end: string }>;
};
```

**Flow:**
1. `useQueryBuilder` parses `TQueryParams` from `location.searchStr` (URL state)
2. On update, navigates with raw object via TanStack Router (no manual JSON.stringify)
3. Service layer calls `serializeQueryParams(params)` → `Record<string, string>` before HTTP
4. HTTP client builds query string via `URLSearchParams` (null/undefined values skipped)

### Dialog System

All CRUD operations happen in dialogs overlaid on the single dashboard page. `SpendingDialogs` is a `forwardRef` component that holds refs for all 6 dialogs and exposes a `SpendingDialogsHandle`:

```ts
type SpendingDialogsHandle = {
  openCreateManual: () => void;
  openCreateText: () => void;
  openCreateReceipt: () => void;
  openEdit: (id: string) => void;
  openDetail: (id: string) => void;
  openAnalysisVerdict: () => void;
};
```

`TableSpending` holds a single `dialogsRef` and calls methods on it from column action buttons and toolbar buttons.

Individual dialogs use two handle types:
- `ModalHandle` — `{ open(): void; close(): void }` — for stateless dialogs (create, analysis)
- `IdDialogHandle` — `{ open(id: string): void; close(): void }` — for ID-driven dialogs (edit, detail)

### Service Layer

Services return TanStack Query option objects (not hooks), consumed directly with `useQuery` / `useMutation`:

```ts
// Usage
const { data } = useQuery(services.spending.getAll(params));
const mutation = useMutation(services.spending.create());
```

This keeps services pure and testable; hooks live only in components.

### HTTP Client

Custom `http` object wrapping `fetch`:
- `http.getAll(path, { params })` / `http.get` / `http.post` / `http.put` / `http.delete`
- `params: Record<string, string>` is serialized via `URLSearchParams`
- Throws `HttpError` (with `status` + parsed response body) on non-2xx

---

## LLM Prompts

### Free Text → Spending
Extracts `{ title, amount, category, note }` from a free-text description. Returns JSON only.

### Receipt URL → Spending
Sends the receipt URL to OpenRouter vision model. Extracts same shape as free text.

### Spending Verdict
Input: `totalAmount`, `byCategory`, top spendings list, `dateFrom`/`dateTo`.
Output: `{ verdict, insights[3], recommendations[3] }` — merged with aggregated data before returning to client.

Default model: `minimax/minimax-m3`. Override via `OPENROUTER_MODEL` env var.

---

## Environment Variables

**Backend (`backend/.env`):**
```env
DATABASE_URL="postgresql://..."
OPENROUTER_API_KEY="sk-or-..."
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_MODEL="minimax/minimax-m3"   # optional, this is the default
BACKEND_PORT=3001
FRONTEND_URL="http://localhost:3000"
STORAGE_DIR="./storage/receipts"
ALLOWED_ORIGINS="*"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL="http://localhost:3001"
```
