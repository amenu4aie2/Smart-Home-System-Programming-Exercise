export interface AuthObserver {
    update(event: string, data: any): void;
}