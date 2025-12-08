import { cn } from '@/lib/utils';
import { Household, Phase } from '@/types/electrical';
import { Zap, Gauge, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HouseholdCardProps {
  household: Household;
  onPhaseChange?: (id: string, newPhase: Phase) => void;
}

export function HouseholdCard({ household, onPhaseChange }: HouseholdCardProps) {
  const { id, name, address, phase, voltage, current, powerConsumption, trips, status } = household;
  const totalTrips = trips.reduce((a, b) => a + b, 0);
  
  const phaseColors = {
    R: 'bg-phase-r',
    Y: 'bg-phase-y',
    B: 'bg-phase-b',
  };

  const statusConfig = {
    healthy: {
      icon: CheckCircle2,
      color: 'text-status-healthy',
      bg: 'bg-status-healthy/10',
      border: 'border-status-healthy/30',
      label: 'Healthy',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-status-warning',
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
      label: 'Warning',
    },
    critical: {
      icon: AlertTriangle,
      color: 'text-status-critical',
      bg: 'bg-status-critical/10',
      border: 'border-status-critical/30',
      label: 'Critical',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const isLowVoltage = voltage < 200;
  const isHighCurrent = current > 20;

  return (
    <div className={cn(
      'glass-panel p-4 transition-all duration-300 hover:border-primary/30',
      config.border,
      status === 'critical' && 'animate-pulse'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
            phaseColors[phase],
            phase === 'Y' ? 'text-black' : 'text-white'
          )}>
            {phase}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">{address}</p>
          </div>
        </div>
        
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full', config.bg)}>
          <StatusIcon className={cn('w-3.5 h-3.5', config.color)} />
          <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className={cn('w-3.5 h-3.5', isLowVoltage ? 'text-status-warning' : 'text-muted-foreground')} />
          </div>
          <p className={cn('font-mono text-sm font-bold', isLowVoltage && 'text-status-warning')}>
            {voltage}V
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Voltage</p>
        </div>
        
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Gauge className={cn('w-3.5 h-3.5', isHighCurrent ? 'text-status-critical' : 'text-muted-foreground')} />
          </div>
          <p className={cn('font-mono text-sm font-bold', isHighCurrent && 'text-status-critical')}>
            {current.toFixed(1)}A
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Current</p>
        </div>
        
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <p className="font-mono text-sm font-bold text-primary">
            {powerConsumption.toFixed(2)} kW
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Power</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Weekly Trips: <span className={cn('font-bold', totalTrips > 5 ? 'text-status-warning' : 'text-foreground')}>{totalTrips}</span>
        </span>
        
        {status !== 'healthy' && onPhaseChange && (
          <div className="flex gap-1">
            {(['R', 'Y', 'B'] as Phase[]).filter(p => p !== phase).map(p => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                className={cn(
                  'h-6 px-2 text-xs',
                  p === 'R' && 'border-phase-r/50 hover:bg-phase-r/20',
                  p === 'Y' && 'border-phase-y/50 hover:bg-phase-y/20',
                  p === 'B' && 'border-phase-b/50 hover:bg-phase-b/20'
                )}
                onClick={() => onPhaseChange(id, p)}
              >
                → {p}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
