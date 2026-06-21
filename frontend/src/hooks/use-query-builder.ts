import type { TQueryParams } from "#/utils/request";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

export type UseQueryBuilderOptions = {
  defaultPage?: number;
  defaultRows?: number;
  defaultSearchKeys?: string[];
  defaultOrderKey?: string;
  defaultOrderRule?: "asc" | "desc";
  defaultTab?: string;
};

export function buildQueryString(params?: TQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.rows != null) searchParams.set("rows", String(params.rows));
  if (params?.orderKey) searchParams.set("orderKey", params.orderKey);
  if (params?.orderRule) searchParams.set("orderRule", params.orderRule);

  if (params?.searchFilters) {
    for (const [key, value] of Object.entries(params.searchFilters)) {
      if (value !== undefined && value !== "") {
        searchParams.set(`searchFilters[${key}]`, String(value));
      }
    }
  }

  if (params?.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== undefined && value !== "") {
        searchParams.set(`filters[${key}]`, String(value));
      }
    }
  }

  if (params?.rangedFilters?.length) {
    for (const { key, start, end } of params.rangedFilters) {
      searchParams.set(`${key}_start`, start);
      searchParams.set(`${key}_end`, end);
    }
  }

  const query = searchParams.toString();
  return query;
}

function parseSearchParams(
  searchString: string,
  defaults: {
    defaultPage: number;
    defaultRows: number;
    defaultOrderKey?: string;
    defaultOrderRule?: "asc" | "desc";
  },
): TQueryParams {
  const params: TQueryParams = {
    page: defaults.defaultPage,
    rows: defaults.defaultRows,
    ...(defaults.defaultOrderKey && { orderKey: defaults.defaultOrderKey }),
    ...(defaults.defaultOrderRule && { orderRule: defaults.defaultOrderRule }),
  };

  const raw = searchString.startsWith("?")
    ? searchString.slice(1)
    : searchString;
  if (!raw) return params;

  const urlParams = new URLSearchParams(raw);

  const page = urlParams.get("page");
  if (page !== null) {
    const n = Number.parseInt(page, 10);
    if (!Number.isNaN(n)) params.page = n;
  }

  const rows = urlParams.get("rows");
  if (rows !== null) {
    const n = Number.parseInt(rows, 10);
    if (!Number.isNaN(n)) params.rows = n;
  }

  // const orderKey = urlParams.get("orderKey");
  // if (orderKey !== null) params.orderKey = orderKey;

  // const orderRule = urlParams.get("orderRule");
  // if (orderRule === "asc" || orderRule === "desc") params.orderRule = orderRule;

  const searchFiltersRaw = urlParams.get("searchFilters");
  if (searchFiltersRaw) {
    try {
      const parsed = JSON.parse(
        searchFiltersRaw,
      ) as TQueryParams["searchFilters"];
      if (parsed && typeof parsed === "object") params.searchFilters = parsed;
    } catch {
      // ignore malformed value
    }
  }

  const filtersRaw = urlParams.get("filters");
  if (filtersRaw) {
    try {
      const parsed = JSON.parse(filtersRaw) as TQueryParams["filters"];
      if (parsed && typeof parsed === "object") params.filters = parsed;
    } catch {
      // ignore malformed value
    }
  }

  const rangedFiltersRaw = urlParams.get("rangedFilters");
  if (rangedFiltersRaw) {
    try {
      const parsed = JSON.parse(
        rangedFiltersRaw,
      ) as TQueryParams["rangedFilters"];
      if (Array.isArray(parsed)) params.rangedFilters = parsed;
    } catch {
      // ignore malformed value
    }
  }

  return params;
}

export function useQueryBuilder(options: UseQueryBuilderOptions = {}) {
  const {
    defaultPage = 1,
    defaultRows = 10,
    defaultSearchKeys = [],
    defaultOrderKey,
    defaultOrderRule,
  } = options;

  const location = useLocation();
  const navigate = useNavigate();

  console.log("[USE QUERY BUILDER] Parse Search Params: ", location.searchStr);

  const params = useMemo(
    () =>
      parseSearchParams(location.searchStr, {
        defaultPage,
        defaultRows,
        defaultOrderKey,
        defaultOrderRule,
      }),
    [
      location.searchStr,
      defaultPage,
      defaultRows,
      defaultOrderKey,
      defaultOrderRule,
    ],
  );

  const updateParams = useCallback(
    (newParams: Partial<TQueryParams>, resetPage = false) => {
      const merged: TQueryParams = {
        ...params,
        ...newParams,
        page: resetPage ? defaultPage : (newParams.page ?? params.page),
      };

      const searchObj: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(merged)) {
        if (value === undefined || value === null) continue;
        if (typeof value === "object") {
          const isEmpty = Array.isArray(value)
            ? value.length === 0
            : Object.keys(value).length === 0;
          if (isEmpty) continue;
        }
        searchObj[key] = value;
      }

      if (merged.page === defaultPage) delete searchObj.page;
      if (merged.rows === defaultRows) delete searchObj.rows;

      navigate({
        to: location.pathname as never,
        search: searchObj as never,
        replace: true,
      });
    },
    [params, defaultPage, defaultRows, location.pathname, navigate],
  );

  const setSearch = useCallback(
    (value: string) => {
      if (defaultSearchKeys.length === 0) {
        console.warn("[useQueryBuilder] No defaultSearchKeys provided.");
        return;
      }
      const newSearchFilters: Record<string, string> = {};
      if (value) {
        for (const key of defaultSearchKeys) {
          newSearchFilters[key] = value;
        }
      }
      updateParams({ searchFilters: newSearchFilters }, true);
    },
    [defaultSearchKeys, updateParams],
  );

  const resetParams = useCallback(() => {
    navigate({
      to: location.pathname as never,
      search: {} as never,
      replace: true,
    });
  }, [location.pathname, navigate]);

  return {
    params,
    setSearch,
    updateParams,
    resetParams,
  };
}
