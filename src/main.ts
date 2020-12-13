import { createMQTTService } from './service-mqtt';
import { createPIR } from './pir';

async function main() {
    const mqtt = await createMQTTService();
    const { pir, sensorId } = createPIR(17, status => {
        try {
            mqtt.publish(`tribeca/${sensorId}/status`, JSON.stringify(status));
        } catch (error) {
            console.log('Error publishing', pir, error.message);
        }
    });
    const currentStatus = await pir.read();
    mqtt.publish(
        `tribeca/${sensorId}/status`,
        JSON.stringify({ sensorId, type: 'SWITCH', value: currentStatus })
    );
}

main();
