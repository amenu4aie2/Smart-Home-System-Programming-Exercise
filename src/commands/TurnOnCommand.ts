import { Command } from './Command';
import { SmartDevice } from '../core/SmartDevice';

/**
 * TurnOnCommand class implementing the Command interface.
 * This command turns on a smart device.
 */
export class TurnOnCommand implements Command {
    private device: SmartDevice;

    /**
     * Constructor for TurnOnCommand.
     * @param device - The smart device to be controlled by this command.
     */
    constructor(device: SmartDevice) {
        this.device = device;
    }

    /**
     * Executes the command to turn on the device.
     */
    public execute(): void {
        this.device.turnOn();
    }

    /**
     * Undoes the command by turning off the device.
     */
    public undo(): void {
        this.device.turnOff();
    }
}