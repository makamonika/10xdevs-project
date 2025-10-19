import { formatNumber, formatCTR } from "@/lib/table-utils.tsx";
import type { GroupMetricsDto } from "@/types";

export interface MetricsSummaryProps {
  metrics: GroupMetricsDto;
  queryCount: number;
}

/**
 * Displays aggregated metrics for a group in compact stat cards
 * Consistent formatting with queries table
 */
export function MetricsSummary({ metrics, queryCount }: MetricsSummaryProps) {
  const stats = [
    {
      label: "Queries",
      value: formatNumber(queryCount),
    },
    {
      label: "Impressions",
      value: formatNumber(metrics.impressions),
    },
    {
      label: "Clicks",
      value: formatNumber(metrics.clicks),
    },
    {
      label: "CTR",
      value: formatCTR(metrics.ctr),
    },
    {
      label: "Avg Position",
      value: formatNumber(metrics.avgPosition, 1),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border bg-card p-4 shadow-xs"
          role="group"
          aria-label={`${stat.label}: ${stat.value}`}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
