import { cn } from '@/lib/utils';
import { PowerBalance } from '@/types/electrical';
import { Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PowerBalanceCardProps {
  balance: PowerBalance;
}

export function PowerBalanceCard({ balance }: PowerBalanceCardProps) {
  const { totalTransmission, totalConsumption, losses, unauthorized } = balance;
  const hasUnauthorizedTap = unauthorized > 0.5;
  const isBalanced = Math.abs(totalTransmission - (totalConsumption + losses + unauthorized)) < 0.1;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Power Balance Verification
        </h2>
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
          isBalanced && !hasUnauthorizedTap ? 'bg-status-healthy/20 text-status-healthy' : 'bg-status-warning/20 text-status-warning'
        )}>
          {isBalanced && !hasUnauthorizedTap ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span className="text-xs font-semibold uppercase">
            {isBalanced && !hasUnauthorizedTap ? 'Balanced' : 'Discrepancy'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Visual Balance */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Transmission</span>
            <span className="text-xs text-muted-foreground">Consumption + Losses</span>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-status-info/20 rounded-lg flex items-center justify-center border border-status-info/30">
              <span className="font-mono font-bold text-status-info">
                {totalTransmission.toFixed(2)} kW
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">=</div>
            <div className="flex-1 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <span className="font-mono font-bold text-primary">
                {(totalConsumption + losses + unauthorized).toFixed(2)} kW
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
            <span className="text-sm">Household Consumption</span>
            <span className="font-mono font-semibold">{totalConsumption.toFixed(2)} kW</span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
            <span className="text-sm">Technical Losses (3%)</span>
            <span className="font-mono font-semibold text-muted-foreground">{losses.toFixed(2)} kW</span>
          </div>
          
          <div className={cn(
            'flex items-center justify-between p-2 rounded-lg',
            hasUnauthorizedTap ? 'bg-status-critical/10 border border-status-critical/30' : 'bg-secondary/30'
          )}>
            <span className={cn(
              'text-sm flex items-center gap-2',
              hasUnauthorizedTap && 'text-status-critical'
            )}>
              {hasUnauthorizedTap && <AlertTriangle className="w-4 h-4" />}
              Unaccounted / Unauthorized
            </span>
            <span className={cn(
              'font-mono font-semibold',
              hasUnauthorizedTap ? 'text-status-critical' : 'text-muted-foreground'
            )}>
              {unauthorized.toFixed(2)} kW
            </span>
          </div>
        </div>

        {hasUnauthorizedTap && (
          <div className="p-3 bg-status-critical/10 border border-status-critical/30 rounded-lg">
            <p className="text-sm text-status-critical font-medium mb-1">
              ⚠️ Possible Unauthorized Tapping Detected
            </p>
            <p className="text-xs text-muted-foreground">
              {unauthorized.toFixed(2)} kW power loss unaccounted for. Recommend immediate field inspection of line segments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
