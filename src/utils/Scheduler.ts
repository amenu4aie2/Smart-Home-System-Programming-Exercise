import { Command } from '../commands/Command';

interface ScheduledTask {
    command: Command;
    executionTime: Date;
}

export class Scheduler {
    private tasks: ScheduledTask[] = [];

    public scheduleTask(command: Command, executionTime: Date): void {
        this.tasks.push({ command, executionTime });
        this.tasks.sort((a, b) => a.executionTime.getTime() - b.executionTime.getTime());
    }

    public runDueTasks(): void {
        const now = new Date();
        while (this.tasks.length > 0 && this.tasks[0].executionTime <= now) {
            const task = this.tasks.shift();
            if (task) {
                task.command.execute();
            }
        }
    }

    // Additional methods for managing tasks can be added here
}