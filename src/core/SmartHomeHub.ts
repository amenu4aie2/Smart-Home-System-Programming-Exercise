import { SmartDevice } from './SmartDevice';
import { DeviceFactory } from './DeviceFactory';
import { Command } from '../commands/Command';
import { Scheduler } from '../utils/Scheduler';
import { AutomationEngine } from '../utils/AutomationEngine';
import { AuthService } from '../auth/AuthService';
import { NotificationService } from '../utils/NotificationService';
import { TaskManager } from './TaskManager';
import { Task, Priority } from './Task';

/**
 * Singleton class representing the Smart Home Hub.
 * Manages devices, tasks, and automation rules within the smart home system.
 */
export class SmartHomeHub {
    private static instance: SmartHomeHub;
    private devices: Map<string, SmartDevice> = new Map();
    private scheduler: Scheduler;
    private automationEngine: AutomationEngine;
    private authService: AuthService;
    private notificationService: NotificationService;
    private taskManager: TaskManager;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes various services and managers.
     */
    private constructor() {
        this.scheduler = Scheduler.getInstance();
        this.automationEngine = AutomationEngine.getInstance();
        this.authService = AuthService.getInstance();
        this.notificationService = NotificationService.getInstance();
        this.taskManager = TaskManager.getInstance();
    }

    /**
     * Returns the singleton instance of the SmartHomeHub.
     * @returns The singleton instance of SmartHomeHub.
     */
    public static getInstance(): SmartHomeHub {
        if (!SmartHomeHub.instance) {
            SmartHomeHub.instance = new SmartHomeHub();
        }
        return SmartHomeHub.instance;
    }

    /**
     * Adds a new device to the smart home system.
     * @param username - The username of the user adding the device.
     * @param type - The type of the device.
     * @param id - The unique identifier for the device.
     * @param name - The name of the device.
     * @throws Error if the user does not have permission to add devices.
     */
    public addDevice(username: string, type: string, id: string, name: string): void {
        if (!this.authService.hasPermission(username, 'create:device')) {
            throw new Error('User does not have permission to add devices');
        }
        const device = DeviceFactory.createDevice(type, id, name);
        this.devices.set(id, device);
        this.notificationService.sendNotification(username, `New device added: ${name}`);
    }

    /**
     * Retrieves a device by its ID.
     * @param username - The username of the user requesting the device.
     * @param id - The unique identifier of the device.
     * @returns The requested SmartDevice or undefined if not found.
     * @throws Error if the user does not have permission to access devices.
     */
    public getDevice(username: string, id: string): SmartDevice | undefined {
        if (!this.authService.hasPermission(username, 'read:device')) {
            throw new Error('User does not have permission to access devices');
        }
        return this.devices.get(id);
    }

    /**
     * Removes a device from the smart home system.
     * @param username - The username of the user removing the device.
     * @param id - The unique identifier of the device.
     * @returns True if the device was removed, false otherwise.
     * @throws Error if the user does not have permission to remove devices.
     */
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

    /**
     * Executes a command on behalf of a user.
     * @param username - The username of the user executing the command.
     * @param command - The command to be executed.
     * @throws Error if the user does not have permission to execute commands.
     */
    public executeCommand(username: string, command: Command): void {
        if (!this.authService.hasPermission(username, 'execute:command')) {
            throw new Error('User does not have permission to execute commands');
        }
        command.execute();
    }

    /**
     * Adds a new task to the task manager.
     * @param username - The username of the user adding the task.
     * @param description - The description of the task.
     * @param startTime - The start time of the task.
     * @param endTime - The end time of the task.
     * @param priority - The priority of the task.
     * @throws Error if the user does not have permission to add tasks.
     */
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

    /**
     * Retrieves all devices in the smart home system.
     * @param username - The username of the user requesting the devices.
     * @returns An array of all SmartDevice objects.
     * @throws Error if the user does not have permission to access devices.
     */
    public getAllDevices(username: string): SmartDevice[] {
        if (!this.authService.hasPermission(username, 'read:device')) {
            throw new Error('User does not have permission to access devices');
        }
        return Array.from(this.devices.values());
    }

    /**
     * Removes a task from the task manager.
     * @param username - The username of the user removing the task.
     * @param id - The unique identifier of the task.
     * @throws Error if the user does not have permission to remove tasks.
     */
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

    /**
     * Retrieves tasks sorted by their start time.
     * @param username - The username of the user requesting the tasks.
     * @returns An array of Task objects sorted by start time.
     * @throws Error if the user does not have permission to view tasks.
     */
    public getTasksSortedByStartTime(username: string): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to view tasks');
        }
        return this.taskManager.getTasksSortedByStartTime(username);
    }

    /**
     * Edits an existing task in the task manager.
     * @param username - The username of the user editing the task.
     * @param id - The unique identifier of the task.
     * @param updatedTask - An object containing the updated task properties.
     * @throws Error if the user does not have permission to edit tasks.
     */
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

    /**
     * Marks a task as completed in the task manager.
     * @param username - The username of the user marking the task as completed.
     * @param id - The unique identifier of the task.
     * @throws Error if the user does not have permission to mark tasks as completed.
     */
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

    /**
     * Retrieves tasks filtered by their priority.
     * @param username - The username of the user requesting the tasks.
     * @param priority - The priority level to filter tasks by.
     * @returns An array of Task objects with the specified priority.
     * @throws Error if the user does not have permission to view tasks.
     */
    public getTasksByPriority(username: string, priority: Priority): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to view tasks');
        }
        return this.taskManager.getTasksByPriority(username, priority);
    }

    /**
     * Schedules a task to be executed at a specified time.
     * @param username - The username of the user scheduling the task.
     * @param task - The task to be scheduled.
     * @param executionTime - The time at which the task should be executed.
     * @throws Error if the user does not have permission to schedule tasks.
     */
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

    /**
     * Adds an automation rule to the automation engine.
     * @param username - The username of the user adding the rule.
     * @param name - The name of the automation rule.
     * @param condition - The condition that triggers the rule.
     * @param action - The action to be executed when the condition is met.
     * @throws Error if the user does not have permission to create automation rules.
     */
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