import { AuthStrategy } from '../interfaces/AuthStrategy';
import { AuthService } from '../AuthService';

export class MFAStrategy implements AuthStrategy {
    constructor(private authService: AuthService) {}

    async authenticate(credentials: { username: string; token: string }): Promise<boolean> {
        const user = this.authService.getUser(credentials.username);
        if (!user || !user.mfaSecret) return false;
        // Placeholder: In a real implementation, verify the token against the secret
        return credentials.token === '123456';
    }
}