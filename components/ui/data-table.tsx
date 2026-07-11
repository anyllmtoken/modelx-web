"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  initialQuery?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  globalFilterFn?: (row: TData, query: string) => boolean;
  getRowHref?: (row: TData) => string;
  getRowClassName?: (row: TData) => string;
  noResultsText?: string;
  searchComponent?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable,
  searchPlaceholder = "Search...",
  initialQuery = "",
  pageSize = 10,
  toolbar,
  globalFilterFn,
  getRowHref,
  getRowClassName,
  noResultsText = "No results.",
  searchComponent,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(initialQuery);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: globalFilterFn
      ? (row, _columnId, filterValue) =>
          globalFilterFn(row.original, filterValue)
      : undefined,
    initialState: { pagination: { pageSize } },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div>
      {searchable && (
        <div className="mb-4">
          {searchComponent ? (
            searchComponent({
              value: globalFilter,
              onChange: setGlobalFilter,
              placeholder: searchPlaceholder,
            })
          ) : (
            <Input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
            />
          )}
        </div>
      )}
      {toolbar && <div className="mb-4">{toolbar}</div>}
      <div className="border-border/40 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | Record<string, string>
                    | undefined;
                  const headerCls =
                    meta?.headerClassName ?? meta?.className ?? "";
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const sortCls = canSort ? "cursor-pointer select-none" : "";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(headerCls, sortCls)}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : canSort
                              ? "none"
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
                            <span className="text-muted-foreground">
                              {sorted === "asc" ? (
                                <ArrowUp size={12} />
                              ) : sorted === "desc" ? (
                                <ArrowDown size={12} />
                              ) : (
                                <ArrowUpDown size={12} />
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
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const href = getRowHref?.(row.original);
                const handleRowClick = href
                  ? (e: MouseEvent) => {
                      if (
                        e.defaultPrevented ||
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey
                      )
                        return;
                      router.push(href);
                    }
                  : undefined;
                const handleRowKeyDown = href
                  ? (e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(href);
                      }
                    }
                  : undefined;
                const rowCls = getRowClassName?.(row.original) ?? "";
                return (
                  <TableRow
                    key={row.id}
                    className={cn(href && "cursor-pointer", rowCls)}
                    onClick={handleRowClick}
                    onKeyDown={handleRowKeyDown}
                    tabIndex={href ? 0 : undefined}
                    role={href ? "link" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | Record<string, string>
                        | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={meta?.className ?? ""}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-8 text-center text-balance"
                >
                  {noResultsText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="First page"
              >
                <ChevronsLeft size={14} />
              </button>
            </PaginationItem>
            <PaginationItem>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
            </PaginationItem>
            <PaginationItem>
              <span
                className="text-muted-foreground flex h-8 items-center px-3 text-xs"
                aria-label={`Page ${pageIndex + 1} of ${totalPages}`}
              >
                {pageIndex + 1} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </PaginationItem>
            <PaginationItem>
              <button
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
                className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="Last page"
              >
                <ChevronsRight size={14} />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
