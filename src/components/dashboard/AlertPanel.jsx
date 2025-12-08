import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  Unplug, 
  CircleSlash, 
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const alertIcons = {
  phase_change: RefreshCw,
  transformer_added: Plus,
  overload: AlertTriangle,
  unauthorized_tap: Unplug,
  loose_neutral: CircleSlash,
  voltage_fluctuation: Activity,
};

const severityConfig = {
  info: {
    bg: 'bg-status-info/10',
    border: 'border-status-info/30',
    text: 'text-status-info',
    dot: 'bg-status-info',
  },
  warning: {
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/30',
    text: 'text-status-warning',
    dot: 'bg-status-warning',
  },
  critical: {
    bg: 'bg-status-critical/10',
    border: 'border-status-critical/30',
    text: 'text-status-critical',
    dot: 'bg-status-critical',
  },
};

export function AlertPanel({ alerts, onResolve }) {
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-status-warning" />
          System Alerts
        </h2>
        <span className={cn(
          'px-2.5 py-1 rounded-full text-xs font-semibold',
          unresolvedAlerts.length > 0 ? 'bg-status-critical/20 text-status-critical' : 'bg-status-healthy/20 text-status-healthy'
        )}>
          {unresolvedAlerts.length} Active
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {unresolvedAlerts.map(alert => {
          const Icon = alertIcons[alert.type];
          const config = severityConfig[alert.severity];
          
          return (
            <div 
              key={alert.id}
              className={cn(
                'p-3 rounded-lg border animate-slide-up',
                config.bg,
                config.border,
                alert.severity === 'critical' && 'animate-pulse'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <Icon className={cn('w-4 h-4', config.text)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('w-2 h-2 rounded-full pulse-dot', config.dot)} />
                    <span className={cn('text-xs font-semibold uppercase', config.text)}>
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium mb-1">{alert.message}</p>
                  
                  {alert.action && (
                    <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded mt-2">
                      💡 {alert.action}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                    
                    {onResolve && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => onResolve(alert.id)}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {resolvedAlerts.length > 0 && (
          <>
            <div className="border-t border-border my-4" />
            <p className="text-xs text-muted-foreground mb-2">Recent Resolved</p>
            {resolvedAlerts.slice(0, 2).map(alert => {
              const Icon = alertIcons[alert.type];
              
              return (
                <div 
                  key={alert.id}
                  className="p-3 rounded-lg bg-secondary/30 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm line-through">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-status-healthy" />
                        <span className="text-xs text-status-healthy">{alert.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

