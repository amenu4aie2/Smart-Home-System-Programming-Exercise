import { SmartDevice } from './SmartDevice';

/**
 * LoggingDeviceDecorator class extending SmartDevice.
 * This decorator adds logging functionality to any SmartDevice.
 */
export class LoggingDeviceDecorator extends SmartDevice {
    private device: SmartDevice; // The smart device being decorated

    /**
     * Constructor for LoggingDeviceDecorator.
     * @param device - The smart device to be decorated with logging functionality.
     */
    constructor(device: SmartDevice) {
        super(device.getId(), device.getName());
        this.device = device;
    }

    /**
     * Turns on the device and logs the action.
     */
    public turnOn(): void {
        console.log(`Turning on ${this.getName()}`);
        this.device.turnOn();
    }

    /**
     * Gets the type of the device.
     * @returns The type of the decorated device.
     */
    public getType(): string {
        return this.device.getType();
    }

    /**
     * Turns off the device and logs the action.
     */
    public turnOff(): void {
        console.log(`Turning off ${this.getName()}`);
        this.device.turnOff();
    }

    /**
     * Gets the status of the device and logs the status.
     * @returns The status of the decorated device (true if on, false if off).
     */
    public getStatus(): boolean {
        const status = this.device.getStatus();
        console.log(`Status of ${this.getName()}: ${status ? 'On' : 'Off'}`);
        return status;
    }
}