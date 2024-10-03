import { SmartDevice } from './SmartDevice';
import { Light } from '../devices/Light';
import { Thermostat } from '../devices/Thermostat';
import { DoorLock } from '../devices/DoorLock';

/**
 * Factory class for creating instances of SmartDevice.
 * Provides a method to create devices based on their type.
 */
export class DeviceFactory {
    /**
     * Creates a new smart device based on the provided type.
     * @param type - The type of the device (e.g., 'light', 'thermostat', 'doorlock').
     * @param id - The unique identifier for the device.
     * @param name - The name of the device.
     * @returns An instance of a SmartDevice.
     * @throws Error if the device type is unsupported.
     */
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