export type TQueryParams = {
  page?: number;
  rows?: number;
  take?: number;
  searchFilters?: Record<string, string>;
  filters?: Record<string, string>;
  rangedFilters?: {
    key: string;
    start: string;
    end: string;
  }[];
  orderKey?: string;
  orderRule?: "asc" | "desc";
};

export function serializeQueryParams(
  params: TQueryParams,
): Record<string, string> {
  const out: Record<string, string> = {};

  if (params.page != null) out.page = String(params.page);
  if (params.rows != null) out.rows = String(params.rows);
  if (params.take != null) out.take = String(params.take);
  if (params.orderKey) out.orderKey = params.orderKey;
  if (params.orderRule) out.orderRule = params.orderRule;

  if (params.searchFilters && Object.keys(params.searchFilters).length) {
    out.searchFilters = JSON.stringify(params.searchFilters);
  }
  if (params.filters && Object.keys(params.filters).length) {
    out.filters = JSON.stringify(params.filters);
  }
  if (params.rangedFilters && params.rangedFilters.length) {
    out.rangedFilters = JSON.stringify(params.rangedFilters);
  }

  return out;
}

export function deserializeQueryParams(search: string): TQueryParams {
  const q = new URLSearchParams(search);
  const params: TQueryParams = {};

  if (q.has("page")) params.page = Number(q.get("page"));
  if (q.has("rows")) params.rows = Number(q.get("rows"));
  if (q.has("take")) params.take = Number(q.get("take"));
  if (q.has("orderKey")) params.orderKey = q.get("orderKey")!;
  if (q.has("orderRule"))
    params.orderRule = q.get("orderRule") as "asc" | "desc";

  try {
    const sf = q.get("searchFilters");
    if (sf) params.searchFilters = JSON.parse(sf);
  } catch {
    /* ignore malformed */
  }

  try {
    const f = q.get("filters");
    if (f) params.filters = JSON.parse(f);
  } catch {
    /* ignore malformed */
  }

  try {
    const rf = q.get("rangedFilters");
    if (rf) params.rangedFilters = JSON.parse(rf);
  } catch {
    /* ignore malformed */
  }

  return params;
}

export function buildQueryString(params: TQueryParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.take != null) search.set("take", String(params.take));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
