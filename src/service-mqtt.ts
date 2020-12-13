import MQTT, { AsyncMqttClient } from 'async-mqtt';

export function createMQTTService(mqttUrl: string): Promise<AsyncMqttClient> {
    return MQTT.connectAsync(mqttUrl);
}
