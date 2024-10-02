import { SmartDevice } from '../core/SmartDevice';

export class Thermostat extends SmartDevice {
    private temperature: number;

    constructor(id: string, name: string) {
        super(id, name);
        this.temperature = 20; // Default temperature in Celsius
    }

    public turnOn(): void {
        this.status = true;
    }

    public turnOff(): void {
        this.status = false;
    }

    public setTemperature(temp: number): void {
        if (temp < 10 || temp > 30) {
            throw new Error('Temperature must be between 10°C and 30°C');
        }
        this.temperature = temp;
        this.status = true; // Setting temperature turns the thermostat on
    }

    public getTemperature(): number {
        return this.temperature;
    }
    // get type
    public getType(): string {
        return 'thermostat';
    }
}