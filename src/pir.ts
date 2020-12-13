import { Gpio } from 'onoff';
import getMAC from 'getmac';

const MAC = getMAC();
let totalSensors = 0;
export type PIR = {
    sensorId: string;
    type: 'SWITCH';
    value: 0 | 1;
};
export function createPIR(pin: number, callback: (value: PIR) => void) {
    totalSensors++;
    const sensorId = MAC + ':00:' + totalSensors.toString(16);
    const pir = new Gpio(pin, 'in', 'both');
    pir.watch((error, value) => {
        if (error) {
            console.log(`Error watching PIR in pin ${pin}:`, error.message);
        } else {
            callback({ sensorId, type: 'SWITCH', value });
        }
    });
    return {
        sensorId,
        close: () => {
            pir.unwatchAll();
            pir.unexport();
        },
        read: async () => {
            const status = await pir.read();
            return { sensorId, type: 'SWITCH', value: status };
        }
    };
}
