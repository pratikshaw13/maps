import { useState, useEffect } from 'react';
import { Household, Phase, Transformer, Alert } from '@/types/electrical';
import { 
  generateHouseholds, 
  generatePhaseLoads, 
  generateTransformer, 
  generateAlerts,
  generatePowerBalance 
} from '@/data/mockData';
import { Header } from '@/components/dashboard/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PhaseIndicator } from '@/components/dashboard/PhaseIndicator';
import { HouseholdCard } from '@/components/dashboard/HouseholdCard';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { TransformerStatus } from '@/components/dashboard/TransformerStatus';
import { PowerBalanceCard } from '@/components/dashboard/PowerBalanceCard';
import { TripChart } from '@/components/dashboard/TripChart';
import { AnomalyPanel } from '@/components/dashboard/AnomalyPanel';
import { Zap, Gauge, AlertTriangle, Home, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [households, setHouseholds] = useState<Household[]>(generateHouseholds());
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());
  const [additionalTransformers, setAdditionalTransformers] = useState<Transformer[]>([]);
  const { toast } = useToast();

  const phaseLoads = generatePhaseLoads(households);
  const transformer = generateTransformer(households);
  const powerBalance = generatePowerBalance(households);

  const totalPower = households.reduce((sum, h) => sum + h.powerConsumption, 0);
  const avgVoltage = households.reduce((sum, h) => sum + h.voltage, 0) / households.length;
  const totalTrips = households.reduce((sum, h) => sum + h.trips.reduce((a, b) => a + b, 0), 0);
  const activeAlerts = alerts.filter(a => !a.resolved).length;

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHouseholds(prev => prev.map(h => ({
        ...h,
        voltage: h.voltage + (Math.random() - 0.5) * 2,
        current: Math.max(5, h.current + (Math.random() - 0.5) * 0.5),
        powerConsumption: Math.max(1, h.powerConsumption + (Math.random() - 0.5) * 0.1),
        lastUpdated: new Date(),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePhaseChange = (householdId: string, newPhase: Phase) => {
    setHouseholds(prev => prev.map(h => 
      h.id === householdId 
        ? { ...h, phase: newPhase, status: 'healthy' as const }
        : h
    ));

    const household = households.find(h => h.id === householdId);
    
    const newAlert: Alert = {
      id: `A${Date.now()}`,
      type: 'phase_change',
      severity: 'info',
      message: `${household?.name} phase changed to ${newPhase}`,
      action: 'Load balanced successfully. Phase distribution optimized.',
      timestamp: new Date(),
      resolved: true,
      householdId,
    };

    setAlerts(prev => [newAlert, ...prev]);

    toast({
      title: "Phase Change Complete",
      description: `${household?.name} successfully moved to Phase ${newPhase}`,
    });
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, resolved: true } : a
    ));

    toast({
      title: "Alert Resolved",
      description: "Issue marked as resolved",
    });
  };

  const handleAddTransformer = () => {
    const newTransformer: Transformer = {
      id: `TF00${additionalTransformers.length + 2}`,
      name: `LT Box - Sector 7 (Aux ${additionalTransformers.length + 1})`,
      capacity: 25,
      currentLoad: 0,
      phases: { R: 0, Y: 0, B: 0 },
      status: 'added',
    };

    setAdditionalTransformers(prev => [...prev, newTransformer]);

    const newAlert: Alert = {
      id: `A${Date.now()}`,
      type: 'transformer_added',
      severity: 'info',
      message: `New transformer ${newTransformer.name} added`,
      action: `Capacity increased by ${newTransformer.capacity} kVA. All households now receiving adequate power supply.`,
      timestamp: new Date(),
      resolved: true,
    };

    setAlerts(prev => [newAlert, ...prev]);

    toast({
      title: "Transformer Added",
      description: `${newTransformer.name} is now active (+${newTransformer.capacity} kVA)`,
    });
  };

  const handleRefresh = () => {
    setHouseholds(generateHouseholds());
    toast({
      title: "Data Refreshed",
      description: "All readings updated",
    });
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        <Header alertCount={activeAlerts} onRefresh={handleRefresh} />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Power"
            value={totalPower.toFixed(2)}
            unit="kW"
            icon={Zap}
            status={totalPower > 40 ? 'warning' : 'healthy'}
            trend="stable"
            trendValue="Real-time"
          />
          <MetricCard
            title="Avg Voltage"
            value={avgVoltage.toFixed(0)}
            unit="V"
            icon={Gauge}
            status={avgVoltage < 210 ? 'warning' : 'healthy'}
            trend={avgVoltage < 210 ? 'down' : 'stable'}
            trendValue={avgVoltage < 210 ? 'Below normal' : 'Normal'}
          />
          <MetricCard
            title="Weekly Trips"
            value={totalTrips}
            icon={AlertTriangle}
            status={totalTrips > 20 ? 'critical' : totalTrips > 10 ? 'warning' : 'healthy'}
          />
          <MetricCard
            title="Households"
            value={households.length}
            icon={Home}
            status="healthy"
          />
        </div>

        {/* Phase Distribution */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Phase Load Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phaseLoads.map(pl => (
              <PhaseIndicator key={pl.phase} phaseLoad={pl} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Charts */}
          <div className="xl:col-span-2 space-y-6">
            <TripChart households={households} />
            <PowerBalanceCard balance={powerBalance} />
          </div>

          {/* Right Column - Status */}
          <div className="space-y-6">
            <TransformerStatus 
              transformer={transformer} 
              onAddTransformer={handleAddTransformer}
              additionalTransformers={additionalTransformers}
            />
            <AlertPanel 
              alerts={alerts} 
              onResolve={handleResolveAlert}
            />
          </div>
        </div>

        {/* Households Grid */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Household Monitoring
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {households.map(h => (
              <HouseholdCard 
                key={h.id} 
                household={h}
                onPhaseChange={handlePhaseChange}
              />
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <AnomalyPanel households={households} />

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>PowerGrid Monitor v1.0 — Real-time Household Electrical Management System</p>
          <p className="mt-1">Last sync: {new Date().toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
