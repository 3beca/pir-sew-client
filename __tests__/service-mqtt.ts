import { createMQTTService } from '../src/service-mqtt';
import aedesFactory from 'aedes';
import net, { AddressInfo } from 'net';

test('MQTTService should connect to mqtt server and publish data', async () => {
    const aedes = aedesFactory();
    const mqttServer = net.createServer(aedes.handle);
    await new Promise<void>(resolve => mqttServer.listen(0, () => resolve()));
    const mqttServerPort = (mqttServer.address() as AddressInfo).port;
    const mqttClient = await createMQTTService('mqtt://localhost:' + mqttServerPort);
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
    await mqttClient.end();
    await mqttServer.close();
    await aedes.close();
});
