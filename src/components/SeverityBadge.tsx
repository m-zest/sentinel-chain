import { severityClasses, severityDotClasses, severityLabel, type Severity } from "@/lib/severity";
import { cn } from "@/lib/utils";

export function SeverityBadge({
  severity,
  className,
  pulse = false,
}: {
  severity: Severity;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider font-mono",
        severityClasses[severity],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          severityDotClasses[severity],
          pulse && severity === "critical" && "sp-pulse",
        )}
      />
      {severityLabel[severity]}
    </span>
  );
}
