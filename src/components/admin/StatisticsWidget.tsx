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
    <div className="p-6 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 dark:hover:border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-mute dark:text-mute uppercase tracking-wider mb-3">{label}</p>
          {isLoading ? (
            <div className="h-12 w-24 bg-surface-soft dark:bg-surface-soft rounded-lg animate-pulse" />
          ) : (
            <p className="text-3xl lg:text-4xl font-black text-ink dark:text-ink leading-tight">{value}</p>
          )}
        </div>
        <span className="text-5xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}
