module.exports = async function (context, eventHubMessages) {
    context.log(`Processing ${eventHubMessages.length} message(s)`);

    try {
        for (let message of eventHubMessages) {
            // Parse message if it's a string
            const data = typeof message === 'string' ? JSON.parse(message) : message;
            
            // Create processed record
            const processedData = {
                deviceId: data.deviceId,
                moisture: data.moisture,
                timestamp: data.timestamp || new Date().toISOString(),
                status: data.moisture < 30 ? 'Low' : 'Normal',
                processedAt: new Date().toISOString()
            };

            context.log(`Processed data from device ${processedData.deviceId}: Moisture level ${processedData.moisture}%`);

            // Generate alert if moisture is low
            if (processedData.moisture < 30) {
                context.log(`Low moisture alert for device ${processedData.deviceId}!`);
                context.bindings.outputQueueItem = {
                    deviceId: processedData.deviceId,
                    alertType: 'Low Moisture',
                    value: processedData.moisture,
                    timestamp: processedData.timestamp
                };
            }

            // Store the processed data
            context.bindings.outputTable = {
                PartitionKey: processedData.deviceId,
                RowKey: new Date(processedData.timestamp).getTime().toString(),
                ...processedData
            };
        }

        context.log('Processing completed successfully');
    } catch (error) {
        context.log.error('Error processing messages:', error);
        throw error;
    }
};
