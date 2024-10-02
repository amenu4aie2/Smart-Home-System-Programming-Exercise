import { SmartDevice } from './SmartDevice';

export class LoggingDeviceDecorator extends SmartDevice {
    private device: SmartDevice;

    constructor(device: SmartDevice) {
        super(device.getId(), device.getName());
        this.device = device;
    }

    public turnOn(): void {
        console.log(`Turning on ${this.getName()}`);
        this.device.turnOn();
    }
// get type
    public getType(): string {
        return this.device.getType();
    }
    public turnOff(): void {
        console.log(`Turning off ${this.getName()}`);
        this.device.turnOff();
    }

    public getStatus(): boolean {
        const status = this.device.getStatus();
        console.log(`Status of ${this.getName()}: ${status ? 'On' : 'Off'}`);
        return status;
    }
}