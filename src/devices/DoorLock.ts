import { SmartDevice } from '../core/SmartDevice';

/**
 * Class representing a smart door lock device.
 * Extends the SmartDevice class and adds functionality specific to door locks.
 */
export class DoorLock extends SmartDevice {
    private locked: boolean; // Indicates whether the door is locked

    /**
     * Constructor for DoorLock.
     * @param id - Unique identifier for the door lock.
     * @param name - Name of the door lock.
     */
    constructor(id: string, name: string) {
        super(id, name);
        this.locked = true; // Door is locked by default
    }

    /**
     * Turns on the door lock.
     * This method locks the door.
     */
    public turnOn(): void {
        this.lock();
    }

    /**
     * Turns off the door lock.
     * This method unlocks the door.
     */
    public turnOff(): void {
        this.unlock();
    }

    /**
     * Locks the door.
     * Sets the locked status to true and updates the device status.
     */
    public lock(): void {
        this.locked = true;
        this.status = true; // Locked is considered 'on' for a door lock
    }

    /**
     * Unlocks the door.
     * Sets the locked status to false and updates the device status.
     */
    public unlock(): void {
        this.locked = false;
        this.status = false; // Unlocked is considered 'off' for a door lock
    }

    /**
     * Checks if the door is locked.
     * @returns True if the door is locked, false otherwise.
     */
    public isLocked(): boolean {
        return this.locked;
    }

    /**
     * Gets the type of the device.
     * @returns A string indicating the type of the device ('door-lock').
     */
    public getType(): string {
        return 'door-lock';
    }
}