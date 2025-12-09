import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateHouseholds } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Gauge, Activity, AlertTriangle, Mail } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HouseholdDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [household, setHousehold] = useState(null);
  const [emailPopup, setEmailPopup] = useState({ show: false, time: null, trips: 0 });
  const [voltageHistory, setVoltageHistory] = useState([]);
  const [powerHistory, setPowerHistory] = useState([]);

  useEffect(() => {
    const households = generateHouseholds();
    const found = households.find(h => h.id === id);
    if (found) {
      setHousehold(found);
      
      // Generate historical data for voltage and power (last 24 hours, hourly)
      const now = new Date();
      const history = [];
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        history.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          hour: time.getHours(),
          voltage: found.voltage + (Math.random() * 20 - 10), // Add some variation
          power: found.powerConsumption + (Math.random() * 0.5 - 0.25),
        });
      }
      setVoltageHistory(history);
      setPowerHistory(history);
    }
  }, [id]);

  // Check for high trips at particular times and show email popup
  useEffect(() => {
    if (!household) return;

    // Check if current has exceeded (load limit exceeded fault)
    const currentNum = household.current;
    const hasLoadLimitExceeded = currentNum > 20;

    if (hasLoadLimitExceeded) {
      // Find time periods with high trips
      const highTripThreshold = 3; // Consider 3+ trips as high
      household.trips.forEach((tripCount, dayIndex) => {
        if (tripCount >= highTripThreshold) {
          const day = daysOfWeek[dayIndex];
          // Show popup for high trip days
          if (!emailPopup.show) {
            setEmailPopup({
              show: true,
              time: day,
              trips: tripCount,
            });
          }
        }
      });
    }
  }, [household, emailPopup.show]);

  if (!household) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Household not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tripData = daysOfWeek.map((day, index) => ({
    day,
    trips: household.trips[index],
  }));

  const statusConfig = {
    healthy: { color: 'text-status-healthy', bg: 'bg-status-healthy/10' },
    warning: { color: 'text-status-warning', bg: 'bg-status-warning/10' },
    critical: { color: 'text-status-critical', bg: 'bg-status-critical/10' },
  };

  const config = statusConfig[household.status];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{household.name}</h1>
              <p className="text-muted-foreground">{household.address}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${config.bg}`}>
            <span className={`font-semibold ${config.color}`}>
              {household.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-status-warning" />
              <span className="text-sm text-muted-foreground">Phase Voltage</span>
            </div>
            <p className="text-2xl font-bold">{household.voltage.toFixed(2)}V</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-status-critical" />
              <span className="text-sm text-muted-foreground">Line Current</span>
            </div>
            <p className="text-2xl font-bold">{household.current.toFixed(1)}A</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Power</span>
            </div>
            <p className="text-2xl font-bold">{household.powerConsumption.toFixed(2)} kW</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-status-warning" />
              <span className="text-sm text-muted-foreground">Total Trips</span>
            </div>
            <p className="text-2xl font-bold">
              {household.trips.reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trip/Time Chart */}
          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-status-warning" />
              Trip Count Over Time (Weekly)
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="trips" fill="hsl(45, 100%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Voltage Chart */}
          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-status-warning" />
              Voltage Over Time (24h)
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={voltageHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="voltage" 
                    stroke="hsl(45, 100%, 50%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(45, 100%, 50%)', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Power Chart */}
          <div className="glass-panel p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Power Consumption Over Time (24h)
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="hsl(217, 91%, 60%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(217, 91%, 60%)', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Email Popup */}
        {emailPopup.show && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, rgba(8, 16, 40, 0.95), rgba(2, 16, 26, 0.95))",
                backdropFilter: "blur(10px)",
                padding: 30,
                borderRadius: 16,
                maxWidth: 500,
                width: "90%",
                boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(0,150,255,0.1)",
                border: "2px solid #4db8ff",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-primary" />
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>
                  Load Limit Exceeded Alert
                </h2>
              </div>
              <p style={{ margin: "0 0 20px 0", fontSize: 16, color: "#bcd1ee", lineHeight: 1.6 }}>
                Your household is experiencing load limit exceeded fault. On <strong style={{ color: "#4db8ff" }}>{emailPopup.time}</strong>, 
                you had <strong style={{ color: "#ffc107" }}>{emailPopup.trips} trips</strong>.
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#9fb4d8", lineHeight: 1.6 }}>
                Would you like to exceed your load limit at this time? We can send you an email notification.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEmailPopup({ show: false, time: null, trips: 0 })}
                  style={{
                    padding: "12px 24px",
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  No, Thanks
                </button>
                <button
                  onClick={() => {
                    toast({
                      title: "Email Sent",
                      description: `Email notification sent for load limit exceeded on ${emailPopup.time}`,
                    });
                    setEmailPopup({ show: false, time: null, trips: 0 });
                  }}
                  style={{
                    padding: "12px 24px",
                    background: "#198754",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Yes, Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

