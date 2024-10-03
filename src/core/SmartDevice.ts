/**
 * Abstract class representing a smart device.
 * All smart devices should extend this class and implement the abstract methods.
 */
export abstract class SmartDevice {
    protected id: string; // Unique identifier for the device
    protected name: string; // Name of the device
    protected status: boolean; // Status of the device (on/off)

    /**
     * Constructor for SmartDevice.
     * @param id - Unique identifier for the device.
     * @param name - Name of the device.
     */
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.status = false; // Devices start in 'off' state
    }

    /**
     * Gets the unique identifier of the device.
     * @returns The unique identifier of the device.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Gets the type of the device.
     * This method must be implemented by subclasses.
     * @returns The type of the device.
     */
    public abstract getType(): string;

    /**
     * Gets the name of the device.
     * @returns The name of the device.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Gets the status of the device.
     * @returns The status of the device (true if on, false if off).
     */
    public getStatus(): boolean {
        return this.status;
    }

    /**
     * Turns on the device.
     * This method must be implemented by subclasses.
     */
    public abstract turnOn(): void;

    /**
     * Turns off the device.
     * This method must be implemented by subclasses.
     */
    public abstract turnOff(): void;
}