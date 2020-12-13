import getMAC from 'getmac';

test('Get MAC from RPI', () => {
    expect(getMAC()).toEqual(expect.any(String));
});
