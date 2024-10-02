import { SmartDevice } from '../core/SmartDevice';

export class Light extends SmartDevice {
    private brightness: number;

    constructor(id: string, name: string) {
        super(id, name);
        this.brightness = 0;
    }

    public turnOn(): void {
        this.status = true;
        this.brightness = 100; // Default to full brightness when turned on
    }

    public turnOff(): void {
        this.status = false;
        this.brightness = 0;
    }

    public setBrightness(level: number): void {
        if (level < 0 || level > 100) {
            throw new Error('Brightness must be between 0 and 100');
        }
        this.brightness = level;
        this.status = level > 0;
    }

    public getBrightness(): number {
        return this.brightness;
    }
}
