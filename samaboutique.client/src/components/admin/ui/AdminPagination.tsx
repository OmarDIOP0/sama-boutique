import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

function getPages(current: number, totalPages: number): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    if (start > 2) pages.push("…");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("…");
    pages.push(totalPages);
    return pages;
}

export function AdminPagination({
    page, pageSize, total, onPageChange, onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
}: Props) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    if (total === 0) return null;

    const btnBase = "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all";

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            {/* Texte + sélecteur */}
            <div className="flex items-center gap-4">
                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>
                    Affichage <strong style={{ color: "#513102" }}>{from}-{to}</strong> sur{" "}
                    <strong style={{ color: "#513102" }}>{total}</strong>
                </p>
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="outline-none"
                        style={{
                            height: 34, borderRadius: 8, border: "1.5px solid rgba(81,49,2,0.12)",
                            background: "white", fontSize: 13, color: "#513102", padding: "0 28px 0 10px",
                            cursor: "pointer",
                            appearance: "none",
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23513102' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                        }}
                    >
                        {pageSizeOptions.map((s) => <option key={s} value={s}>{s} / page</option>)}
                    </select>
                )}
            </div>

            {/* Boutons */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        aria-label="Page précédente"
                        className={btnBase}
                        style={{ border: "1.5px solid rgba(81,49,2,0.15)", color: "#513102", opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {getPages(page, totalPages).map((p, i) =>
                        p === "…" ? (
                            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center" style={{ color: "rgba(81,49,2,0.40)", fontSize: 13 }}>…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={btnBase}
                                style={p === page
                                    ? { background: "#C7932D", color: "white", border: "1.5px solid #C7932D", cursor: "pointer" }
                                    : { border: "1.5px solid rgba(81,49,2,0.15)", color: "#513102", cursor: "pointer" }}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        aria-label="Page suivante"
                        className={btnBase}
                        style={{ border: "1.5px solid rgba(81,49,2,0.15)", color: "#513102", opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
