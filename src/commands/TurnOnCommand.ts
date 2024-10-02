import { Command } from './Command';
import { SmartDevice } from '../core/SmartDevice';

export class TurnOnCommand implements Command {
    private device: SmartDevice;

    constructor(device: SmartDevice) {
        this.device = device;
    }

    public execute(): void {
        this.device.turnOn();
    }

    public undo(): void {
        this.device.turnOff();
    }
}