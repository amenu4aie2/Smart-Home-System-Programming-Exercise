import { SmartDevice } from './SmartDevice';
import { DeviceFactory } from './DeviceFactory';
import { Command } from '../commands/Command';
import { Scheduler } from '../utils/Scheduler';
import { AutomationEngine } from '../utils/AutomationEngine';
import { AuthenticationService } from '../utils/AuthenticationService';
import { NotificationService } from '../utils/NotificationService';
import { TaskManager } from './TaskManager';
import { Task, Priority } from './Task';

export class SmartHomeHub {
    private static instance: SmartHomeHub;
    private devices: Map<string, SmartDevice> = new Map();
    private scheduler: Scheduler;
    private automationEngine: AutomationEngine;
    private authService: AuthenticationService;
    private notificationService: NotificationService;
    private taskManager: TaskManager;

    private constructor() {
        this.scheduler = new Scheduler();
        this.automationEngine = new AutomationEngine();
        this.authService = new AuthenticationService();
        this.notificationService = new NotificationService();
        this.taskManager = new TaskManager();
    }

    public static getInstance(): SmartHomeHub {
        if (!SmartHomeHub.instance) {
            SmartHomeHub.instance = new SmartHomeHub();
        }
        return SmartHomeHub.instance;
    }

    // Existing methods...

    public addTask(description: string, startTime: Date, endTime: Date, priority: Priority): void {
        const task = new Task(Date.now().toString(), description, startTime, endTime, priority);
        try {
            this.taskManager.addTask(task);
            this.notificationService.sendNotification(`New task added: ${description}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(`Failed to add task: ${errorMessage}`);
        }
    }

    public removeTask(id: string): void {
        try {
            this.taskManager.removeTask(id);
            this.notificationService.sendNotification(`Task removed: ${id}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(`Failed to remove task: ${errorMessage}`);
        }
    }

    public getTasksSortedByStartTime(): Task[] {
        return this.taskManager.getTasksSortedByStartTime();
    }

    public editTask(id: string, updatedTask: Partial<Task>): void {
        try {
            this.taskManager.editTask(id, updatedTask);
            this.notificationService.sendNotification(`Task updated: ${id}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(`Failed to update task: ${errorMessage}`);
        }
    }

    public markTaskAsCompleted(id: string): void {
        try {
            this.taskManager.markTaskAsCompleted(id);
            this.notificationService.sendNotification(`Task marked as completed: ${id}`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.notificationService.sendNotification(`Failed to mark task as completed: ${errorMessage}`);
        }
    }

    public getTasksByPriority(priority: Priority): Task[] {
        return this.taskManager.getTasksByPriority(priority);
    }
}