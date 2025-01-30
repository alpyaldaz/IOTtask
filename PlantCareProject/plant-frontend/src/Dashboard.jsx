import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch devices data
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/devices');
        const data = await response.json();
        setDevices(data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    // Fetch alerts
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/alerts');
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchDevices();
    fetchAlerts();

    // Update every 5 seconds
    const interval = setInterval(() => {
      fetchDevices();
      fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>Plant Care Dashboard</h1>
      
      {/* Device Cards */}
      <div className="device-grid">
        {devices.map(device => (
          <div key={device.deviceId} className="device-card">
            <h2>{device.deviceId}</h2>
            <div className="moisture-level">
              <span className={device.moisture < 30 ? 'low' : 'normal'}>
                Moisture: {device.moisture}%
              </span>
            </div>
            <div className="timestamp">
              Last updated: {new Date(device.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>Active Alerts</h2>
          {alerts.map((alert, index) => (
            <div key={index} className="alert-item">
              {alert.deviceId}: Low moisture level ({alert.moisture}%) at{' '}
              {new Date(alert.timestamp).toLocaleString()}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="chart-section">
        <h2>Moisture Levels Over Time</h2>
        <LineChart width={800} height={400} data={devices}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="moisture" 
            stroke="#8884d8" 
            name="Moisture Level (%)" 
          />
        </LineChart>
      </div>
    </div>
  );
}

export default Dashboard;