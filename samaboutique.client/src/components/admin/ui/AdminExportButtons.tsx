import { FileSpreadsheet, FileText } from "lucide-react";

interface Props {
    onCSV: () => void;
    onPDF: () => void;
}

// Excel = vert, PDF = rouge (couleurs des formats)
export function AdminExportButtons({ onCSV, onPDF }: Props) {
    const base: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 40, padding: "0 14px", borderRadius: 10,
        fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        transition: "all 0.18s", background: "white",
    };
    return (
        <>
            <button
                onClick={onCSV}
                style={{ ...base, border: "1.5px solid rgba(33,115,70,0.30)", color: "#217346" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(33,115,70,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                title="Exporter en Excel (CSV)"
            >
                <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button
                onClick={onPDF}
                style={{ ...base, border: "1.5px solid rgba(220,38,38,0.30)", color: "#DC2626" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                title="Exporter en PDF"
            >
                <FileText className="w-4 h-4" /> PDF
            </button>
        </>
    );
}
