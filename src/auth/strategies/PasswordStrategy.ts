import { AuthStrategy } from '../interfaces/AuthStrategy';
import { AuthService } from '../AuthService';
import bcrypt from 'bcrypt';

/**
 * PasswordStrategy class implementing the AuthStrategy interface.
 * This strategy uses a username and password for authentication.
 */
export class PasswordStrategy implements AuthStrategy {
    /**
     * Constructor for PasswordStrategy.
     * @param authService - An instance of AuthService to interact with user data.
     */
    constructor(private authService: AuthService) {}

    /**
     * Authenticates a user based on provided credentials.
     * @param credentials - An object containing the username and password.
     * @returns A promise that resolves to a boolean indicating the success of the authentication.
     */
    async authenticate(credentials: { username: string; password: string }): Promise<boolean> {
        // Retrieve the user by username from the AuthService
        const user = this.authService.getUser(credentials.username);
        
        // If user is not found, return false
        if (!user) return false;
        
        // Compare the provided password with the stored password hash
        return bcrypt.compare(credentials.password, user.passwordHash);
    }
}