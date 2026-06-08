import { Inbox } from "lucide-react";
import { AdminIcon, type AdminIconColor } from "./AdminIcon";

interface Props {
    icon?: React.ElementType;
    iconColor?: AdminIconColor;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function AdminEmptyState({ icon = Inbox, iconColor = "amber", title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="mb-5">
                <AdminIcon icon={icon} color={iconColor} size="lg" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#513102", fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 6 }}>
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
