import { cn } from '@/lib/utils';
import { Box, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TransformerStatus({ 
  transformer, 
  onAddTransformer,
  additionalTransformers = []
}) {
  const loadPercentage = (transformer.currentLoad / transformer.capacity) * 100;
  const isOverloaded = loadPercentage > 90;
  const isWarning = loadPercentage > 75;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Box className="w-5 h-5 text-status-info" />
          Transformer Status
        </h2>
        {isOverloaded && onAddTransformer && (
          <Button
            size="sm"
            onClick={onAddTransformer}
            className="bg-status-info hover:bg-status-info/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Transformer
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Main Transformer */}
        <div className={cn(
          'p-4 rounded-lg border transition-all',
          isOverloaded ? 'border-status-critical/50 bg-status-critical/5' :
          isWarning ? 'border-status-warning/50 bg-status-warning/5' :
          'border-status-healthy/50 bg-status-healthy/5'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold">{transformer.name}</p>
              <p className="text-xs text-muted-foreground">ID: {transformer.id}</p>
            </div>
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              isOverloaded ? 'bg-status-critical/20 text-status-critical' :
              isWarning ? 'bg-status-warning/20 text-status-warning' :
              'bg-status-healthy/20 text-status-healthy'
            )}>
              {isOverloaded ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold uppercase">
                {isOverloaded ? 'Overloaded' : isWarning ? 'High Load' : 'Normal'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase mb-1">Current Load</p>
              <p className="font-mono text-xl font-bold text-foreground">
                {transformer.currentLoad.toFixed(2)} <span className="text-sm text-muted-foreground">kW</span>
              </p>
            </div>
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase mb-1">Capacity</p>
              <p className="font-mono text-xl font-bold text-foreground">
                {transformer.capacity} <span className="text-sm text-muted-foreground">kVA</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Load Distribution</span>
              <span className={cn(
                'font-semibold',
                isOverloaded ? 'text-status-critical' :
                isWarning ? 'text-status-warning' :
                'text-status-healthy'
              )}>{loadPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isOverloaded ? 'bg-status-critical' :
                  isWarning ? 'bg-status-warning' :
                  'bg-status-healthy'
                )}
                style={{ width: `${Math.min(loadPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {(['R', 'Y', 'B']).map(phase => (
              <div key={phase} className="text-center p-2 bg-background/30 rounded-lg">
                <div className={cn(
                  'w-6 h-6 rounded mx-auto mb-1 flex items-center justify-center text-xs font-bold',
                  phase === 'R' && 'bg-phase-r text-white',
                  phase === 'Y' && 'bg-phase-y text-black',
                  phase === 'B' && 'bg-phase-b text-white'
                )}>
                  {phase}
                </div>
                <p className="font-mono text-sm font-bold">
                  {transformer.phases[phase].toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground">kW</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Transformers */}
        {additionalTransformers.map(tf => (
          <div 
            key={tf.id}
            className="p-4 rounded-lg border border-status-info/50 bg-status-info/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-status-info" />
                <div>
                  <p className="font-semibold text-sm">{tf.name}</p>
                  <p className="text-xs text-muted-foreground">Added to handle overflow</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-status-info">+{tf.capacity} kVA</p>
                <p className="text-xs text-status-healthy">● Active</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

