import { Task, Priority } from './Task';

export class TaskManager {
    private tasks: Task[] = [];

    public addTask(task: Task): void {
        if (this.tasks.some(t => t.overlaps(task))) {
            throw new Error("Task overlaps with an existing task");
        }
        this.tasks.push(task);
        this.sortTasks();
    }

    public removeTask(id: string): void {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error("Task not found");
        }
        this.tasks.splice(index, 1);
    }

    public getTasksSortedByStartTime(): Task[] {
        return [...this.tasks];  // Already sorted due to sortTasks() call in addTask
    }

    public editTask(id: string, updatedTask: Partial<Task>): void {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            throw new Error("Task not found");
        }
        Object.assign(task, updatedTask);
        this.sortTasks();
    }

    public markTaskAsCompleted(id: string): void {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            throw new Error("Task not found");
        }
        task.completed = true;
    }

    public getTasksByPriority(priority: Priority): Task[] {
        return this.tasks.filter(t => t.priority === priority);
    }

    private sortTasks(): void {
        this.tasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
}