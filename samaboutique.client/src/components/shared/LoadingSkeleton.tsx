import { cn } from "@/lib/utils";

interface Props {
  variant?: "page" | "card" | "table" | "text" | "avatar";
  rows?: number;
  className?: string;
}

function Bone({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function LoadingSkeleton({ variant = "card", rows = 3, className }: Props) {
  if (variant === "page") {
    return (
      <div className={cn("p-6 space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Bone className="h-8 w-48" />
          <Bone className="h-8 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <Bone className="h-4 w-24" />
              <Bone className="h-8 w-32" />
              <Bone className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-5 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)}>
        <Bone className="h-10 w-full rounded-lg" />
        {Array.from({ length: rows }).map((_, i) => (
          <Bone key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("rounded-xl border p-5 space-y-3", className)}>
        <Bone className="h-5 w-3/4" />
        <Bone className="h-8 w-1/2" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-2/3" />
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Bone className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Bone
          key={i}
          className={cn("h-4", i === rows - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
