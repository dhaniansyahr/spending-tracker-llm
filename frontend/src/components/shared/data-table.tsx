import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
} from "lucide-react";

import { cn } from "#/utils/classname";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination.tsx";

function Checkbox({
  checked,
  indeterminate,
  onChange,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      className={cn(
        "size-4 cursor-pointer rounded border-(--line) accent-(--lagoon)",
        className,
      )}
    />
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  totalData?: number;
  totalPage?: number;
  page?: number;
  rows?: number;
  onPageChange?: (page: number) => void;
  onRowsChange?: (rows: number) => void;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: TData[]) => void;
  className?: string;
};

function DataTable<TData>({
  columns: userColumns,
  data,
  totalData,
  totalPage = 1,
  page = 1,
  rows = 10,
  onPageChange,
  onRowsChange,
  isLoading = false,
  enableRowSelection = false,
  onSelectionChange,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<TData> = {
    id: "__select__",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableSorting: false,
    size: 40,
  };

  const columns = enableRowSelection
    ? [selectionColumn, ...userColumns]
    : userColumns;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);
      onSelectionChange?.(
        Object.keys(next)
          .filter((k) => next[k])
          .map((k) => data[Number(k)]!)
          .filter(Boolean),
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPage,
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const pageRange = buildPageRange(page, totalPage);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-(--line) shadow-[0_1px_0_var(--inset-glint)_inset,0_4px_16px_rgba(23,58,64,0.07)]">
        <Table>
          <TableHeader className="bg-(--sand)/50 [&_tr]:border-(--line)">
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="hover:bg-transparent border-(--line)"
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.column.getSize() !== 150
                            ? header.column.getSize()
                            : undefined,
                      }}
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)",
                        canSort &&
                          "cursor-pointer select-none hover:text-(--sea-ink)",
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <span className="text-(--sea-ink-soft)/50">
                              {sorted === "asc" ? (
                                <ArrowUpIcon className="size-3.5" />
                              ) : sorted === "desc" ? (
                                <ArrowDownIcon className="size-3.5" />
                              ) : (
                                <ChevronsUpDownIcon className="size-3.5" />
                              )}
                            </span>
                          )}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <TableRow className="border-(--line) hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <Loader2Icon className="mx-auto size-5 animate-spin text-(--lagoon)" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="border-(--line) hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-(--sea-ink-soft)"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="border-(--line) hover:bg-(--lagoon)/5 data-[state=selected]:bg-(--lagoon)/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-(--sea-ink)">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: rows-per-page + pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Meta bar */}
        <div className="flex items-center justify-between text-sm text-(--sea-ink-soft)">
          <span>
            {totalData !== undefined ? (
              <>
                <span className="font-semibold text-(--sea-ink)">
                  {totalData}
                </span>{" "}
                {totalData === 1 ? "record" : "records"}
              </>
            ) : null}
          </span>
          {enableRowSelection && selectedCount > 0 && (
            <span className="rounded-full bg-(--lagoon)/15 px-2.5 py-0.5 text-xs font-medium text-(--lagoon-deep)">
              {selectedCount} selected
            </span>
          )}
        </div>

        {/* Page numbers */}
        {totalPage > 1 && (
          <Pagination className="w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange?.(page - 1)}
                  aria-disabled={page <= 1}
                  className={cn(
                    "text-(--sea-ink-soft) hover:bg-(--lagoon)/10 hover:text-(--sea-ink)",
                    page <= 1 && "pointer-events-none opacity-40",
                  )}
                />
              </PaginationItem>

              {pageRange.map((p, i) =>
                p === "…" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis className="text-(--sea-ink-soft)" />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => onPageChange?.(p)}
                      className={cn(
                        "text-(--sea-ink-soft) hover:bg-(--lagoon)/10 hover:text-(--sea-ink)",
                        p === page &&
                          "border-(--lagoon)/30 bg-(--lagoon)/15 text-(--lagoon-deep) font-semibold hover:bg-(--lagoon)/20",
                      )}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange?.(page + 1)}
                  aria-disabled={page >= totalPage}
                  className={cn(
                    "text-(--sea-ink-soft) hover:bg-(--lagoon)/10 hover:text-(--sea-ink)",
                    page >= totalPage && "pointer-events-none opacity-40",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-(--sea-ink-soft)">
          <span>Rows per page</span>
          <select
            value={rows}
            onChange={(e) => onRowsChange?.(Number(e.target.value))}
            className={cn(
              "rounded-md border border-(--line) bg-(--surface) px-2 py-1 text-sm text-(--sea-ink) shadow-xs outline-none transition-[color,box-shadow]",
              "focus:border-(--lagoon) focus:ring-[3px] focus:ring-(--lagoon)/20",
            )}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {totalData !== undefined && (
            <span>
              {(page - 1) * rows + 1}–{Math.min(page * rows, totalData)} of{" "}
              <span className="font-medium text-(--sea-ink)">{totalData}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { DataTable };
export type { DataTableProps };
