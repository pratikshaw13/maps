import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, AlertTriangle, Home, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const phaseMap = { 0: "R", 1: "Y", 2: "B" };
const phaseColors = {
  R: { bg: "#dc3545", text: "#fff", label: "Red Phase" },
  Y: { bg: "#ffc107", text: "#000", label: "Yellow Phase" },
  B: { bg: "#0d6efd", text: "#fff", label: "Blue Phase" },
};

export default function LTDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ltData, setLtData] = useState(null);
  const [housesByPhase, setHousesByPhase] = useState({ R: [], Y: [], B: [] });
  const [phasePower, setPhasePower] = useState({ R: 0, Y: 0, B: 0 });
  const [unauthorizedWarnings, setUnauthorizedWarnings] = useState({ R: false, Y: false, B: false });

  useEffect(() => {
    // Get LT data from localStorage or generate it
    // For now, we'll get it from the map's housesMap
    const storedHousesMap = localStorage.getItem('housesMap');
    const storedLtNodes = localStorage.getItem('ltNodes');
    
    if (storedHousesMap && storedLtNodes) {
      const housesMap = JSON.parse(storedHousesMap);
      const ltNodes = JSON.parse(storedLtNodes);
      const lt = ltNodes.find(n => n.id === id);
      
      if (lt) {
        setLtData(lt);
        
        // Collect all houses for this LT box by phase
        const houses = { R: [], Y: [], B: [] };
        const phaseTotalPower = { R: 0, Y: 0, B: 0 };
        
        for (let breakerIndex = 0; breakerIndex < 3; breakerIndex++) {
          const phase = phaseMap[breakerIndex];
          const segKey = `${id}-${breakerIndex}`;
          const phaseHouses = housesMap[segKey];
          
          if (phaseHouses) {
            phaseHouses.forEach((arr) => {
              arr.forEach((house) => {
                // Parse power consumption (could be number or calculated from voltage/current)
                let power = 0;
                if (typeof house.powerConsumption === 'number') {
                  power = house.powerConsumption;
                } else if (typeof house.powerConsumption === 'string') {
                  power = parseFloat(house.powerConsumption) || 0;
                } else {
                  // Calculate from voltage and current if powerConsumption not available
                  const voltageNum = parseFloat(house.voltage.replace(" V", "")) || 0;
                  const currentNum = parseFloat(house.current.replace(" A", "")) || 0;
                  power = (voltageNum * currentNum) / 1000; // kW
                }
                
                houses[phase].push({
                  number: house.number,
                  voltage: house.voltage,
                  current: house.current,
                  power: power,
                  status: house.status,
                  phase: house.phase,
                });
                phaseTotalPower[phase] += power;
              });
            });
          }
        }
        
        setHousesByPhase(houses);
        setPhasePower(phaseTotalPower);
        
        // Check for unauthorized consumption
        // If total phase power (from breaker) is much higher than sum of household power
        const warnings = { R: false, Y: false, B: false };
        
        lt.breakers.forEach((breaker, idx) => {
          const phase = phaseMap[idx];
          // Calculate total phase power from breaker current
          // Use standard phase voltage of 230V for LT distribution
          const phaseVoltage = 230; // V (standard LT phase voltage)
          const breakerCurrent = parseFloat(breaker.current.replace(" A", ""));
          const totalPhasePower = (phaseVoltage * breakerCurrent) / 1000; // kW
          
          const householdSumPower = phaseTotalPower[phase];
          const difference = totalPhasePower - householdSumPower;
          // Consider technical losses (3-5%) and measurement variations, so threshold is 15% of household power
          // Or minimum 1 kW difference to avoid false positives
          const threshold = Math.max(householdSumPower * 0.15, 1.0); // 15% or minimum 1.0 kW
          
          // If difference is significant (more than threshold), unauthorized consumption detected
          if (difference > threshold && householdSumPower > 0 && totalPhasePower > householdSumPower) {
            warnings[phase] = true;
          }
        });
        
        setUnauthorizedWarnings(warnings);
      }
    } else {
      // Fallback: create mock data
      const mockLT = {
        id: id,
        name: id,
        breakers: [
          { name: `CB-${id}-1`, voltage: "11 kV", current: "140 A", status: "ON" },
          { name: `CB-${id}-2`, voltage: "13 kV", current: "160 A", status: "ON" },
          { name: `CB-${id}-3`, voltage: "15 kV", current: "180 A", status: "ON" },
        ],
      };
      setLtData(mockLT);
    }
  }, [id]);

  if (!ltData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center">
          <p className="text-muted-foreground">LT Box not found</p>
          <Button onClick={() => navigate('/map')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  const totalHouseholdPower = phasePower.R + phasePower.Y + phasePower.B;
  const totalHouses = housesByPhase.R.length + housesByPhase.Y.length + housesByPhase.B.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/map')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{ltData.name}</h1>
              <p className="text-muted-foreground">Low Tension Box Dashboard</p>
            </div>
          </div>
        </div>

        {/* Unauthorized Consumption Warnings */}
        {(unauthorizedWarnings.R || unauthorizedWarnings.Y || unauthorizedWarnings.B) && (
          <div className="mb-6 glass-panel p-4 border-2 border-status-warning">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-status-warning" />
              <h2 className="text-lg font-semibold text-status-warning">Unauthorized Consumption Detected</h2>
            </div>
            <div className="space-y-2">
              {unauthorizedWarnings.R && (
                <div className="flex items-center gap-2 text-status-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Red Phase (R): Significant power difference detected. Patrolling required.</span>
                </div>
              )}
              {unauthorizedWarnings.Y && (
                <div className="flex items-center gap-2 text-status-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Yellow Phase (Y): Significant power difference detected. Patrolling required.</span>
                </div>
              )}
              {unauthorizedWarnings.B && (
                <div className="flex items-center gap-2 text-status-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Blue Phase (B): Significant power difference detected. Patrolling required.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Houses</span>
            </div>
            <p className="text-2xl font-bold">{totalHouses}</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-status-warning" />
              <span className="text-sm text-muted-foreground">Total Power</span>
            </div>
            <p className="text-2xl font-bold">{totalHouseholdPower.toFixed(2)} kW</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-status-critical" />
              <span className="text-sm text-muted-foreground">Active Breakers</span>
            </div>
            <p className="text-2xl font-bold">
              {ltData.breakers.filter(b => b.status === "ON").length} / {ltData.breakers.length}
            </p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-status-warning" />
              <span className="text-sm text-muted-foreground">Warnings</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.values(unauthorizedWarnings).filter(w => w).length}
            </p>
          </div>
        </div>

        {/* Phase-wise Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['R', 'Y', 'B'] as const).map((phase) => {
            const phaseInfo = phaseColors[phase];
            const houses = housesByPhase[phase];
            const phaseSumPower = phasePower[phase];
            const breaker = ltData.breakers[phase === 'R' ? 0 : phase === 'Y' ? 1 : 2];
            const phaseVoltage = 230; // Standard LT phase voltage
            const breakerCurrent = parseFloat(breaker.current.replace(" A", ""));
            const totalPhasePower = (phaseVoltage * breakerCurrent) / 1000; // kW
            const difference = totalPhasePower - phaseSumPower;
            const hasUnauthorized = unauthorizedWarnings[phase];

            return (
              <div key={phase} className="glass-panel p-5">
                <div
                  className="p-3 rounded-lg mb-4 text-center"
                  style={{
                    background: phaseInfo.bg,
                    color: phaseInfo.text,
                  }}
                >
                  <h2 className="text-lg font-bold">{phaseInfo.label} ({phase})</h2>
                </div>

                {/* Phase Power Summary */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                    <span className="text-sm text-muted-foreground">Household Power Sum:</span>
                    <span className="font-bold">{phaseSumPower.toFixed(2)} kW</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                    <span className="text-sm text-muted-foreground">Total Phase Power:</span>
                    <span className="font-bold">{totalPhasePower.toFixed(2)} kW</span>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded ${
                    hasUnauthorized ? 'bg-status-warning/20 border border-status-warning' : 'bg-secondary/30'
                  }`}>
                    <span className="text-sm text-muted-foreground">Difference:</span>
                    <span className={`font-bold ${hasUnauthorized ? 'text-status-warning' : ''}`}>
                      {difference.toFixed(2)} kW
                    </span>
                  </div>
                </div>

                {/* Unauthorized Warning */}
                {hasUnauthorized && (
                  <div className="mb-4 p-3 bg-status-warning/20 border border-status-warning rounded-lg">
                    <div className="flex items-center gap-2 text-status-warning">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Patrolling Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unauthorized consumption detected. Power difference exceeds threshold.
                    </p>
                  </div>
                )}

                {/* Houses List */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Houses ({houses.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {houses.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No houses connected
                      </p>
                    ) : (
                      houses.map((house, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-secondary/30 rounded-lg text-sm"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">House #{house.number}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              house.status === "ON" 
                                ? "bg-status-healthy/20 text-status-healthy" 
                                : "bg-status-critical/20 text-status-critical"
                            }`}>
                              {house.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Voltage:</span>
                              <div className="font-mono">{house.voltage}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current:</span>
                              <div className="font-mono">{house.current}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Power:</span>
                              <div className="font-mono font-bold">{house.power.toFixed(2)} kW</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

