export type Phase = 'R' | 'Y' | 'B';

export interface Household {
  id: string;
  name: string;
  address: string;
  phase: Phase;
  voltage: number;
  current: number;
  powerConsumption: number;
  trips: number[];
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface PhaseLoad {
  phase: Phase;
  load: number;
  maxCapacity: number;
  households: number;
  status: 'normal' | 'overloaded';
}

export interface Transformer {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  phases: {
    R: number;
    Y: number;
    B: number;
  };
  status: 'active' | 'overloaded' | 'added';
}

export interface Alert {
  id: string;
  type: 'phase_change' | 'transformer_added' | 'overload' | 'unauthorized_tap' | 'loose_neutral' | 'voltage_fluctuation';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action?: string;
  timestamp: Date;
  resolved: boolean;
  householdId?: string;
}

export interface PowerBalance {
  totalTransmission: number;
  totalConsumption: number;
  losses: number;
  unauthorized: number;
}
