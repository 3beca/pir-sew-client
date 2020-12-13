import MQTT from 'async-mqtt';

export const SERVER = process.env.MQTT;

export async function createMQTTService() {
    return await MQTT.connectAsync(SERVER);
}
