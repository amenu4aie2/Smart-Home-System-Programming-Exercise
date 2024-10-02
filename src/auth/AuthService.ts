import * as bcrypt from 'bcrypt'; // Import bcrypt correctly
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, UserFactory } from './models/User';
import { Role } from './models/Role';
import { AuthObserver } from './interfaces/AuthObserver';
import { AuthStrategy } from './interfaces/AuthStrategy';
import { PasswordStrategy } from './strategies/PasswordStrategy';
import { MFAStrategy } from './strategies/MFAStrategy';

export class AuthService {
    private static instance: AuthService;
    private users: Map<string, User> = new Map();
    private roles: Map<string, Role> = new Map();
    private observers: AuthObserver[] = [];
    private authStrategies: Map<string, AuthStrategy> = new Map();

    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private readonly JWT_EXPIRES_IN = '15m';
    private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
    private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';
    private readonly PASSWORD_RESET_EXPIRES = 3600000; // 1 hour in milliseconds
    

    private emailTransporter = nodemailer.createTransport({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    private constructor() {
        this.authStrategies.set('password', new PasswordStrategy(this));
        this.createDefaultAdmin();
        this.authStrategies.set('mfa', new MFAStrategy(this));
        this.initializeDefaultRoles();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Observer Pattern methods
    public addObserver(observer: AuthObserver): void {
        this.observers.push(observer);
    }

    public removeObserver(observer: AuthObserver): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    private notifyObservers(event: string, data: any): void {
        for (const observer of this.observers) {
            observer.update(event, data);
        }
    }

    // Role management methods
    private initializeDefaultRoles(): void {
        this.addRole('user', ['read:own_profile',]);
        this.addRole('admin', ['read:any_profile', 'write:any_profile', 'delete:any_profile','create:task', 'read:task', 'update:task', 'delete:task', 'create:automation', 'read:automation', 'update:automation', 'delete:automation', 'execute:automation', 'create:schedule', 'read:schedule', 'update:schedule', 'delete:schedule', 'execute:schedule','send:notification', 'create:role', 'read:role', 'update:role', 'delete:role', 'assign:role', 'remove:role', 'create:user', 'read:user', 'update:user', 'delete:user', 'assign:user_role', 'remove:user_role', 'create:device', 'read:device', 'update:device', 'delete:device', 'execute:command', 'create:task', 'read:task', 'update:task', 'delete:task', 'execute:task', 'create:automation', 'read:automation', 'update:automation', 'delete:automation', 'execute:automation', 'create:schedule', 'read:schedule', 'update:schedule', 'delete:schedule', 'execute:schedule','create:notification',
            'read:task',
            'create:task',
            'delete:task',
            'update:task',
            'create:schedule',
            'create:automation']);
    }
    private async createDefaultAdmin() {
        try {
            const hashedPassword = await bcrypt.hash('adminpassword', 12);  // CHANGE THIS PASSWORD!
            // const adminUser: User = {
            //     id: uuidv4(),
            //     username: 'admin',  // Admin username
            //     email: 'admin@example.com',
            //     passwordHash: hashedPassword,
            //     failedAttempts: 0,
            //     lastFailedAttempt: new Date(0),
            //     isActive: true,
            //     roles: new Set(), // Important: initialize as an empty Set
            //     createdAt: new Date(),
            //     updatedAt: new Date()
            // };
            const adminUser = UserFactory.createUser('admin', 'admin@example.com', 'adminpassword');

            this.users.set('admin', adminUser);
            this.addRole('admin', ['create:task', 'read:task', 'update:task', 'delete:task', /* other admin permissions */]);
            this.assignRoleToUser('admin', 'admin');

            console.log('Default admin user created.');
        } catch (error) {
            console.error('Error creating default admin user:', error);
        }
    }

    public addRole(name: string, permissions: string[]): void {
        const roleId = uuidv4();
        this.roles.set(roleId, {
            id: roleId,
            name,
            permissions: new Set(permissions)
        });
        this.notifyObservers('roleAdded', { name });
    }

    public getRole(roleId: string): Role | undefined {
        return this.roles.get(roleId);
    }

    public assignRoleToUser(username: string, roleName: string): void {
        const user = this.getUser(username);
        const role = Array.from(this.roles.values()).find(r => r.name === roleName);
        
        if (!user || !role) {
            throw new Error('User or role not found');
        }

        user.roles.add(role.id);
        user.updatedAt = new Date();
        this.users.set(username, user);
        this.notifyObservers('roleAssigned', { username, roleName });
    }

    public removeRoleFromUser(username: string, roleName: string): void {
        const user = this.getUser(username);
        const role = Array.from(this.roles.values()).find(r => r.name === roleName);
        
        if (!user || !role) {
            throw new Error('User or role not found');
        }

        user.roles.delete(role.id);
        user.updatedAt = new Date();
        this.users.set(username, user);
        this.notifyObservers('roleRemoved', { username, roleName });
    }

    public hasPermission(username: string, permission: string): boolean {
        const user = this.getUser(username);
        if (!user) {
            return false;
        }

        for (const roleId of user.roles) {
            const role = this.getRole(roleId);
            if (role && role.permissions.has(permission)) {
                return true;
            }
        }
        return false;
    }

    // User management methods
    public addUser(username: string, email: string, password: string): void {
        if (this.users.has(username)) {
            throw new Error('User already exists');
        }
        if (!this.isPasswordStrong(password)) {
            throw new Error('Password does not meet complexity requirements');
        }
        const newUser = UserFactory.createUser(username, email, password);
        this.users.set(username, newUser);
        this.assignRoleToUser(username, 'user'); // Assign default 'user' role
        this.notifyObservers('userAdded', { username });
    }

    public getUser(username: string): User | undefined {
        return this.users.get(username);
    }

    // Authentication methods
    public async authenticate(strategy: string, credentials: any): Promise<boolean> {
        const authStrategy = this.authStrategies.get(strategy);
        if (!authStrategy) {
            throw new Error('Invalid authentication strategy');
        }
        const result = await authStrategy.authenticate(credentials);
        this.notifyObservers('authenticationAttempt', { strategy, success: result });
        return result;
    }

    public async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        const user = this.getUser(username);
        if (!user || !user.isActive) {
            return null;
        }

        if (user.failedAttempts >= 5 && Date.now() - user.lastFailedAttempt.getTime() < 15 * 60 * 1000) {
            throw new Error('Account temporarily locked. Please try again later.');
        }

        const isAuthenticated = await this.authenticate('password', { username, password });
        if (!isAuthenticated) {
            user.failedAttempts++;
            user.lastFailedAttempt = new Date();
            this.users.set(username, user);
            return null;
        }

        // Reset failed attempts on successful login
        user.failedAttempts = 0;
        this.users.set(username, user);

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        this.notifyObservers('login', { username });
        return { accessToken, refreshToken };
    }

    private generateAccessToken(user: User): string {
        const userRoles = Array.from(user.roles).map(roleId => this.getRole(roleId as string)?.name).filter(Boolean);
        return jwt.sign(
            { userId: user.id, username: user.username, roles: userRoles },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    private generateRefreshToken(user: User): string {
        return jwt.sign(
            { userId: user.id },
            this.REFRESH_TOKEN_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
        );
    }

    public verifyAccessToken(token: string): { userId: string; username: string; roles: string[] } | null {
        try {
            return jwt.verify(token, this.JWT_SECRET) as { userId: string; username: string; roles: string[] };
        } catch (error) {
            return null;
        }
    }

    public async refreshToken(refreshToken: string): Promise<string | null> {
        try {
            const payload = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as { userId: string };
            const user = Array.from(this.users.values()).find(u => u.id === payload.userId);
            if (!user) {
                return null;
            }
            return this.generateAccessToken(user);
        } catch (error) {
            return null;
        }
    }

    public async changePassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
        const user = this.getUser(username);
        if (!user) {
            return false;
        }

        const isAuthenticated = await this.authenticate('password', { username, password: oldPassword });
        if (!isAuthenticated) {
            return false;
        }

        if (!this.isPasswordStrong(newPassword)) {
            throw new Error('New password does not meet complexity requirements');
        }

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        user.updatedAt = new Date();
        this.users.set(username, user);

        this.notifyObservers('passwordChanged', { username });
        return true;
    }

    public async initiatePasswordReset(email: string): Promise<void> {
        const user = Array.from(this.users.values()).find(u => u.email === email);
        if (!user) {
            // Don't reveal if the email exists or not
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpires = new Date(Date.now() + this.PASSWORD_RESET_EXPIRES);

        this.users.set(user.username, user);

        const resetUrl = `http://yourapp.com/reset-password?token=${resetToken}`;

        await this.emailTransporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Please use the following link to reset your password: ${resetUrl}\nThis link will expire in 1 hour.`,
        });

        this.notifyObservers('passwordResetInitiated', { username: user.username });
    }

    public async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const user = Array.from(this.users.values()).find(
            u => u.resetToken === token && u.resetTokenExpires && u.resetTokenExpires > new Date()
        );

        if (!user) {
            return false;
        }

        if (!this.isPasswordStrong(newPassword)) {
            throw new Error('New password does not meet complexity requirements');
        }

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        user.updatedAt = new Date();
        this.users.set(user.username, user);

        this.notifyObservers('passwordReset', { username: user.username });
        return true;
    }

    private isPasswordStrong(password: string): boolean {
        const minLength = 12;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasNonalphas = /\W/.test(password);
        return password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasNonalphas;
    }

    public async enableMFA(username: string): Promise<string> {
        const user = this.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }

        const secret = crypto.randomBytes(32).toString('hex');
        user.mfaSecret = secret;
        user.updatedAt = new Date();
        this.users.set(username, user);

        this.notifyObservers('mfaEnabled', { username });
        // In a real implementation, you would generate a QR code here
        return secret;
    }

    public async verifyMFA(username: string, token: string): Promise<boolean> {
        return this.authenticate('mfa', { username, token });
    }

    public async deactivateAccount(username: string): Promise<void> {
        const user = this.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        user.isActive = false;
        user.updatedAt = new Date();
        this.users.set(username, user);
        this.notifyObservers('accountDeactivated', { username });
    }

    public async reactivateAccount(username: string): Promise<void> {
        const user = this.getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        user.isActive = true;
        user.updatedAt = new Date();
        this.users.set(username, user);
        this.notifyObservers('accountReactivated', { username });
    }

    public userHasRole(username: string, roleName: string): boolean {
        const user = this.getUser(username);
        if (!user) {
            return false;
        }
        return Array.from(user.roles).some(roleId => this.getRole(roleId as string)?.name === roleName);
    }

    // This method would be used to regularly clean up expired reset tokens
    public async cleanupExpiredTokens(): Promise<void> {
        for (const [username, user] of this.users.entries()) {
            if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
                user.resetToken = undefined;
                user.resetTokenExpires = undefined;
                user.updatedAt = new Date();
                this.users.set(username, user);
            }
        }
        this.notifyObservers('expiredTokensCleanup', {});
    }
}