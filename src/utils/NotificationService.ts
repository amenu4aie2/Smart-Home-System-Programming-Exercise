export class NotificationService {
    public sendNotification(message: string): void {
        console.log(`NOTIFICATION: ${message}`);
        // In a real system, this could send an email, SMS, or push notification
    }
}