import { AdminIcon, type AdminIconColor } from "./AdminIcon";

interface Props {
    icon?: React.ElementType;
    iconColor?: AdminIconColor;
    title: string;
    subtitle?: string;
    children?: React.ReactNode; // zone d'action à droite (CTA)
}

export function AdminPageHeader({ icon, iconColor = "amber", title, subtitle, children }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
                {icon && <AdminIcon icon={icon} color={iconColor} size="md" />}
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: "#513102", fontFamily: "'Bricolage Grotesque', sans-serif", lineHeight: 1.1 }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 2 }}>{subtitle}</p>
                    )}
                </div>
            </div>
            {children && <div className="flex items-center gap-2.5">{children}</div>}
        </div>
    );
}
