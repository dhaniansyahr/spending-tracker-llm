import { Button } from "#/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { CategoryBadge, SourceBadge } from "#/components/ui/badge";
import type { TSpending } from "#/services/spendings/type";
import { formatDate, formatCurrency } from "#/utils/format";
import { Eye, SquarePen } from "lucide-react";

interface ICreateColumnsProps {
  onDetail: (id: string) => void;
  onEdit: (id: string) => void;
  currentPage: number;
  pageSize: number;
}

export default function createColumns(
  props: ICreateColumnsProps,
): ColumnDef<TSpending>[] {
  return [
    {
      header: "No",
      accessorKey: "no",
      enableSorting: false,
      cell: ({ row, table }) => {
        const sortedIndex = table
          .getSortedRowModel()
          .rows.findIndex((r) => r.id === row.id);
        return (
          <div>
            {(props.currentPage - 1) * props.pageSize + sortedIndex + 1}
          </div>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => {
        return <span>{formatDate(row.original?.date)}</span>;
      },
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => {
        return <span>{formatCurrency(row.original?.amount ?? 0)}</span>;
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: ({ row }) => <CategoryBadge category={row.original?.category} />,
    },
    {
      header: "Source",
      accessorKey: "source",
      cell: ({ row }) => <SourceBadge source={row.original?.source} />,
    },
    {
      header: "Note",
      accessorKey: "note",
    },
    {
      header: "Action",
      id: "actions",
      accessorKey: "id",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => props.onDetail(row.original.id)}
            aria-label="View details"
          >
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => props.onEdit(row.original.id)}
            aria-label="Edit"
          >
            <SquarePen />
          </Button>
        </div>
      ),
    },
  ];
}
