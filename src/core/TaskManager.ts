import { Task, Priority } from './Task';
import { AuthService } from '../auth/AuthService';

/**
 * Singleton class for managing tasks.
 * Provides methods to add, remove, edit, and retrieve tasks.
 */
export class TaskManager {
    private static instance: TaskManager;
    private tasks: Map<string, Task[]> = new Map();
    private authService: AuthService;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the AuthService instance.
     */
    private constructor() {
        this.authService = AuthService.getInstance();
    }

    /**
     * Returns the singleton instance of the TaskManager.
     * @returns The singleton instance of TaskManager.
     */
    public static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    /**
     * Adds a new task for a user.
     * @param username - The username of the user adding the task.
     * @param task - The task to be added.
     * @throws Error if the user does not have permission to create tasks or if the task overlaps with an existing task.
     */
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

    /**
     * Removes a task for a user.
     * @param username - The username of the user removing the task.
     * @param id - The unique identifier of the task to be removed.
     * @throws Error if the user does not have permission to delete tasks or if the task is not found.
     */
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

    /**
     * Retrieves tasks for a user sorted by their start time.
     * @param username - The username of the user requesting the tasks.
     * @returns An array of Task objects sorted by start time.
     * @throws Error if the user does not have permission to read tasks.
     */
    public getTasksSortedByStartTime(username: string): Task[] {
        if (!this.authService.hasPermission(username, 'read:task')) {
            throw new Error('User does not have permission to read tasks');
        }
        return this.tasks.get(username) || [];  // Already sorted due to sortTasks() call in addTask
    }

    /**
     * Edits an existing task for a user.
     * @param username - The username of the user editing the task.
     * @param id - The unique identifier of the task to be edited.
     * @param updatedTask - An object containing the updated task properties.
     * @throws Error if the user does not have permission to update tasks or if the task is not found.
     */
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

    /**
     * Marks a task as completed for a user.
     * @param username - The username of the user marking the task as completed.
     * @param id - The unique identifier of the task to be marked as completed.
     * @throws Error if the user does not have permission to update tasks or if the task is not found.
     */
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

    /**
     * Retrieves tasks for a user filtered by their priority.
     * @param username - The username of the user requesting the tasks.
     * @param priority - The priority level to filter tasks by.
     * @returns An array of Task objects with the specified priority.
     * @throws Error if the user does not have permission to read tasks.
     */
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

    /**
     * Sorts tasks for a user by their start time.
     * @param username - The username of the user whose tasks should be sorted.
     */
    private sortTasks(username: string): void {
        const userTasks = this.tasks.get(username);
        if (userTasks) {
            userTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        }
    }
}