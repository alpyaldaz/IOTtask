const express = require('express');
const { TableClient } = require('@azure/data-tables');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Add debug logging
console.log('Initializing with connection string:', process.env.AZURE_STORAGE_CONNECTION_STRING ? 'Connection string exists' : 'No connection string found');

// Initialize Table client
const tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    'plantdata'
);

// Helper function to format entity data
const formatEntity = (entity) => ({
    deviceId: entity.deviceId,
    moisture: Number(entity.moisture),
    status: entity.status,
    timestamp: entity.timestamp,
});

// Get latest readings for all devices
app.get('/api/devices', async (req, res) => {
    try {
        console.log('Fetching all devices...');
        const devices = new Map();
        
        for await (const entity of tableClient.listEntities()) {
            console.log('Found entity:', entity);
            const currentReading = devices.get(entity.deviceId);
            const formattedEntity = formatEntity(entity);
            
            if (!currentReading || new Date(formattedEntity.timestamp) > new Date(currentReading.timestamp)) {
                devices.set(entity.deviceId, formattedEntity);
            }
        }
        
        const result = Array.from(devices.values());
        console.log('Sending response:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching current readings:', error);
        res.status(500).json({ error: 'Failed to fetch device readings', details: error.message });
    }
});

// Get history for specific device
app.get('/api/devices/:deviceId/history', async (req, res) => {
    try {
        const { deviceId } = req.params;
        console.log('Fetching history for device:', deviceId);
        const history = [];
        
        for await (const entity of tableClient.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${deviceId}'`
            }
        })) {
            console.log('Found history entity:', entity);
            history.push(formatEntity(entity));
        }
        
        console.log('Sending history response:', history);
        res.json(history);
    } catch (error) {
        console.error('Error fetching device history:', error);
        res.status(500).json({ error: 'Failed to fetch device history', details: error.message });
    }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
    try {
        console.log('Fetching alerts...');
        const alerts = [];
        
        for await (const entity of tableClient.listEntities({
            queryOptions: {
                filter: "moisture lt 30"
            }
        })) {
            console.log('Found alert:', entity);
            alerts.push(formatEntity(entity));
        }
        
        console.log('Sending alerts response:', alerts);
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts', details: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API running on port ${port}`);
    console.log('Debug: Environment variables loaded:', {
        port: process.env.PORT,
        hasStorageConnection: !!process.env.AZURE_STORAGE_CONNECTION_STRING
    });
});