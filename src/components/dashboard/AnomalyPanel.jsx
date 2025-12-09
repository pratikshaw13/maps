import { cn } from '@/lib/utils';
import { 
  Unplug, 
  CircleSlash, 
  Activity, 
  Wrench,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function AnomalyPanel({ households }) {
  const lowVoltageHouses = households.filter(h => h.voltage < 200);
  const highCurrentHouses = households.filter(h => h.current > 20);
  const highTripHouses = households.filter(h => h.trips.reduce((a, b) => a + b, 0) > 5);

  const anomalies = [];

  if (lowVoltageHouses.length > 0) {
    anomalies.push({
      type: 'low_voltage',
      icon: Activity,
      title: 'Low Voltage Detected',
      description: `${lowVoltageHouses.length} household(s) experiencing voltage below 200V`,
      solution: 'Check transformer tap settings, inspect for loose connections, verify neutral integrity',
      severity: 'critical',
      affected: lowVoltageHouses.map(h => h.name),
    });
  }

  if (highCurrentHouses.length > 0) {
    anomalies.push({
      type: 'high_current',
      icon: AlertTriangle,
      title: 'High Current Draw',
      description: `${highCurrentHouses.length} household(s) drawing current above 20A`,
      solution: 'Review load distribution, consider phase change, or upgrade service cable',
      severity: 'warning',
      affected: highCurrentHouses.map(h => h.name),
    });
  }

  // Always show these potential issues
  anomalies.push({
    type: 'loose_neutral',
    icon: CircleSlash,
    title: 'Potential Loose Neutral',
    description: 'Voltage imbalance may indicate loose neutral connection',
    solution: 'Dispatch technician to inspect and tighten neutral connections at junction boxes and service entries',
    severity: 'warning',
  });

  anomalies.push({
    type: 'unauthorized_tap',
    icon: Unplug,
    title: 'Unauthorized Tapping Risk',
    description: 'Power loss discrepancy detected in transmission balance',
    solution: 'Conduct field inspection of line segments, install smart meters, verify all connections',
    severity: 'critical',
  });

  if (highTripHouses.length > 0) {
    anomalies.push({
      type: 'voltage_fluctuation',
      icon: Activity,
      title: 'Frequent Tripping',
      description: `${highTripHouses.length} household(s) with excessive weekly trips`,
      solution: 'Investigate overload conditions, check MCB ratings, consider phase redistribution',
      severity: 'warning',
      affected: highTripHouses.map(h => h.name),
    });
  }

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Wrench className="w-5 h-5 text-status-warning" />
          Anomaly Detection & Solutions
        </h2>
        <span className={cn(
          'px-2.5 py-1 rounded-full text-xs font-semibold',
          anomalies.some(a => a.severity === 'critical') 
            ? 'bg-status-critical/20 text-status-critical'
            : 'bg-status-warning/20 text-status-warning'
        )}>
          {anomalies.length} Issues
        </span>
      </div>

      <div className="space-y-3">
        {anomalies.slice(0, 3).map((anomaly, index) => {
          const Icon = anomaly.icon;
          const isCritical = anomaly.severity === 'critical';
          
          return (
            <div 
              key={index}
              className={cn(
                'p-4 rounded-lg border',
                isCritical 
                  ? 'bg-status-critical/5 border-status-critical/30'
                  : 'bg-status-warning/5 border-status-warning/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  isCritical ? 'bg-status-critical/20' : 'bg-status-warning/20'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    isCritical ? 'text-status-critical' : 'text-status-warning'
                  )} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{anomaly.title}</h3>
                    <span className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 rounded',
                      isCritical 
                        ? 'bg-status-critical/20 text-status-critical'
                        : 'bg-status-warning/20 text-status-warning'
                    )}>
                      {anomaly.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {anomaly.description}
                  </p>
                  
                  {anomaly.affected && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {anomaly.affected.map(name => (
                        <span 
                          key={name}
                          className="text-[10px] px-1.5 py-0.5 bg-secondary rounded"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 p-2 bg-background/50 rounded mt-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground">
                      <strong>Solution:</strong> {anomaly.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

