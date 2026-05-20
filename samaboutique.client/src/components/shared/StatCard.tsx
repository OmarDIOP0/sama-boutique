import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  iconColor?: string;
  iconBg?: string;
  className?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  className,
  subtitle,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend !== undefined && trend === 0;

  return (
    <div
      className={cn(
        "card-glass rounded-2xl p-5 card-hover cursor-default relative overflow-hidden",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between relative">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1 count-anim truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full",
                isPositive && "bg-success/10 text-success",
                isNegative && "bg-danger/10 text-danger",
                isNeutral && "bg-muted text-muted-foreground"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {isNeutral && <Minus className="w-3 h-3" />}
              <span>{formatPercent(trend)}</span>
              {trendLabel && (
                <span className="opacity-70 ml-0.5">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
