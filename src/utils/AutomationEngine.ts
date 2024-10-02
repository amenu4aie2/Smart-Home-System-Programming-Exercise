import { SmartDevice } from '../core/SmartDevice';
import { Command } from '../commands/Command';
import { AuthService } from '../auth/AuthService';

interface AutomationRule {
    id: string;
    username: string;
    name: string;
    condition: (device: SmartDevice) => boolean;
    action: Command;
}

export class AutomationEngine {
    private static instance: AutomationEngine;
    private rules: Map<string, AutomationRule[]> = new Map();
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    public static getInstance(): AutomationEngine {
        if (!AutomationEngine.instance) {
            AutomationEngine.instance = new AutomationEngine();
        }
        return AutomationEngine.instance;
    }

    public addRule(username: string, name: string, condition: (device: SmartDevice) => boolean, action: Command): string {
        if (!this.authService.hasPermission(username, 'create:automation')) {
            throw new Error('User does not have permission to create automation rules');
        }

        const ruleId = Date.now().toString(); // Simple ID generation
        const newRule: AutomationRule = { id: ruleId, username, name, condition, action };

        if (!this.rules.has(username)) {
            this.rules.set(username, []);
        }

        this.rules.get(username)!.push(newRule);
        return ruleId;
    }

    public checkAndExecuteRules(username: string, device: SmartDevice): void {
        if (!this.authService.hasPermission(username, 'execute:automation')) {
            throw new Error('User does not have permission to execute automation rules');
        }

        const userRules = this.rules.get(username);
        if (!userRules) {
            return; // No rules for this user
        }

        for (const rule of userRules) {
            if (rule.condition(device)) {
                rule.action.execute();
            }
        }
    }

    public getRules(username: string): AutomationRule[] {
        if (!this.authService.hasPermission(username, 'read:automation')) {
            throw new Error('User does not have permission to view automation rules');
        }

        return this.rules.get(username) || [];
    }

    public getRule(username: string, ruleId: string): AutomationRule | undefined {
        if (!this.authService.hasPermission(username, 'read:automation')) {
            throw new Error('User does not have permission to view automation rules');
        }

        const userRules = this.rules.get(username);
        return userRules?.find(rule => rule.id === ruleId);
    }

    public updateRule(username: string, ruleId: string, updates: Partial<Omit<AutomationRule, 'id' | 'username'>>): void {
        if (!this.authService.hasPermission(username, 'update:automation')) {
            throw new Error('User does not have permission to update automation rules');
        }

        const userRules = this.rules.get(username);
        if (!userRules) {
            throw new Error('No automation rules found for this user');
        }

        const ruleIndex = userRules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex === -1) {
            throw new Error('Automation rule not found');
        }

        userRules[ruleIndex] = { ...userRules[ruleIndex], ...updates };
    }

    public removeRule(username: string, ruleId: string): void {
        if (!this.authService.hasPermission(username, 'delete:automation')) {
            throw new Error('User does not have permission to remove automation rules');
        }

        const userRules = this.rules.get(username);
        if (!userRules) {
            throw new Error('No automation rules found for this user');
        }

        const index = userRules.findIndex(rule => rule.id === ruleId);
        if (index === -1) {
            throw new Error('Automation rule not found');
        }

        userRules.splice(index, 1);
    }

    public clearAllRules(username: string): void {
        if (!this.authService.hasPermission(username, 'delete:automation')) {
            throw new Error('User does not have permission to clear automation rules');
        }

        this.rules.set(username, []);
    }

    public getRuleCount(username: string): number {
        if (!this.authService.hasPermission(username, 'read:automation')) {
            throw new Error('User does not have permission to view automation rules');
        }

        return this.rules.get(username)?.length || 0;
    }
}