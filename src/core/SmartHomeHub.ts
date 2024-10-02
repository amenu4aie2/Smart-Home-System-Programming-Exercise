import { SmartDevice } from './SmartDevice';
import { DeviceFactory } from './DeviceFactory';
import { Command } from '../commands/Command';
import { Scheduler } from '../utils/Scheduler';
import { AutomationEngine } from '../utils/AutomationEngine';
import { AuthenticationService } from '../utils/AuthenticationService';
import { NotificationService } from '../utils/NotificationService';

export class SmartHomeHub {
    private static instance: SmartHomeHub;
    private devices: Map<string, SmartDevice> = new Map();
    private scheduler: Scheduler;
    private automationEngine: AutomationEngine;
    private authService: AuthenticationService;
    private notificationService: NotificationService;

    private constructor() {
        this.scheduler = new Scheduler();
        this.automationEngine = new AutomationEngine();
        this.authService = new AuthenticationService();
        this.notificationService = new NotificationService();
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
        this.notificationService.sendNotification(`New device added: ${name}`);
    }

    public getDevice(id: string): SmartDevice | undefined {
        return this.devices.get(id);
    }

    public removeDevice(id: string): boolean {
        const removed = this.devices.delete(id);
        if (removed) {
            this.notificationService.sendNotification(`Device removed: ${id}`);
        }
        return removed;
    }

    public executeCommand(command: Command, username: string, password: string): void {
        if (this.authService.authenticate(username, password)) {
            command.execute();
        } else {
            this.notificationService.sendNotification("Unauthorized command execution attempt");
        }
    }

    public getDeviceStatus(): string {
        return Array.from(this.devices.entries())
            .map(([id, device]) => `${id}: ${device.getName()} - ${device.getStatus() ? 'On' : 'Off'}`)
            .join('\n');
    }

    // Additional methods for scheduling, automation, etc. can be added here
}