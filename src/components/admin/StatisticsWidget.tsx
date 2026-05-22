/**
 * Statistics Widget Component
 * 
 * Displays a single statistic with icon, label, and value.
 * Used in the admin dashboard to show key metrics.
 */

'use client';

interface StatisticsWidgetProps {
  label: string;
  value: number;
  icon: string;
  isLoading?: boolean;
}

export function StatisticsWidget({
  label,
  value,
  icon,
  isLoading = false,
}: StatisticsWidgetProps) {
  return (
    <div className="p-6 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md hover:border-stone dark:hover:border-stone transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-mute dark:text-mute uppercase tracking-wider mb-2">{label}</p>
          {isLoading ? (
            <div className="h-10 w-20 bg-surface-soft dark:bg-surface-soft rounded-md animate-pulse" />
          ) : (
            <p className="text-4xl font-extrabold text-ink dark:text-ink">{value}</p>
          )}
        </div>
        <span className="text-5xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}
