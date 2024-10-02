import { SmartDevice } from './SmartDevice';
import { DeviceFactory } from './DeviceFactory';
import { Command } from '../commands/Command';
import { Scheduler } from '../utils/Scheduler';
import { AutomationEngine } from '../utils/AutomationEngine';

export class SmartHomeHub {
    private static instance: SmartHomeHub;
    private devices: Map<string, SmartDevice> = new Map();
    private scheduler: Scheduler;
    private automationEngine: AutomationEngine;

    private constructor() {
        this.scheduler = new Scheduler();
        this.automationEngine = new AutomationEngine();
    }

    public static getInstance(): SmartHomeHub {
        if (!SmartHomeHub.instance) {
            SmartHomeHub.instance = new SmartHomeHub();
        }
        return SmartHomeHub.instance;
    }

    public addDevice(type: string, id: string, name: string): void {
        const device = DeviceFactory.createDevice(type, id, name);
        this.devices.set(id, device);
    }

    public getDevice(id: string): SmartDevice | undefined {
        return this.devices.get(id);
    }

    public removeDevice(id: string): boolean {
        return this.devices.delete(id);
    }

    public executeCommand(command: Command): void {
        command.execute();
    }

    // Additional methods for scheduling, automation, etc. can be added here
}