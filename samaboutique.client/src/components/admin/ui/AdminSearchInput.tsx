import { Search, X } from "lucide-react";

interface Props {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
}

export function AdminSearchInput({ value, onChange, placeholder = "Rechercher…", className }: Props) {
    return (
        <div className={`relative ${className ?? ""}`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(81,49,2,0.40)" }} />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full outline-none transition-all"
                style={{
                    height: 44,
                    paddingLeft: 42,
                    paddingRight: value ? 38 : 16,
                    borderRadius: 12,
                    border: "1.5px solid rgba(81,49,2,0.12)",
                    background: "#FFFFFF",
                    fontSize: 14,
                    color: "#513102",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#C7932D"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(199,147,45,0.14)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(81,49,2,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    aria-label="Effacer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "rgba(81,49,2,0.40)", cursor: "pointer" }}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
