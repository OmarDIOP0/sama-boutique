import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4 mb-6", className)}>
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--sama-terra-light)", width: "3.25rem", height: "3.25rem" }}
          >
            <Icon className="w-6 h-6" style={{ color: "var(--sama-terra)" }} />
          </div>
        )}
        <div>
          <h1
            className="text-3xl font-bold text-foreground leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
