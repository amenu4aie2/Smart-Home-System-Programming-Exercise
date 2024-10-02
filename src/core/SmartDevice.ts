export abstract class SmartDevice {
    protected id: string;
    protected name: string;
    protected status: boolean;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.status = false; // Devices start in 'off' state
    }

    public getId(): string {
        return this.id;
    }
    public abstract getType(): string;

    public getName(): string {
        return this.name;
    }

    public getStatus(): boolean {
        return this.status;
    }


    public abstract turnOn(): void;
    public abstract turnOff(): void;
}
