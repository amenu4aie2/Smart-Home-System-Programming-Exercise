import { SmartDevice } from '../core/SmartDevice';

/**
 * Class representing a smart thermostat device.
 * Extends the SmartDevice class and adds functionality specific to thermostats.
 */
export class Thermostat extends SmartDevice {
    private temperature: number; // Current temperature setting of the thermostat

    /**
     * Constructor for Thermostat.
     * @param id - Unique identifier for the thermostat.
     * @param name - Name of the thermostat.
     */
    constructor(id: string, name: string) {
        super(id, name);
        this.temperature = 20; // Default temperature in Celsius
    }

    /**
     * Turns on the thermostat.
     * Sets the status to true.
     */
    public turnOn(): void {
        this.status = true;
    }

    /**
     * Turns off the thermostat.
     * Sets the status to false.
     */
    public turnOff(): void {
        this.status = false;
    }

    /**
     * Sets the temperature of the thermostat.
     * @param temp - The desired temperature in Celsius.
     * @throws Error if the temperature is not between 10°C and 30°C.
     */
    public setTemperature(temp: number): void {
        if (temp < 10 || temp > 30) {
            throw new Error('Temperature must be between 10°C and 30°C');
        }
        this.temperature = temp;
        this.status = true; // Setting temperature turns the thermostat on
    }

    /**
     * Gets the current temperature setting of the thermostat.
     * @returns The current temperature in Celsius.
     */
    public getTemperature(): number {
        return this.temperature;
    }

    /**
     * Gets the type of the device.
     * @returns A string indicating the type of the device ('thermostat').
     */
    public getType(): string {
        return 'thermostat';
    }
}