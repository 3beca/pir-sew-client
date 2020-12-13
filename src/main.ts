import { createMQTTService } from './service-mqtt';
import { createPIR } from './pir';
import { AsyncMqttClient } from 'async-mqtt';

let pirDevice: ReturnType<typeof createPIR>;
let mqtt: AsyncMqttClient;

async function main() {
    mqtt = await createMQTTService();
    console.log('connected to MQTT', mqtt.connected);
    const pirDevice = createPIR(17, status => {
        try {
            mqtt.publish(`tribeca/${pirDevice.sensorId}/status`, JSON.stringify(status));
        } catch (error) {
            console.log('Error publishing', pirDevice, error.message);
        }
    });
    const currentStatus = await pirDevice.pir.read();
    const firstMessage = JSON.stringify({ sensorId: pirDevice.sensorId, type: 'SWITCH', value: currentStatus });
    console.log('Publish first message', firstMessage);
    mqtt.publish(
        `tribeca/${pirDevice.sensorId}/status`,
        firstMessage
    );
}

async function gracefulShutdown() {
    try {
        console.log('Graceful shutdown starting');
        if (pirDevice) {
            pirDevice.pir.unwatchAll();
            pirDevice.pir.unexport();
        }
        if (mqtt) {
            await mqtt.end();
        }
        console.log('Graceful shutdown completed, exit now');
        process.exit(0);
    } catch (error) {
        console.error('Graceful shutdown error', error);
        process.exit(1);
    }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

main().catch(error => {
    console.error('Error on starting up', error);
    process.exit(1);
});
