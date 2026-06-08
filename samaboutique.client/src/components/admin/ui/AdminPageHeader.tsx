interface Props {
    icon?: React.ElementType;
    title: string;
    subtitle?: string;
    children?: React.ReactNode; // zone d'action à droite (CTA)
}

export function AdminPageHeader({ icon: Icon, title, subtitle, children }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
                {Icon && (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(199,147,45,0.10)" }}>
                        <Icon className="w-6 h-6" style={{ color: "#C7932D" }} />
                    </div>
                )}
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: "#513102", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1 }}>
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
