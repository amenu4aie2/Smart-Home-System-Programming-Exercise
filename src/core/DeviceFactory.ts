import { SmartDevice } from './SmartDevice';
import { Light } from '../devices/Light';
import { Thermostat } from '../devices/Thermostat';
import { DoorLock } from '../devices/DoorLock';

export class DeviceFactory {
    public static createDevice(type: string, id: string, name: string): SmartDevice {
        switch (type.toLowerCase()) {
            case 'light':
                return new Light(id, name);
            case 'thermostat':
                return new Thermostat(id, name);
            case 'doorlock':
                return new DoorLock(id, name);
            default:
                throw new Error(`Unsupported device type: ${type}`);
        }
    }
}