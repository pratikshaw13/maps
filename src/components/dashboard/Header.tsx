import { cn } from '@/lib/utils';
import { Zap, RefreshCw, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface HeaderProps {
  alertCount: number;
  onRefresh?: () => void;
}

export function Header({ alertCount, onRefresh }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="glass-panel p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg glow-primary">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PowerGrid Monitor</h1>
              <p className="text-xs text-muted-foreground">Household Management Dashboard</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 ml-8">
            <div className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="font-mono text-sm">{currentTime.toLocaleTimeString()}</p>
            <p className="text-xs text-muted-foreground">{currentTime.toLocaleDateString()}</p>
          </div>

          <div className="h-8 w-px bg-border hidden sm:block" />

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            className="relative"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-status-critical text-[10px] font-bold rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
