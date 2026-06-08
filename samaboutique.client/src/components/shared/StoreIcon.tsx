export type StoreIconColor = "amber" | "brown" | "green" | "red";
export type StoreIconSize = "sm" | "md" | "lg";

// Palette warm uniquement (charte sénégalaise) — glow plus doux que l'admin
const COLORS: Record<StoreIconColor, { from: string; to: string; glow: string; inset: number }> = {
    amber: { from: "#C7932D", to: "#E8A93E", glow: "rgba(199,147,45,0.35)", inset: 0.25 },
    brown: { from: "#513102", to: "#7A4A0A", glow: "rgba(81,49,2,0.30)",   inset: 0.15 },
    green: { from: "#2D7A4F", to: "#3DA066", glow: "rgba(45,122,79,0.30)", inset: 0.20 },
    red:   { from: "#DC2626", to: "#EF4444", glow: "rgba(220,38,38,0.30)", inset: 0.20 },
};

const SIZES: Record<StoreIconSize, { box: number; icon: number; radius: number }> = {
    sm: { box: 36, icon: 17, radius: 12 },
    md: { box: 48, icon: 22, radius: 14 },
    lg: { box: 60, icon: 28, radius: 16 },
};

interface Props {
    icon: React.ElementType;
    color?: StoreIconColor;
    size?: StoreIconSize;
    className?: string;
}

export function StoreIcon({ icon: Icon, color = "amber", size = "md", className }: Props) {
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
                boxShadow: `0 3px 10px ${c.glow}, inset 0 1px 0 rgba(255,255,255,${c.inset})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <Icon style={{ width: s.icon, height: s.icon, color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))" }} />
        </div>
    );
}
