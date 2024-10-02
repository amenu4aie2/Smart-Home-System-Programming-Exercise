import { Task, Priority } from './Task';
import { AuthService } from '../auth/AuthService';

export class TaskManager {
    private static instance: TaskManager;
    private tasks: Map<string, Task[]> = new Map();
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    public static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    public addTask(username: string, task: Task): void {
        if (!this.authService.hasPermission(username, 'create:task')) {
            throw new Error('User does not have permission to create tasks');
        }
        if (!this.tasks.has(username)) {
            this.tasks.set(username, []);
        }
        const userTasks = this.tasks.get(username)!;
        if (userTasks.some(t => t.overlaps(task))) {
            throw new Error("Task overlaps with an existing task");
        }
        userTasks.push(task);
        this.sortTasks(username);
    }

    public removeTask(username: string, id: string): void {
        if (!this.authService.hasPermission(username, 'delete:task')) {
            throw new Error('User does not have permission to delete tasks');
        }
        const userTasks = this.tasks.get(username);
        if (!userTasks) {
            throw new Error("No tasks found for this user");
        }
        const index = userTasks.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error("Task not found");
        }
        userTasks.splice(index, 1);
    }

    public getTasksSortedByStartTime(username: string): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to read tasks');
        }
        return this.tasks.get(username) || [];  // Already sorted due to sortTasks() call in addTask
    }

    public editTask(username: string, id: string, updatedTask: Partial<Task>): void {
        if (!this.authService.hasPermission(username, 'update:task')) {
            throw new Error('User does not have permission to update tasks');
        }
        const userTasks = this.tasks.get(username);
        if (!userTasks) {
            throw new Error("No tasks found for this user");
        }
        const task = userTasks.find(t => t.id === id);
        if (!task) {
            throw new Error("Task not found");
        }
        Object.assign(task, updatedTask);
        this.sortTasks(username);
    }

    public markTaskAsCompleted(username: string, id: string): void {
        if (!this.authService.hasPermission(username, 'update:task')) {
            throw new Error('User does not have permission to update tasks');
        }
        const userTasks = this.tasks.get(username);
        if (!userTasks) {
            throw new Error("No tasks found for this user");
        }
        const task = userTasks.find(t => t.id === id);
        if (!task) {
            throw new Error("Task not found");
        }
        task.completed = true;
    }

    public getTasksByPriority(username: string, priority: Priority): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to read tasks');
        }
        const userTasks = this.tasks.get(username);
        if (!userTasks) {
            return [];
        }
        return userTasks.filter(t => t.priority === priority);
    }

    private sortTasks(username: string): void {
        const userTasks = this.tasks.get(username);
        if (userTasks) {
            userTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        }
    }
}