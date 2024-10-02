import { AuthStrategy } from '../interfaces/AuthStrategy';
import { AuthService } from '../AuthService';
import bcrypt from 'bcrypt';

export class PasswordStrategy implements AuthStrategy {
    constructor(private authService: AuthService) {}

    async authenticate(credentials: { username: string; password: string }): Promise<boolean> {
        const user = this.authService.getUser(credentials.username);
        if (!user) return false;
        return bcrypt.compare(credentials.password, user.passwordHash);
    }
}