import { AuthService } from '../auth/AuthService';

/**
 * Interface representing a notification.
 * Each notification has an ID, message, and timestamp.
 */
interface Notification {
    id: string; // Unique identifier for the notification
    message: string; // Message content of the notification
    timestamp: Date; // Timestamp when the notification was created
}

/**
 * Singleton class for managing notifications.
 * Provides methods to send, retrieve, and remove notifications.
 */
export class NotificationService {
    private static instance: NotificationService;
    private notifications: Map<string, Notification[]> = new Map();
    private authService: AuthService;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the AuthService instance.
     */
    private constructor() {
        this.authService = AuthService.getInstance();
    }

    /**
     * Returns the singleton instance of the NotificationService.
     * @returns The singleton instance of NotificationService.
     */
    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Sends a notification to a user.
     * @param username - The username of the user to send the notification to.
     * @param message - The message content of the notification.
     * @returns The unique identifier of the sent notification.
     * @throws Error if the user does not have permission to send notifications.
     */
    public sendNotification(username: string, message: string): string {
        if (!this.authService.hasPermission(username, 'create:notification')) {
            throw new Error('User does not have permission to send notifications');
        }

        const notificationId = Date.now().toString(); // Simple ID generation
        const newNotification: Notification = {
            id: notificationId,
            message,
            timestamp: new Date()
        };

        if (!this.notifications.has(username)) {
            this.notifications.set(username, []);
        }

        this.notifications.get(username)!.push(newNotification);

        console.log(`NOTIFICATION for ${username}: ${message}`);
        // Here you would implement the actual sending of email, SMS, or push notification
        // For example:
        // this.sendEmail(username, message);
        // this.sendSMS(username, message);
        // this.sendPushNotification(username, message);

        return notificationId;
    }

    /**
     * Retrieves all notifications for a user.
     * @param username - The username of the user requesting the notifications.
     * @returns An array of Notification objects.
     * @throws Error if the user does not have permission to read notifications.
     */
    public getNotifications(username: string): Notification[] {
        if (!this.authService.hasPermission(username, 'read:notification')) {
            throw new Error('User does not have permission to read notifications');
        }

        return this.notifications.get(username) || [];
    }

    /**
     * Removes a specific notification for a user.
     * @param username - The username of the user removing the notification.
     * @param notificationId - The unique identifier of the notification to be removed.
     * @throws Error if the user does not have permission to remove notifications.
     */
    public removeNotification(username: string, notificationId: string): void {
        if (!this.authService.hasPermission(username, 'delete:notification')) {
            throw new Error('User does not have permission to remove notifications');
        }

        const userNotifications = this.notifications.get(username);
        if (!userNotifications) {
            throw new Error('No notifications found for this user');
        }

        const index = userNotifications.findIndex(notification => notification.id === notificationId);
        if (index === -1) {
            throw new Error('Notification not found');
        }

        userNotifications.splice(index, 1);
    }

    /**
     * Clears all notifications for a user.
     * @param username - The username of the user clearing the notifications.
     * @throws Error if the user does not have permission to clear notifications.
     */
    public clearAllNotifications(username: string): void {
        if (!this.authService.hasPermission(username, 'delete:notification')) {
            throw new Error('User does not have permission to clear notifications');
        }

        this.notifications.set(username, []);
    }

    // private sendEmail(username: string, message: string): void {
    //     // Implementation for sending email
    // }

    // private sendSMS(username: string, message: string): void {
    //     // Implementation for sending SMS
    // }

    // private sendPushNotification(username: string, message: string): void {
    //     // Implementation for sending push notification
    // }
}