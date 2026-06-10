import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "protective" | "positive" | "warning";
}

export function Card({ className, accent, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-elevated rounded-lg border border-border p-4",
        accent === "protective" && "border-l-2 border-l-protective border-t-border border-r-border border-b-border",
        accent === "positive" && "border-l-2 border-l-positive border-t-border border-r-border border-b-border",
        accent === "warning" && "border-l-2 border-l-warning border-t-border border-r-border border-b-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm font-medium text-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-muted-foreground leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}
