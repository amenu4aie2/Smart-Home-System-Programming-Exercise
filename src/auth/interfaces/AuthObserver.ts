/**
 * Interface representing an observer in the authentication system.
 * Observers implementing this interface will be notified of authentication events.
 */
export interface AuthObserver {
    /**
     * Method to be called when an authentication event occurs.
     * @param event - The name of the event that occurred.
     * @param data - Additional data related to the event.
     */
    update(event: string, data: any): void;
}