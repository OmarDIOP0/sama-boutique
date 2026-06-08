export type AdminIconColor = "amber" | "brown" | "green" | "blue" | "teal" | "purple" | "red" | "orange";
export type AdminIconSize = "sm" | "md" | "lg";

// Palette brillante (gradient + glow) — conforme à la charte
const COLORS: Record<AdminIconColor, { from: string; to: string; glow: string; inset: number }> = {
    amber:  { from: "#C7932D", to: "#E8A93E", glow: "rgba(199,147,45,0.45)", inset: 0.30 },
    brown:  { from: "#513102", to: "#7A4A0A", glow: "rgba(81,49,2,0.45)",   inset: 0.20 },
    green:  { from: "#2D7A4F", to: "#3DA066", glow: "rgba(45,122,79,0.40)", inset: 0.25 },
    blue:   { from: "#2563EB", to: "#3B82F6", glow: "rgba(37,99,235,0.40)", inset: 0.25 },
    teal:   { from: "#0891B2", to: "#0EA5C9", glow: "rgba(8,145,178,0.40)", inset: 0.25 },
    purple: { from: "#7C3AED", to: "#9B59F5", glow: "rgba(124,58,237,0.40)", inset: 0.25 },
    red:    { from: "#DC2626", to: "#EF4444", glow: "rgba(220,38,38,0.40)", inset: 0.25 },
    orange: { from: "#D97706", to: "#F59E0B", glow: "rgba(217,119,6,0.40)", inset: 0.25 },
};

const SIZES: Record<AdminIconSize, { box: number; icon: number; radius: number }> = {
    sm: { box: 36, icon: 16, radius: 11 },
    md: { box: 48, icon: 22, radius: 14 },
    lg: { box: 60, icon: 28, radius: 16 },
};

interface Props {
    icon: React.ElementType;
    color?: AdminIconColor;
    size?: AdminIconSize;
    className?: string;
}

export function AdminIcon({ icon: Icon, color = "amber", size = "md", className }: Props) {
    const c = COLORS[color];
    const s = SIZES[size];
    return (
        <div
            className={className}
            style={{
                width: s.box,
                height: s.box,
                borderRadius: s.radius,
                background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                boxShadow: `0 4px 14px ${c.glow}, inset 0 1px 0 rgba(255,255,255,${c.inset})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <Icon style={{ width: s.icon, height: s.icon, color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }} />
        </div>
    );
}
