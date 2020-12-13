let triggerCallback;
jest.mock('onoff', () => ({
    Gpio: function() {
        return {
            read() {
                return Promise.resolve(1);
            },
            unwatchAll() {},
            unexport() {},
            watch(c) { triggerCallback = c }
        }
    }
}));
import { createPIR } from '../src/pir';

describe('createPIR', () => {

    let pirDevice;
    let callbackSpy;

    beforeEach(() => {
        callbackSpy = jest.fn();
        pirDevice = createPIR(1, (value) => Promise.resolve(callbackSpy(value)));
    });

    afterEach(async () => {
        await pirDevice.close();
        jest.restoreAllMocks();
    });

    it('should read value', async () => {
        const value = await pirDevice.read();
        expect(value).toStrictEqual({
            sensorId: pirDevice.sensorId,
            type: 'SWITCH',
            value: 1
        });
    });

    it('should call callback with watched value from pir', () => {
        triggerCallback(null, 0);
        expect(callbackSpy).toBeCalledWith({
            sensorId: pirDevice.sensorId,
            type: 'SWITCH',
            value: 0
        });
    });

    it('should not call callback on watch error', () => {
        triggerCallback(Error('Oops'));
        expect(callbackSpy).not.toBeCalled;
    });
});
