export enum Priority {
    Low,
    Medium,
    High
}

export class Task {
    constructor(
        public id: string,
        public description: string,
        public startTime: Date,
        public endTime: Date,
        public priority: Priority,
        public completed: boolean = false
    ) {}

    public duration(): number {
        return this.endTime.getTime() - this.startTime.getTime();
    }

    public overlaps(other: Task): boolean {
        return this.startTime < other.endTime && other.startTime < this.endTime;
    }
}