import { SmartDevice } from '../core/SmartDevice';
import { Command } from '../commands/Command';
import { AuthService } from '../auth/AuthService';

/**
 * Interface representing an automation rule.
 * Each rule has an ID, username, name, condition, and action.
 */
interface AutomationRule {
    id: string; // Unique identifier for the rule
    username: string; // Username of the user who created the rule
    name: string; // Name of the rule
    condition: (device: SmartDevice) => boolean; // Condition to trigger the rule
    action: Command; // Action to execute when the condition is met
}

/**
 * Singleton class for managing automation rules.
 * Provides methods to add, update, remove, and execute rules.
 */
export class AutomationEngine {
    private static instance: AutomationEngine;
    private rules: Map<string, AutomationRule[]> = new Map();
    private authService: AuthService;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the AuthService instance.
     */
    private constructor() {
        this.authService = AuthService.getInstance();
    }

    /**
     * Returns the singleton instance of the AutomationEngine.
     * @returns The singleton instance of AutomationEngine.
     */
    public static getInstance(): AutomationEngine {
        if (!AutomationEngine.instance) {
            AutomationEngine.instance = new AutomationEngine();
        }
        return AutomationEngine.instance;
    }

    /**
     * Adds a new automation rule for a user.
     * @param username - The username of the user adding the rule.
     * @param name - The name of the rule.
     * @param condition - The condition that triggers the rule.
     * @param action - The action to be executed when the condition is met.
     * @returns The unique identifier of the added rule.
     * @throws Error if the user does not have permission to create automation rules.
     */
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

    /**
     * Checks and executes all rules for a user based on a device's state.
     * @param username - The username of the user whose rules should be checked.
     * @param device - The smart device to check against the rules.
     * @throws Error if the user does not have permission to execute automation rules.
     */
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

    /**
     * Retrieves all automation rules for a user.
     * @param username - The username of the user requesting the rules.
     * @returns An array of AutomationRule objects.
     * @throws Error if the user does not have permission to view automation rules.
     */
    public getRules(username: string): AutomationRule[] {
        if (!this.authService.hasPermission(username, 'read:automation')) {
            throw new Error('User does not have permission to view automation rules');
        }

        return this.rules.get(username) || [];
    }

    /**
     * Retrieves a specific automation rule by its ID.
     * @param username - The username of the user requesting the rule.
     * @param ruleId - The unique identifier of the rule.
     * @returns The requested AutomationRule or undefined if not found.
     * @throws Error if the user does not have permission to view automation rules.
     */
    public getRule(username: string, ruleId: string): AutomationRule | undefined {
        if (!this.authService.hasPermission(username, 'read:automation')) {
            throw new Error('User does not have permission to view automation rules');
        }

        const userRules = this.rules.get(username);
        return userRules?.find(rule => rule.id === ruleId);
    }

    /**
     * Updates an existing automation rule.
     * @param username - The username of the user updating the rule.
     * @param ruleId - The unique identifier of the rule.
     * @param updates - An object containing the updated rule properties.
     * @throws Error if the user does not have permission to update automation rules.
     */
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

    /**
     * Removes an automation rule.
     * @param username - The username of the user removing the rule.
     * @param ruleId - The unique identifier of the rule.
     * @throws Error if the user does not have permission to remove automation rules.
     */
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

    /**
     * Clears all automation rules for a user.
     * @param username - The username of the user clearing the rules.
     * @throws Error if the user does not have permission to clear automation rules.
     */
    public clearAllRules(username: string): void {
        if (!this.authService.hasPermission(username, 'delete:automation')) {
            throw new Error('User does not have permission to clear automation rules');
        }

        this.rules.set(username, []);
    }

    /**
     * Retrieves the count of automation rules for a user.
     * @param username - The username of the user requesting the count.
     * @returns The number of automation rules for the user.
     * @throws Error if the user does not have permission to view automation rules.
     */
    public getRuleCount(username: string): number {
        if (!this.authService.hasPermission(username, 'read:automation')) {
            throw new Error('User does not have permission to view automation rules');
        }

        return this.rules.get(username)?.length || 0;
    }
}