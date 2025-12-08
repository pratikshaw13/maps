import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'healthy' | 'warning' | 'critical';
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status = 'healthy',
  className,
}: MetricCardProps) {
  const statusColors = {
    healthy: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  };

  const glowColors = {
    healthy: 'glow-primary',
    warning: 'glow-warning',
    critical: 'glow-critical',
  };

  return (
    <div
      className={cn(
        'glass-panel p-5 relative overflow-hidden group transition-all duration-300 hover:border-primary/50',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8">
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={cn('metric-value', statusColors[status])}>{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trendValue && (
            <p className={cn(
              'text-xs mt-1.5',
              trend === 'up' ? 'text-status-critical' : 
              trend === 'down' ? 'text-status-healthy' : 
              'text-muted-foreground'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        
        <div className={cn(
          'p-2.5 rounded-lg bg-secondary/50',
          glowColors[status]
        )}>
          <Icon className={cn('w-5 h-5', statusColors[status])} />
        </div>
      </div>
    </div>
  );
}
