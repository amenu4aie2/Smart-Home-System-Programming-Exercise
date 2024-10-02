import { Command } from '../commands/Command';
import { AuthService } from '../auth/AuthService';

interface ScheduledTask {
    id: string;
    username: string;
    command: Command;
    executionTime: Date;
}

export class Scheduler {
    private static instance: Scheduler;
    private tasks: Map<string, ScheduledTask[]> = new Map();
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    public static getInstance(): Scheduler {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }
        return Scheduler.instance;
    }

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

    public getScheduledTasks(username: string): ScheduledTask[] {
        if (!this.authService.hasPermission(username, 'read:schedule')) {
            throw new Error('User does not have permission to view scheduled tasks');
        }

        return this.tasks.get(username) || [];
    }

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

    public clearAllTasks(username: string): void {
        if (!this.authService.hasPermission(username, 'delete:schedule')) {
            throw new Error('User does not have permission to clear scheduled tasks');
        }

        this.tasks.set(username, []);
    }
}