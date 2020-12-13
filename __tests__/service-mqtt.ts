import { createMQTTService } from '../src/service-mqtt';

test('MQTTService should connect to sew and publish data', async () => {
    const mqttClient = await createMQTTService();
    const msg = {
        sensorId: '00:00:00:00:00:00:00:01',
        type: 'SWITCH',
        value: 1
    };
    await mqttClient.publish(
        'tribeca/00:00:00:00:00:00:00:01/status',
        JSON.stringify(msg)
    );
    expect(mqttClient).toBeTruthy();
    expect(mqttClient.connected).toBeTruthy();
    mqttClient.end();
});
