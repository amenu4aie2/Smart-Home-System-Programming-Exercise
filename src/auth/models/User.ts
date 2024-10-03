import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing a user in the system.
 */
export interface User {
    id: string; // Unique identifier for the user
    username: string; // Username of the user
    email: string; // Email address of the user
    passwordHash: string; // Hashed password of the user
    failedAttempts: number; // Number of failed login attempts
    lastFailedAttempt: Date; // Timestamp of the last failed login attempt
    resetToken?: string; // Token for password reset (optional)
    resetTokenExpires?: Date; // Expiry date for the reset token (optional)
    mfaSecret?: string; // Secret for multi-factor authentication (optional)
    isActive: boolean; // Indicates if the user account is active
    roles: Set<string>; // Set of role IDs assigned to the user
    createdAt: Date; // Timestamp when the user was created
    updatedAt: Date; // Timestamp when the user was last updated
}

/**
 * Factory class for creating User instances.
 */
export class UserFactory {
    /**
     * Creates a new user with the provided username, email, and password.
     * @param username - The username for the new user.
     * @param email - The email address for the new user.
     * @param password - The password for the new user.
     * @returns A new User object.
     */
    static createUser(username: string, email: string, password: string): User {
        return {
            id: uuidv4(), // Generate a unique ID for the user
            username,
            email,
            passwordHash: bcrypt.hashSync(password, 12), // Hash the password with bcrypt
            failedAttempts: 0, // Initialize failed login attempts to 0
            lastFailedAttempt: new Date(0), // Set the last failed attempt to the epoch
            isActive: true, // Set the user account as active
            roles: new Set(), // Initialize roles as an empty set
            createdAt: new Date(), // Set the creation timestamp to now
            updatedAt: new Date() // Set the update timestamp to now
        };
    }
}