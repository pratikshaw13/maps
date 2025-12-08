import { cn } from '@/lib/utils';
import { Household } from '@/types/electrical';
import { getTripChartData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface TripChartProps {
  households: Household[];
}

const COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(45, 100%, 50%)',
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 45%)',
  'hsl(280, 84%, 60%)',
  'hsl(180, 76%, 45%)',
  'hsl(320, 84%, 60%)',
  'hsl(30, 100%, 50%)',
];

export function TripChart({ households }: TripChartProps) {
  const data = getTripChartData(households);
  const totalTrips = data.reduce((sum, d) => sum + d.total, 0);
  const worstDay = data.reduce((max, d) => d.total > max.total ? d : max, data[0]);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-status-warning" />
          Weekly Trip Count
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Trips</p>
            <p className="font-mono font-bold text-lg">{totalTrips}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Peak Day</p>
            <p className="font-mono font-bold text-lg text-status-warning">{worstDay.day}</p>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)', fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
            />
            {households.map((h, i) => (
              <Bar 
                key={h.id}
                dataKey={h.id}
                name={h.name}
                stackId="a"
                fill={COLORS[i % COLORS.length]}
                radius={i === households.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Analysis:</strong> {worstDay.day} shows highest trip frequency ({worstDay.total} trips). 
          Consider load balancing or phase redistribution for affected households.
        </p>
      </div>
    </div>
  );
}
