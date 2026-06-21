import { useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, PenLineIcon, PlusIcon, ScanIcon, SearchIcon, SparklesIcon, TrendingUpIcon, XIcon } from "lucide-react";

import { useQueryBuilder } from "#/hooks/use-query-builder";
import { services } from "#/services";
import { CATEGORY_LABELS, SOURCE_LABELS } from "#/components/ui/badge";
import { Input } from "#/components/ui/input";
import { SingleSelect } from "#/components/shared/single-select";
import { DataTable } from "#/components/shared/data-table";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { SpendingDialogs, type SpendingDialogsHandle } from "../dialogs";
import createColumns from "./columns";
import type { SelectOption } from "#/components/shared/single-select";
import type { TCategory, TSource } from "#/services/spendings/type";

const CATEGORY_OPTIONS: SelectOption[] = (
  Object.entries(CATEGORY_LABELS) as [TCategory, string][]
).map(([value, label]) => ({ value, label }));

const SOURCE_OPTIONS: SelectOption[] = (
  Object.entries(SOURCE_LABELS) as [TSource, string][]
).map(([value, label]) => ({ value, label }));

export default function TableSpending() {
  const dialogsRef = useRef<SpendingDialogsHandle>(null);

  const { params, setSearch, updateParams, resetParams } = useQueryBuilder({
    defaultPage: 1,
    defaultRows: 10,
    defaultSearchKeys: ["title"],
  });

  const { data, isLoading } = useQuery(services.spending.getAll(params));

  const entries = data?.entries ?? [];
  const totalData = data?.totalData ?? 0;
  const totalPage = data?.totalPage ?? 1;

  const titleSearch = params.searchFilters?.["title"] ?? "";
  const categoryFilter = params.filters?.["category"] ?? "";
  const sourceFilter = params.filters?.["source"] ?? "";
  const hasActiveFilters = !!(titleSearch || categoryFilter || sourceFilter);

  const setCategoryFilter = useCallback(
    (value: string) => {
      const next = { ...params.filters };
      if (value) next.category = value;
      else delete next.category;
      updateParams({ filters: next }, true);
    },
    [updateParams, params.filters],
  );

  const setSourceFilter = useCallback(
    (value: string) => {
      const next = { ...params.filters };
      if (value) next.source = value;
      else delete next.source;
      updateParams({ filters: next }, true);
    },
    [updateParams, params.filters],
  );

  const columns = createColumns({
    onDetail: (id) => dialogsRef.current?.openDetail(id),
    onEdit: (id) => dialogsRef.current?.openEdit(id),
    currentPage: params.page ?? 1,
    pageSize: params.rows ?? 10,
  });

  return (
    <>
      <SpendingDialogs ref={dialogsRef} />

      <div className="flex flex-col gap-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-full max-w-60">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--sea-ink-soft)/60 pointer-events-none" />
            <Input
              placeholder="Search by title..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-7"
            />
            {titleSearch && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-(--sea-ink-soft)/60 hover:text-(--sea-ink) transition-colors"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="w-full max-w-48">
            <SingleSelect
              placeholder="All Categories"
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={(val) =>
                setCategoryFilter(val === categoryFilter ? "" : val)
              }
            />
          </div>

          {/* Source filter */}
          <div className="w-full max-w-40">
            <SingleSelect
              placeholder="All Sources"
              options={SOURCE_OPTIONS}
              value={sourceFilter}
              onChange={(val) => setSourceFilter(val === sourceFilter ? "" : val)}
            />
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetParams}
              className="gap-1.5 text-(--sea-ink-soft) hover:text-(--sea-ink)"
            >
              <XIcon className="size-3.5" />
              Clear
            </Button>
          )}

          {/* Action buttons */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => dialogsRef.current?.openAnalysisVerdict()}
            >
              <TrendingUpIcon className="size-3.5" />
              Analysis
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <PlusIcon className="size-3.5" />
                  Add
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => dialogsRef.current?.openCreateManual()}
                >
                  <PenLineIcon className="size-4" />
                  Manual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dialogsRef.current?.openCreateText()}
                >
                  <SparklesIcon className="size-4" />
                  Text Analysis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dialogsRef.current?.openCreateReceipt()}
                >
                  <ScanIcon className="size-4" />
                  Receipt Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={entries}
          totalData={totalData}
          totalPage={totalPage}
          page={params.page ?? 1}
          rows={params.rows ?? 10}
          isLoading={isLoading}
          onPageChange={(page) => updateParams({ page })}
          onRowsChange={(rows) => updateParams({ rows }, true)}
        />
      </div>
    </>
  );
}
