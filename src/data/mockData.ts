import { Household, PhaseLoad, Transformer, Alert, PowerBalance, Phase } from '@/types/electrical';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const generateHouseholds = (): Household[] => [
  {
    id: 'H001',
    name: 'House 001',
    address: '12 Main Street',
    phase: 'R',
    voltage: 228,
    current: 15.2,
    powerConsumption: 3.46,
    trips: [0, 1, 0, 2, 0, 1, 0],
    status: 'healthy',
    lastUpdated: new Date(),
  },
  {
    id: 'H002',
    name: 'House 002',
    address: '14 Main Street',
    phase: 'R',
    voltage: 195,
    current: 22.8,
    powerConsumption: 4.45,
    trips: [1, 2, 1, 3, 2, 1, 0],
    status: 'warning',
    lastUpdated: new Date(),
  },
  {
    id: 'H003',
    name: 'House 003',
    address: '16 Main Street',
    phase: 'Y',
    voltage: 232,
    current: 12.5,
    powerConsumption: 2.90,
    trips: [0, 0, 0, 1, 0, 0, 0],
    status: 'healthy',
    lastUpdated: new Date(),
  },
  {
    id: 'H004',
    name: 'House 004',
    address: '18 Main Street',
    phase: 'Y',
    voltage: 235,
    current: 10.8,
    powerConsumption: 2.54,
    trips: [0, 0, 0, 0, 0, 0, 0],
    status: 'healthy',
    lastUpdated: new Date(),
  },
  {
    id: 'H005',
    name: 'House 005',
    address: '20 Main Street',
    phase: 'B',
    voltage: 180,
    current: 28.5,
    powerConsumption: 5.13,
    trips: [2, 3, 2, 4, 3, 2, 1],
    status: 'critical',
    lastUpdated: new Date(),
  },
  {
    id: 'H006',
    name: 'House 006',
    address: '22 Main Street',
    phase: 'B',
    voltage: 225,
    current: 14.2,
    powerConsumption: 3.20,
    trips: [0, 1, 0, 1, 0, 0, 0],
    status: 'healthy',
    lastUpdated: new Date(),
  },
  {
    id: 'H007',
    name: 'House 007',
    address: '24 Main Street',
    phase: 'R',
    voltage: 230,
    current: 14.5,
    powerConsumption: 3.34,
    trips: [0, 0, 0, 1, 0, 0, 0],
    status: 'healthy',
    lastUpdated: new Date(),
  },
  {
    id: 'H008',
    name: 'House 008',
    address: '26 Main Street',
    phase: 'Y',
    voltage: 230,
    current: 11.5,
    powerConsumption: 2.65,
    trips: [0, 0, 1, 0, 0, 0, 0],
    status: 'healthy',
    lastUpdated: new Date(),
  },
];

export const generatePhaseLoads = (households: Household[]): PhaseLoad[] => {
  const phases: Phase[] = ['R', 'Y', 'B'];
  
  return phases.map(phase => {
    const phaseHouseholds = households.filter(h => h.phase === phase);
    const totalLoad = phaseHouseholds.reduce((sum, h) => sum + h.powerConsumption, 0);
    const maxCapacity = 15; // kW per phase
    
    return {
      phase,
      load: totalLoad,
      maxCapacity,
      households: phaseHouseholds.length,
      status: totalLoad > maxCapacity * 0.85 ? 'overloaded' : 'normal',
    };
  });
};

export const generateTransformer = (households: Household[]): Transformer => {
  const phases = generatePhaseLoads(households);
  const totalLoad = phases.reduce((sum, p) => sum + p.load, 0);
  
  return {
    id: 'TF001',
    name: 'LT Box - Sector 7',
    capacity: 50, // kVA
    currentLoad: totalLoad,
    phases: {
      R: phases.find(p => p.phase === 'R')?.load || 0,
      Y: phases.find(p => p.phase === 'Y')?.load || 0,
      B: phases.find(p => p.phase === 'B')?.load || 0,
    },
    status: totalLoad > 45 ? 'overloaded' : 'active',
  };
};

export const generateAlerts = (): Alert[] => [
  {
    id: 'A001',
    type: 'overload',
    severity: 'critical',
    message: 'House 005 experiencing voltage drop (180V)',
    action: 'Recommend phase change to B or transformer upgrade',
    timestamp: new Date(Date.now() - 1800000),
    resolved: false,
    householdId: 'H005',
  },
  {
    id: 'A002',
    type: 'overload',
    severity: 'warning',
    message: 'House 002 high current draw detected (22.8A)',
    action: 'Check for excessive load. Consider load distribution.',
    timestamp: new Date(Date.now() - 3600000),
    resolved: false,
    householdId: 'H002',
  },
];

export const generatePowerBalance = (households: Household[]): PowerBalance => {
  const totalConsumption = households.reduce((sum, h) => sum + h.powerConsumption, 0);
  const losses = totalConsumption * 0.03; // 3% technical losses
  const unauthorized = 1.2; // Unauthorized tapping
  const totalTransmission = totalConsumption + losses + unauthorized;
  
  return {
    totalTransmission,
    totalConsumption,
    losses,
    unauthorized,
  };
};

export const getTripChartData = (households: Household[]) => {
  return daysOfWeek.map((day, index) => ({
    day,
    ...households.reduce((acc, h) => ({
      ...acc,
      [h.id]: h.trips[index],
    }), {}),
    total: households.reduce((sum, h) => sum + h.trips[index], 0),
  }));
};
