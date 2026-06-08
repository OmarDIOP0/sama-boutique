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

// Génère la liste des numéros de page avec ellipses : 1 … 4 5 [6] 7 8 … 20
function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");

  pages.push(total);
  return pages;
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
      <div className="overflow-x-auto admin-card">
        <table className="w-full" style={{ fontSize: 15 }}>
          <thead>
            <tr style={{ background: "rgba(81,49,2,0.04)", borderBottom: "1px solid rgba(81,49,2,0.08)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-5 py-3.5 text-left whitespace-nowrap", col.headerClassName)}
                  style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(81,49,2,0.50)" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={cn("transition-colors", onRowClick && "cursor-pointer")}
                style={{ borderBottom: idx < data.length - 1 ? "1px solid rgba(81,49,2,0.05)" : "none" }}
                onMouseEnter={onRowClick ? (e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.04)"; } : undefined}
                onMouseLeave={onRowClick ? (e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; } : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-5 py-4", col.className)}
                    style={{ color: "#513102" }}
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
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
            {getPageNumbers(pagination.page, pagination.totalPages).map((page, i) =>
              page === "…" ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page as number)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xs font-semibold transition-all",
                    page === pagination.page
                      ? "text-white shadow-sm"
                      : "border border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                  style={page === pagination.page ? { background: "#C7932D" } : undefined}
                >
                  {page}
                </button>
              )
            )}
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
