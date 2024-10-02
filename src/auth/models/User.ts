import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    failedAttempts: number;
    lastFailedAttempt: Date;
    resetToken?: string;
    resetTokenExpires?: Date;
    mfaSecret?: string;
    isActive: boolean;
    roles: Set<string>; // Role IDs
    createdAt: Date;
    updatedAt: Date;
}

export class UserFactory {
    static createUser(username: string, email: string, password: string): User {
        return {
            id: uuidv4(),
            username,
            email,
            passwordHash: bcrypt.hashSync(password, 12),
            failedAttempts: 0,
            lastFailedAttempt: new Date(0),
            isActive: true,
            roles: new Set(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}