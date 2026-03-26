import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdvancedCharts = ({ username, userId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/analytics/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (userId) fetchAnalytics();
  }, [userId]);

  return (
    <div className="clay-card chart-card">
      <div className="chart-header">
        <h4 className="label-cartoon">Performance Curve</h4>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--clay-text-dim)" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--clay-text-dim)" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: 'var(--clay-card)', border: 'none', borderRadius: '1rem', boxShadow: 'var(--clay-shadow-out)' }}
              itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="var(--primary)" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorPrimary)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chart-card { padding: 1.5rem; }
        .chart-header h4 { margin: 0 0 1.5rem 0; font-size: 0.9rem; font-weight: 700; color: var(--clay-text-dim); text-transform: uppercase; letter-spacing: 0.1em; }
        .chart-body { margin-left: -1rem; }
      `}} />
    </div>
  );
};

export default AdvancedCharts;
