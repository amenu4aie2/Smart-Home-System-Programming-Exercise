import { SmartDevice } from '../core/SmartDevice';

export class DoorLock extends SmartDevice {
    private locked: boolean;

    constructor(id: string, name: string) {
        super(id, name);
        this.locked = true; // Door is locked by default
    }

    public turnOn(): void {
        this.lock();
    }

    public turnOff(): void {
        this.unlock();
    }

    public lock(): void {
        this.locked = true;
        this.status = true; // Locked is considered 'on' for a door lock
    }

    public unlock(): void {
        this.locked = false;
        this.status = false; // Unlocked is considered 'off' for a door lock
    }

    public isLocked(): boolean {
        return this.locked;
    }
}