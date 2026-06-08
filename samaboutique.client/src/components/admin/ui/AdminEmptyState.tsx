import { Inbox } from "lucide-react";

interface Props {
    icon?: React.ElementType;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function AdminEmptyState({ icon: Icon = Inbox, title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: "rgba(199,147,45,0.10)" }}>
                <Icon className="w-7 h-7" style={{ color: "#C7932D" }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#513102", fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>
                {title}
            </p>
            {description && (
                <p className="max-w-sm" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginBottom: action ? 20 : 0 }}>
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
