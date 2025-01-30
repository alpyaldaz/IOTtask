const PlantDevice = require('./devices/deviceSimulator');
require('dotenv').config();

// Create devices with complete connection strings
const devices = [
    new PlantDevice('HostName=PlantHub.azure-devices.net;DeviceId=PlantDevice1;SharedAccessKey=', 'PlantDevice1'),
    new PlantDevice('HostName=PlantHub.azure-devices.net;DeviceId=PlantDevice2;SharedAccessKey=', 'PlantDevice2'),
    new PlantDevice('HostName=PlantHub.azure-devices.net;DeviceId=PlantDevice3;SharedAccessKey=', 'PlantDevice3')
];

// Start all devices
async function startDevices() {
    try {
        // Connect all devices
        await Promise.all(devices.map(device => device.connect()));

        // Send telemetry every 30 seconds
        setInterval(() => {
            devices.forEach(device => device.sendTelemetry());
        }, 30000);
    } catch (error) {
        console.error('Error starting devices:', error);
    }
}

startDevices().catch(console.error);