import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pagination,
  onPageChange,
  loading,
  emptyTitle = "Aucun résultat",
  emptyDescription,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSkeleton variant="table" rows={5} />;
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "bg-card transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/20"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-5 py-4 text-foreground", col.className)}
                  >
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pt-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{pagination.totalCount}</span>{" "}
            résultat{pagination.totalCount > 1 ? "s" : ""} — page{" "}
            <span className="font-semibold text-foreground">{pagination.page}</span> /{" "}
            {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrevious}
              className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              const page = i + 1;
              const isActive = page === pagination.page;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xs font-semibold transition-all",
                    isActive
                      ? "text-white shadow-sm"
                      : "border border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                  style={isActive ? { background: "var(--sama-terra)" } : undefined}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
