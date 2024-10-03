import { AuthStrategy } from '../interfaces/AuthStrategy';
import { AuthService } from '../AuthService';

/**
 * MFAStrategy class implementing the AuthStrategy interface.
 * This strategy uses multi-factor authentication (MFA) with a token.
 */
export class MFAStrategy implements AuthStrategy {
    /**
     * Constructor for MFAStrategy.
     * @param authService - An instance of AuthService to interact with user data.
     */
    constructor(private authService: AuthService) {}

    /**
     * Authenticates a user based on provided credentials.
     * @param credentials - An object containing the username and MFA token.
     * @returns A promise that resolves to a boolean indicating the success of the authentication.
     */
    async authenticate(credentials: { username: string; token: string }): Promise<boolean> {
        // Retrieve the user by username from the AuthService
        const user = this.authService.getUser(credentials.username);
        
        // If user is not found or does not have an MFA secret, return false
        if (!user || !user.mfaSecret) return false;
        
        // Placeholder: In a real implementation, verify the token against the secret
        return credentials.token === '123456';
    }
}