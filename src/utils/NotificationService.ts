import { AuthService } from '../auth/AuthService';

interface Notification {
    id: string;
    message: string;
    timestamp: Date;
}

export class NotificationService {
    private static instance: NotificationService;
    private notifications: Map<string, Notification[]> = new Map();
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

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

    public getNotifications(username: string): Notification[] {
        if (!this.authService.hasPermission(username, 'read:notification')) {
            throw new Error('User does not have permission to read notifications');
        }

        return this.notifications.get(username) || [];
    }

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