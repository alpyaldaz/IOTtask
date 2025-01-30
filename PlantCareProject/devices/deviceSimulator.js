const { Mqtt } = require('azure-iot-device-mqtt');
const { Client, Message } = require('azure-iot-device');
require('dotenv').config();

class PlantDevice {
    constructor(connectionString, deviceId) {
        this.deviceId = deviceId;
        this.client = Client.fromConnectionString(connectionString, Mqtt);
    }

    async connect() {
        try {
            await this.client.open();
            console.log(`${this.deviceId} connected successfully`);
            return true;
        } catch (error) {
            console.error(`Error connecting ${this.deviceId}:`, error);
            return false;
        }
    }

    async sendTelemetry() {
        try {
            const moistureLevel = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
            const telemetry = {
                deviceId: this.deviceId,
                moisture: moistureLevel,
                timestamp: new Date().toISOString()
            };

            const message = new Message(JSON.stringify(telemetry));
            await this.client.sendEvent(message);
            console.log(`${this.deviceId} sent data:`, telemetry);
        } catch (error) {
            console.error(`Error sending telemetry from ${this.deviceId}:`, error);
        }
    }
}

module.exports = PlantDevice;