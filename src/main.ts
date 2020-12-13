import { createMQTTService } from './service-mqtt';
import { createPIR } from './pir';
import { AsyncMqttClient } from 'async-mqtt';

let pirDevice: ReturnType<typeof createPIR>;
let mqtt: AsyncMqttClient;

const mqttUrl = process.env.MQTT_URL || '';
const pinNumber = +(process.env.PIN_NUMBER || '');

async function main() {
    mqtt = await createMQTTService(mqttUrl);
    console.log('connected to MQTT', mqtt.connected);
    const pirDevice = createPIR(pinNumber, async status => {
        try {
            await mqtt.publish(
                `tribeca/${pirDevice.sensorId}/status`,
                JSON.stringify(status)
            );
        } catch (error) {
            console.log('Error publishing', pirDevice, error.message);
        }
    });
    const status = await pirDevice.read();
    console.log('Publish first read', status);
    await mqtt.publish(
        `tribeca/${pirDevice.sensorId}/status`,
        JSON.stringify(status)
    );
}

async function gracefulShutdown() {
    try {
        console.log('Graceful shutdown starting');
        if (pirDevice) {
            pirDevice.close();
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
