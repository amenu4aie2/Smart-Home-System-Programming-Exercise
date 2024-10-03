import { SmartDevice } from '../core/SmartDevice';

/**
 * Class representing a smart light device.
 * Extends the SmartDevice class and adds functionality specific to lights.
 */
export class Light extends SmartDevice {
    private brightness: number; // Brightness level of the light (0-100)

    /**
     * Constructor for Light.
     * @param id - Unique identifier for the light.
     * @param name - Name of the light.
     */
    constructor(id: string, name: string) {
        super(id, name);
        this.brightness = 0; // Initialize brightness to 0 (off)
    }

    /**
     * Turns on the light.
     * Sets the status to true and brightness to 100 (full brightness).
     */
    public turnOn(): void {
        this.status = true;
        this.brightness = 100; // Default to full brightness when turned on
    }

    /**
     * Turns off the light.
     * Sets the status to false and brightness to 0.
     */
    public turnOff(): void {
        this.status = false;
        this.brightness = 0;
    }

    /**
     * Sets the brightness level of the light.
     * @param level - The brightness level (0-100).
     * @throws Error if the brightness level is not between 0 and 100.
     */
    public setBrightness(level: number): void {
        if (level < 0 || level > 100) {
            throw new Error('Brightness must be between 0 and 100');
        }
        this.brightness = level;
        this.status = level > 0; // Update status based on brightness level
    }

    /**
     * Gets the current brightness level of the light.
     * @returns The brightness level (0-100).
     */
    public getBrightness(): number {
        return this.brightness;
    }

    /**
     * Gets the type of the device.
     * @returns A string indicating the type of the device ('light').
     */
    public getType(): string {
        return 'light';
    }
}
