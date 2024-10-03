import { Command } from '../commands/Command';
import { AuthService } from '../auth/AuthService';

/**
 * Interface representing a scheduled task.
 */
interface ScheduledTask {
    id: string; // Unique identifier for the task
    username: string; // Username of the user who scheduled the task
    command: Command; // Command to be executed
    executionTime: Date; // Time when the task should be executed
}

/**
 * Singleton class for scheduling and managing tasks.
 */
export class Scheduler {
    private static instance: Scheduler;
    private tasks: Map<string, ScheduledTask[]> = new Map();
    private authService: AuthService;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the AuthService instance.
     */
    private constructor() {
        this.authService = AuthService.getInstance();
    }

    /**
     * Returns the singleton instance of the Scheduler.
     * @returns The singleton instance of Scheduler.
     */
    public static getInstance(): Scheduler {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }
        return Scheduler.instance;
    }

    /**
     * Schedules a new task for a user.
     * @param username - The username of the user scheduling the task.
     * @param command - The command to be executed.
     * @param executionTime - The time when the task should be executed.
     * @returns The unique identifier of the scheduled task.
     * @throws Error if the user does not have permission to schedule tasks.
     */
    public scheduleTask(username: string, command: Command, executionTime: Date): string {
        if (!this.authService.hasPermission(username, 'create:schedule')) {
            throw new Error('User does not have permission to schedule tasks');
        }

        const taskId = Date.now().toString(); // Simple ID generation
        const newTask: ScheduledTask = { id: taskId, username, command, executionTime };

        if (!this.tasks.has(username)) {
            this.tasks.set(username, []);
        }

        const userTasks = this.tasks.get(username)!;
        userTasks.push(newTask);
        userTasks.sort((a, b) => a.executionTime.getTime() - b.executionTime.getTime());

        return taskId;
    }

    /**
     * Executes all due tasks for a user.
     * @param username - The username of the user whose tasks should be executed.
     * @throws Error if the user does not have permission to run scheduled tasks.
     */
    public runDueTasks(username: string): void {
        if (!this.authService.hasPermission(username, 'execute:schedule')) {
            throw new Error('User does not have permission to run scheduled tasks');
        }

        const userTasks = this.tasks.get(username);
        if (!userTasks) {
            return; // No tasks for this user
        }

        const now = new Date();
        while (userTasks.length > 0 && userTasks[0].executionTime <= now) {
            const task = userTasks.shift();
            if (task) {
                task.command.execute();
            }
        }
    }

    /**
     * Retrieves all scheduled tasks for a user.
     * @param username - The username of the user requesting the tasks.
     * @returns An array of ScheduledTask objects.
     * @throws Error if the user does not have permission to view scheduled tasks.
     */
    public getScheduledTasks(username: string): ScheduledTask[] {
        if (!this.authService.hasPermission(username, 'read:schedule')) {
            throw new Error('User does not have permission to view scheduled tasks');
        }

        return this.tasks.get(username) || [];
    }

    /**
     * Removes a scheduled task for a user.
     * @param username - The username of the user removing the task.
     * @param taskId - The unique identifier of the task to be removed.
     * @throws Error if the user does not have permission to remove scheduled tasks.
     */
    public removeScheduledTask(username: string, taskId: string): void {
        if (!this.authService.hasPermission(username, 'delete:schedule')) {
            throw new Error('User does not have permission to remove scheduled tasks');
        }

        const userTasks = this.tasks.get(username);
        if (!userTasks) {
            throw new Error('No scheduled tasks found for this user');
        }

        const index = userTasks.findIndex(task => task.id === taskId);
        if (index === -1) {
            throw new Error('Scheduled task not found');
        }

        userTasks.splice(index, 1);
    }

    /**
     * Clears all scheduled tasks for a user.
     * @param username - The username of the user clearing the tasks.
     * @throws Error if the user does not have permission to clear scheduled tasks.
     */
    public clearAllTasks(username: string): void {
        if (!this.authService.hasPermission(username, 'delete:schedule')) {
            throw new Error('User does not have permission to clear scheduled tasks');
        }

        this.tasks.set(username, []);
    }
}