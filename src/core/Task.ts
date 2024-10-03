/**
 * Enum representing the priority levels of a task.
 */
export enum Priority {
    Low,    // Low priority
    Medium, // Medium priority
    High    // High priority
}

/**
 * Class representing a task.
 * Each task has an ID, description, start and end times, priority, and completion status.
 */
export class Task {
    /**
     * Constructor for Task.
     * @param id - Unique identifier for the task.
     * @param description - Description of the task.
     * @param startTime - Start time of the task.
     * @param endTime - End time of the task.
     * @param priority - Priority level of the task.
     * @param completed - Completion status of the task (default is false).
     */
    constructor(
        public id: string,
        public description: string,
        public startTime: Date,
        public endTime: Date,
        public priority: Priority,
        public completed: boolean = false
    ) {}

    /**
     * Calculates the duration of the task.
     * @returns The duration of the task in milliseconds.
     */
    public duration(): number {
        return this.endTime.getTime() - this.startTime.getTime();
    }

    /**
     * Checks if this task overlaps with another task.
     * @param other - The other task to check for overlap.
     * @returns True if the tasks overlap, false otherwise.
     */
    public overlaps(other: Task): boolean {
        return this.startTime < other.endTime && other.startTime < this.endTime;
    }
}