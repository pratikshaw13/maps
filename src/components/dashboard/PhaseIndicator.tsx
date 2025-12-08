import { cn } from '@/lib/utils';
import { Phase, PhaseLoad } from '@/types/electrical';

interface PhaseIndicatorProps {
  phaseLoad: PhaseLoad;
  onClick?: () => void;
}

export function PhaseIndicator({ phaseLoad, onClick }: PhaseIndicatorProps) {
  const { phase, load, maxCapacity, households, status } = phaseLoad;
  const percentage = (load / maxCapacity) * 100;
  
  const phaseColors = {
    R: 'bg-phase-r',
    Y: 'bg-phase-y',
    B: 'bg-phase-b',
  };

  const phaseTextColors = {
    R: 'text-phase-r',
    Y: 'text-phase-y',
    B: 'text-phase-b',
  };

  const phaseBorderColors = {
    R: 'border-phase-r/50',
    Y: 'border-phase-y/50',
    B: 'border-phase-b/50',
  };

  return (
    <div 
      className={cn(
        'glass-panel p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]',
        phaseBorderColors[phase],
        status === 'overloaded' && 'animate-pulse border-status-critical'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
            phaseColors[phase],
            phase === 'Y' ? 'text-black' : 'text-white'
          )}>
            {phase}
          </div>
          <div>
            <p className="font-semibold">Phase {phase}</p>
            <p className="text-xs text-muted-foreground">{households} households</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={cn('font-mono text-lg font-bold', phaseTextColors[phase])}>
            {load.toFixed(2)} kW
          </p>
          <p className="text-xs text-muted-foreground">
            of {maxCapacity} kW max
          </p>
        </div>
      </div>
      
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
            phaseColors[phase],
            percentage > 85 && 'animate-pulse'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2">
        <span className={cn(
          'text-xs font-semibold uppercase',
          status === 'overloaded' ? 'text-status-critical' : 'text-status-healthy'
        )}>
          {status === 'overloaded' ? '⚠ Overloaded' : '● Normal'}
        </span>
        <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}
