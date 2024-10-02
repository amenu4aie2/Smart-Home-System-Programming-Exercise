import { SmartDevice } from './SmartDevice';
import { DeviceFactory } from './DeviceFactory';
import { Command } from '../commands/Command';
import { Scheduler } from '../utils/Scheduler';
import { AutomationEngine } from '../utils/AutomationEngine';
import { AuthService } from '../auth/AuthService';
import { NotificationService } from '../utils/NotificationService';
import { TaskManager } from './TaskManager';
import { Task, Priority } from './Task';

export class SmartHomeHub {
    private static instance: SmartHomeHub;
    private devices: Map<string, SmartDevice> = new Map();
    private scheduler: Scheduler;
    private automationEngine: AutomationEngine;
    private authService: AuthService;
    private notificationService: NotificationService;
    private taskManager: TaskManager;

    private constructor() {
        this.scheduler = Scheduler.getInstance();
        this.automationEngine = AutomationEngine.getInstance();
        this.authService = AuthService.getInstance();
        this.notificationService = NotificationService.getInstance();
        this.taskManager = TaskManager.getInstance();
    }

    public static getInstance(): SmartHomeHub {
        if (!SmartHomeHub.instance) {
            SmartHomeHub.instance = new SmartHomeHub();
        }
        return SmartHomeHub.instance;
    }

    public addDevice(username: string, type: string, id: string, name: string): void {
        if (!this.authService.hasPermission(username, 'create:device')) {
            throw new Error('User does not have permission to add devices');
        }
        const device = DeviceFactory.createDevice(type, id, name);
        this.devices.set(id, device);
        this.notificationService.sendNotification(username, `New device added: ${name}`);
    }

    public getDevice(username: string, id: string): SmartDevice | undefined {
        if (!this.authService.hasPermission(username, 'read:device')) {
            throw new Error('User does not have permission to access devices');
        }
        return this.devices.get(id);
    }

    public removeDevice(username: string, id: string): boolean {
        if (!this.authService.hasPermission(username, 'delete:device')) {
            throw new Error('User does not have permission to remove devices');
        }
        const removed = this.devices.delete(id);
        if (removed) {
            this.notificationService.sendNotification(username, `Device removed: ${id}`);
        }
        return removed;
    }

    public executeCommand(username: string, command: Command): void {
        if (!this.authService.hasPermission(username, 'execute:command')) {
            throw new Error('User does not have permission to execute commands');
        }
        command.execute();
    }

    public addTask(username: string, description: string, startTime: Date, endTime: Date, priority: Priority): void {
        if (!this.authService.hasPermission(username, 'create:task')) {
            throw new Error('User does not have permission to add tasks');
        }
        const task = new Task(Date.now().toString(), description, startTime, endTime, priority);
        try {
            this.taskManager.addTask(username, task);
            this.notificationService.sendNotification(username, `New task added: ${description}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(username, `Failed to add task: ${errorMessage}`);
        }
    }
    public getAllDevices(username: string): SmartDevice[] {
        if (!this.authService.hasPermission(username, 'read:device')) {
            throw new Error('User does not have permission to access devices');
        }
        return Array.from(this.devices.values());
    }
    public removeTask(username: string, id: string): void {
        if (!this.authService.hasPermission(username, 'delete:task')) {
            throw new Error('User does not have permission to remove tasks');
        }
        try {
            this.taskManager.removeTask(username, id);
            this.notificationService.sendNotification(username, `Task removed: ${id}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(username, `Failed to remove task: ${errorMessage}`);
        }
    }

    public getTasksSortedByStartTime(username: string): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to view tasks');
        }
        return this.taskManager.getTasksSortedByStartTime(username);
    }

    public editTask(username: string, id: string, updatedTask: Partial<Task>): void {
        if (!this.authService.hasPermission(username, 'update:task')) {
            throw new Error('User does not have permission to edit tasks');
        }
        try {
            this.taskManager.editTask(username, id, updatedTask);
            this.notificationService.sendNotification(username, `Task updated: ${id}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(username, `Failed to update task: ${errorMessage}`);
        }
    }

    public markTaskAsCompleted(username: string, id: string): void {
        if (!this.authService.hasPermission(username, 'update:task')) {
            throw new Error('User does not have permission to mark tasks as completed');
        }
        try {
            this.taskManager.markTaskAsCompleted(username, id);
            this.notificationService.sendNotification(username, `Task marked as completed: ${id}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(username, `Failed to mark task as completed: ${errorMessage}`);
        }
    }

    public getTasksByPriority(username: string, priority: Priority): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to view tasks');
        }
        return this.taskManager.getTasksByPriority(username, priority);
    }

    public scheduleTask(username: string, task: Task, executionTime: Date): void {
        if (!this.authService.hasPermission(username, 'create:schedule')) {
            throw new Error('User does not have permission to schedule tasks');
        }
        const scheduledTaskId = this.scheduler.scheduleTask(username, {
            execute: () => this.taskManager.addTask(username, task),
            undo: () => this.taskManager.removeTask(username, task.id)
        }, executionTime);
        this.notificationService.sendNotification(username, `Task scheduled: ${task.description}`);
    }

    public addAutomationRule(
        username: string, 
        name: string, 
        condition: (device: SmartDevice) => boolean, 
        action: Command
    ): void {
        if (!this.authService.hasPermission(username, 'create:automation')) {
            throw new Error('User does not have permission to create automation rules');
        }
        const ruleId = this.automationEngine.addRule(username, name, condition, action);
        this.notificationService.sendNotification(username, `Automation rule added: ${name}`);
    }
}