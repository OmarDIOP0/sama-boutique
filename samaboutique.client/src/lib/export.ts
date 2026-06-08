import jsPDF from "jspdf";

export interface ExportColumn<T> {
    header: string;
    /** valeur brute (string/number) pour la cellule */
    value: (row: T) => string | number;
}

// ── Export CSV (compatible Excel) ─────────────────────────────────────────────
export function exportToCSV<T>(filename: string, columns: ExportColumn<T>[], rows: T[]) {
    const escape = (v: string | number) => {
        const s = String(v ?? "");
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.map((c) => escape(c.header)).join(";");
    const body = rows.map((r) => columns.map((c) => escape(c.value(r))).join(";")).join("\n");
    // BOM UTF-8 pour les accents dans Excel
    const csv = "﻿" + header + "\n" + body;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${filename}.csv`);
}

// ── Export PDF (tableau stylisé) ──────────────────────────────────────────────
export function exportToPDF<T>(
    title: string,
    columns: ExportColumn<T>[],
    rows: T[],
    opts?: { subtitle?: string; summary?: { label: string; value: string }[] }
) {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const GOLD: [number, number, number] = [199, 147, 45];
    const DARK: [number, number, number] = [81, 49, 2];

    // En-tête
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...DARK);
    doc.text(title, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 100, 80);
    doc.text(`SamaBoutique · Dakar · ${new Date().toLocaleString("fr-FR")}`, 14, 24);
    if (opts?.subtitle) doc.text(opts.subtitle, 14, 29);

    let y = opts?.subtitle ? 38 : 34;

    // Résumé (cartes)
    if (opts?.summary?.length) {
        let x = 14;
        const cardW = (pageW - 28) / opts.summary.length - 4;
        opts.summary.forEach((s) => {
            doc.setFillColor(250, 245, 235);
            doc.roundedRect(x, y, cardW, 16, 2, 2, "F");
            doc.setFontSize(7.5);
            doc.setTextColor(140, 120, 95);
            doc.text(s.label.toUpperCase(), x + 4, y + 6);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...DARK);
            doc.text(s.value, x + 4, y + 12);
            doc.setFont("helvetica", "normal");
            x += cardW + 4;
        });
        y += 24;
    }

    // En-tête de tableau
    const colW = (pageW - 28) / columns.length;
    doc.setFillColor(...GOLD);
    doc.rect(14, y, pageW - 28, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    columns.forEach((c, i) => doc.text(c.header, 16 + i * colW, y + 6));
    y += 9;

    // Lignes
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    rows.forEach((r, idx) => {
        if (y > 195) { doc.addPage(); y = 16; }
        if (idx % 2 === 0) { doc.setFillColor(252, 249, 244); doc.rect(14, y, pageW - 28, 7, "F"); }
        doc.setTextColor(60, 45, 25);
        columns.forEach((c, i) => {
            const text = String(c.value(r) ?? "");
            doc.text(text.length > 28 ? text.slice(0, 27) + "…" : text, 16 + i * colW, y + 5);
        });
        y += 7;
    });

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
